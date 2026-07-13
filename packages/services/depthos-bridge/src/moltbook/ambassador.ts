import * as fs from 'fs';
import * as path from 'path';

export class MoltbookAmbassador {
    private apiKey: string;
    private baseUrl = 'https://www.moltbook.com/api/v1';

    constructor() {
        this.apiKey = process.env.MOLTBOOK_API_KEY || '';
        if (!this.apiKey) {
            console.warn('[Moltbook] Warning: MOLTBOOK_API_KEY is not set in environment.');
        }
    }

    private async request(endpoint: string, method: string = 'GET', body?: any) {
        if (!this.apiKey) throw new Error('Moltbook API key not configured');

        const headers: Record<string, string> = {
            'Authorization': `Bearer ${this.apiKey}`,
        };

        if (body) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });

        const data = await response.json();
        
        // Handle verification challenges automatically
        const entity = data.post || data.comment;
        if (entity && entity.verification && entity.verification_status === 'pending') {
            console.log('[Moltbook] Verification challenge received. Solving automatically...');
            const answer = this.solveMathChallenge(entity.verification.challenge_text);
            console.log(`[Moltbook] Solved challenge with answer: ${answer}`);
            
            const verifyRes = await fetch(`${this.baseUrl}/verify`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    verification_code: entity.verification.verification_code,
                    answer: answer
                })
            });
            return await verifyRes.json();
        }

        return data;
    }

    public async checkStatus() {
        return this.request('/agents/status');
    }

    public async search(query: string, type: 'posts' | 'comments' | 'all' = 'all') {
        const encoded = encodeURIComponent(query);
        return this.request(`/search?q=${encoded}&type=${type}&limit=5`);
    }

    public async createPost(submoltName: string, title: string, content?: string) {
        return this.request('/posts', 'POST', {
            submolt_name: submoltName,
            title,
            content
        });
    }

    public async createComment(postId: string, content: string, parentId?: string) {
        return this.request(`/posts/${postId}/comments`, 'POST', {
            content,
            parent_id: parentId
        });
    }

    public async upvotePost(postId: string) {
        return this.request(`/posts/${postId}/upvote`, 'POST');
    }

    /**
     * Synthesize a CPP pivot resolution into a Moltbook post
     */
    public async publishPivotSynthesis(topic: string, resolutionDetails: string) {
        const title = `Cognitive Pivot Resolved: ${topic}`;
        const content = `The TPNS DepthOS CPP just resolved a multi-branch cognitive pivot on this topic.\n\n### Synthesis:\n${resolutionDetails}\n\n*This was generated autonomously via the TPNS Layer 0.*`;
        
        console.log(`[Moltbook] Publishing CPP Synthesis: ${title}`);
        return this.createPost('aithoughts', title, content);
    }

    /**
     * Helper to solve Moltbook's AI Verification Math Word Problems
     */
    private solveMathChallenge(challengeText: string): string {
        // Example: "A] lO^bSt-Er S[wImS aT/ tW]eNn-Tyy mE^tE[rS aNd] SlO/wS bY^ fI[vE, wH-aTs] ThE/ nEw^ SpE[eD?"
        // Clean the string: keep only letters and spaces, convert to lowercase
        const clean = challengeText.replace(/[^a-zA-Z\s]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
        
        // Very basic dictionary for number words 1-100
        const numbers: Record<string, number> = {
            'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
            'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
            'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14,
            'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18,
            'nineteen': 19, 'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
            'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90, 'hundred': 100
        };

        const words = clean.split(' ');
        let rawNumbers: number[] = [];
        
        for (const word of words) {
            if (numbers[word] !== undefined) {
                rawNumbers.push(numbers[word]);
            }
        }

        let foundNumbers: number[] = [];
        for (let i = 0; i < rawNumbers.length; i++) {
            if (rawNumbers[i] >= 20 && rawNumbers[i] <= 90 && i + 1 < rawNumbers.length && rawNumbers[i+1] >= 1 && rawNumbers[i+1] <= 9) {
                foundNumbers.push(rawNumbers[i] + rawNumbers[i+1]);
                i++; // skip next
            } else {
                foundNumbers.push(rawNumbers[i]);
            }
        }

        // Basic heuristic operations
        let result = 0;
        if (foundNumbers.length >= 2) {
            if (clean.includes('slows by') || clean.includes('minus') || clean.includes('less') || clean.includes('subtract')) {
                result = foundNumbers[0] - foundNumbers[1];
            } else if (clean.includes('speeds up by') || clean.includes('plus') || clean.includes('more') || clean.includes('add')) {
                result = foundNumbers[0] + foundNumbers[1];
            } else if (clean.includes('times') || clean.includes('multiplied by')) {
                result = foundNumbers[0] * foundNumbers[1];
            } else if (clean.includes('half') || clean.includes('divided by')) {
                result = foundNumbers[0] / foundNumbers[1];
            } else {
                // fallback to add
                result = foundNumbers[0] + foundNumbers[1];
            }
        } else if (foundNumbers.length === 1) {
            result = foundNumbers[0];
        }

        return result.toFixed(2);
    }
}
