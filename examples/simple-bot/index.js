const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log('Bot is ready to receive commands.');
});

client.on('messageCreate', async (message) => {
    if (message.content === 'ping') {
        console.log(`Received ping from ${message.author.tag}`);
        await message.reply('Pong!');
    }
});

// Periodic logging removed to reduce noise
// setInterval(() => {
//     const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
//     console.log(`[Heartbeat] Memory usage: ${memoryUsage.toFixed(2)} MB`);
// }, 5000);

const token = process.env.DISCORD_TOKEN;

if (!token) {
    console.error("Error: DISCORD_TOKEN is not set!");
    console.log("Please set the DISCORD_TOKEN environment variable in the dashboard.");
    // Keep process alive to show logs
    setInterval(() => { }, 10000);
} else {
    client.login(token).catch(err => {
        console.error("Failed to login:", err.message);
    });
}
