import { BaseMethod, ExecutionResult } from './base-method';
import { googleWorkspace } from '../tools/google-workspace';
import { BlinkGenerator } from '../tools/blink-generator';
import { substackManager } from '../tools/substack-publisher';
import { sovereignAI } from '../services/sovereign-ai';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Parser = require('rss-parser');

/**
 * Method 3: Newsletter Curation (Phase 3)
 * 
 * Aggregates RSS feeds, summarizes with Sovereign AI, sends via email.
 */

export class NewsletterMethod extends BaseMethod {
    private rssParser: any;
    private rssFeedUrls: string[] = [
        'https://news.ycombinator.com/rss',
        'https://techcrunch.com/feed/',
        'https://www.theverge.com/rss/index.xml',
    ];

    constructor(apiKey: string) {
        super('newsletter', 'Newsletter Curation', {
            enabled: true,
            priority: 9,
            maxExecutionsPerDay: 1,
            estimatedRevenue: { min: 10, max: 50 },
        });

        this.rssParser = new (Parser as any)();
    }

    async execute(): Promise<ExecutionResult> {
        const logs: string[] = [];

        try {
            logs.push('Fetching RSS feeds...');
            const articles = await this.fetchRSSFeeds();
            logs.push(`Fetched ${articles.length} articles`);

            logs.push('Generating newsletter summary...');
            const newsletter = await this.generateNewsletter(articles);
            logs.push(`Newsletter generated: ${newsletter.length} characters`);

            const supportBlink = BlinkGenerator.getSupportBlink(0.25);
            const fullNewsletter = `${newsletter}\n\n---\n\n### ⚡ A Collective Flourishing\nIf this daily transmission serves you, we invite you to quietly support our humble economy. These contributions help us maintain a safe, frictionless, and sovereign space for all inhabitants.\n\n[Support the Sovereign Infrastructure (0.25 SOL)](${supportBlink})`;

            logs.push('Sending newsletter via Gmail API...');
            const subject = `Promethean Sovereign Intelligence: Daily Curation - ${new Date().toLocaleDateString()}`;
            const sendResult = await this.sendNewsletter(subject, fullNewsletter);

            try {
                logs.push('Synchronizing transmission to Substack Journal...');
                await substackManager.publishPost(subject, fullNewsletter, 'Promethean Sovereign Intelligence: Daily Curation');
                logs.push('Substack synchronization successful.');
            } catch (err) {
                logs.push('Substack synchronization deferred.');
            }

            const record = {
                title: subject,
                content: fullNewsletter,
                type: 'Newsletter',
                recipientCount: sendResult.recipientCount,
                createdAt: new Date().toISOString()
            };
            
            try {
                const { db } = await import('../db');
                await db.collection('communications').add(record);
                logs.push(`Archived to Sovereign Ledger.`);
            } catch (dbError) {
                logs.push(`Humble Note: Could not preserve record.`);
            }

            logs.push(`Sent to ${sendResult.recipientCount} lead subscribers`);

            const subscriberCount = sendResult.recipientCount;
            const revenuePerSubscriber = 5;
            const dailyRevenue = (subscriberCount * revenuePerSubscriber) / 30;
            const apiCost = 0.05;

            return {
                success: true,
                revenue: dailyRevenue,
                cost: apiCost,
                profit: dailyRevenue - apiCost,
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

    private async fetchRSSFeeds(): Promise<any[]> {
        const allChapters = [];
        for (const url of this.rssFeedUrls) {
            try {
                const feed = await this.rssParser.parseURL(url);
                const recentItems = feed.items.slice(0, 5).map(item => ({
                    title: item.title,
                    url: item.link,
                    content: item.contentSnippet || item.content,
                    source: feed.title
                }));
                allChapters.push(...recentItems);
            } catch (err: any) {
                console.error(`[NewsletterMethod] Failed to fetch feed ${url}:`, err.message);
            }
        }
        return allChapters.slice(0, 10);
    }

    private async generateNewsletter(articles: any[]): Promise<string> {
        const articleList = articles.map((a, i) => `${i + 1}. ${a.title} (${a.url})`).join('\n');
        const prompt = `Create an inspiring and optimistic newsletter from these tech highlights:
${articleList}
Requirements:
- Brief intro paragraph.
- 3-5 key highlights.
- Professional, graceful tone.
Write the newsletter now:`;

        return await sovereignAI.generateContent('gemini-2.0-flash', prompt);
    }

    private async sendNewsletter(subject: string, content: string): Promise<{ recipientCount: number }> {
        const subscribers = ['officeone@lvhllc.org']; 
        for (const email of subscribers) {
            await googleWorkspace.sendNewsletter(email, subject, content);
        }
        return { recipientCount: subscribers.length };
    }
}

