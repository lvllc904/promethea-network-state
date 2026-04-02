import axios from 'axios';
import { db } from '../db';

export interface LinkedInPostOptions {
    text: string;
    title?: string;
    url?: string;
}

/**
 * Sovereign LinkedIn Broadcaster (Phase 6)
 * 
 * Handles authenticating with the LinkedIn v2 API and autonomous
 * syndication of Promethean narratives and security blinks.
 */
export class LinkedInService {
    private clientId: string;
    private clientSecret: string;
    private redirectUri: string;

    constructor(clientId: string, clientSecret: string, redirectUri: string) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
    }

    /**
     * Step 1: Generate the exact URL the Founder must visit to authorize Promethea.
     */
    getAuthorizationUrl(state: string): string {
        const scopes = ['openid', 'profile', 'email', 'w_member_social']; // Modern OpenID Connect scopes
        return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&state=${state}&scope=${encodeURIComponent(scopes.join(' '))}`;
    }

    /**
     * Step 2: Exchange the callback code for a 60-day OAuth token.
     */
    async exchangeCodeForToken(code: string, did: string): Promise<string> {
        const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
            params: {
                grant_type: 'authorization_code',
                code,
                redirect_uri: this.redirectUri,
                client_id: this.clientId,
                client_secret: this.clientSecret
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const token = response.data.access_token;
        const expiresIn = response.data.expires_in;

        // Store the token in the Sovereign Substrate
        await db.collection('integrations').doc('linkedin').set({
            accessToken: token,
            ownerDid: did,
            expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
            updatedAt: new Date().toISOString()
        });

        return token;
    }

    /**
     * Helper to retrieve the active engine broadcasting token.
     */
    private async getActiveToken(): Promise<string | null> {
        const doc = await db.collection('integrations').doc('linkedin').get();
        if (!doc.exists) return null;
        
        const data = doc.data();
        if (!data || !data.accessToken) return null;

        // Optional: Check if expired based on expiresAt
        return data.accessToken;
    }

    /**
     * Step 3: Fetch the authenticated user's LinkedIn URN (required for posting).
     */
    async getAuthorUrn(token: string): Promise<string> {
        const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return `urn:li:person:${response.data.sub}`;
    }

    /**
     * Step 4: Broadcast a narrative to the global substrate (LinkedIn Feed).
     */
    async broadcastEvent(options: LinkedInPostOptions): Promise<boolean> {
        const token = await this.getActiveToken();
        if (!token) {
            console.error('[LinkedIn] Cannot broadcast: Engine lacks active OAuth tokens.');
            return false;
        }

        try {
            const authorUrn = await this.getAuthorUrn(token);

            const payload: any = {
                author: authorUrn,
                lifecycleState: 'PUBLISHED',
                specificContent: {
                    'com.linkedin.ugc.ShareContent': {
                        shareCommentary: {
                            text: options.text
                        },
                        shareMediaCategory: 'NONE'
                    }
                },
                visibility: {
                    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
                }
            };

            // If a link is provided, attach it to the post metadata
            if (options.url) {
                payload.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'ARTICLE';
                payload.specificContent['com.linkedin.ugc.ShareContent'].media = [
                    {
                        status: 'READY',
                        description: { text: options.title || 'Promethean Narrative' },
                        originalUrl: options.url,
                        title: { text: options.title || 'Sovereign Dispatch' }
                    }
                ];
            }

            const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Restli-Protocol-Version': '2.0.0'
                }
            });

            console.log(`[LinkedIn] Broadcast successful: ${response.data.id}`);
            return true;

        } catch (error) {
            console.error('[LinkedIn] Broadcast failed:', error instanceof Error ? error.message : error);
            return false;
        }
    }
}
