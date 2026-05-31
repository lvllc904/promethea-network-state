import { NextResponse } from 'next/server';

const LEDGER_URL = process.env.NEXT_PUBLIC_LEDGER_URL || 'https://sovereign-ledger-385120524005.us-central1.run.app';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const did = searchParams.get('did');
    const syndicate_id = searchParams.get('syndicate_id');
    const token = req.headers.get('Authorization') || '';
    
    const r = await fetch(`${LEDGER_URL}/api/v1/blob?did=${did}&syndicate_id=${syndicate_id}`, { 
      headers: { 'Authorization': token },
      cache: 'no-store', 
      signal: AbortSignal.timeout(30000) 
    });
    
    if (r.ok) { 
        const blobBytes = await r.arrayBuffer(); 
        return new NextResponse(blobBytes, {
            headers: { 'Content-Type': r.headers.get('Content-Type') || 'application/octet-stream' }
        });
    } else {
        return NextResponse.json({ error: `Ledger returned ${r.status}` }, { status: r.status });
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Connection to Sovereign Ledger failed', details: err.message }, { status: 503 });
  }
}
