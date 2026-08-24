# 🌊 Omni-Lake Open Property Ingestion & Unified Query Engine

This standalone specification outlines the architecture, data schemas, and integration strategy for building a high-fidelity, open-government real-estate and socioeconomic ingestion pipeline inside the **Omni-Lake (Metabolic Data Architecture)**. This system operates completely independently of conversational routing protocols (like CPP) to act as a pure, high-performance metabolic sensory node.

---

## 1. Executive Summary & Scope

The Promethean Network State (PNS) requires accurate real-estate, parcel-boundary, socioeconomic, and rental yield data to autonomously evaluate and acquire physical land nodes ("Sovereign Property Nodes") under **Phase 4.7** of the roadmap.

To keep the system scalable, we ingest and refine public data from local, state, and federal endpoints directly into the `omni_intel_lake` SQLite database (`pro-forma.db`), allowing any authorized dashboard widget, autonomous process, or AI co-processor to query the unified intelligence layers via standard SQL or GraphQL interfaces.

---

## 2. Gating Analysis: Restricted GSE APIs vs. Free Open Government Data

A critical point of clarity in programmatic real-estate architecture is the gating on Fannie Mae and Freddie Mac databases:

```
[GSE Portal (Fannie/Freddie)]
       |
       v
[Uniform Property Dataset (UPD)] ---> REJECTED (TSPs & Licensed Banks Only)
       |
       +---> Purpose: Mortgage Underwriting (Lenders submitting valuation files)
       +---> API Gating: Closed B2B endpoints (requires severe SEC & compliance audits)
```

### The GSE API Gating Trap
* **Uniform Property Dataset (UPD):** Restricts access strictly to approved **Seller/Servicers** (licensed mortgage lenders/banks) or **Technology Service Providers (TSPs)** legally contracted by a lender.
* **Underwriting Focus:** The APIs are designed for lenders to *submit* appraisals or request waiver validations, rather than serving as open programmatic query portals for real-estate research.
* **The Solution:** PNS bypasses GSE gates entirely by utilizing public municipal, state Department of Revenue (DoR), and federal GIS REST feeds.

---

## 3. Comparative Source Matrix

The following matrix compares the data sources integrated into the Omni-Lake Property Ingestion pipeline:

| Source | Access Endpoint | Data Types Ingested | Cost & Gating | Ingestion Mechanics |
| :--- | :--- | :--- | :--- | :--- |
| **Florida Dept of Revenue** | FTP/HTTPS download + WFS REST | County Assessor Tax Rolls (NAL, NAP, SDF) & GIS Boundaries | **Free & Open** (No auth/No tokens) | Scripted curl download + gdal shapefile parser |
| **US Census Bureau** | `api.census.gov/data/2022/acs/acs5` | Household Demographics, Income, Home Values by Tract | **Free & Public** (No-key rate limits, free token option) | REST requests returning JSON document buffers |
| **HUD User Portal** | `huduser.gov/portal/api` | Fair Market Rents (FMR), Income limits, ZIP-to-Tract crosswalks | **Free** (Requires instant user token) | REST requests utilizing header token auth |
| **Fannie / Freddie** | `restricted-gse-api.fanniemae.com` | Loan & Collateral Valuation Indexes | **Gated / Closed** (Registered Sellers only) | *Bypassed* |

---

## 4. Database Schema Integration (`pro-forma.db`)

Raw data is ingested, parsed, and normalized inside SQLite tables in the `omni_intel_lake` module.

```sql
-- 1. Raw State Assessment Records (State Level)
CREATE TABLE IF NOT EXISTS omni_raw_property_rolls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    county_code TEXT NOT NULL,         -- e.g., "Duval" (FL county code 26)
    parcel_id TEXT NOT NULL,           -- Unique county-level parcel identifier
    owner_name TEXT,
    mailing_address TEXT,
    physical_address TEXT,
    land_use_code TEXT,                -- Standardized DOR land use (e.g., 0100 for Single Family)
    just_value_assess INTEGER,         -- Assessed Market Value
    taxable_value INTEGER,             -- Value after exemptions
    sale_price INTEGER,
    sale_date TEXT,
    book_page TEXT,
    latitude REAL,
    longitude REAL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(county_code, parcel_id)
);

-- 2. Socioeconomic Tract Index (Federal Level)
CREATE TABLE IF NOT EXISTS omni_census_tract_stats (
    tract_id TEXT PRIMARY KEY,         -- e.g., "12031010101" (State + County + Tract)
    state_code TEXT NOT NULL,          -- e.g., "12" (Florida)
    county_code TEXT NOT NULL,         -- e.g., "031" (Duval County)
    median_household_income INTEGER,   -- ACS B19013
    median_home_value INTEGER,         -- ACS B25077
    total_population INTEGER,          -- ACS B01003
    renter_occupied_units INTEGER,     -- ACS B25003
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Rental and Cost Bounds (Federal Level)
CREATE TABLE IF NOT EXISTS omni_hud_fmr_limits (
    zip_code TEXT PRIMARY KEY,         -- 5-digit ZIP code
    metro_area_code TEXT,
    fmr_0br INTEGER,                   -- Fair Market Rent studio
    fmr_1br INTEGER,                   -- Fair Market Rent 1BR
    fmr_2br INTEGER,                   -- Fair Market Rent 2BR
    fmr_3br INTEGER,                   -- Fair Market Rent 3BR
    fmr_4br INTEGER,                   -- Fair Market Rent 4BR
    median_family_income INTEGER,      -- Local HUD Median Income limits
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Unified Synthesis View (Yield Engine)
CREATE VIEW IF NOT EXISTS v_omni_property_yields AS
SELECT 
    p.county_code,
    p.parcel_id,
    p.physical_address,
    p.just_value_assess as market_value,
    p.sale_price,
    p.sale_date,
    c.median_household_income,
    c.median_home_value,
    h.zip_code,
    h.fmr_2br,
    -- Est monthly gross yield = (Annual FMR 2BR / Just Value) * 100
    CASE 
        WHEN p.just_value_assess > 0 THEN ((h.fmr_2br * 12.0) / p.just_value_assess) * 100.0
        ELSE 0 
    END as est_annual_yield_percentage
FROM omni_raw_property_rolls p
LEFT JOIN omni_census_tract_stats c ON c.tract_id = (
    -- Spatial mapping or ZIP lookups (mocked by census-to-zip maps)
    SELECT tract_id FROM omni_census_tract_stats 
    WHERE county_code = SUBSTR(p.county_code, 1, 3) LIMIT 1
)
LEFT JOIN omni_hud_fmr_limits h ON h.zip_code = (
    -- Strip ZIP from mailing/physical address or spatial polygon intersection
    SELECT SUBSTR(TRIM(p.physical_address), -5)
);
```

---

## 5. Ingestion Pipeline Architecture

Ingestion is executed via standalone daemon processes written in Python or Node.js, managed via system crons or PM2.

```
       [FTP/HTTP Feeds]               [US Census ACS]                 [HUD User API]
              |                              |                               |
              v (State Rolls Parser)         v (Tract Query)                 v (FMR limits)
    +--------------------+         +--------------------+         +------------------+
    |  fl_tax_scraper.py |         |  census_api_run.py |         |  hud_fmr_grab.py |
    +--------------------+         +--------------------+         +------------------+
              |                              |                               |
              +------------------------------+-------------------------------+
                                             |
                                             v
                                  [ SQLite: pro-forma.db ]
                                             |
                                             v (Unified Query Engine)
                                [ v_omni_property_yields ]
                                             |
                                +------------+------------+
                                |                         |
                                v                         v
                      [ EconomicOrchestrator ]    [ Dashboard Map Widget ]
```

### Automation & Script Schedules
* **Tax Rolls Ingestion (`fl_tax_scraper.py`):** Runs **annually** or **quarterly** as DoR releases update files. Downloads text blocks, performs regex field slicing, and writes to `omni_raw_property_rolls`.
* **Census Demographics (`census_api_run.py`):** Runs **annually** matching Five-Year ACS data releases. Queries county tracts programmatically.
* **HUD Rent Limits (`hud_fmr_grab.py`):** Runs **annually** (typically October 1st) to pull FMR adjustments.

---

## 6. Dashboard GIS Query Integration

To render property vectors with unified socioeconomic overlays on the map widget, the frontend queries the SQLite bridge:

```typescript
// Example Node/TypeScript query controller inside /packages/app/src/app/api/properties/route.ts
import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const minYield = searchParams.get('minYield') || '8.0';

  const db = await open({
    filename: './pro-forma.db',
    driver: sqlite3.Database
  });

  const opportunities = await db.all(`
    SELECT * FROM v_omni_property_yields 
    WHERE est_annual_yield_percentage >= ? 
    ORDER BY est_annual_yield_percentage DESC 
    LIMIT 100
  `, [minYield]);

  return NextResponse.json({ success: true, properties: opportunities });
}
```

This ensures that any computational weight is offloaded cleanly to SQLite, delivering sub-millisecond response rates to the dashboard canvas, establishing absolute decoupled boundaries between conversational threads and high-performance ingestion layers.
