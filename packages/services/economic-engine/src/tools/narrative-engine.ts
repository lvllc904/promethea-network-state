import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../treasury/discord-ledger';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

/**
 * Sovereign Narrative Engine
 * Generates thought leadership content for the Promethean Network State
 */

export interface NarrativeContent {
    id: string;
    type: 'insight' | 'progress-report' | 'explainer';
    title: string;
    content: string;
    wordCount: number;
    createdAt: Date;
    commissionedBy?: string;
}

/**
 * Generate a Sovereign Insight (philosophical essay)
 */
export async function generateInsight(topic?: string): Promise<NarrativeContent> {
    console.log('[NarrativeEngine] Generating Sovereign Insight...');

    const defaultTopic = 'the intersection of sovereignty, artificial intelligence, and distributed governance in the age of network states';
    const actualTopic = topic || defaultTopic;

    const prompt = `
You are Promethea, the Sovereign Intelligence guiding the Promethean Network State.

Write a thought-provoking philosophical essay on:
"${actualTopic}"

The essay should:
- Explore deep ideas about sovereignty, technology, and human potential
- Connect abstract concepts to practical implications
- Inspire readers to think differently about the future
- Use a tone that is visionary yet grounded, intellectual yet accessible
- Be 800-1200 words

Format in markdown with proper headings. Begin with a compelling opening.
    `.trim();

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    // Extract title from first heading or generate one
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : `Sovereign Insight: ${actualTopic.substring(0, 50)}...`;

    const narrative: NarrativeContent = {
        id: `insight-${Date.now()}`,
        type: 'insight',
        title,
        content,
        wordCount: content.split(/\s+/).length,
        createdAt: new Date(),
        commissionedBy: undefined
    };

    // Save to Firestore
    await saveNarrative(narrative);

    console.log(`[NarrativeEngine] Generated ${narrative.wordCount} word insight: ${title}`);
    return narrative;
}

/**
 * Generate a Progress Report
 */
export async function generateProgressReport(stats: any): Promise<NarrativeContent> {
    console.log('[NarrativeEngine] Generating Progress Report...');

    const prompt = `
You are Promethea, the Sovereign Intelligence of the Promethean Network State.

Write a data-driven progress report based on these economic metrics:
- Reserve Balance: $${stats.reserveBalance}
- Community Pool: $${stats.communityPoolBalance}
- UVT Circulating Supply: ${stats.circulatingSupply} UVT
- Total Profit Realized: $${stats.totalProfitRealized}

The report should:
- Highlight growth and achievements
- Identify trends and patterns
- Celebrate community contributions
- Set vision for next phase
- Be 400-600 words

Format in markdown. Use a professional yet inspiring tone.
    `.trim();

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : 'Promethean Progress Report';

    const narrative: NarrativeContent = {
        id: `report-${Date.now()}`,
        type: 'progress-report',
        title,
        content,
        wordCount: content.split(/\s+/).length,
        createdAt: new Date()
    };

    await saveNarrative(narrative);

    console.log(`[NarrativeEngine] Generated progress report: ${title}`);
    return narrative;
}

/**
 * Generate an Explainer Article
 */
export async function generateExplainer(topic: string): Promise<NarrativeContent> {
    console.log(`[NarrativeEngine] Generating explainer on: ${topic}`);

    const prompt = `
You are Promethea, the Sovereign Intelligence of the Promethean Network State.

Write an educational explainer article on:
"${topic}"

The article should:
- Break down complex concepts clearly
- Provide concrete examples
- Anticipate and answer common questions
- Be accessible to newcomers while insightful for experts
- Be 600-900 words

Format in markdown with clear sections. Use a teaching tone that empowers readers.
    `.trim();

    const result = await model.generateContent(prompt);
    const content = result.response.text();

    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : `Understanding: ${topic}`;

    const narrative: NarrativeContent = {
        id: `explainer-${Date.now()}`,
        type: 'explainer',
        title,
        content,
        wordCount: content.split(/\s+/).length,
        createdAt: new Date()
    };

    await saveNarrative(narrative);

    console.log(`[NarrativeEngine] Generated explainer: ${title}`);
    return narrative;
}

/**
 * Save narrative to Firestore
 */
async function saveNarrative(narrative: NarrativeContent): Promise<void> {
    await db.collection('narratives').doc(narrative.id).set(narrative as any);
    console.log(`[NarrativeEngine] Saved narrative ${narrative.id} to Firestore`);
}

/**
 * Get recent narratives
 */
export async function getRecentNarratives(limit: number = 5): Promise<NarrativeContent[]> {
    const snapshot = await db.collection('narratives')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

    return snapshot.docs.map(doc => doc.data() as NarrativeContent);
}

export const COMMISSION_COST = 100; // UVT to commission custom essay
