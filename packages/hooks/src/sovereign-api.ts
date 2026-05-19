const ENGINE_URL = 'https://economic-engine-385120524005.us-central1.run.app';

export async function executeSovereignMethod(methodId: string, params: any = {}) {
  try {
    const response = await fetch(`${ENGINE_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ methodId, ...params }),
    });
    return await response.json();
  } catch (err) {
    console.error(`[SovereignData] Execution failed:`, err);
    throw err;
  }
}

export async function addSovereignData(collection: string, data: any, token?: string | null) {
  try {
    // If token not provided, try to get from window (client-side only)
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('pns_sovereign_token') : null);
    
    const response = await fetch(`${ENGINE_URL}/api/${collection}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Engine API ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error(`[SovereignData] Failed to add to ${collection}:`, err);
    throw err;
  }
}
