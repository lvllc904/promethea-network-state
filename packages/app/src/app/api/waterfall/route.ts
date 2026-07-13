export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getLocalDB } from '@/lib/server/sqlite';

export async function GET() {
  try {
    const db = await getLocalDB();
    const row = await db.get("SELECT data FROM waterfall WHERE id = 'status'");
    if (row) {
      return NextResponse.json(JSON.parse(row.data));
    }
    return NextResponse.json({ error: 'Waterfall status not found' }, { status: 404 });
  } catch (err: any) {
    console.error('[API waterfall GET] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await getLocalDB();
    
    // Simulate sweep or write custom data
    const row = await db.get("SELECT data FROM waterfall WHERE id = 'status'");
    let data = row ? JSON.parse(row.data) : {};
    
    if (body.action === 'sweep' || body.method === 'trigger_waterfall_sweep') {
      // Execute local sweep rebalance
      data.totalTvlUsd = (data.totalTvlUsd || 1452000) + 25000;
      data.nextUnlock = '23h 59m 59s';
      if (Array.isArray(data.rings)) {
        data.rings = data.rings.map((r: any) => ({
          ...r,
          balanceSol: r.isActive ? 0 : r.balanceSol
        }));
      }
      
      await db.run(
        "UPDATE waterfall SET data = ?, timestamp = ? WHERE id = 'status'",
        [JSON.stringify(data), new Date().toISOString()]
      );

      // Insert an audit transaction to uvt_ledger
      const txId = 'tx-' + Date.now();
      const tx = {
        id: txId,
        method: 'WATERFALL_SWEEP_REALLOCATION',
        amount: '+$25,000.00',
        timestamp: new Date().toISOString()
      };
      await db.run(
        'INSERT INTO uvt_ledger (id, orgId, data, timestamp) VALUES (?, ?, ?, ?)',
        [txId, 'global', JSON.stringify(tx), tx.timestamp]
      );
    } else {
      data = { ...data, ...body };
      await db.run(
        "UPDATE waterfall SET data = ?, timestamp = ? WHERE id = 'status'",
        [JSON.stringify(data), new Date().toISOString()]
      );
    }
    
    return NextResponse.json({ ok: true, status: 'SUCCESS', data });
  } catch (err: any) {
    console.error('[API waterfall POST] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

