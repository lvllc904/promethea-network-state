
import { fetch } from 'undici';
import { getSecret } from '../secrets';

const SQUARESPACE_API_BASE = 'https://api.squarespace.com/1.0';

interface DnsRecord {
  id: string;
  host: string;
  type: string;
  data: string;
  priority: number;
}

async function getSquarespaceApiToken(): Promise<string> {
  return await getSecret('SQUARESPACE_API_TOKEN');
}

// Note: This is a hypothetical API endpoint. 
// The actual Squarespace API for DNS management is not publicly documented.
export async function getDnsRecords(websiteId: string): Promise<DnsRecord[]> {
  const apiToken = await getSquarespaceApiToken();

  const response = await fetch(`${SQUARESPACE_API_BASE}/websites/${websiteId}/domains/dns-records`, {
    headers: { 'Authorization': `Bearer ${apiToken}` }
  });

  const data = await response.json() as { result: DnsRecord[] };
  return data.result;
}

// Note: This is a hypothetical API endpoint.
export async function updateDnsRecord(websiteId: string, recordId: string, record: Partial<DnsRecord>): Promise<void> {
  const apiToken = await getSquarespaceApiToken();

  await fetch(`${SQUARESPACE_API_BASE}/websites/${websiteId}/domains/dns-records/${recordId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(record)
  });
}
