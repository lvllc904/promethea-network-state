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
    const modeIndex = args.indexOf('--mode');

    if (urlIndex === -1) {
        console.log("Usage: cartographer --url <URL> [--mode <map|synthesize>] [--output <FILENAME>]");
        process.exit(1);
    }

    const url = args[urlIndex + 1];
    const mode = modeIndex !== -1 ? args[modeIndex + 1] : 'synthesize';
    const defaultOutput = mode === 'map' ? 'ui_map.json' : 'shadow_state.html';
    const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : defaultOutput;

    if (mode === 'map') {
        console.log(`\n[Cartographer CLI] 🗺️ Mapping visual control coordinates for: ${url}`);
        try {
            // In a full environment, this parses raw chromium viewport layout bounds.
            // Sourced from local state replication files.
            const mapResult = cartographer.map(url, "");
            fs.writeFileSync(outputFile, JSON.stringify(mapResult, null, 4));
            console.log(`[SUCCESS] ✅ Visual UI Map saved to: ${path.resolve(outputFile)}`);
        } catch (error) {
            console.error("[ERROR] ❌ Mapping failed:", error);
            process.exit(1);
        }
    } else {
        console.log(`\n[Cartographer CLI] 🗺️ Synthesizing M2M Shadow Layer for: ${url}`);
        try {
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
}

main();
