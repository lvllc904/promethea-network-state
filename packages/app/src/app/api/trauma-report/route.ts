export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import * as path from 'path';
import * as fs from 'fs';

function jsonToEdn(obj: any): string {
  if (obj === null || obj === undefined) return 'nil';
  if (typeof obj === 'string') return `"${obj.replace(/"/g, '\\"')}"`;
  if (typeof obj === 'number') return obj.toString();
  if (typeof obj === 'boolean') return obj ? 'true' : 'false';
  if (Array.isArray(obj)) {
    return `[${obj.map(jsonToEdn).join(' ')}]`;
  }
  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    const pairs = keys.map(k => {
      const keyStr = k.startsWith(':') ? k : `:${k}`;
      return `${keyStr} ${jsonToEdn(obj[k])}`;
    });
    return `{${pairs.join(' ')}}`;
  }
  return 'nil';
}

function getTraumaVaultPath(): string {
    let rootPath = process.cwd();
    let ednPath = path.join(rootPath, 'content', 'trauma_vault.edn');
    if (!fs.existsSync(path.dirname(ednPath))) {
        const parentPath = path.join(process.cwd(), '..', 'content', 'trauma_vault.edn');
        if (fs.existsSync(path.dirname(parentPath))) {
            ednPath = parentPath;
        } else {
            const grandParentPath = path.join(process.cwd(), '..', '..', 'content', 'trauma_vault.edn');
            if (fs.existsSync(path.dirname(grandParentPath))) {
                ednPath = grandParentPath;
            } else {
                ednPath = '/Users/officeone/Promethean Network State/promethea_antigravity_bundle_20251130_211450/content/trauma_vault.edn';
            }
        }
    }
    return ednPath;
}

function appendToEdnFile(filePath: string, entry: any) {
  const ednEntry = jsonToEdn(entry);
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, `[${ednEntry}]\n`, 'utf-8');
    return;
  }
  let currentContent = fs.readFileSync(filePath, 'utf-8').trim();
  if (currentContent === '' || currentContent === 'nil' || currentContent === '[]') {
    fs.writeFileSync(filePath, `[${ednEntry}]\n`, 'utf-8');
    return;
  }
  if (currentContent.endsWith(']')) {
    currentContent = currentContent.slice(0, -1).trim();
  }
  fs.writeFileSync(filePath, `${currentContent}\n ${ednEntry}]\n`, 'utf-8');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { source, message, stack, digest } = body;
    
    const entry = {
      id: 'err-' + Math.random().toString(36).substring(2, 11),
      source: source || 'unknown',
      message: message || 'No error message',
      stack: stack || '',
      digest: digest || '',
      timestamp: new Date().toISOString()
    };

    const filePath = getTraumaVaultPath();
    console.log(`[TRAUMA SINK] Appending exception to ${filePath}:`, entry.message);
    appendToEdnFile(filePath, entry);

    return NextResponse.json({ success: true, entry });
  } catch (err: any) {
    console.error('[API trauma-report POST] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
