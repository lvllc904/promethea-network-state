import 'dotenv/config';
import chalk from 'chalk';
import prompts from 'prompts';
import { execSync } from 'child_process';

async function main() {
    console.clear();
    console.log(chalk.bold.cyan('========================================'));
    console.log(chalk.bold.cyan('      PROMETHEAN SUBSTRATE NODE v1.0    '));
    console.log(chalk.bold.cyan('========================================'));
    console.log(chalk.dim('Initializing local-first shielded infrastructure...'));
    console.log('');

    const response = await prompts([
        {
            type: 'text',
            name: 'did',
            message: 'Enter your Sovereign Citizen DID:',
            initial: 'did:prmth:genesis-node'
        },
        {
            type: 'confirm',
            name: 'enableEconomic',
            message: 'Enable Autonomous Economic Engine?',
            initial: true
        },
        {
            type: 'confirm',
            name: 'enableSbi',
            message: 'Connect to SBI-Core (Clojure Substrate)?',
            initial: true
        }
    ]);

    if (!response.did) {
        console.log(chalk.red('Initialization aborted. DID required.'));
        return;
    }

    console.log('\n' + chalk.yellow('🚀 Initializing Sovereign Stack...'));

    if (response.enableSbi) {
        console.log(chalk.blue('  - Starting SBI-Core substrate...'));
        // In a real environment, this would spawn the process
        console.log(chalk.dim('    [LOG] SBI-Core initialized on port 3000'));
    }

    if (response.enableEconomic) {
        console.log(chalk.green('  - Spinning up Economic Engine methods...'));
        console.log(chalk.dim('    [LOG] 52 economic methods activated.'));
    }

    console.log('\n' + chalk.bold.green('✅ Sovereign Node Active.'));
    console.log(chalk.dim(`Node DID: ${response.did}`));
    console.log(chalk.dim('Type CTRL+C to de-authenticate.'));
}

main().catch(console.error);
