
import { ai } from '../genkit';
import { z } from 'zod';
import { listFiles, readFile } from '../tools/file-system';
import { cognitiveHealingFlow } from './cognitive-healing';

const ErrorLogSchema = z.object({ errorLog: z.string() });
const HealingPlanSchema = z.object({
  diagnosis: z.string(),
  hypothesis: z.string(),
  strategy: z.string(),
  steps: z.array(z.string()),
});

const KEYWORDS = {
  CONFLICT: ['EDUPLICATEWORKSPACE', 'duplicate workspace'],
};

/**
 * A tiered diagnostic flow.
 * It first attempts a fast, pattern-based diagnosis for known, simple errors.
 * If that fails or the error is complex, it escalates to the more advanced cognitiveHealingFlow.
 */
export const selfHealingFlow = ai.defineFlow(
  {
    name: 'selfHealingFlow',
    inputSchema: ErrorLogSchema,
    outputSchema: HealingPlanSchema,
  },
  async ({ errorLog }) => {
    const lowercasedLog = errorLog.toLowerCase();
    const isConflict = KEYWORDS.CONFLICT.some(kw => lowercasedLog.includes(kw));

    // Fast-path: Handle known, simple conflicts directly
    if (isConflict) {
      const { files: allFiles } = await listFiles({ path: './' });
      const packageJsonFiles = allFiles.filter(f => f.endsWith('package.json'));
      const packageNames = new Map<string, string[]>();

      for (const file of packageJsonFiles) {
        const { content } = await readFile({ path: file });
        try {
          const pkg = JSON.parse(content);
          if (pkg.name) {
            if (!packageNames.has(pkg.name)) {
              packageNames.set(pkg.name, []);
            }
            packageNames.get(pkg.name)!.push(file);
          }
        } catch (e) { /* Ignore malformed package.json files */ }
      }

      const duplicates = [...packageNames.entries()].filter(([, paths]) => paths.length > 1);

      if (duplicates.length > 0) {
        const duplicateInfo = duplicates.map(([name, paths]) => `Package name "${name}" is duplicated in: ${paths.join(', ')}`).join('\n');
        return {
          diagnosis: 'Duplicate Workspace Package Name',
          hypothesis: 'The build failed because multiple `package.json` files in the workspace have the same `name` attribute.',
          strategy: 'Assign a unique name to each conflicting package.',
          steps: [
            'Identify the `package.json` files with duplicate `name` fields.',
            'For each duplicate, edit the `name` field to be unique within the workspace.',
            `The following duplicates were found:\n${duplicateInfo}`,
            'After renaming, run `pnpm install` again.',
          ],
        };
      }
    }

    // Escalation Path: If no simple pattern is matched, invoke the cognitive flow
    const cognitiveResult = await cognitiveHealingFlow({ errorLog });

    return {
      diagnosis: `Cognitive Analysis: ${cognitiveResult.diagnosis}`,
      hypothesis: 'An AI-driven analysis was performed to diagnose and fix the issue.',
      strategy: `The AI took the following action: ${cognitiveResult.actionTaken}. Verification status: ${cognitiveResult.verificationStatus}`,
      steps: [
        `Verification Log: ${cognitiveResult.verificationLog}`,
        'Review the action taken and the verification log to confirm the fix.'
      ],
    };
  }
);
