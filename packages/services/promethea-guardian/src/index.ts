
import * as cloudflare from './tools/cloudflare.js';
import * as squarespace from './tools/squarespace.js';

const DOMAIN = 'lvhllc.org';

async function main() {
  console.log('Guardian service starting...');

  // This is the main loop. In the future, this will run periodically.
  try {
    console.log(`Analyzing DNS state for ${DOMAIN}...`);

    const cloudflareRecords = await cloudflare.getDnsRecords(DOMAIN);

    // TODO: Implement squarespace.getDnsRecords and compare the two.

    const rootRecord = cloudflareRecords.find(r => r.name === DOMAIN && r.type === 'A');

    if (rootRecord && !rootRecord.proxied) {
      console.log('Found incorrect DNS state: root record is not proxied. Correcting...');
      await cloudflare.updateDnsRecordProxyStatus(DOMAIN, rootRecord.id, true);
      console.log('DNS state corrected.');
    } else if (rootRecord) {
      console.log('DNS state is correct.');
    } else {
      console.log('Could not find root A record for the domain.');
    }

  } catch (error) {
    console.error('An error occurred during the guardian check:', error);
  }

  console.log('Guardian service finished check.');
}

main();
