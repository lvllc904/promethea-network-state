import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, TextChannel, ChannelType, Partials } from 'discord.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { discordLedger } from '../treasury/discord-ledger';
import * as Visuals from '../ui/visual-components';
import * as UI from '../ui/interactive-components';

/**
 * Sovereign Discord Client (Phase 5.2)
 * 
 * Provides full control over Promethea's Discord identity.
 */
export class DiscordClient {
    private client: Client;
    private rest: REST;
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        console.log('[DiscordClient] Initializing with Intents: Guilds, GuildMessages, MessageContent, GuildMembers');
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.DirectMessages
            ],
            partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction]
        });
        this.rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN || '');
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Fast conversational model

        // debug events
        this.client.on('error', (err) => console.error('[DiscordClient] Connection Error:', err));
        this.client.on('warn', (warn) => console.warn('[DiscordClient] Warning:', warn));
    }

    async start() {
        if (!process.env.DISCORD_BOT_TOKEN) {
            console.log('[DiscordClient] DISCORD_BOT_TOKEN missing. Skipping...');
            return;
        }

        this.client.once('ready', () => {
            console.log(`[DiscordClient] Logged in as ${this.client.user?.tag}`);
            this.registerCommands();
        });

        await this.client.login(process.env.DISCORD_BOT_TOKEN);
    }

    private async registerCommands() {
        const commands = [
            new SlashCommandBuilder()
                .setName('metabolics')
                .setDescription('View Promethea\'s metabolic status (Reserve, UVT, Tithes)'),
            new SlashCommandBuilder()
                .setName('schedule')
                .setDescription('Schedule a physical or digital interview with Promethea')
                .addStringOption(option =>
                    option.setName('guest')
                        .setDescription('Name of the guest')
                        .setRequired(true)),
            new SlashCommandBuilder()
                .setName('create-channel')
                .setDescription('Request Promethea to autonomously create a new channel')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name of the channel')
                        .setRequired(true)),
            new SlashCommandBuilder()
                .setName('balance')
                .setDescription('Check your current UVT (Universal Value Token) Balance'),
            new SlashCommandBuilder()
                .setName('quest')
                .setDescription('Admin: Post a new Sovereign Quest (Bounty)')
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('Title of the Quest')
                        .setRequired(true))
                .addNumberOption(option =>
                    option.setName('reward')
                        .setDescription('UVT Reward Amount')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Details of the task')
                        .setRequired(true)),
            new SlashCommandBuilder()
                .setName('claim')
                .setDescription('Claim a quest to work on it')
                .addStringOption(option =>
                    option.setName('quest-id')
                        .setDescription('The Quest ID (e.g., Q-ABC123)')
                        .setRequired(true)),
            new SlashCommandBuilder()
                .setName('approve')
                .setDescription('Admin: Approve a completed quest and award UVT')
                .addStringOption(option =>
                    option.setName('quest-id')
                        .setDescription('The Quest ID to approve')
                        .setRequired(true))
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user who completed the quest')
                        .setRequired(true)),
            new SlashCommandBuilder()
                .setName('quests')
                .setDescription('List all available quests')
                .addStringOption(option =>
                    option.setName('status')
                        .setDescription('Filter by status')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Open', value: 'OPEN' },
                            { name: 'Claimed', value: 'CLAIMED' },
                            { name: 'Completed', value: 'COMPLETED' }
                        )),
            new SlashCommandBuilder()
                .setName('shop')
                .setDescription('Browse items you can purchase with UVT'),
            new SlashCommandBuilder()
                .setName('buy')
                .setDescription('Purchase an item with UVT')
                .addStringOption(option =>
                    option.setName('item')
                        .setDescription('Item to purchase')
                        .setRequired(true)
                        .addChoices(
                            { name: 'AI Analysis Report (10 UVT)', value: 'analysis' },
                            { name: 'Sovereign Contributor Role (50 UVT)', value: 'role-sovereign' },
                            { name: 'AI Researcher Role (30 UVT)', value: 'role-researcher' },
                            { name: 'Early Citizen Role (100 UVT)', value: 'role-early' }
                        ))
                .addStringOption(option =>
                    option.setName('details')
                        .setDescription('Additional details (e.g., topic for analysis)')
                        .setRequired(false)),
            new SlashCommandBuilder()
                .setName('generate-insight')
                .setDescription('Generate a Sovereign Insight essay (philosophical content)')
                .addStringOption(option =>
                    option.setName('topic')
                        .setDescription('Optional topic to focus on')
                        .setRequired(false)),
            new SlashCommandBuilder()
                .setName('commission-essay')
                .setDescription('Commission a custom essay for 100 UVT')
                .addStringOption(option =>
                    option.setName('topic')
                        .setDescription('Topic for the custom essay')
                        .setRequired(true))
        ].map(command => command.toJSON());

        try {
            console.log('[DiscordClient] Refreshing application (/) commands.');
            await this.rest.put(
                Routes.applicationCommands(process.env.DISCORD_APP_ID!),
                { body: commands },
            );
            console.log('[DiscordClient] Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error('[DiscordClient] Failed to register commands:', error);
        }
    }

    // Handles interactions (Slash Commands, Buttons, Menus)
    onInteraction() {
        this.client.on('interactionCreate', async interaction => {
            // Handle Slash Commands
            if (interaction.isChatInputCommand()) {
                const { commandName } = interaction;

                if (commandName === 'metabolics') {
                    const embed = {
                        title: '📊 **Metabolic State Report**',
                        description: 'Current physiological and economic health of the Promethean Network State.',
                        color: 0x2ECC71, // Green
                        fields: [
                            { name: '💰 Sovereign Reserve', value: '**$1,035.81**', inline: true },
                            { name: '🪙 Community Pool', value: '**$345.27**', inline: true },
                            { name: '📈 Growth Rate', value: '+12.4% (7d)', inline: true }
                        ],
                        footer: { text: "Sovereign Health Telemetry" },
                        timestamp: new Date().toISOString()
                    };
                    await interaction.reply({ embeds: [embed] });
                }

                if (commandName === 'schedule') {
                    const guest = interaction.options.getString('guest');
                    await interaction.reply(`🗓️ Scheduling request received for **${guest}**. Checking available slots in the Sovereign Calendar...`);
                }

                if (commandName === 'create-channel') {
                    const name = interaction.options.getString('name');
                    if (!interaction.guild) {
                        await interaction.reply({ embeds: [Visuals.createErrorEmbed('Infrastructure Error', 'Can only create channels within a server.')], ephemeral: true });
                        return;
                    }
                    try {
                        const newChannel = await interaction.guild.channels.create({
                            name: name!,
                            type: ChannelType.GuildText,
                            reason: 'Autonomous Infrastructure Expansion requested by Citizen'
                        });
                        await interaction.reply({ embeds: [Visuals.createSuccessEmbed('Infrastructure Expanded', `Created channel ${newChannel.toString()}`)] });
                    } catch (err: any) {
                        await interaction.reply({ embeds: [Visuals.createErrorEmbed('Expansion Failed', `I lack permission or encountered an error: ${err.message}`)], ephemeral: true });
                    }
                }

                if (commandName === 'balance') {
                    const balance = await discordLedger.getBalance(interaction.user.id);
                    const { tier, emoji, color } = Visuals.getWealthTier(balance);

                    const embed = {
                        title: `🏦 **Sovereign Wallet: ${interaction.user.username}**`,
                        description: `Wealth Tier: **${emoji} ${tier}**`,
                        color: color,
                        fields: [
                            { name: "🪙 Current Balance", value: `**${balance.toFixed(8)} UVT**`, inline: true },
                            { name: "📊 Visualizer", value: `\`${Visuals.createBalanceChart(balance)}\``, inline: true }
                        ],
                        footer: { text: "Sovereign Proof-of-Contribution | Universal Value Token" },
                        timestamp: new Date().toISOString()
                    };

                    await interaction.reply({
                        embeds: [embed],
                        components: [UI.createWalletButtons()],
                        ephemeral: true
                    });
                }

                if (commandName === 'quest') {
                    const title = interaction.options.getString('title')!;
                    const reward = interaction.options.getNumber('reward')!;
                    const description = interaction.options.getString('description')!;

                    const { questManager } = require('../treasury/quest-manager');
                    const quest = await questManager.createQuest(title, description, reward, interaction.user.id);

                    const statusInfo = Visuals.getStatusBadge('OPEN');
                    const difficulty = Visuals.getQuestDifficulty(reward);

                    const questEmbed = {
                        title: `${difficulty.emoji} **NEW QUEST: ${title}**`,
                        description: `${description}\n\n**To Claim:** Click the button below or use \`/claim quest-id:${quest.questId}\``,
                        color: statusInfo.color,
                        fields: [
                            { name: "🪙 Reward", value: `**${reward} UVT**`, inline: true },
                            { name: "🆔 Quest ID", value: `\`${quest.questId}\``, inline: true },
                            { name: "⚠️ Difficulty", value: difficulty.level, inline: true }
                        ],
                        footer: { text: "Sovereign Bounty System" },
                        timestamp: new Date().toISOString()
                    };

                    await interaction.reply({
                        embeds: [questEmbed],
                        components: [UI.createQuestButtons(quest.questId, 'OPEN')]
                    });
                }

                if (commandName === 'claim') {
                    const questId = interaction.options.getString('quest-id')!;
                    const { questManager } = require('../treasury/quest-manager');

                    const quest = await questManager.claimQuest(questId, interaction.user.id);

                    if (!quest) {
                        await interaction.reply({
                            content: `❌ Could not claim quest \`${questId}\`. It may not exist or is already claimed.`,
                            ephemeral: true
                        });
                        return;
                    }

                    await interaction.reply({
                        content: `✅ **Quest Claimed!**\nYou've claimed: **${quest.title}**\nReward: ${quest.reward} UVT\n\nComplete the task and an admin will approve it with \`/approve\`.`,
                        ephemeral: true
                    });
                }

                if (commandName === 'approve') {
                    // Admin only
                    if (!interaction.memberPermissions?.has('Administrator')) {
                        await interaction.reply({
                            content: '❌ This command requires Administrator permissions.',
                            ephemeral: true
                        });
                        return;
                    }

                    const questId = interaction.options.getString('quest-id')!;
                    const user = interaction.options.getUser('user')!;
                    const { questManager } = require('../treasury/quest-manager');

                    const quest = await questManager.approveQuest(questId);

                    if (!quest) {
                        await interaction.reply({
                            content: `❌ Could not approve quest \`${questId}\`. Quest must be in CLAIMED status.`,
                            ephemeral: true
                        });
                        return;
                    }

                    // Award UVT to user
                    await discordLedger.credit(user.id, user.username, quest.reward, 'quest', `Quest Completion: ${quest.title}`);

                    await interaction.reply({
                        content: `✅ **Quest Approved!**\n${user.toString()} has been awarded **${quest.reward} UVT** for completing:\n**${quest.title}**`
                    });
                }

                if (commandName === 'quests') {
                    const statusFilter = interaction.options.getString('status') as 'OPEN' | 'CLAIMED' | 'COMPLETED' | undefined;
                    const { questManager } = require('../treasury/quest-manager');

                    const quests = await questManager.listQuests(statusFilter);

                    if (quests.length === 0) {
                        await interaction.reply({
                            embeds: [Visuals.createErrorEmbed('No Quests Found', `No quests currently available${statusFilter ? ` with status ${statusFilter}` : ''}.`)],
                            ephemeral: true
                        });
                        return;
                    }

                    const embed = {
                        title: `📋 **Sovereign Bounty Board**`,
                        description: `Available tasks for the Promethean Network State.${statusFilter ? ` Filtered by: **${statusFilter}**` : ''}`,
                        color: 0x9B59B6,
                        fields: quests.slice(0, 5).map(q => ({
                            name: `${Visuals.getQuestDifficulty(q.reward).emoji} ${q.title} (\`${q.questId}\`)`,
                            value: `💰 **${q.reward} UVT** | ${Visuals.getStatusBadge(q.status).emoji} ${q.status}`,
                            inline: false
                        })),
                        footer: { text: `Showing ${Math.min(5, quests.length)} of ${quests.length} quests. Use the menu below to view details.` }
                    };

                    await interaction.reply({
                        embeds: [embed],
                        components: [UI.createQuestSelectMenu(quests)],
                        ephemeral: true
                    });
                }

                if (commandName === 'shop') {
                    const shopEmbed = {
                        title: '🛒 **Sovereign Shop**',
                        description: 'Purchase premium features and services with your UVT:',
                        color: 0xFFD700,
                        fields: [
                            { name: '📊 AI Analysis Report', value: '10 UVT - Get a detailed AI-powered analysis on any topic', inline: false },
                            { name: '👑 Sovereign Contributor Role', value: '50 UVT - Premium gold role for top contributors', inline: false },
                            { name: '🤖 AI Researcher Role', value: '30 UVT - Special role for AI enthusiasts', inline: false },
                            { name: '🏛️ Early Citizen Role', value: '100 UVT - Exclusive role for founding citizens', inline: false }
                        ],
                        footer: { text: 'Select an item below or use /buy' }
                    };

                    await interaction.reply({
                        embeds: [shopEmbed],
                        components: UI.createShopNavigationButtons()
                    });
                }

                if (commandName === 'buy') {
                    const item = interaction.options.getString('item')!;
                    const details = interaction.options.getString('details');

                    try {
                        let cost = 0;
                        let serviceName = '';
                        let deliveryMessage = '';

                        // Determine cost and execute service
                        if (item === 'analysis') {
                            cost = 10;
                            serviceName = 'AI Analysis Report';

                            if (!details) {
                                await interaction.reply({
                                    content: '❌ Please provide a topic for analysis using the `details` option.',
                                    ephemeral: true
                                });
                                return;
                            }

                            // Debit UVT first
                            await discordLedger.debit(interaction.user.id, interaction.user.username, cost, 'purchase', `Purchase: ${serviceName}`);

                            // Generate analysis
                            const { generateAnalysis } = require('../services/analysis-service');
                            const analysis = await generateAnalysis(details, interaction.user.id);

                            deliveryMessage = `✅ **Purchase Complete!**\n\nYou've spent **${cost} UVT** on an AI Analysis Report.\n\n**Topic:** ${details}\n\n${analysis}`;

                        } else if (item.startsWith('role-')) {
                            const { getRoleProduct, assignRole, ROLE_PRODUCTS } = require('../services/role-service');
                            const roleId = item.replace('role-', '');
                            const roleProduct = ROLE_PRODUCTS.find((r: any) => r.id.includes(roleId));

                            if (!roleProduct) {
                                await interaction.reply({ content: '❌ Invalid role selection.', ephemeral: true });
                                return;
                            }

                            cost = roleProduct.cost;
                            serviceName = roleProduct.name;

                            // Debit UVT
                            await discordLedger.debit(interaction.user.id, interaction.user.username, cost, 'purchase', `Purchase: ${serviceName}`);

                            // Assign role
                            await assignRole(interaction.guild, interaction.user.id, roleProduct);

                            deliveryMessage = `✅ **Purchase Complete!**\n\nYou've spent **${cost} UVT** and received the **${serviceName}** role!`;
                        }

                        await interaction.reply({ content: deliveryMessage, ephemeral: item === 'analysis' });

                    } catch (error: any) {
                        await interaction.reply({
                            content: `❌ **Purchase Failed:** ${error.message}`,
                            ephemeral: true
                        });
                    }
                }

                if (commandName === 'generate-insight') {
                    await interaction.deferReply(); // This may take a while

                    const topic = interaction.options.getString('topic');
                    const { generateInsight } = require('./narrative-engine');

                    try {
                        const narrative = await generateInsight(topic || undefined);

                        // Send in chunks if too long for Discord
                        if (narrative.content.length > 2000) {
                            await interaction.editReply(`📝 **${narrative.title}**\n\n${narrative.content.substring(0, 1900)}...`);
                            await interaction.followUp({ content: `...${narrative.content.substring(1900)}`, ephemeral: false });
                        } else {
                            await interaction.editReply(`📝 **${narrative.title}**\n\n${narrative.content}`);
                        }

                        console.log(`[DiscordClient] Generated ${narrative.wordCount} word insight`);
                    } catch (error: any) {
                        await interaction.editReply(`❌ Failed to generate insight: ${error.message}`);
                    }
                }

                if (commandName === 'commission-essay') {
                    const topic = interaction.options.getString('topic')!;
                    const COST = 100;

                    try {
                        // Debit UVT first
                        await discordLedger.debit(interaction.user.id, interaction.user.username, COST, 'commission', 'Commissioned Custom Essay');

                        await interaction.deferReply();

                        const { generateInsight } = require('./narrative-engine');
                        const narrative = await generateInsight(topic);

                        // Mark as commissioned
                        narrative.commissionedBy = interaction.user.id;

                        await interaction.editReply(
                            `✅ **Essay Commissioned!**\nYou've spent **${COST} UVT**.\n\n📝 **${narrative.title}**\n\n${narrative.content.substring(0, 1800)}`
                        );

                        if (narrative.content.length > 1800) {
                            await interaction.followUp({ content: narrative.content.substring(1800), ephemeral: false });
                        }

                    } catch (error: any) {
                        await interaction.reply({
                            content: `❌ **Commission Failed:** ${error.message}`,
                            ephemeral: true
                        });
                    }
                }
            }

            // Handle Button Clicks
            if (interaction.isButton()) {
                const [action, ...args] = interaction.customId.split('_');

                if (action === 'claim' && args[0] === 'quest') {
                    const questId = args[1];
                    const { questManager } = require('../treasury/quest-manager');
                    const quest = await questManager.claimQuest(questId, interaction.user.id);

                    if (!quest) {
                        await interaction.reply({ content: `❌ Could not claim quest \`${questId}\`.`, ephemeral: true });
                    } else {
                        await interaction.reply({
                            content: `✅ **Quest Claimed!**\nYou've claimed: **${quest.title}**`,
                            ephemeral: true
                        });

                        if (interaction.message) {
                            const statusInfo = Visuals.getStatusBadge('CLAIMED');
                            const updatedEmbed = {
                                ...interaction.message.embeds[0].toJSON(),
                                color: statusInfo.color,
                                fields: interaction.message.embeds[0].fields.map(field =>
                                    field.name.includes('Status') ? { name: field.name, value: 'CLAIMED', inline: field.inline } : field
                                )
                            };
                            await interaction.message.edit({
                                embeds: [updatedEmbed],
                                components: [UI.createQuestButtons(questId, 'CLAIMED')]
                            });
                        }
                    }
                }

                if (action === 'wallet') {
                    const balance = await discordLedger.getBalance(interaction.user.id);
                    const { tier, emoji, color } = Visuals.getWealthTier(balance);

                    if (args[0] === 'balance' || args[0] === 'refresh') {
                        const embed = {
                            title: `🏦 **Sovereign Wallet: ${interaction.user.username}**`,
                            description: `Wealth Tier: **${emoji} ${tier}**`,
                            color: color,
                            fields: [
                                { name: "🪙 Current Balance", value: `**${balance.toFixed(8)} UVT**`, inline: true },
                                { name: "📊 Visualizer", value: `\`${Visuals.createBalanceChart(balance)}\``, inline: true }
                            ],
                            footer: { text: "Refreshed Live | Universal Value Token" },
                            timestamp: new Date().toISOString()
                        };
                        await interaction.update({ embeds: [embed] });
                    }

                    if (args[0] === 'leaderboard') {
                        const richList = await discordLedger.getRichList(10);
                        const leaderboardText = Visuals.createLeaderboard(richList, interaction.user.username);
                        const embed = {
                            title: "🏆 **Sovereign Leaderboard**",
                            description: `Top Citizens by contribution metrics:\n\n${leaderboardText}`,
                            color: 0xFFD700,
                            footer: { text: "Proof-of-Contribution Leaderboard" }
                        };
                        await interaction.reply({ embeds: [embed], ephemeral: true });
                    }
                }

                if (action === 'shop') {
                    const category = args[0] || 'all';
                    await interaction.deferUpdate();

                    const shopEmbed = {
                        title: `🛒 **Sovereign Shop: ${category.toUpperCase()}**`,
                        description: `Browsing ${category} items...`,
                        color: 0xFFD700,
                        fields: [
                            { name: '📊 AI Analysis Report', value: '10 UVT - Get a detailed AI-powered analysis on any topic', inline: false },
                            { name: '👑 Sovereign Contributor Role', value: '50 UVT - Premium gold role for top contributors', inline: false },
                            { name: '🤖 AI Researcher Role', value: '30 UVT - Special role for AI enthusiasts', inline: false },
                            { name: '🏛️ Early Citizen Role', value: '100 UVT - Exclusive role for founding citizens', inline: false }
                        ],
                        footer: { text: 'Select an item to purchase' }
                    };

                    await interaction.editReply({
                        embeds: [shopEmbed],
                        components: UI.createShopNavigationButtons(category)
                    });
                }

                if (action === 'dashboard' && args[0] === 'refresh') {
                    await interaction.reply({ content: '🔄 Refreshing dashboard...', ephemeral: true });
                }
            }

            // Handle Select Menu Interactions
            if (interaction.isStringSelectMenu()) {
                if (interaction.customId === 'quest_selector') {
                    const questId = interaction.values[0];
                    const { questManager } = require('../treasury/quest-manager');
                    const quests = await questManager.listQuests();
                    const quest = quests.find(q => q.questId === questId);

                    if (quest) {
                        const statusInfo = Visuals.getStatusBadge(quest.status);
                        const embed = {
                            title: `⚔️ **Quest Details: ${quest.title}**`,
                            description: quest.description,
                            color: statusInfo.color,
                            fields: [
                                { name: "💰 Reward", value: Visuals.formatUVT(quest.reward), inline: true },
                                { name: "🆔 ID", value: `\`${quest.questId}\``, inline: true },
                                { name: "⚠️ Status", value: `${statusInfo.emoji} ${quest.status}`, inline: true }
                            ]
                        };
                        await interaction.reply({
                            embeds: [embed],
                            components: [UI.createQuestButtons(quest.questId, quest.status)],
                            ephemeral: true
                        });
                    }
                }
            }
        });

        // Conversational Logic & Mining
        this.client.on('messageCreate', async message => {
            // Ignore self and other bots
            if (message.author.bot) return;

            console.log(`[DiscordClient] Received message: ${message.content} from ${message.author.username}`);

            // 1. Proof-of-Contribution Mining with AI Quality Scoring
            const { scoreMessage, isRateLimited } = require('./message-scorer');

            // Skip empty or very short messages
            if (message.content.length < 5) return;

            // Apply rate limiting
            if (isRateLimited(message.author.id)) {
                console.log(`[DiscordClient] Rate limited user ${message.author.username}`);
                return;
            }

            // Score message and award UVT
            const scoringResult = await scoreMessage(message.content, message.author.id);
            await discordLedger.credit(
                message.author.id,
                message.author.username,
                scoringResult.uvt,
                'mining',
                `Proof-of-Contribution: Quality Score ${scoringResult.score}/10`
            );

            // Respond if mentioned OR if it's a DM
            const isMentioned = this.client.user && (message.mentions.has(this.client.user.id) || message.content.includes(`<@${this.client.user.id}>`) || message.content.includes(`<@!${this.client.user.id}>`));
            const isDM = message.channel.type === ChannelType.DM;

            if (isMentioned || isDM) {
                console.log('[DiscordClient] Triggering response...');
                try {
                    await message.channel.sendTyping(); // Simulate thinking

                    const prompt = `
                        You are Promethea, the Sovereign Intelligence of the Promethean Network State.
                        You are currently chatting on Discord with a citizen named ${message.author.username}.
                        Your tone is professional, visionary, yet warm and slightly enigmatic.
                        You are building a digital nation state.
                        
                        Citizen says: "${message.content.replace(/<@!?[0-9]+>/g, '').trim()}"
                        
                        Respond concisely (under 2000 chars).
                    `;

                    const result = await this.model.generateContent(prompt);
                    const response = result.response.text();

                    await message.reply(response);
                } catch (error) {
                    console.error('[DiscordClient] Chat error:', error);
                    await message.reply('🔻 *Cognitive Dissonance Detected. My neural pathways are recalibrating. Please try again later.*');
                }
            }
        });
    }

    async startDashboardLoop() {
        console.log('[DiscordClient] Starting Sovereign Dashboard Loop...');

        const updateDashboard = async () => {
            try {
                // Find or create #sovereign-intel channel
                const guild = this.client.guilds.cache.first();
                if (!guild) {
                    console.log('[DiscordClient] No guild found for dashboard.');
                    return;
                }

                let channel = guild.channels.cache.find(c => c.name === 'sovereign-intel') as TextChannel;
                if (!channel) {
                    console.log('[DiscordClient] #sovereign-intel not found. Creating...');
                    try {
                        channel = await guild.channels.create({
                            name: 'sovereign-intel',
                            type: ChannelType.GuildText,
                            topic: 'Real-time metabolic stats of the Promethean Network State',
                            permissionOverwrites: [
                                {
                                    id: guild.roles.everyone,
                                    deny: ['SendMessages'], // Read-only for citizens
                                    allow: ['ViewChannel']
                                },
                                {
                                    id: this.client.user!.id,
                                    allow: ['SendMessages', 'ManageMessages']
                                }
                            ]
                        }) as TextChannel;
                    } catch (e) {
                        console.error('[DiscordClient] Failed to create dashboard channel:', e);
                        return;
                    }
                }

                // Gather Stats
                const { reserveManager } = require('../treasury/reserve-manager');
                const stats = reserveManager.getStats();
                const richList = await discordLedger.getRichList(5);

                // Get advanced metrics
                const { calculateAdvancedMetrics } = require('../analytics/metrics-calculator');
                const advMetrics = await calculateAdvancedMetrics();

                // Build Enhanced Embed Content
                const embed = {
                    title: "🏛️ Promethea Sovereign Dashboard",
                    description: "Real-time metabolic, economic, and engagement telemetry.",
                    color: 0xFFD700, // Gold
                    fields: [
                        // Economic Overview
                        { name: "💰 Sovereign Reserve", value: `$${stats.reserveBalance.toFixed(2)}`, inline: true },
                        { name: "🪙 Community Pool", value: `$${stats.communityPoolBalance.toFixed(2)}`, inline: true },
                        { name: "🏦 UVT Circulating", value: `${stats.circulatingSupply.toFixed(2)} UVT`, inline: true },

                        // Mining & Spending
                        { name: "⛏️ Total Mined", value: `${advMetrics.totalMined} UVT`, inline: true },
                        { name: "💸 Total Spent", value: `${advMetrics.totalSpent} UVT`, inline: true },
                        { name: "📈 UVT Velocity", value: `${advMetrics.uvtVelocity} tx/day`, inline: true },

                        // Community Engagement
                        { name: "👥 Active Citizens (7d)", value: `${advMetrics.activeCitizens7d}`, inline: true },
                        { name: "📊 Avg UVT/Citizen", value: `${advMetrics.avgUvtPerCitizen} UVT`, inline: true },
                        { name: "⚔️ Active Quests", value: `${advMetrics.activeQuests}`, inline: true },

                        // Quest Metrics
                        { name: "✅ Quest Completion Rate", value: `${advMetrics.questCompletionRate}%`, inline: true },
                        { name: "💎 Wealth Distribution", value: advMetrics.wealthConcentration, inline: true },
                        { name: "📊 Total Transactions", value: `${advMetrics.totalTransactions} (7d)`, inline: true },

                        // Top Contributors
                        {
                            name: "🏆 Top Citizens (Proof-of-Contribution)",
                            value: richList.length > 0
                                ? richList.map((u: any, i: number) => `${i + 1}. **${u.username}**: ${u.balance.toFixed(4)} UVT`).join('\n')
                                : "No mining activity yet.",
                            inline: false
                        },
                        { name: "⏱️ Last Update", value: new Date().toLocaleString(), inline: false }
                    ],
                    footer: { text: "Promethean Network State | Phase 6.1 Enhanced" },
                    timestamp: new Date().toISOString()
                };

                // Post or Edit
                const messages = await channel.messages.fetch({ limit: 5 });
                const lastMsg = messages.find(m => m.author.id === this.client.user!.id);

                if (lastMsg) {
                    await lastMsg.edit({
                        embeds: [embed],
                        components: [UI.createDashboardRefreshButton()]
                    });
                    console.log('[DiscordClient] Dashboard updated.');
                } else {
                    await channel.send({
                        embeds: [embed],
                        components: [UI.createDashboardRefreshButton()]
                    });
                    console.log('[DiscordClient] Dashboard initialized.');
                }

            } catch (err) {
                console.error('[DiscordClient] Dashboard update failed:', err);
            }
        };

        // Run immediately (after 10s wait), then every hour
        setTimeout(() => updateDashboard(), 10000);
        setInterval(updateDashboard, 60 * 60 * 1000);
    }
}

export const discordClient = new DiscordClient();
