import Eris from 'eris';
import { readCSV } from './util';
import path from 'path';
import Poll, { POLL_DATA_HEADERS, PollData, RawPollData } from './Poll';

const bot = new Eris.Client("Bot " + process.env.DISCORD_TOKEN as string, {
    intents: ['guilds']
});

const polls = new Map();

bot.connect();

bot.on('error', console.error);
bot.on('warn', console.warn);

bot.on('ready', () => {
    console.log('Bot is ready');
    readCSV<RawPollData>(path.join(process.cwd(), 'data/polls.csv'), POLL_DATA_HEADERS).forEach(
        rpollData => {
            let pollData: PollData = {
                id: rpollData.id,
                guildId: rpollData.guildId,
                channelId: rpollData.channelId,
                duration: parseInt(rpollData.duration),
                multi: rpollData.multi === '1',
                cron: rpollData.cron,
                title: rpollData.title,
                options: []
            };
            for (let i = 1; i < 5; i++) {
                if ((rpollData as any)[`option${i}`])
                    pollData.options.push((rpollData as any)[`option${i}`]);
            }
            polls.set(rpollData.id, new Poll(bot, pollData, true));
        }
    );
});
