const fs = require('fs');
const path = require('path');

/**
 * DepthOS Version Synchronizer
 * Purpose: Ensures the package.json version matches the UI diagnostic version
 * and updates the internal state before bundling.
 */

const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');
const UI_CONSTANTS_PATH = path.join(__dirname, '..', '..', 'packages', 'app', 'src', 'constants.ts'); // adjust if needed

function sync() {
    try {
        // 1. Read package.json
        const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
        const currentVersion = pkg.version;
        console.log(`[SYNC] Detected Version: ${currentVersion}`);

        // 2. Update UI Constants (if file exists)
        if (fs.existsSync(UI_CONSTANTS_PATH)) {
            let constantsContent = fs.readFileSync(UI_CONSTANTS_PATH, 'utf8');
            const versionRegex = /export const VERSION = ['"].*?['"]/;
            if (versionRegex.test(constantsContent)) {
                constantsContent = constantsContent.replace(
                    versionRegex,
                    `export const VERSION = "${currentVersion}"`
                );
                fs.writeFileSync(UI_CONSTANTS_PATH, constantsContent);
                console.log(`[SYNC] Updated ${UI_CONSTANTS_PATH} to ${currentVersion}`);
            }
        }

        // 3. Clean old VSIX files that do not match current version
        const dir = path.resolve(__dirname, '..', '..');
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            if (file.endsWith('.vsix') && !file.includes(currentVersion)) {
                fs.unlinkSync(path.join(dir, file));
                console.log(`[PURGE] Removed legacy bundle: ${file}`);
            }
        });

        console.log(`[SUCCESS] Version ${currentVersion} is now the global truth.`);
    } catch (error) {
        console.error(`[ERROR] Sync failed: ${error.message}`);
        process.exit(1);
    }
}

sync();
