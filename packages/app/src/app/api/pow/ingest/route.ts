import { NextResponse } from 'next/server';
import { BiologicalPowPayload } from '@promethea/lib';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // 1. Validate Payload Structure
    if (!data.citizenId || !data.taskId || !data.sourceType || !data.mediaUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Generate Deterministic Hash of the Payload
    const hashData = `${data.citizenId}:${data.taskId}:${data.sourceType}:${data.mediaUrl}:${Date.now()}`;
    const hash = crypto.createHash('sha256').update(hashData).digest('hex');

    // 3. Construct the Internal Representation
    const powPayload: BiologicalPowPayload = {
      id: crypto.randomUUID(),
      citizenId: data.citizenId,
      taskId: data.taskId,
      syndicateId: data.syndicateId || 'global',
      sourceType: data.sourceType,
      mediaUrl: data.mediaUrl,
      fileSizeCents: data.fileSizeCents || 0,
      metadata: data.metadata || {},
      hash,
      status: 'PENDING_EVALUATION',
      createdAt: new Date().toISOString(),
    };

    // 4. (Future) Route to PostgreSQL via Paperclip ORM or Firebase 
    // Here we would push to the ingestion queue (e.g. RabbitMQ/Redis or direct DB insert)
    console.log(`[Biological PoW] Ingested new payload: ${powPayload.id} from Citizen ${powPayload.citizenId}`);
    
    return NextResponse.json({ 
      success: true, 
      payloadId: powPayload.id,
      hash: powPayload.hash,
      status: powPayload.status
    });

  } catch (error: any) {
    console.error('[Biological PoW] Ingestion Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
