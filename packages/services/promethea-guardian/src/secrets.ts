
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

const PROJECT_ID = 'studio-9105849211-9ba48';

export async function getSecret(secretName: string): Promise<string> {
  const name = `projects/${PROJECT_ID}/secrets/${secretName}/versions/latest`;

  try {
    const [version] = await client.accessSecretVersion({
      name,
    });

    const payload = version.payload?.data?.toString();

    if (!payload) {
      throw new Error(`Secret ${secretName} has no payload.`);
    }

    return payload;
  } catch (error) {
    console.error(`Error accessing secret ${secretName}:`, error);
    throw new Error(`Could not access secret ${secretName}.`);
  }
}
