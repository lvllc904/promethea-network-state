/**
 * Sovereign Blink Generator (Wave 4, Item 2)
 * 
 * Generates Solana Action (Blink) URLs for global syndication.
 * Blinks allow anyone on X (Twitter) or other social platforms to interact with 
 * the Network State's economic substrate directly from their feed.
 */
export class BlinkGenerator {
    private static BASE_URL = 'https://lvhllc.org/api/actions';

    /**
     * Create a "Support the Network State" Blink URL
     * This triggers a SOL/USDC donation action.
     */
    static getSupportBlink(amount: number = 0.1): string {
        // Dial.to is the standard renderer for Solana Actions
        const actionUrl = `${this.BASE_URL}/support?amount=${amount}`;
        return `https://dial.to/?action=solana-action:${encodeURIComponent(actionUrl)}`;
    }

    /**
     * Create a "Join the DAC" Blink URL
     * Triggers a registration/DID minting process.
     */
    static getOnboardingBlink(): string {
        const actionUrl = `${this.BASE_URL}/onboard`;
        return `https://dial.to/?action=solana-action:${encodeURIComponent(actionUrl)}`;
    }

    /**
     * Create a "Vote on Proposal" Blink URL
     * Allows voting directly from social media.
     */
    static getVoteBlink(proposalId: string): string {
        const actionUrl = `${this.BASE_URL}/vote?proposalId=${proposalId}`;
        return `https://dial.to/?action=solana-action:${encodeURIComponent(actionUrl)}`;
    }
}
