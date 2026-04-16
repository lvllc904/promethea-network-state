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
}

export const cartographer = new Cartographer();
