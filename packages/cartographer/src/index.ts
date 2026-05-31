/**
 * @promethea/cartographer
 * 
 * Sovereign Machine-to-Machine (M2M) synthesis engine. 
 * Formats your application's dynamic state into semantic HTML for bots and LLMs.
 */

export interface CartographerState {
    title: string;
    description: string;
    urlPath: string;
    customScripts?: string[];
    customBodyText?: string[];
}

export interface UIElementMap {
    id: string;
    selector: string;
    text: string;
    role: string;
    coordinates: { x: number; y: number; w: number; h: number };
    isClickable: boolean;
}

export interface UIMapResult {
    url: string;
    timestamp: string;
    elements: UIElementMap[];
    resolution: { width: number; height: number };
}

export class Cartographer {
    
    /**
     * Build the raw semantic <head> segment.
     */
    private getBaseHead(state: CartographerState) {
        const { title, description, urlPath } = state;
        const brand = "Promethean Network State";
        const canonicalUrl = `https://lvhllc.org${urlPath}`;
        
        return `
            <meta charset="utf-8" />
            <title>${title} | ${brand}</title>
            <meta name="description" content="${description}" />
            <meta property="og:title" content="${title} | ${brand}" />
            <meta property="og:description" content="${description}" />
            <meta property="og:url" content="${canonicalUrl}" />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${title} | ${brand}" />
            <meta name="twitter:description" content="${description}" />
        `;
    }

    /**
     * Synthesize a full shadow HTML document based on provided state metadata.
     */
    public synthesize(state: CartographerState): string {
        const head = this.getBaseHead(state);
        const scripts = (state.customScripts || []).join('\n    ');
        const bodyLines = (state.customBodyText || []).map(line => `<p>${line}</p>`).join('\n    ');

        return `<!DOCTYPE html>
<html lang="en">
<head>
    ${head}
    ${scripts}
</head>
<body>
    <h1>${state.title} - Promethean Network State</h1>
    <p>${state.description}</p>
    <hr/>
    ${bodyLines}
    <p><em>Notice: You are viewing the autonomous Machine-to-Machine (M2M) representation of this node via the Sovereign Shadow Protocol.</em></p>
</body>
</html>`;
    }

    /**
     * Parse raw HTML/DOM and generate a structured coordinate control map.
     * Simulates spatial layout mapping for machine consumption.
     */
    public map(url: string, htmlContent: string): UIMapResult {
        const elements: UIElementMap[] = [];
        
        // Simulating the extraction of primary interactive layout coordinates based on typical PNS templates.
        // In full execution, this integrates with local headless Chrome DOM measurements.
        const mockSelectors = [
            { id: 'atlas', selector: "button[title='Atlas']", text: 'Atlas', role: 'button', x: 33, y: 341, isClickable: true },
            { id: 'economics', selector: "button[title='Economics']", text: 'Economics', role: 'button', x: 33, y: 397, isClickable: true },
            { id: 'governance', selector: "button[title='Governance']", text: 'Governance', role: 'button', x: 33, y: 453, isClickable: true },
            { id: 'narrative', selector: "button[title='Narrative']", text: 'Narrative', role: 'button', x: 33, y: 509, isClickable: true },
            { id: 'passport', selector: "button[title='Passport']", text: 'Passport', role: 'button', x: 33, y: 565, isClickable: true },
            { id: 'pulse', selector: "button[title='Pulse']", text: 'Pulse', role: 'button', x: 33, y: 621, isClickable: true },
            { id: 'cmd_k', selector: 'Cmd+K Hint', text: '⌘ K', role: 'hint', x: 748, y: 48, isClickable: false },
            { id: 'header_ticker', selector: 'Header Ticker', text: 'Financial Ticker', role: 'ticker', x: 748, y: 16, isClickable: true },
            { id: 'footer_ticker', selector: 'Footer Ticker', text: 'State Ticker', role: 'ticker', x: 748, y: 802, isClickable: true },
            { id: 'glass_tray_container', selector: '.glass-panel', text: 'Active Pillar Tray', role: 'dialog', x: 96, y: 48, w: 384, h: 720, isClickable: false },
            { id: 'tray_copilot_chat', selector: '.bg-teal-950\\/30', text: 'Co-Pilot Chat', role: 'log', x: 96, y: 560, w: 384, h: 220, isClickable: true }
        ];

        // Parse custom HTML inputs to extract dynamic links/buttons if present
        let match;
        const buttonRegex = /<button[^>]*>(.*?)<\/button>/gi;
        let dynamicIdx = 1;
        
        while ((match = buttonRegex.exec(htmlContent)) !== null) {
            const text = match[1].replace(/<[^>]*>/g, '').trim();
            if (text && !mockSelectors.some(m => m.text === text)) {
                elements.push({
                    id: `btn-${dynamicIdx++}`,
                    selector: `button:has-text('${text}')`,
                    text: text,
                    role: 'button',
                    coordinates: { x: 260, y: 115 + (dynamicIdx * 45), w: 90, h: 32 },
                    isClickable: true
                });
            }
        }

        // Map mock coordinates to the synthesized control array
        mockSelectors.forEach(m => {
            elements.push({
                id: m.id,
                selector: m.selector,
                text: m.text,
                role: m.role,
                coordinates: { x: m.x, y: m.y, w: 40, h: 40 },
                isClickable: m.isClickable
            });
        });

        return {
            url,
            timestamp: new Date().toISOString(),
            elements,
            resolution: { width: 1496, height: 816 }
        };
    }
}

export const cartographer = new Cartographer();
