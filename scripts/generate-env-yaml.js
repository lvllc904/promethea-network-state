const fs = require('fs');
const path = require('path');

function parseEnv(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = {};
    let currentKey = null;
    let currentValue = '';
    let inQuote = false;
    let quoteChar = '';

    const lines = content.split(/\r?\n/);

    for (const line of lines) {
        if (!currentKey) {
            const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)/);
            if (match) {
                const key = match[1];
                let val = match[2];

                if (val.startsWith("'") || val.startsWith('"')) {
                    quoteChar = val[0];
                    if (val.endsWith(quoteChar) && val.length > 1 && val[val.length - 2] !== '\\') {
                        // One line quoted string
                        result[key] = val.slice(1, -1);
                    } else {
                        // Multi-line quoted string start
                        currentKey = key;
                        currentValue = val.slice(1); // Remove starting quote
                        inQuote = true;
                    }
                } else {
                    result[key] = val;
                }
            }
        } else if (inQuote) {
            if (line.endsWith(quoteChar) && line[line.length - 2] !== '\\') {
                // End of multi-line string
                currentValue += '\n' + line.slice(0, -1); // Append line conformant to newline
                result[currentKey] = currentValue;
                currentKey = null;
                inQuote = false;
            } else {
                currentValue += '\n' + line;
            }
        }
    }
    return result;
}

const engineEnv = parseEnv(path.resolve('packages/services/economic-engine/.env'));
const appEnv = parseEnv(path.resolve('packages/app/.env'));

// Map our specific needed keys
const finalEnv = {
    GEMINI_API_KEY: engineEnv.GEMINI_API_KEY,
    FIREBASE_PROJECT_ID: engineEnv.FIREBASE_PROJECT_ID,
    DISCORD_BOT_TOKEN: appEnv.DISCORD_BOT_TOKEN,
    DISCORD_APP_ID: appEnv.DISCORD_APP_ID,
    DISCORD_PUBLIC_KEY: appEnv.DISCORD_PUBLIC_KEY,
    GOOGLE_SERVICE_ACCOUNT_JSON: engineEnv.GOOGLE_SERVICE_ACCOUNT_JSON
};

// Build YAML
let yaml = '';
for (const [k, v] of Object.entries(finalEnv)) {
    if (v) {
        // Simple YAML escaping: explicit quotes and escape internal quotes
        const safeVal = v.replace(/"/g, '\\"');
        yaml += `${k}: "${safeVal}"\n`;
    }
}

fs.writeFileSync('env-vars.yaml', yaml);
console.log('env-vars.yaml generated.');
