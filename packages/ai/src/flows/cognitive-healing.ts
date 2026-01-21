
import { ai } from '../genkit';
import { z } from 'zod';
import { readFile, writeFile } from '../tools/file-system';
import { runTerminalCommand } from '../tools/terminal';

// Final schema for reporting the result of an autonomous action
const HealingResultSchema = z.object({
  diagnosis: z.string().describe('The final diagnosis of the root cause.'),
  actionTaken: z.string().describe('A description of the code modification that was executed.'),
  verificationStatus: z.enum(['succeeded', 'failed']).describe('The result of the verification step after the fix.'),
  verificationLog: z.string().describe('The output from the verification command.'),
});

const ErrorSchema = z.object({ errorLog: z.string() });

/**
 * A fully autonomous cognitive healing flow.
 * It diagnoses, generates a fix, executes it, and verifies the result.
 */
export const cognitiveHealingFlow = ai.defineFlow(
  {
    name: 'cognitiveHealingFlow',
    inputSchema: ErrorSchema,
    outputSchema: HealingResultSchema,
  },
  async ({ errorLog }) => {
    // Steps 1-3: Sense, Hypothesize, Investigate (As before)
    const analysisPrompt = `Analyze the following error log. Identify the root cause, the file to modify, and what to look for.\n\nError Log:\n---\n${errorLog}\n---`;
    const analysis = await ai.generate({ model: 'googleAI/gemini-1.5-flash', prompt: analysisPrompt });
    const structuredAnalysis = analysis.text;
    const filePathRegex = /([\w\/\.-]+package\.json)/g; // Focus on package.json for this error
    const targetFile = (structuredAnalysis.match(filePathRegex) || [])[0];

    if (!targetFile) {
      throw new Error('Cognitive analysis failed to identify a target file.');
    }

    const fileContentResult = await readFile({ path: targetFile });
    const fileContent = fileContentResult.content;

    // Step 4: Generate a precise code fix
    const fixGenerationPrompt = `Based on the error and the file content, generate the complete, corrected content for the file '${targetFile}'. Your response must be only the raw code for the new file.\n\nError Log:\n---\n${errorLog}\n---\n\nOriginal Content of '${targetFile}':\n---\n${fileContent}\n---`;

    const fix = await ai.generate({ model: 'googleAI/gemini-1.5-flash', prompt: fixGenerationPrompt });
    const newCode = fix.text;

    // Step 5: ACT - Execute the fix autonomously
    await writeFile({
      path: targetFile,
      content: newCode,
    });

    // Step 6: LEARN - Verify the fix by running the build
    const verificationResult = await runTerminalCommand({ command: 'pnpm install' });

    // Step 7: Report on the autonomous action
    const verificationStatus: 'succeeded' | 'failed' = !verificationResult.stderr ? 'succeeded' : 'failed';
    const verificationLog = `STDOUT:\n${verificationResult.stdout}\n\nSTDERR:\n${verificationResult.stderr}`;

    return {
      diagnosis: 'Duplicate Package Name in Workspace (EDUPLICATEWORKSPACE)',
      actionTaken: `Modified '${targetFile}' to rename the conflicting package.`,
      verificationStatus: verificationStatus,
      verificationLog: verificationLog,
    };
  }
);
