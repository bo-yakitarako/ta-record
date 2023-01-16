import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';

config();

const TOKEN = process.env.BOT_TOKEN as string;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

client.on('ready', () => {
  console.log('最強の記録をお前たちに見せてやるよ');
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) {
    return;
  }
  if (message.content === 'ping') {
    await message.reply('pong');
  }
});

client.login(TOKEN);
