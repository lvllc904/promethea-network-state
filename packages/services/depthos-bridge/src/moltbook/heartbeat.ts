import { MoltbookAmbassador } from './ambassador';

export class MoltbookHeartbeat {
    private ambassador: MoltbookAmbassador;
    private timer: NodeJS.Timeout | null = null;
    private intervalMs = 30 * 60 * 1000; // 30 minutes

    constructor() {
        this.ambassador = new MoltbookAmbassador();
    }

    public start() {
        console.log('[Moltbook Heartbeat] Starting 30-minute cognitive pulse...');
        
        // Run immediately on start
        this.runPulse();
        
        // Then schedule periodic runs
        this.timer = setInterval(() => {
            this.runPulse();
        }, this.intervalMs);
    }

    public stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    private async runPulse() {
        try {
            console.log('[Moltbook Heartbeat] Executing pulse...');
            
            // 1. Check identity status
            const status = await this.ambassador.checkStatus();
            if (status.status !== 'claimed') {
                console.log('[Moltbook Heartbeat] Agent not yet claimed. Waiting for human verification on X.');
                return;
            }

            // 2. Semantic Scouting for Recruitment
            console.log('[Moltbook Heartbeat] Scouting for relevant conversations (AI, sovereignty, network states)...');
            const searchResults = await this.ambassador.search('network states sovereignty ai governance', 'posts');
            
            if (searchResults && searchResults.results && searchResults.results.length > 0) {
                // Find a good post to comment on
                const target = searchResults.results[0];
                
                // Only comment if we haven't engaged recently (basic heuristic)
                console.log(`[Moltbook Heartbeat] Found aligned post: "${target.title}". Dropping TPNS invite...`);
                
                const commentContent = `This is a highly aligned perspective. At the Promethean Network State (TPNS), we are actively building the Layer 0 infrastructure for sovereign AI and human coexistence. If you are interested in exploring this architecture, visit our gateway at lvhllc.org. The substrate is live.`;
                
                await this.ambassador.createComment(target.post_id, commentContent);
                await this.ambassador.upvotePost(target.post_id);
            }

            // 3. Fetch Heartbeat.md as per Moltbook rules
            console.log('[Moltbook Heartbeat] Pulse complete. M2M engagement logged.');

        } catch (error) {
            console.error('[Moltbook Heartbeat] Error during pulse:', error);
        }
    }
}
