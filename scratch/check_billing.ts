import { CloudBillingClient } from '@google-cloud/billing';

async function checkBilling() {
    const client = new CloudBillingClient();
    const projectId = 'studio-9105849211-9ba48';

    console.log('--- Sovereign Billing Investigation ---');
    
    try {
        // 1. List all billing accounts
        console.log('Checking all available Billing Accounts...');
        const [accounts] = await client.listBillingAccounts();
        for (const account of accounts) {
            console.log(`- Account: ${account.displayName} (${account.name}) | Open: ${account.open}`);
        }

        // 2. Check current project billing info
        console.log(`\nChecking billing info for Project: ${projectId}...`);
        const [projectBillingInfo] = await client.getProjectBillingInfo({
            name: `projects/${projectId}`
        });
        console.log(`Currently linked to: ${projectBillingInfo.billingAccountName || 'None'}`);
        console.log(`Billing Enabled: ${projectBillingInfo.billingEnabled}`);

    } catch (error) {
        console.error('Error investigating billing:', error.message);
    }
}

checkBilling();
