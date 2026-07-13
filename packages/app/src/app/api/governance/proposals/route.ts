export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getLocalDB } from '@/lib/server/sqlite';

export async function GET() {
  try {
    const db = await getLocalDB();
    const rows = await db.all('SELECT data FROM proposals');
    const proposals = rows.map(r => JSON.parse(r.data));
    return NextResponse.json(proposals);
  } catch (err: any) {
    console.error('[API proposals GET] Error:', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, type, narrative } = body;
    if (!title || !narrative) {
      return NextResponse.json({ error: 'Title and narrative are required' }, { status: 400 });
    }

    const db = await getLocalDB();
    const id = 'prop-' + Math.random().toString(36).substring(2, 11);
    const proposal = {
      id,
      title,
      type: type || 'CONSTITUTIONAL',
      current: 0,
      threshold: 10,
      narrative
    };

    await db.run(
      'INSERT INTO proposals (id, orgId, data) VALUES (?, ?, ?)',
      [id, 'global', JSON.stringify(proposal)]
    );

    return NextResponse.json(proposal);
  } catch (err: any) {
    console.error('[API proposals POST] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

