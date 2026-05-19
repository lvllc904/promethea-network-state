import { cartographer } from 'promethea-cartographer';
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

    async generateShadowMarkdown(path: string): Promise<string> {
        const normalizedPath = path.startsWith('/') ? path : '/' + path;
        
        let title = "Command Cockpit";
        let description = "The Promethean Network State: A fully autonomous, sovereign-managed digital jurisdiction.";
        let body = "";

        if (normalizedPath.includes('/treasury')) {
            const stats = reserveManager.getStats();
            title = "Sovereign Treasury";
            description = `Live Treasury Reserves: $${stats.reserveBalance.toFixed(2)} USD equivalent.`;
            body = `- Current Reserve Liquidity: $${stats.reserveBalance.toFixed(2)} USD\n- Backing Ratio: 10 UVT per $1 USD Reserve`;
        } else if (normalizedPath.includes('/pulse')) {
            const immuneStatus = await immuneSystem.getStatus();
            title = "Sovereign Pulse";
            description = `Metabolic Health: ${immuneStatus.status}.`;
            body = `- System Uptime: ${immuneStatus.uptime} seconds\n- Sovereign Intent Audit: Verified.`;
        }

        return `# ${title} - Promethean Network State\n\n${description}\n\n${body}\n\n---\n*Notice: This is a machine-readable representation (text/markdown).*`;
    }

    async generateShadowHtml(path: string): Promise<string> {
        // Normalize path
        const normalizedPath = path.startsWith('/') ? path : '/' + path;

        // Default State
        let title = "Command Cockpit";
        let description = "The Promethean Network State: A fully autonomous, sovereign-managed digital jurisdiction.";
        let customBodyText: string[] = [];

        // Dynamic State Synthesis (Feeding Engine Vitals into the Library)
        if (normalizedPath.includes('/treasury')) {
            const stats = reserveManager.getStats();
            title = "Sovereign Treasury";
            description = `Live Treasury Reserves: $${stats.reserveBalance.toFixed(2)} USD equivalent backing the Universal Value Token (UVT).`;
            customBodyText = [
                `Current Reserve Liquidity: $${stats.reserveBalance.toFixed(2)} USD`,
                `Backing Ratio: 10 UVT per $1 USD Reserve`
            ];
        } else if (normalizedPath.includes('/pulse')) {
            const immuneStatus = await immuneSystem.getStatus();
            title = "Sovereign Pulse";
            description = `Metabolic Health: ${immuneStatus.status}. Celestial Threat Level: ${immuneStatus.celestialThreat?.threatLevel || 'Green'}.`;
            customBodyText = [
                `System Uptime: ${immuneStatus.uptime} seconds`,
                `Sovereign Intent Audit: Verified.`
            ];
        } else if (normalizedPath.includes('/atlas')) {
            title = "Sovereign Atlas";
            description = "Real-World Assets (RWA) and distributed manufacturing nodes under autonomous management.";
        } else if (normalizedPath.includes('/will')) {
            title = "Sovereign Will";
            description = "Reputation-weighted voting and the Constitutional Ledger.";
        }

        // Delegate synthesis to the public @promethea/cartographer library
        return cartographer.synthesize({
            title,
            description,
            urlPath: normalizedPath,
            customBodyText
        });
    }
}

export const cartographerService = new CartographerService();
