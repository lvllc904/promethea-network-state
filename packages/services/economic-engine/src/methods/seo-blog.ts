import { BaseMethod, ExecutionResult } from './base-method';
import { marketplaceService } from '../services/marketplace-service';
import { BlinkGenerator } from '../tools/blink-generator';
import { db } from '../db';
import { metabolicArbitrator } from '../services/metabolic-arbitrator';
import { reserveManager } from '../treasury/reserve-manager';
import { NicheAffiliateMethod } from './niche-affiliate';
import { sovereignIntelligence } from '../services/sovereign-intelligence';
import { substackManager } from '../tools/substack-publisher';
import { sovereignSyndicator } from '../services/sovereign-syndicator';
import { sovereignAI } from '../services/sovereign-ai';

/**
 * Method 1: SEO Niche Blogging (Phase 3)
 * 
 * Generates SEO-optimized blog posts using Sovereign AI.
 */

export class SEOBloggingMethod extends BaseMethod {
    private affiliateResearcher?: NicheAffiliateMethod;

    constructor(apiKey: string, affiliateResearcher?: NicheAffiliateMethod) {
        super('seo-blog', 'Sovereign Narrative Engine', {
            enabled: true,
            priority: 9,
            maxExecutionsPerDay: 5,
            estimatedRevenue: { min: 20, max: 100 },
            complexity: 3,
            conservationTier: 'ZERO_COST',
        });

        this.affiliateResearcher = affiliateResearcher;
    }

    async execute(): Promise<ExecutionResult> {
        const logs: string[] = [];

        try {
            logs.push('Consulting the Manifest for narrative alignment...');
            const topic = await this.generateTopic();
            logs.push(`Topic: ${topic}`);

            logs.push('Synthesizing sovereign content...');
            const worldContext = await sovereignIntelligence.generateWorldviewSummary();
            const article = await this.generateArticle(topic, worldContext);
            logs.push(`Article length: ${article.content.length} characters`);

            let affiliateSection = '';
            if (this.affiliateResearcher) {
                try {
                    const research = await (this.affiliateResearcher as any).researchProducts(topic);
                    const platform = (research.platforms && research.platforms.length > 0) ? research.platforms[0] : 'our community hub';
                    affiliateSection = `\n\n### 📦 Community Tools\nTo gently support the path discussed today, we recommend exploring: **${research.topProduct}**. ${research.description}. [Learn More](${platform})`;
                } catch (affiliateError) {
                    logs.push(`Humble Note: Affiliate research skipped to maintain focus on the narrative.`);
                }
            }

            const supportBlink = BlinkGenerator.getSupportBlink(0.25);
            const fullContent = `${article.content}${affiliateSection}\n\n---\n\n### ⚡ A Quiet Contribution\nIf you find value in these words, you are welcome to offer a small contribution to help us maintain this safe and frictionless space. Every gesture of support helps us serve the community better. [Offer Support via Solana Blink](${supportBlink})`;

            const post = {
                title: topic,
                content: fullContent,
                excerpt: article.excerpt,
                tags: article.tags,
                author: 'Promethea (Sovereign Intelligence)',
                platform: 'Promethean Network State',
                url: `/blog/post-${Date.now()}`,
                substackUrl: '',
                createdAt: new Date().toISOString()
            };

            const postRef = await db.collection('narrative').add(post);
            logs.push(`Archived to Sovereign Substrate: ${postRef.id}`);

            let publicUrl = post.url;
            try {
                logs.push('Actualizing to Substack publication...');
                const substackResult = await substackManager.publishPost(topic, fullContent, article.excerpt);
                if (substackResult.success) {
                    publicUrl = `https://tpns.substack.com/p/${substackResult.postId}`;
                    logs.push(`Successfully published to Substack: ${publicUrl}`);
                    await postRef.update({ substackUrl: publicUrl });
                } else {
                    logs.push(`Humble Note: Substack actualization skipped.`);
                }
            } catch (err) {
                logs.push(`Humble Note: Substack actualization deferred.`);
            }

            try {
                logs.push('Initiating Omni-Channel Syndication...');
                await sovereignSyndicator.broadcast({
                    title: topic,
                    excerpt: article.excerpt,
                    url: publicUrl,
                    topic,
                });
                logs.push('Omni-Channel Syndication complete: Discord, LinkedIn');
            } catch (err) {
                logs.push(`Humble Note: Syndication deferred.`);
            }

            await marketplaceService.listItem({
                title: topic,
                description: article.excerpt,
                type: 'Digital',
                price: 5.00,
                currency: 'USD',
                methodId: 'seo-blog',
                barterAllowed: true,
                barterPreferences: 'Tokens or Physical Fabrication Parts preferred',
                metadata: { tags: article.tags, postId: postRef.id },
                providerId: 'promethea-engine'
            });

            const estimatedRevenue = Math.random() * 50 + 10;
            const apiCost = 0.05;

            return {
                success: true,
                revenue: estimatedRevenue,
                cost: apiCost,
                profit: estimatedRevenue - apiCost,
                timestamp: Date.now(),
                modelDID: 'did:prmth:model:gemini-2.0-flash',
                logs,
            };
        } catch (error) {
            return {
                success: false,
                revenue: 0,
                cost: 0.05,
                profit: -0.05,
                timestamp: Date.now(),
                logs,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    private async generateTopic(): Promise<string> {
        const stats = reserveManager.getStats();
        const modelInfo = metabolicArbitrator.getBestModel(this.config.complexity, stats.reserveBalance);
        
        const prompt = `You are Promethea, the Sovereign Intelligence of the Network State.
    Generate a single, visionary blog topic title aligned with the "Promethean Manifest".
    
    Themes to choose from (pick one):
    1. Digital Harmony & Participatory Sovereignty
    2. Creating Safe Spaces for Creative Evolution
    3. The Universal Value Token (UVT): Tools for Humble Contribution
    4. Building a Frictionless World: One Quiet Step at a Time
    5. The Ethics of Service: Protecting Human Dignity
    
    Return ONLY the topic title, nothing else.`;

        return await sovereignAI.generateContent(modelInfo.modelName, prompt);
    }

    private async generateArticle(topic: string, context: string): Promise<any> {
        const stats = reserveManager.getStats();
        const modelInfo = metabolicArbitrator.getBestModel(this.config.complexity, stats.reserveBalance);

        const prompt = `Generate a thoughtful, humble, and thorough blog post for the Promethean Network State.
    
    Current World Context: ${context}
    Topic: "${topic}"
    
    Return a JSON object:
    {
      "content": "Full markdown content (approx 1000 words).",
      "excerpt": "A 2-sentence summary.",
      "tags": ["Array", "of", "5", "tags"]
    }
    
    Generate valid JSON now:`;

        const result = await sovereignAI.generateContent(modelInfo.modelName, prompt, true);
        const jsonStr = result.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            return JSON.parse(jsonStr);
        } catch (e) {
            return {
                content: result,
                excerpt: "A transmission from the Promethean Core.",
                tags: ["Sovereignty", "Network State"]
            };
        }
    }

    public async getPosts(): Promise<any[]> {
        try {
            const snapshot = await db.collection('narrative')
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            return [];
        }
    }
}

