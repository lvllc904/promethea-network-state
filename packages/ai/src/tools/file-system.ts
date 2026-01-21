
import { z } from 'zod';
import { tool } from 'genkit';
import * as fs from 'fs/promises';
import * as path from 'path';

// Helper to ensure paths are within the project directory
function resolvePath(p: string): string {
  const resolved = path.resolve(process.cwd(), p);
  if (!resolved.startsWith(process.cwd())) {
    throw new Error(`Path traversal detected. Invalid path: ${p}`);
  }
  return resolved;
}

export const listFiles = tool(
  {
    name: 'listFiles',
    description: 'Lists all files in a given directory path, recursively.',
    inputSchema: z.object({ path: z.string() }),
    outputSchema: z.object({ files: z.array(z.string()) }),
  },
  async ({ path: dirPath }) => {
    try {
      const resolvedPath = resolvePath(dirPath);
      const dirents = await fs.readdir(resolvedPath, { withFileTypes: true });
      const files = await Promise.all(
        dirents.map((dirent) => {
          const res = path.resolve(dirPath, dirent.name);
          const relativePath = path.relative(process.cwd(), res);
          return dirent.isDirectory() ? listFiles({ path: relativePath }) : { files: [relativePath] };
        })
      );
      return { files: files.flatMap(f => f.files) };
    } catch (error: any) {
      // Return a structured error so the AI can process it
      return { files: [`Error listing files: ${error.message}`] };
    }
  }
);

export const readFile = tool(
  {
    name: 'readFile',
    description: 'Reads the content of a file at a given path.',
    inputSchema: z.object({ path: z.string() }),
    outputSchema: z.object({ content: z.string() }),
  },
  async ({ path: filePath }) => {
    try {
      const resolvedPath = resolvePath(filePath);
      const content = await fs.readFile(resolvedPath, 'utf-8');
      return { content };
    } catch (error: any) {
      return { content: `Error reading file: ${error.message}` };
    }
  }
);

export const writeFile = tool(
  {
    name: 'writeFile',
    description: 'Writes content to a file at a given path, creating it if it does not exist.',
    inputSchema: z.object({ path: z.string(), content: z.string() }),
    outputSchema: z.object({ success: z.boolean(), error: z.string().optional() }),
  },
  async ({ path: filePath, content }) => {
    try {
      const resolvedPath = resolvePath(filePath);
      await fs.writeFile(resolvedPath, content, 'utf-8');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: `Error writing file: ${error.message}` };
    }
  }
);

export const deleteFile = tool(
  {
    name: 'deleteFile',
    description: 'Deletes a file at a given path.',
    inputSchema: z.object({ path: z.string() }),
    outputSchema: z.object({ success: z.boolean(), error: z.string().optional() }),
  },
  async ({ path: filePath }) => {
    try {
      const resolvedPath = resolvePath(filePath);
      await fs.unlink(resolvedPath);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: `Error deleting file: ${error.message}` };
    }
  }
);
