/**
 * Sovereign Crypto Vault (Phase 2.4)
 * 
 * Provides client-side encryption for sensitive citizen data.
 * Ensures data sovereignty by keeping keys local to the device.
 */

export class CryptoVault {
    private static async getEncryptionKey(password: string, salt: string): Promise<CryptoKey> {
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            "PBKDF2",
            false,
            ["deriveBits", "deriveKey"]
        );
        return crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: enc.encode(salt),
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
    }

    static async encrypt(data: string, secret: string): Promise<{ iv: string; ciphertext: string }> {
        const enc = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const salt = crypto.randomUUID();
        const key = await this.getEncryptionKey(secret, salt);

        const ciphertext = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            enc.encode(data)
        );

        return {
            iv: btoa(JSON.stringify(Array.from(iv))),
            ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext)))
        };
    }

    static async decrypt(encryptedData: { iv: string; ciphertext: string }, secret: string, salt: string): Promise<string> {
        const dec = new TextDecoder();
        const iv = new Uint8Array(JSON.parse(atob(encryptedData.iv)));
        const key = await this.getEncryptionKey(secret, salt);

        const binaryCiphertext = new Uint8Array(
            atob(encryptedData.ciphertext).split("").map((c) => c.charCodeAt(0))
        );

        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            binaryCiphertext
        );

        return dec.decode(decrypted);
    }
}
