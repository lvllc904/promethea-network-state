import { fetch } from 'undici';
import { getSecret } from '../secrets';

const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';

interface DnsRecord {
  id: string;
  name: string;
  type: string;
  content: string;
  proxied: boolean;
}

async function getCloudflareApiToken(): Promise<string> {
  return await getSecret('CLOUDFLARE_API_TOKEN');
}

async function getCloudflareZoneId(apiToken: string, zoneName: string): Promise<string> {
  const response = await fetch(`${CLOUDFLARE_API_BASE}/zones?name=${zoneName}`, {
    headers: { 'Authorization': `Bearer ${apiToken}` }
  });
  const data = await response.json() as { result: { id: string }[] };
  if (!data.result || data.result.length === 0) {
    throw new Error(`Could not find zone with name ${zoneName}`);
  }
  return data.result[0].id;
}

export async function getDnsRecords(zoneName: string): Promise<DnsRecord[]> {
  const apiToken = await getCloudflareApiToken();
  const zoneId = await getCloudflareZoneId(apiToken, zoneName);

  const response = await fetch(`${CLOUDFLARE_API_BASE}/zones/${zoneId}/dns_records`, {
    headers: { 'Authorization': `Bearer ${apiToken}` }
  });

  const data = await response.json() as { result: DnsRecord[] };
  return data.result;
}

export async function updateDnsRecordProxyStatus(zoneName: string, recordId: string, proxied: boolean): Promise<void> {
  const apiToken = await getCloudflareApiToken();
  const zoneId = await getCloudflareZoneId(apiToken, zoneName);

  await fetch(`${CLOUDFLARE_API_BASE}/zones/${zoneId}/dns_records/${recordId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ proxied })
  });
}
