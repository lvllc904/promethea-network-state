export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getLocalDB } from '@/lib/server/sqlite';

export async function GET() {
  try {
    const db = await getLocalDB();
    const rows = await db.all('SELECT data FROM uvt_ledger ORDER BY timestamp DESC');
    const ledger = rows.map(r => JSON.parse(r.data));
    return NextResponse.json(ledger);
  } catch (err: any) {
    console.error('[API uvt ledger GET] Error:', err);
    return NextResponse.json([]);
  }
}
