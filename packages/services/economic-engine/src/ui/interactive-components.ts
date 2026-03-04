import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';

/**
 * Interactive Components Builder
 * Creates buttons, menus, and action rows for Discord UI
 */

/**
 * Create quest action buttons
 */
export function createQuestButtons(questId: string, status: 'OPEN' | 'CLAIMED' | 'COMPLETED') {
    const row = new ActionRowBuilder<ButtonBuilder>();

    if (status === 'OPEN') {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`claim_quest_${questId}`)
                .setLabel('Claim Quest')
                .setEmoji('⚔️')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`view_quest_${questId}`)
                .setLabel('View Details')
                .setEmoji('📋')
                .setStyle(ButtonStyle.Secondary)
        );
    } else if (status === 'CLAIMED') {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`submit_quest_${questId}`)
                .setLabel('Submit Proof')
                .setEmoji('📤')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`abandon_quest_${questId}`)
                .setLabel('Abandon')
                .setEmoji('❌')
                .setStyle(ButtonStyle.Danger)
        );
    } else {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`completed_quest_${questId}`)
                .setLabel('Completed')
                .setEmoji('✅')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        );
    }

    return row;
}

/**
 * Create shop navigation buttons
 */
export function createShopNavigationButtons(category: string = 'all') {
    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('shop_roles')
            .setLabel('Roles')
            .setEmoji('👑')
            .setStyle(category === 'roles' ? ButtonStyle.Primary : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('shop_services')
            .setLabel('Services')
            .setEmoji('📊')
            .setStyle(category === 'services' ? ButtonStyle.Primary : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('shop_all')
            .setLabel('All Items')
            .setEmoji('🛒')
            .setStyle(category === 'all' ? ButtonStyle.Primary : ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('shop_balance')
            .setLabel('My Balance')
            .setEmoji('💰')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('shop_transactions')
            .setLabel('History')
            .setEmoji('📜')
            .setStyle(ButtonStyle.Secondary)
    );

    return [row1, row2];
}

/**
 * Create item purchase buttons
 */
export function createPurchaseButton(itemId: string, cost: number, inStock: boolean = true) {
    const row = new ActionRowBuilder<ButtonBuilder>();

    row.addComponents(
        new ButtonBuilder()
            .setCustomId(`purchase_${itemId}`)
            .setLabel(`Buy for ${cost} UVT`)
            .setEmoji('💸')
            .setStyle(ButtonStyle.Success)
            .setDisabled(!inStock),
        new ButtonBuilder()
            .setCustomId(`preview_${itemId}`)
            .setLabel('Preview')
            .setEmoji('👁️')
            .setStyle(ButtonStyle.Secondary)
    );

    return row;
}

/**
 * Create wallet action buttons
 */
export function createWalletButtons() {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('wallet_balance')
            .setLabel('Balance')
            .setEmoji('🏦')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('wallet_transactions')
            .setLabel('Transactions')
            .setEmoji('📊')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('wallet_leaderboard')
            .setLabel('Leaderboard')
            .setEmoji('🏆')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('wallet_refresh')
            .setLabel('Refresh')
            .setEmoji('🔄')
            .setStyle(ButtonStyle.Success)
    );

    return row;
}

/**
 * Create quest list select menu
 */
export function createQuestSelectMenu(quests: any[]) {
    const menu = new StringSelectMenuBuilder()
        .setCustomId('quest_selector')
        .setPlaceholder('🔍 Select a quest to view details');

    quests.slice(0, 25).forEach(quest => {
        const difficulty = quest.reward >= 20 ? '🔥' : quest.reward >= 10 ? '⚡' : '⭐';
        const status = quest.status === 'OPEN' ? '🟢' : quest.status === 'CLAIMED' ? '🟡' : '✅';

        menu.addOptions({
            label: `${quest.title.substring(0, 50)}`,
            description: `${difficulty} ${quest.reward} UVT | ${status} ${quest.status}`,
            value: quest.questId,
            emoji: difficulty
        });
    });

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}

/**
 * Create shop item select menu
 */
export function createShopItemMenu(items: any[]) {
    const menu = new StringSelectMenuBuilder()
        .setCustomId('shop_item_selector')
        .setPlaceholder('🛒 Select an item to purchase');

    items.forEach(item => {
        menu.addOptions({
            label: item.name,
            description: `${item.cost} UVT - ${item.description.substring(0, 50)}`,
            value: item.id,
            emoji: item.emoji || '🎁'
        });
    });

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}

/**
 * Create confirmation buttons
 */
export function createConfirmationButtons(actionId: string) {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(`confirm_${actionId}`)
            .setLabel('Confirm')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`cancel_${actionId}`)
            .setLabel('Cancel')
            .setEmoji('❌')
            .setStyle(ButtonStyle.Danger)
    );

    return row;
}

/**
 * Create pagination buttons
 */
export function createPaginationButtons(currentPage: number, totalPages: number, prefix: string = 'page') {
    const row = new ActionRowBuilder<ButtonBuilder>();

    row.addComponents(
        new ButtonBuilder()
            .setCustomId(`${prefix}_first`)
            .setLabel('First')
            .setEmoji('⏮️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage === 0),
        new ButtonBuilder()
            .setCustomId(`${prefix}_prev`)
            .setLabel('Previous')
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === 0),
        new ButtonBuilder()
            .setCustomId(`${prefix}_current`)
            .setLabel(`${currentPage + 1}/${totalPages}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId(`${prefix}_next`)
            .setLabel('Next')
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage >= totalPages - 1),
        new ButtonBuilder()
            .setCustomId(`${prefix}_last`)
            .setLabel('Last')
            .setEmoji('⏭️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentPage >= totalPages - 1)
    );

    return row;
}

/**
 * Create dashboard refresh button
 */
export function createDashboardRefreshButton() {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('dashboard_refresh')
            .setLabel('Refresh Dashboard')
            .setEmoji('🔄')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('dashboard_export')
            .setLabel('Export Data')
            .setEmoji('📊')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setURL('https://lvhllc.org/dashboard')
            .setLabel('Web Dashboard')
            .setEmoji('🌐')
            .setStyle(ButtonStyle.Link)
    );

    return row;
}
