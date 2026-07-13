const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function main() {
    console.log("[Map Interactor] Launching headless browser...");
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: { width: 1440, height: 900 },
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--allow-running-insecure-content'
        ]
    });

    try {
        const page = await browser.newPage();
        console.log("[Map Interactor] Navigating to https://lvhllc.org...");
        
        // Go to lvhllc.org
        await page.goto('https://lvhllc.org', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        console.log("[Map Interactor] Page title:", await page.title());
        console.log("[Map Interactor] Waiting 10 seconds for initial map and HUD components to settle...");
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Take initial screenshot
        const artifactDir = '/Users/officeone/.gemini/antigravity/brain/7636b475-e50d-4fa9-9645-08751d7069b4';
        const img1 = path.join(artifactDir, 'media__lvhllc_loaded.png');
        await page.screenshot({ path: img1 });
        console.log("[Map Interactor] Initial screenshot captured:", img1);

        // Analyze page structure to find interactive buttons
        console.log("[Map Interactor] Inspecting interactive buttons...");
        const buttons = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('button')).map((b, index) => ({
                index,
                text: b.innerText?.trim() || b.getAttribute('title') || b.getAttribute('aria-label') || 'Unnamed',
                hasSvg: !!b.querySelector('svg'),
                visible: b.offsetWidth > 0 && b.offsetHeight > 0
            }));
        });
        console.log("[Map Interactor] Found buttons:", JSON.stringify(buttons, null, 2));

        // Let's click on the first visible button that might be related to "Atlas" or similar
        // Let's look for a button containing "Atlas" or map element
        const atlasButton = buttons.find(b => b.text.toLowerCase().includes('atlas'));
        if (atlasButton) {
            console.log(`[Map Interactor] Found Atlas button at index ${atlasButton.index}. Clicking it...`);
            const buttonHandles = await page.$$('button');
            await buttonHandles[atlasButton.index].click();
            await new Promise(resolve => setTimeout(resolve, 4000));
            const img2 = path.join(artifactDir, 'media__lvhllc_atlas_clicked.png');
            await page.screenshot({ path: img2 });
            console.log("[Map Interactor] Screenshot after clicking Atlas:", img2);
        } else {
            console.log("[Map Interactor] No specific Atlas button found, let's find any visible map canvas or SVG element to drag");
        }

        // Let's perform a drag/pan operation on the center of the screen to simulate map interaction
        console.log("[Map Interactor] Simulating click & drag pan on map (center of viewport)...");
        const centerX = 1440 / 2;
        const centerY = 900 / 2;
        
        await page.mouse.move(centerX, centerY);
        await page.mouse.down();
        // Drag left and down
        await page.mouse.move(centerX - 200, centerY + 150, { steps: 20 });
        await page.mouse.up();
        
        console.log("[Map Interactor] Map drag simulated. Waiting for rendering...");
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const img3 = path.join(artifactDir, 'media__lvhllc_dragged.png');
        await page.screenshot({ path: img3 });
        console.log("[Map Interactor] Screenshot after dragging map:", img3);

        // Let's simulate a scroll wheel zoom-in on the map
        console.log("[Map Interactor] Simulating scroll-wheel zoom-in at center...");
        await page.mouse.move(centerX, centerY);
        // Puppeteer doesn't have a direct wheel API, but we can emit a raw devtools protocol event
        const client = await page.target().createCDPSession();
        await client.send('Input.dispatchMouseEvent', {
            type: 'mouseWheel',
            x: centerX,
            y: centerY,
            deltaX: 0,
            deltaY: -300 // negative is zoom-in / scroll-up
        });
        
        console.log("[Map Interactor] Zoom event dispatched. Waiting for rendering...");
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const img4 = path.join(artifactDir, 'media__lvhllc_zoomed.png');
        await page.screenshot({ path: img4 });
        console.log("[Map Interactor] Screenshot after zooming map:", img4);

        // Let's click on one of the coordinate nodes on the screen (if present)
        console.log("[Map Interactor] Scanning for coordinate nodes/citadel dots...");
        const nodesFound = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('*'));
            return elements
                .filter(el => {
                    const text = el.innerText?.trim();
                    return text && (text.includes('Wyoming') || text.includes('Citadel') || text.includes('Neo-Tokyo') || text.includes('Retreat'));
                })
                .map(el => ({
                    tagName: el.tagName,
                    text: el.innerText?.trim(),
                    visible: el.offsetWidth > 0 && el.offsetHeight > 0
                }));
        });
        console.log("[Map Interactor] Coordinate nodes text elements found:", JSON.stringify(nodesFound, null, 2));

    } catch (e) {
        console.error("[Map Interactor] Interaction flow failed:", e);
    } finally {
        await browser.close();
        console.log("[Map Interactor] Browser closed.");
    }
}

main();
