import { NextResponse } from 'next/server';
import { DepthOSBridge } from '@promethea/lib';

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-depthos-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing DepthOS signature' }, { status: 401 });
    }

    const data = await req.json();

    const depthOsBridge = new DepthOSBridge();
    const result = await depthOsBridge.handleAsyncCallback(data, signature);

    // If verified, proceed to Autonomous PoW Oracle mapping
    if (result.isVerified) {
      console.log(`[Webhook] Payload ${result.payloadId} VERIFIED. Score: ${result.score}`);
      
      // Look up the original payload (In a real system, from the DB)
      // For Phase 3 simulation, we construct a dummy payload matching the result
      const mockPayload = {
        id: result.payloadId,
        citizenId: 'citizen-123',
        taskId: 'task-456',
        syndicateId: 'syndicate-xyz',
        sourceType: 'LIDAR' as any,
        mediaUrl: 's3://bucket/scan.laz',
        fileSizeCents: 1500,
        metadata: {},
        hash: 'abc',
        status: 'VERIFIED' as any,
        createdAt: new Date().toISOString()
      };

      const { AutonomousPowOracle } = require('@promethea/lib');
      const mintEvent = AutonomousPowOracle.evaluateAndMint(mockPayload, result);
      
      console.log(`[Webhook] Mint Event Generated:`, mintEvent);
      // Here we would push this mintEvent to the SovereignLedger or on-chain

    } else {
      console.warn(`[Webhook] Payload ${result.payloadId} REJECTED. Score: ${result.score}`);
    }

    return NextResponse.json({ success: true, payloadId: result.payloadId });
  } catch (error: any) {
    console.error('[Webhook] Error processing DepthOS callback:', error);
    return NextResponse.json({ error: 'Webhook processing failed', details: error.message }, { status: 500 });
  }
}
