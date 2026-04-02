const fs = require('fs');
const path = require('path');

/**
 * Phase B: Process raw REST snapshots into a clean Genesis JSON.
 */

function processDoc(doc) {
    const data = doc.fields;
    const result = {};
    if (!data) return result;
    
    for (const key in data) {
        const val = data[key];
        if (val.stringValue !== undefined) result[key] = val.stringValue;
        else if (val.integerValue !== undefined) result[key] = parseInt(val.integerValue);
        else if (val.doubleValue !== undefined) result[key] = parseFloat(val.doubleValue);
        else if (val.booleanValue !== undefined) result[key] = val.booleanValue;
        else if (val.arrayValue !== undefined) {
            result[key] = (val.arrayValue.values || []).map(v => v.stringValue || v);
        }
        // Add more types if needed
    }
    return result;
}

const citizensRaw = JSON.parse(fs.readFileSync('scripts/citizens.json', 'utf8')).documents || [];
const uvtRaw = JSON.parse(fs.readFileSync('scripts/uvt.json', 'utf8')).documents || [];
const proposalsRaw = JSON.parse(fs.readFileSync('scripts/proposals.json', 'utf8')).documents || [];

const citizens = {};
citizensRaw.forEach(d => {
    const id = d.name.split('/').pop();
    citizens[id] = processDoc(d);
});

const uvtBalances = {};
let totalUVT = 0;
uvtRaw.forEach(d => {
    const data = processDoc(d);
    const owner = data.ownerId;
    if (!owner) return;
    if (!uvtBalances[owner]) uvtBalances[owner] = 0;
    uvtBalances[owner] += (data.amount || 0);
    totalUVT += (data.amount || 0);
});

const proposals = proposalsRaw.map(d => ({
    id: d.name.split('/').pop(),
    ...processDoc(d)
}));

const genesisPayload = {
    timestamp: new Date().toISOString(),
    stats: {
        totalCitizens: Object.keys(citizens).length,
        totalUVT,
        totalProposals: proposals.length
    },
    state: {
        citizens,
        uvtBalances,
        proposals
    }
};

fs.writeFileSync('scripts/genesis_snapshot.json', JSON.stringify(genesisPayload, null, 2));
console.log("✅ Genesis snapshot processed successfully.");
console.log(`📊 Stats: ${genesisPayload.stats.totalCitizens} Citizens, ${genesisPayload.stats.totalUVT} UVT, ${genesisPayload.stats.totalProposals} Proposals.`);
