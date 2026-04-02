import { useState, useEffect } from 'react';

const ENGINE_URL = 'https://economic-engine-385120524005.us-central1.run.app';

export function useSovereignData<T>(endpoint: string, interval: number = 30000) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch(`${ENGINE_URL}${endpoint}`);
      if (!response.ok) throw new Error(`Engine API ${response.status}`);
      const json = await response.json();
      setData(json);
      setError(null);
    } catch (err) {
      console.error(`[SovereignData] Failed to fetch ${endpoint}:`, err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (interval > 0) {
      const id = setInterval(fetchData, interval);
      return () => clearInterval(id);
    }
  }, [endpoint, interval]);

  return { data, loading, error, refetch: fetchData };
}

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
