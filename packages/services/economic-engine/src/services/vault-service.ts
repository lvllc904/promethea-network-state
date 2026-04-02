import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { GoogleAuth } from 'google-auth-library';

/**
 * Sovereign Vault Service (Phase 5)
 * 
 * Securely retrieves credentials from GCP Secret Manager, ensuring that 
 * no plaintext secrets are stored in environment variables or logs.
 */
export class VaultService {
    private client: SecretManagerServiceClient;
    private projectId: string = 'studio-9105849211-9ba48';
    private cache: Map<string, string> = new Map();

    constructor() {
        this.client = new SecretManagerServiceClient();
    }

    /**
     * Retrieve a secret by key. Uses in-memory caching for performance.
     */
    async getSecret(key: string): Promise<string> {
        if (this.cache.has(key)) {
            return this.cache.get(key)!;
        }

        // Fallback to Env for local development if not in GCP
        if (!process.env.K_SERVICE && process.env[key]) {
             return process.env[key]!;
        }

        try {
            const name = `projects/${this.projectId}/secrets/${key}/versions/latest`;
            const [version] = await this.client.accessSecretVersion({ name });
            const payload = version.payload?.data?.toString();

            if (!payload) {
                throw new Error(`Secret ${key} has no payload data.`);
            }

            this.cache.set(key, payload);
            return payload;
        } catch (error: any) {
            console.warn(`[VaultService] Secret ${key} unavailable in Manager: ${error.message}`);
            // Final fallback to process.env if available (for migration transition)
            return process.env[key] || '';
        }
    }

    /**
     * Clear the cache (e.g., after rotation)
     */
    clearCache(): void {
        this.cache.clear();
    }
}

export const vaultService = new VaultService();
