import Eris from 'eris';
import { setupPolls } from './polls';
import { setupCommands } from './commandshandler';

const bot = new Eris.Client("Bot " + process.env.DISCORD_TOKEN as string, {
    intents: ['guilds']
});

bot.connect();

bot.on('error', console.error);
bot.on('warn', console.warn);

bot.once('ready', async () => {
    setupPolls(bot);
    await setupCommands(bot);
    console.log('Polls and commands setup complete');
});

bot.on('ready', () => {
    console.log('Bot is ready');
})
