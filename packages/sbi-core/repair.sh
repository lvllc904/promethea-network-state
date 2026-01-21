#!/bin/bash

# --- Start Fix Script ---
# Ensure a clean exit on error
set -e

echo "Starting repair process for @promethea/lib workspace..."

# 1. Install missing TypeScript type definitions and dependencies
# Diagnosis: Missing `@types/node` (for 'process') and `ethers` package.
echo "1. Installing missing dependencies: @types/node and ethers for @promethea/lib..."
# Install @types/node as a development dependency.
# Install ethers as a runtime dependency.
npm install --workspace=@promethea/lib @types/node --save-dev
npm install --workspace=@promethea/lib ethers

echo "Dependency installation complete."

# 2. Correct `clsx` import syntax
# Diagnosis: Incorrect named import `{ clsx }` instead of default import `clsx`.
# File location: packages/lib/src/utils.ts (based on the workspace name)
echo "2. Correcting import syntax for 'clsx' in packages/lib/src/utils.ts..."
# Use sed to replace 'import { clsx } from "clsx";' with 'import clsx from "clsx";'
# Note: The 'g' flag ensures all occurrences are replaced, though usually only one exists for imports.
sed -i.bak 's/import { clsx } from "clsx";/import clsx from "clsx";/g' packages/lib/src/utils.ts

echo "File modification complete. Backup created: packages/lib/src/utils.ts.bak"

# 3. Address Node.js/npm version mismatch (Recommended)
# Diagnosis: npm version incompatible with Node.js version. Update npm globally.
echo "3. Updating npm globally to address version mismatch..."
npm install -g npm@latest

echo "npm update complete."

# 4. Re-run build to verify fixes
echo "4. Attempting to rebuild @promethea/lib workspace..."
npm run build --workspace=@promethea/lib

echo "Repair script finished. Review build output for success."