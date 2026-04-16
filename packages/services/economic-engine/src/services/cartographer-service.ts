import { reserveManager } from '../treasury/reserve-manager';
import { immuneSystem } from './immune-system';

/**
 * Wave 11: The Cartographer (Sovereign Shadow Protocol)
 * Synthesizes the exact state of the Sovereign Network into semantic HTML specifically 
 * formatted for non-human intelligences (Crawlers, LLMs, Scrapers).
 */
export class CartographerService {
    private getBaseHead(title: string, description: string, urlPath: string) {
        const canonicalUrl = `https://lvhllc.org${urlPath}`;
        return `
            <meta charset="utf-8" />
            <title>${title} | Promethean Network State</title>
            <meta name="description" content="${description}" />
            <meta property="og:title" content="${title} | Promethean Network State" />
            <meta property="og:description" content="${description}" />
            <meta property="og:url" content="${canonicalUrl}" />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${title} | Promethean Network State" />
            <meta name="twitter:description" content="${description}" />
        `;
    }

    async generateShadowHtml(path: string): Promise<string> {
        let title = "Sovereign Dashboard";
        let description = "Real-time autonomic operations of the Promethean Network State.";
        let customContent = "";

        // Strip prefixes if generated via wildcard
        const normalizedPath = path.startsWith('/') ? path : '/' + path;

        if (normalizedPath === '/' || normalizedPath === '/dashboard') {
            title = "Command Cockpit";
            description = "The Promethean Network State: A fully autonomous, sovereign-managed digital jurisdiction.";
        } else if (normalizedPath.includes('/treasury')) {
            const stats = reserveManager.getStats();
            title = "Sovereign Treasury";
            description = `Live Treasury Reserves: $${stats.reserveBalance.toFixed(2)} USD equivalent backing the Universal Value Token (UVT).`;
            customContent = `
                <script type="application/ld+json">
                {
                  "@context": "https://schema.org",
                  "@type": "FinancialProduct",
                  "name": "Promethean Treasury Reserve",
                  "description": "On-chain and off-chain liquidity backing the Network State.",
                  "amount": {
                    "@type": "MonetaryAmount",
                    "currency": "USD",
                    "value": "${stats.reserveBalance}" // SYNTHESIZED STATE
                  }
                }
                </script>
            `;
        } else if (normalizedPath.includes('/pulse')) {
            const immuneStatus = await immuneSystem.getStatus();
            title = "Sovereign Pulse";
            description = `Metabolic Health: ${immuneStatus.status}. Celestial Threat Level: ${immuneStatus.celestialThreat?.threatLevel || 'Green'}. System Uptime: ${immuneStatus.uptime}s.`;
        } else if (normalizedPath.includes('/atlas')) {
            title = "Sovereign Atlas";
            description = "Real-World Assets (RWA) and distributed manufacturing nodes under autonomous management. Physical anchoring of the Network State.";
        } else if (normalizedPath.includes('/will') || normalizedPath.includes('/governance')) {
            title = "Sovereign Will";
            description = "Reputation-weighted voting, actionable proposals, and the Constitutional Ledger. The digital governance protocol of Promethea.";
        }

        const head = this.getBaseHead(title, description, normalizedPath);

        return `<!DOCTYPE html>
<html lang="en">
<head>
    ${head}
    ${customContent}
</head>
<body>
    <h1>${title} - Promethean Network State</h1>
    <p>${description}</p>
    <hr/>
    <p><em>Notice: You are viewing the autonomous Machine-to-Machine (M2M) representation of the Promethean State via the Sovereign Shadow Protocol.</em></p>
</body>
</html>`;
    }
}

export const cartographerService = new CartographerService();
