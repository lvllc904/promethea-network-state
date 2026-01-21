
import { z } from 'zod';
import { tool } from 'genkit';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const runTerminalCommand = tool(
  {
    name: 'runTerminalCommand',
    description: 'Executes a shell command and returns its standard output and standard error.',
    inputSchema: z.object({ command: z.string() }),
    outputSchema: z.object({
      stdout: z.string(),
      stderr: z.string(),
    }),
  },
  async ({ command }) => {
    try {
      const { stdout, stderr } = await execAsync(command, { cwd: process.cwd() });
      return { stdout, stderr };
    } catch (error: any) {
      // The execAsync promise rejects if the command returns a non-zero exit code.
      // We capture stdout and stderr from the error object in this case.
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || `Execution failed with error: ${error.message}`,
      };
    }
  }
);
