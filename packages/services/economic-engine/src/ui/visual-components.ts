/**
 * Visual Components Library
 * Rich UI elements for Discord Economy
 */

/**
 * Generate ASCII progress bar
 */
export function createProgressBar(current: number, max: number, width: number = 20): string {
    const percentage = Math.min(current / max, 1);
    const filled = Math.floor(percentage * width);
    const empty = width - filled;

    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const percent = Math.floor(percentage * 100);

    return `${bar} ${percent}%`;
}

/**
 * Generate UVT balance visualization (sparkline-style)
 */
export function createBalanceChart(balance: number, maxSeen: number = 100): string {
    const bars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    const percentage = Math.min(balance / maxSeen, 1);
    const barIndex = Math.floor(percentage * (bars.length - 1));

    return bars[barIndex].repeat(10);
}

/**
 * Create wealth tier badge
 */
export function getWealthTier(balance: number): { tier: string; emoji: string; color: number } {
    if (balance >= 100) return { tier: 'Sovereign Elite', emoji: '👑', color: 0xFFD700 };
    if (balance >= 50) return { tier: 'Noble Contributor', emoji: '💎', color: 0x9B59B6 };
    if (balance >= 20) return { tier: 'Valued Citizen', emoji: '⭐', color: 0x3498DB };
    if (balance >= 5) return { tier: 'Active Miner', emoji: '⛏️', color: 0x2ECC71 };
    return { tier: 'Newcomer', emoji: '🌱', color: 0x95A5A6 };
}

/**
 * Format UVT amount with emoji
 */
export function formatUVT(amount: number): string {
    if (amount >= 100) return `🏆 ${amount.toFixed(2)} UVT`;
    if (amount >= 10) return `💰 ${amount.toFixed(2)} UVT`;
    if (amount >= 1) return `🪙 ${amount.toFixed(3)} UVT`;
    return `✨ ${amount.toFixed(4)} UVT`;
}

/**
 * Create quest difficulty badge
 */
export function getQuestDifficulty(reward: number): { level: string; emoji: string } {
    if (reward >= 50) return { level: 'Legendary', emoji: '🔥' };
    if (reward >= 20) return { level: 'Epic', emoji: '⚡' };
    if (reward >= 10) return { level: 'Rare', emoji: '💫' };
    if (reward >= 5) return { level: 'Common', emoji: '⭐' };
    return { level: 'Basic', emoji: '📝' };
}

/**
 * Create status badge
 */
export function getStatusBadge(status: 'OPEN' | 'CLAIMED' | 'COMPLETED'): { text: string; emoji: string; color: number } {
    switch (status) {
        case 'OPEN':
            return { text: 'OPEN', emoji: '🟢', color: 0x2ECC71 };
        case 'CLAIMED':
            return { text: 'IN PROGRESS', emoji: '🟡', color: 0xF39C12 };
        case 'COMPLETED':
            return { text: 'COMPLETED', emoji: '✅', color: 0x95A5A6 };
    }
}

/**
 * Create transaction type icon
 */
export function getTransactionIcon(type: string): string {
    const icons: { [key: string]: string } = {
        'mining': '⛏️',
        'quest': '⚔️',
        'purchase': '🛒',
        'commission': '📝',
        'bonus': '🎁',
        'admin': '👑'
    };
    return icons[type] || '💫';
}

/**
 * Create animated loading message
 */
export function createLoadingEmbed(title: string): any {
    return {
        title: `⏳ ${title}`,
        description: `${'▰'.repeat(3)}${'▱'.repeat(7)} Processing...`,
        color: 0x3498DB,
        footer: { text: 'Please wait...' }
    };
}

/**
 * Create success animation
 */
export function createSuccessEmbed(title: string, description: string): any {
    return {
        title: `✨ ${title}`,
        description: `✓ ${description}`,
        color: 0x2ECC71,
        footer: { text: '🎉 Transaction Complete' },
        timestamp: new Date().toISOString()
    };
}

/**
 * Create error message
 */
export function createErrorEmbed(title: string, error: string): any {
    return {
        title: `❌ ${title}`,
        description: `⚠️ ${error}`,
        color: 0xE74C3C,
        footer: { text: 'Please try again' }
    };
}

/**
 * ASCII Art: UVT Logo
 */
export const UVT_LOGO = `
╔═══════════════════════════╗
║   🪙  U V T              ║
║   Universal Value Token   ║
╚═══════════════════════════╝
`;

/**
 * Generate leaderboard visual
 */
export function createLeaderboard(users: { username: string; balance: number }[], currentUserId?: string): string {
    const medals = ['🥇', '🥈', '🥉'];

    return users.map((user, i) => {
        const rank = i < 3 ? medals[i] : `${i + 1}.`;
        const highlight = user.username === currentUserId ? '→ **' : '';
        return `${rank} ${highlight}${user.username}${highlight}: ${formatUVT(user.balance)}`;
    }).join('\n');
}

/**
 * Wealth distribution pie chart (emoji-based)
 */
export function createWealthDistribution(top20Percent: number): string {
    const segments = Math.floor(top20Percent / 10);
    const filled = '🟦'.repeat(segments);
    const empty = '⬜'.repeat(10 - segments);

    return `${filled}${empty} ${top20Percent.toFixed(0)}%`;
}

/**
 * Create quest card preview
 */
export function createQuestCardPreview(quest: any): string {
    const difficulty = getQuestDifficulty(quest.reward);
    const status = getStatusBadge(quest.status);

    return `
${difficulty.emoji} **${quest.title}**
${status.emoji} Status: ${status.text}
💰 Reward: ${formatUVT(quest.reward)}
🆔 ${quest.questId}
    `.trim();
}
