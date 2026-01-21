'use server';

import type { DetectNetworkThreatsInput, DetectNetworkThreatsOutput } from '@promethea/lib';

export async function handleDetect(data: DetectNetworkThreatsInput): Promise<DetectNetworkThreatsOutput> {
  try {
    const Ai = await import('@promethea/ai');
    return await Ai.invokeDetectNetworkThreats(data) as unknown as DetectNetworkThreatsOutput;
  } catch (e) {
    console.error(e);
    return {
      threatDetected: true,
      threatDescription:
        'An unexpected error occurred while analyzing the data.',
      suggestedAction:
        'Please review the logs manually and report any suspicious activity.',
    } as DetectNetworkThreatsOutput;
  }
}
