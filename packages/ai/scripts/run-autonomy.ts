
import '../src/genkit';
import { autonomyCore } from '../src/flows/autonomy-core';
import { runFlow } from '@genkit-ai/flow';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
    const args = process.argv.slice(2);
    const inputGoal = args.join(' ');

    console.log(`[Cognitive Engine] Received input: ${inputGoal.substring(0, 100)}...`);

    try {
        const result = await runFlow(autonomyCore, { initialGoal: inputGoal });
        console.log('[Cognitive Engine] Plan executed successfully.');
        console.log(result);
    } catch (error) {
        console.error('[Cognitive Engine] Error executing flow:', error);
        process.exit(1);
    }
}

main();
