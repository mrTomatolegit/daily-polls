import Eris, { ApplicationCommandTypes } from 'eris';
import { polls } from '../polls';

export const trigger_metadata: Eris.ApplicationCommandBulkEditOptions<false, ApplicationCommandTypes> = {
    name: 'trigger',
    description: 'Force trigger a poll',
    type: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
    nsfw: false,
    options: [
        {
            type: Eris.Constants.ApplicationCommandOptionTypes.STRING,
            description: 'name of the existing poll',
            name: 'poll',
            required: true,
            autocomplete: true
        }
    ]
};

export const run = async (interaction: Eris.CommandInteraction) => {
    const option = interaction.data.options?.find((o: any) => o.name === 'poll');
    if (!option) {
        return interaction.createMessage({
            content: 'Please provide a poll to trigger',
            flags: 64
        });
    }
    if (option.type !== Eris.Constants.ApplicationCommandOptionTypes.STRING) {
        return interaction.createMessage({
            content: 'Invalid option type',
            flags: 64
        });
    }
    const pollId = option.value;
    const poll = polls.get(pollId);
    if (!poll) {
        return interaction.createMessage({
            content: `Poll \`${pollId}\` not found.`,
            flags: 64
        });
    }
    poll.run();
    await interaction.createMessage({
        content: `Poll \`${pollId}\` triggered.`
    });
};

export const autocomplete = async (interaction: Eris.AutocompleteInteraction) => {
    await interaction.acknowledge([...polls.values()].map(x => ({value: x.id, name: x.title})));
};
