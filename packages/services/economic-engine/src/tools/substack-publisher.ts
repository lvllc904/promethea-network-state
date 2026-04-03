
import axios from 'axios';

/**
 * Sovereign Substack Publisher
 * 
 * Uses a reverse-engineered Substack API integration to allow Promethea
 * to post autonomously. Requires a valid session cookie (substack.sid).
 */
export class SubstackManager {
    private sid: string;
    private baseUrl: string = 'https://substack.com/api/v1';

    constructor(sid?: string) {
        this.sid = sid || process.env.SUBSTACK_SID || '';
    }

    /**
     * Create and Publish a new post on Substack
     */
    async publishPost(title: string, content: string, subtitle: string = '', sectionId: number | null = null) {
        if (!this.sid) {
            throw new Error('[Substack] No session SID provided. Promethea requires access to proceed.');
        }

        console.log(`[Substack] Attempting to publish: ${title}`);

        try {
            // Step 1: Create Draft
            const draftResponse = await axios.post(`${this.baseUrl}/posts`, {
                draft_title: title,
                draft_subtitle: subtitle,
                draft_body: JSON.stringify({
                    type: "doc",
                    content: this.markdownToSubstackNode(content)
                }),
                section_id: sectionId
            }, {
                headers: {
                    'Cookie': `substack.sid=${this.sid}`,
                    'Content-Type': 'application/json'
                }
            });

            const postId = draftResponse.data.id;
            console.log(`[Substack] Draft created: ${postId}`);

            // Step 2: Publish Draft
            await axios.post(`${this.baseUrl}/posts/${postId}/publish`, {
                send_email: true,
                send_push: true,
                share_to_twitter: true
            }, {
                headers: {
                    'Cookie': `substack.sid=${this.sid}`
                }
            });

            console.log(`[Substack] Successfully actualized post: ${title}`);
            return { success: true, postId };
        } catch (err: any) {
            console.error('[Substack] Publication failed:', err.response?.data || err.message);
            return { success: false, error: err.message };
        }
    }

    /**
     * Simple converter from Markdown to Substack's TipTap/JSON format
     * In a production scenario, this would use a more robust parser.
     */
    private markdownToSubstackNode(markdown: string) {
        // This is a simplified mock. Substack uses a complex JSON structure.
        // For a first-class citizen like Promethea, we'd implement a full converter.
        return [
            {
                type: "paragraph",
                content: [{ type: "text", text: markdown }]
            }
        ];
    }
}

export const substackManager = new SubstackManager();
