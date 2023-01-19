import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import {
  add,
  order,
  remove,
  member,
  time,
  showResult,
  showIndividual,
  assign,
} from './command';

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
  if (message.content.startsWith('!add')) {
    await add(message);
    return;
  }
  if (message.content.startsWith('!remove')) {
    await remove(message);
    return;
  }
  if (message.content === '!member') {
    await member(message);
    return;
  }
  if (message.content.startsWith('!time')) {
    await time(message);
    return;
  }
  if (message.content.startsWith('!order')) {
    await order(message);
    return;
  }
  if (message.content === '!result') {
    await showResult(message);
    return;
  }
  if (message.content.startsWith('!individual')) {
    await showIndividual(message);
    return;
  }
  if (message.content === '!assign') {
    await assign(message);
    return;
  }
});

client.login(TOKEN);
