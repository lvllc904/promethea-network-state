export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getLocalDB } from '@/lib/server/sqlite';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { proposalId, vote, signature, walletAddress, message } = body;

    if (!proposalId || !vote) {
      return NextResponse.json({ error: 'Proposal ID and vote are required' }, { status: 400 });
    }

    const db = await getLocalDB();

    // 1. Insert vote into the votes table
    const voteId = 'vote-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
    const voteData = {
      proposalId,
      vote,
      signature,
      walletAddress,
      message,
      timestamp: new Date().toISOString()
    };

    await db.run(
      'INSERT INTO votes (id, orgId, data) VALUES (?, ?, ?)',
      [voteId, 'global', JSON.stringify(voteData)]
    );

    // 2. Fetch the proposal and update its vote counts
    const row = await db.get('SELECT data FROM proposals WHERE id = ?', [proposalId]);
    if (row) {
      const proposal = JSON.parse(row.data);
      if (vote === 'FOR' || vote === 'YES') {
        proposal.current = (proposal.current || 0) + 1;
      }
      
      await db.run(
        'UPDATE proposals SET data = ? WHERE id = ?',
        [JSON.stringify(proposal), proposalId]
      );
      
      return NextResponse.json({ ok: true, proposal });
    }

    return NextResponse.json({ ok: true, queued: true });
  } catch (err: any) {
    console.error('[API vote POST] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

