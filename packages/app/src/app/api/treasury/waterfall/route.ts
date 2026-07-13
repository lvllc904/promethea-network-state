export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getLocalDB } from '@/lib/server/sqlite';

export async function GET() {
  try {
    const db = await getLocalDB();
    const row = await db.get("SELECT data FROM waterfall WHERE id = 'status'");
    if (row) {
      return NextResponse.json(JSON.parse(row.data));
    }
    return NextResponse.json({ error: 'Waterfall status not found' }, { status: 404 });
  } catch (error: any) {
    console.error('Waterfall API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

