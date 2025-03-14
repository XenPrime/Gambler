const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const userBalances = new Map();
const DEFAULT_BALANCE = 1000;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('guildCreate', async (guild) => {
    // Find the first available text channel to send the welcome message
    const channel = guild.channels.cache.find(channel => 
        channel.type === 0 && // 0 is the type for text channels
        channel.permissionsFor(guild.members.me).has('SendMessages')
    );

    if (channel) {
        const welcomeEmbed = new EmbedBuilder()
            .setTitle('🎲 Welcome to Red or Black Roulette! 🎲')
            .setColor('#2a2a2a')
            .setDescription('Thank you for adding me to your server! Let me explain how to play the game.')
            .addFields(
                { name: '📌 Game Rules', value: 'Place your bet on either red or black. If the wheel lands on your color, you win!' },
                { name: '💰 Betting System', value: `- Minimum bet: ${process.env.MIN_BET} coins\n- Maximum bet: ${process.env.MAX_BET} coins\n- Starting balance: ${process.env.INITIAL_BALANCE} coins` },
                { name: '🎲 Double or Nothing', value: 'After winning, you can double your winnings by reacting with 🎲. But be careful - you could lose it all!' },
                { name: '📜 Commands', value: '!play <amount> <red|black> - Place a bet\n!balance - Check your balance\n!stats - View your statistics\n!rules - Review the rules\n!help - Show all commands' }
            );

        await channel.send({ embeds: [welcomeEmbed] });
    }
});

function createGameEmbed(userId, balance, result = null, betAmount = null, won = false, doubleOrNothing = false) {
    const embed = new EmbedBuilder()
        .setTitle('Red or Black Game')
        .setColor('#2a2a2a')
        .addFields({ name: 'Balance', value: `${balance} coins` });

    if (result) {
        const resultText = won
            ? `You won ${betAmount} coins!`
            : `You lost ${betAmount} coins!`;
        embed.addFields({ name: 'Result', value: resultText })
            .setColor(won ? '#4CAF50' : '#ff4444');

        if (doubleOrNothing && won) {
            embed.addFields({
                name: 'Double or Nothing?',
                value: 'React with 🎲 to double your winnings!'
            });
        }
    }

    return embed;
}

function getBalance(userId) {
    if (!userBalances.has(userId)) {
        userBalances.set(userId, DEFAULT_BALANCE);
    }
    return userBalances.get(userId);
}

function updateBalance(userId, amount) {
    const currentBalance = getBalance(userId);
    userBalances.set(userId, currentBalance + amount);
    return userBalances.get(userId);
}

async function createSpinningEmbed() {
    const spinFrames = [
        '🔴 ⚫ 《 ⚫ 🔴',
        '⚫ 🔴 《 🔴 ⚫',
        '🔴 ⚫ 《 ⚫ 🔴',
        '⚫ 🔴 《 🔴 ⚫'
    ];
    const embed = new EmbedBuilder()
        .setTitle('Spinning the Wheel!')
        .setColor('#2a2a2a')
        .setDescription(spinFrames[0]);
    return embed;
}

const userStats = new Map(); // Track user statistics

function updateStats(userId, won, amount) {
    if (!userStats.has(userId)) {
        userStats.set(userId, { wins: 0, losses: 0, totalWon: 0, totalLost: 0 });
    }
    const stats = userStats.get(userId);
    if (won) {
        stats.wins++;
        stats.totalWon += amount;
    } else {
        stats.losses++;
        stats.totalLost += amount;
    }
    userStats.set(userId, stats);
}

function createStatsEmbed(userId) {
    const stats = userStats.get(userId) || { wins: 0, losses: 0, totalWon: 0, totalLost: 0 };
    const winRate = stats.wins + stats.losses > 0 ? 
        ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1) : 0;

    return new EmbedBuilder()
        .setTitle('Player Statistics')
        .setColor('#2a2a2a')
        .addFields(
            { name: 'Win Rate', value: `${winRate}%`, inline: true },
            { name: 'Total Wins', value: `${stats.wins}`, inline: true },
            { name: 'Total Losses', value: `${stats.losses}`, inline: true },
            { name: 'Total Won', value: `${stats.totalWon} coins`, inline: true },
            { name: 'Total Lost', value: `${stats.totalLost} coins`, inline: true },
            { name: 'Net Profit', value: `${stats.totalWon - stats.totalLost} coins`, inline: true }
        );
}

function createHelpEmbed() {
    return new EmbedBuilder()
        .setTitle('Red or Black Game - Help')
        .setColor('#2a2a2a')
        .setDescription('Welcome to Red or Black! Try your luck by betting on red or black.')
        .addFields(
            { name: '!play <amount> <red|black>', value: 'Place a bet on red or black' },
            { name: '!balance', value: 'Check your current balance' },
            { name: '!stats', value: 'View your game statistics' },
            { name: '!rules', value: 'View the game rules' },
            { name: '!help', value: 'Show this help message' }
        );
}

function createRulesEmbed() {
    return new EmbedBuilder()
        .setTitle('Red or Black Game - Rules')
        .setColor('#2a2a2a')
        .addFields(
            { name: '📌 Basic Rules', value: 'Bet on either red or black. If you guess correctly, you win!' },
            { name: '💰 Betting', value: 'Minimum bet is 1 coin. You cannot bet more than your balance.' },
            { name: '🎲 Double or Nothing', value: 'After winning, you can choose to double your winnings or collect your prize.' },
            { name: '⚠️ Risk', value: 'If you choose double or nothing and lose, you lose your original winnings.' }
        );
}

// Update the playGame function to track stats
async function playGame(message, betAmount, color) {
    const userId = message.author.id;
    const currentBalance = getBalance(userId);

    if (isNaN(betAmount) || betAmount <= 0) {
        return message.reply('Please enter a valid bet amount!');
    }

    if (betAmount > currentBalance) {
        return message.reply('Not enough coins!');
    }

    // Start with spinning animation
    const spinningMessage = await message.reply({ embeds: [await createSpinningEmbed()] });
    
    const spinFrames = [
        '🔴 ⚫ 《 ⚫ 🔴',
        '⚫ 🔴 《 🔴 ⚫',
        '🔴 ⚫ 《 ⚫ 🔴',
        '⚫ 🔴 《 🔴 ⚫'
    ];

    // Animate the spinning
    for (let i = 0; i < 8; i++) {
        const frame = spinFrames[i % spinFrames.length];
        const spinEmbed = new EmbedBuilder()
            .setTitle('Spinning the Wheel!')
            .setColor('#2a2a2a')
            .setDescription(frame);
        
        await spinningMessage.edit({ embeds: [spinEmbed] });
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    const result = Math.random() < 0.5 ? 'red' : 'black';
    const won = result === color;
    const newBalance = updateBalance(userId, won ? betAmount : -betAmount);
    updateStats(userId, won, betAmount); // Add this line to track stats

    const gameMessage = await message.reply({
        embeds: [createGameEmbed(userId, newBalance, result, betAmount, won, true)]
    });

    if (won) {
        await gameMessage.react('🎲');

        const filter = (reaction, user) => {
            return reaction.emoji.name === '🎲' && user.id === userId;
        };

        try {
            const collected = await gameMessage.awaitReactions({
                filter,
                max: 1,
                time: 30000,
                errors: ['time']
            });

            if (collected.first()) {
                const doubleResult = Math.random() < 0.5;
                const doubleAmount = betAmount * 2;

                if (doubleResult) {
                    const finalBalance = updateBalance(userId, betAmount);
                    await gameMessage.edit({
                        embeds: [createGameEmbed(
                            userId,
                            finalBalance,
                            'DOUBLE WIN!',
                            doubleAmount,
                            true,
                            false
                        )]
                    });
                } else {
                    const finalBalance = updateBalance(userId, -betAmount * 2);
                    await gameMessage.edit({
                        embeds: [createGameEmbed(
                            userId,
                            finalBalance,
                            'DOUBLE LOSS!',
                            doubleAmount,
                            false,
                            false
                        )]
                    });
                }
            }
        } catch (error) {
            // Timeout or error occurred
        }
    }
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const args = message.content.toLowerCase().split(' ');
    switch(args[0]) {
        case '!play':
            const betAmount = parseInt(args[1]);
            const color = args[2];

            if (!color || (color !== 'red' && color !== 'black')) {
                return message.reply('Please use the format: !play <amount> <red|black>');
            }

            await playGame(message, betAmount, color);
            break;

        case '!balance':
            const balance = getBalance(message.author.id);
            await message.reply({
                embeds: [createGameEmbed(message.author.id, balance)]
            });
            break;

        case '!stats':
            await message.reply({
                embeds: [createStatsEmbed(message.author.id)]
            });
            break;

        case '!rules':
            await message.reply({
                embeds: [createRulesEmbed()]
            });
            break;

        case '!help':
            await message.reply({
                embeds: [createHelpEmbed()]
            });
            break;
    }
});

require('dotenv').config();
client.login(process.env.DISCORD_BOT_TOKEN);