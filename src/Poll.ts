import { CronJob } from 'cron';
import Eris from 'eris';

export const POLL_DATA_HEADERS =
    'id,guildId,channelId,cron,duration,multi,title,option1,option2,option3,option4,option5,option6,option7,option8,option9,option10';

export type PollData = {
    id: string;
    guildId: string;
    channelId: string;
    cron: string;
    duration: number;
    multi: boolean;
    title: string;
    options: string[];
};

export type RawPollData = {
    id: string;
    guildId: string;
    channelId: string;
    cron: string;
    duration: string;
    multi: string;
    title: string;
    option1: string;
    option2: string;
    option3: string;
    option4: string;
    option5: string;
    option6: string;
    option7: string;
    option8: string;
    option9: string;
    option10: string;
};

class Poll {
    public id: string;
    private _cron: string;
    public get cron() {
        return this._cron;
    }
    public set cron(value: string) {
        this._cron = value;
        this.setupCron();
    }
    public guildId: string;
    public channelId: string;
    public duration: number;
    public multi: boolean;
    public title: string;
    public options: string[];
    public cronJob?: CronJob;

    private hasRandom: boolean = false;
    constructor(private bot: Eris.Client, data: PollData, public autostart = true) {
        this.id = data.id;
        this._cron = data.cron;
        this.guildId = data.guildId;
        this.channelId = data.channelId;
        this.duration = data.duration;
        this.multi = data.multi;
        this.title = data.title;
        this.options = data.options;
        this.setupCron();
    }

    private setupCron() {
        this.hasRandom = false;
        if (this.cronJob) {
            this.cronJob.stop();
        }

        let cronParts = this._cron.split(' ');
        for (let i = 0; i < cronParts.length; i++) {
            const value = cronParts[i];
            if (value.startsWith('rand(') && value.endsWith(')')) {
                this.hasRandom = true;
                const [min, max] = value
                    .substring(5, value.length - 1)
                    .split('-')
                    .map(Number);
                const randomValue = Math.floor(Math.random() * (max - min + 1) + min);
                cronParts[i] = randomValue.toString();
            }
        }

        const finalCron = cronParts.join(' ');
        this.cronJob = new CronJob(
            finalCron,
            () => {
                this.run();
            },
            null,
            this.autostart,
            'Europe/Paris'
        );
    }

    public start() {
        this.cronJob?.start();
    }

    public run() {
        if (this.hasRandom) this.setupCron();
        return this.bot.createMessage(this.channelId, this.toMessageContent());
    }

    public toMessageContent(): Eris.MessageContent {
        return {
            poll: {
                question: {
                    text: this.title
                },
                answers: this.options.map((option, i) => ({
                    answer_id: i,
                    poll_media: { text: option }
                })),
                duration: this.duration,
                allow_multiselect: this.multi,
                layout_type: 1
            }
        };
    }

    public toString() {
        return `Poll ${this.id} (${this.duration}h,${this.multi ? 'multi' : 'single'}): ${
            this.title
        } - ${this.options.join(', ')}`;
    }
}

export default Poll;
