#!/usr/bin/env node

import { GragClient } from './index';
import * as fs from 'fs';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    printHelp();
    return;
  }

  const queryIdx = args.findIndex(a => a === '--query' || a === '-q');
  const conformalIdx = args.findIndex(a => a === '--conformal' || a === '-c');
  const endpointIdx = args.findIndex(a => a === '--endpoint' || a === '-e');

  let query = queryIdx !== -1 && args[queryIdx + 1] ? args[queryIdx + 1] : '';
  let conformalAlpha = conformalIdx !== -1 && args[conformalIdx + 1] ? parseFloat(args[conformalIdx + 1]) : 0.10;
  let endpoint = endpointIdx !== -1 && args[endpointIdx + 1] ? args[endpointIdx + 1] : 'http://localhost:4006';

  // Read standard input
  let rawInput = '';
  
  if (!process.stdin.isTTY) {
    rawInput = await readStdin();
  } else {
    // If no stdin, search for file argument or use remaining non-flag arguments
    const fileArgs = args.filter((a, idx) => {
      if (idx > 0 && (args[idx - 1] === '--query' || args[idx - 1] === '-q' || args[idx - 1] === '--conformal' || args[idx - 1] === '-c' || args[idx - 1] === '--endpoint' || args[idx - 1] === '-e')) {
        return false;
      }
      return !a.startsWith('-');
    });
    
    if (fileArgs.length > 0 && fs.existsSync(fileArgs[0])) {
      rawInput = fs.readFileSync(fileArgs[0], 'utf-8');
    }
  }

  if (!rawInput.trim()) {
    console.error('\x1b[31m[ERROR] No reference context document provided via standard input or file.\x1b[0m');
    process.exit(1);
  }

  if (!query) {
    console.error('\x1b[31m[ERROR] Please specify a query using --query "your query"\x1b[0m');
    process.exit(1);
  }

  // Segment input text by paragraphs or double linebreaks to form context arrays
  const context = rawInput
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 10);

  const client = new GragClient({ endpoint, conformalAlpha });

  console.log('\x1b[36m┌─────────────────────────────────────────────────────────────┐\x1b[0m');
  console.log('\x1b[36m│          PROMETHEAN GRAG GATEWAY SUBSTRATE EVALUATION       │\x1b[0m');
  console.log('\x1b[36m└─────────────────────────────────────────────────────────────┘\x1b[0m');
  console.log(`\x1b[90mQuery:\x1b[0m ${query}`);
  console.log(`\x1b[90mConformal Bound (α):\x1b[0m ${conformalAlpha} (Confidence: ${(100 - conformalAlpha * 100).toFixed(0)}%)`);
  console.log(`\x1b[90mEndpoint:\x1b[0m ${endpoint}`);
  console.log(`\x1b[90mContext Size:\x1b[0m ${context.length} sections found`);
  console.log('\x1b[90mEvaluating logical entailment and zero-hallucination bounds...\x1b[0m\n');

  try {
    const start = Date.now();
    const result = await client.generate({ query, context });
    const elapsed = Date.now() - start;

    console.log('\x1b[32m┌─── EVALUATION COMPLETED FlAWLESSLY ─────────────────────────┐\x1b[0m');
    console.log(`\x1b[90mElapsed Time:\x1b[0m ${elapsed}ms`);
    console.log(`\x1b[90mGrounding Confidence:\x1b[0m \x1b[1m\x1b[32m${result.groundingConfidence.toFixed(1)}%\x1b[0m`);
    console.log(`\x1b[90mFiltered Context Documents:\x1b[0m ${result.filteredContext.length} of ${context.length} retained`);
    
    if (result.contradictions.length > 0) {
      console.log('\x1b[31m│ ⚠️  CONTRADICTIONS DETECTED:\x1b[0m');
      result.contradictions.forEach((c, idx) => {
        console.log(`\x1b[31m│   [${idx + 1}] ${c}\x1b[0m`);
      });
    } else {
      console.log('\x1b[32m│ ✅ ZERO Hallucinations detected (Entailment guaranteed)\x1b[0m');
    }
    
    console.log('\x1b[32m└─────────────────────────────────────────────────────────────┘\x1b[0m');
    console.log('\n\x1b[1m\x1b[36m--- RESPONSE GENERATION ---\x1b[0m');
    console.log(result.text);
    console.log('\x1b[36m---------------------------\x1b[0m');
  } catch (err: any) {
    console.error(`\x1b[31m[ERROR] Evaluation failed: ${err.message}\x1b[0m`);
    process.exit(1);
  }
}

function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let input = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => { input += chunk; });
    process.stdin.on('end', () => { resolve(input); });
  });
}

function printHelp() {
  console.log(`
\x1b[36mGrounded Rationality Agent Gateway (GRAG) CLI Client\x1b[0m

\x1b[1mUSAGE:\x1b[0m
  cat report.txt | grag evaluate --query "your prompt" [options]
  grag evaluate filepath.txt --query "your prompt" [options]

\x1b[1mOPTIONS:\x1b[0m
  -q, --query <string>      The query/prompt to synthesize and evaluate against context
  -c, --conformal <number>  The conformal prediction threshold alpha (default: 0.10)
  -e, --endpoint <url>      The GRAG Service endpoint port/socket (default: http://localhost:4006)
  -h, --help                Show this help screen
`);
}

main();
