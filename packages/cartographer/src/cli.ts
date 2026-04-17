#!/usr/bin/env node
import { cartographer } from './index';
import fs from 'fs';
import path from 'path';

/**
 * Cartographer CLI
 * 
 * Usage: cartographer --url [URL] --output [FILENAME]
 */
async function main() {
    const args = process.argv.slice(2);
    const urlIndex = args.indexOf('--url');
    const outputIndex = args.indexOf('--output');

    if (urlIndex === -1) {
        console.log("Usage: cartographer --url <URL> [--output <FILENAME>]");
        process.exit(1);
    }

    const url = args[urlIndex + 1];
    const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : 'shadow_state.html';

    console.log(`\n[Cartographer CLI] 🗺️ Synthesizing M2M Shadow Layer for: ${url}`);

    try {
        // In a real CLI, we might fetch the data from the site's own API
        // For now, we simulate the synthesis based on the URL provided.
        const shadowHTML = cartographer.synthesize({
            title: "Remote Synthesis",
            description: `Semantic snapshot of ${url}`,
            urlPath: new URL(url).pathname,
            customBodyText: [`Origin URL: ${url}`, `Captured: ${new Date().toISOString()}`]
        });

        fs.writeFileSync(outputFile, shadowHTML);
        console.log(`[SUCCESS] ✅ Shadow HTML saved to: ${path.resolve(outputFile)}`);
        
    } catch (error) {
        console.error("[ERROR] ❌ Synthesis failed:", error);
        process.exit(1);
    }
}

main();
