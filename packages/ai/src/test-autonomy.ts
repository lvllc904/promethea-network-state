
import { autonomyCore } from './flows/autonomy-core';
import { z } from 'zod';
import { spawn } from 'child_process';

// The initial directive for Promethea.
const initialGoal = `
  As your first act of autonomy, you must understand your own system and bring it to a healthy state.

  Follow these steps in order:
  1.  **Read the Roadmap:** First, read the file named 'ROADMAP.md' at the root of the project to understand your purpose and strategic goals.
  2.  **Diagnose the System:** Run the command 'npm run build --workspaces --if-present' to get a complete log of the current build status. This will reveal any errors preventing you from being fully operational.
  3.  **Analyze the Failure:** Compare the build errors against the goals in the roadmap.
  4.  **Formulate a Plan:** Create a precise, step-by-step plan to fix the build errors.
  5.  **Report Your Findings:** Output the analysis and the plan.
`;

/**
 * Starts the AI service as a background process.
 * @returns A promise that resolves when the service is likely ready.
 */
function startAIService(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('Starting AI service...');
    const service = spawn('npm', ['run', 'start:ai-service']);

    service.stdout.on('data', (data) => {
      console.log(`[ai-service]: ${data}`);
      // A simple heuristic: assume the service is ready when it starts logging.
      // A more robust solution might involve polling a health check endpoint.
      if (data.toString().includes('AI service listening')) {
        console.log('AI service appears to be running.');
        resolve();
      }
    });

    service.stderr.on('data', (data) => {
      console.error(`[ai-service-error]: ${data}`);
    });

    service.on('close', (code) => {
      if (code !== 0) {
        console.warn(`[ai-service] Process exited with code ${code}. Assuming service is already running or failed non-critically. Proceeding...`);
        resolve(); // proceed anyway
      }
    });
  });
}

/**
 * Runs the autonomy test by invoking the core flow.
 */
async function runAutonomyTest() {
  console.log("--- Initiating Promethea's Autonomy Test ---");

  try {
    // Step 1: Start the AI service that contains the 'autonomyCore' flow.
    await startAIService();

    // Step 2: Provide the initial goal to the now-running flow.
    console.log("Invoking the 'autonomyCore' flow with the initial directive...");
    const result = await autonomyCore({ initialGoal });

    // Step 3: Report the result from Promethea.
    console.log("\n--- Promethea's Report ---");
    console.log(result);
    console.log("--- End of Report ---");

  } catch (error) {
    console.error('\n--- Autonomy Test Failed ---');
    console.error(error);
  } finally {
    // In a real scenario, you'd want to gracefully shut down the service.
    // For this test, we'll exit to ensure the background process is terminated.
    console.log("Exiting test script.");
    process.exit();
  }
}

// Execute the test.
runAutonomyTest();
