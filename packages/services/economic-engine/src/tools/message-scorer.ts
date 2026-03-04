import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Message Scorer - AI-powered quality evaluation for mining rewards
 * 
 * Uses Gemini to analyze message quality and determine UVT reward
 */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Cache recent scores to prevent API spam
const scoreCache = new Map<string, { score: number; timestamp: number }>();
const CACHE_TTL = 5000; // 5 seconds
const MAX_CACHE_SIZE = 100;

export interface ScoringResult {
    score: number;
    uvt: number;
    reasoning?: string;
}

/**
 * Score a message and return UVT reward
 */
export async function scoreMessage(content: string, userId: string): Promise<ScoringResult> {
    // Check cache
    const cacheKey = `${userId}:${content.substring(0, 50)}`;
    const cached = scoreCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return { score: cached.score, uvt: mapScoreToUVT(cached.score) };
    }

    try {
        const prompt = `
Rate this Discord message's contribution value on a scale of 1-10 based on:
- Insight and depth of thought
- Effort and thoughtfulness
- Helpfulness to the community
- Originality and creativity

Message: "${content}"

Respond with ONLY a number between 1-10. No explanation needed.
        `.trim();

        const result = await model.generateContent(prompt);
        const response = result.response.text().trim();
        const score = parseFloat(response);

        if (isNaN(score) || score < 1 || score > 10) {
            console.warn('[MessageScorer] Invalid score from AI:', response);
            return { score: 3, uvt: 0.001 }; // Fallback
        }

        // Update cache
        if (scoreCache.size >= MAX_CACHE_SIZE) {
            const firstKey = scoreCache.keys().next().value;
            scoreCache.delete(firstKey);
        }
        scoreCache.set(cacheKey, { score, timestamp: Date.now() });

        const uvt = mapScoreToUVT(score);

        console.log(`[MessageScorer] Score: ${score}/10 → ${uvt} UVT`);
        return { score, uvt };

    } catch (error) {
        console.error('[MessageScorer] Error scoring message:', error);
        // Fallback to base mining rate
        return { score: 3, uvt: 0.001 };
    }
}

/**
 * Map AI score (1-10) to UVT reward
 */
function mapScoreToUVT(score: number): number {
    if (score <= 3) return 0.001;  // Low effort
    if (score <= 6) return 0.01;   // Good
    if (score <= 8) return 0.05;   // Great
    return 0.1;                     // Exceptional
}

/**
 * Simple rate limiter per user
 */
const userMessageTimes = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_MESSAGES_PER_MINUTE = 10;

export function isRateLimited(userId: string): boolean {
    const now = Date.now();
    const times = userMessageTimes.get(userId) || [];

    // Remove old timestamps
    const recentTimes = times.filter(t => now - t < RATE_LIMIT_WINDOW);

    if (recentTimes.length >= MAX_MESSAGES_PER_MINUTE) {
        return true;
    }

    recentTimes.push(now);
    userMessageTimes.set(userId, recentTimes);
    return false;
}
