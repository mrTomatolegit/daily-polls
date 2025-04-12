import path from 'path';
import Poll, { POLL_DATA_HEADERS, PollData, RawPollData } from './Poll';
import { readCSV } from './util';
import Eris from 'eris';

export const polls = new Map<string, Poll>();

export function setupPolls(bot: Eris.Client) {
    readCSV<RawPollData>(path.join(process.cwd(), 'data/polls.csv'), POLL_DATA_HEADERS).forEach(
        rpollData => {
            let pollData: PollData = {
                id: rpollData.id,
                guildId: rpollData.guildId,
                channelId: rpollData.channelId,
                duration: parseInt(rpollData.duration),
                multi: rpollData.multi === '1',
                cron: rpollData.cron,
                content: rpollData.content,
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
}
