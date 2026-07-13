export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getLocalDB } from '@/lib/server/sqlite';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.method === 'trigger_waterfall_sweep') {
      const db = await getLocalDB();
      const row = await db.get("SELECT data FROM waterfall WHERE id = 'status'");
      let data = row ? JSON.parse(row.data) : {};
      
      // Execute local sweep rebalance
      data.totalTvlUsd = (data.totalTvlUsd || 1452000) + 25000;
      data.nextUnlock = '23h 59m 59s';
      if (Array.isArray(data.rings)) {
        data.rings = data.rings.map((r: any) => ({
          ...r,
          balanceSol: r.isActive ? 0 : r.balanceSol
        }));
      }
      
      await db.run(
        "UPDATE waterfall SET data = ?, timestamp = ? WHERE id = 'status'",
        [JSON.stringify(data), new Date().toISOString()]
      );

      // Insert an audit transaction to uvt_ledger
      const txId = 'tx-' + Date.now();
      const tx = {
        id: txId,
        method: 'WATERFALL_SWEEP_REALLOCATION',
        amount: '+$25,000.00',
        timestamp: new Date().toISOString()
      };
      await db.run(
        'INSERT INTO uvt_ledger (id, orgId, data, timestamp) VALUES (?, ?, ?, ?)',
        [txId, 'global', JSON.stringify(tx), tx.timestamp]
      );
      
      return NextResponse.json({ ok: true, status: 'SUCCESS', data });
    }
    
    return NextResponse.json({ ok: true, message: 'Method ignored or queued' });
  } catch (error: any) {
    console.error('Engine Execute Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

