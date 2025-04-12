import {
    ApplicationCommandBulkEditOptions,
    ApplicationCommandCreateOptions,
    ApplicationCommandTypes,
    AutocompleteInteraction,
    Client,
    CommandInteraction,
    CommandInteractionData,
    Constants
} from 'eris';
import { trigger_metadata, run as run_trigger, autocomplete as autocomplete_trigger } from './commands/trigger';

const commands_meta = [trigger_metadata];
const commands_runners: Record<string, (i: CommandInteraction) => unknown> = {
    trigger: run_trigger
};
const command_autocomplete_runners: Record<string, (i: AutocompleteInteraction) => unknown> = {
    trigger: autocomplete_trigger
};

const getCommands = (bot: Client, guildId?: string) =>
    guildId ? bot.getGuildCommands(guildId) : bot.getCommands();

const createCommand = (
    bot: Client,
    command: ApplicationCommandCreateOptions<true | false, ApplicationCommandTypes>,
    guildId?: string
) => (guildId ? bot.createGuildCommand(guildId, command) : bot.createCommand(command));

const deleteCommand = (bot: Client, commandID: string, guildId?: string) =>
    guildId ? bot.deleteGuildCommand(guildId, commandID) : bot.deleteCommand(commandID);

const bulkEditCommands = (
    bot: Client,
    commands: ApplicationCommandBulkEditOptions<true | false, ApplicationCommandTypes>[],
    guildId?: string
) => (guildId ? bot.bulkEditGuildCommands(guildId, commands) : bot.bulkEditCommands(commands));

export async function setupCommands(bot: Client, guildId?: string) {
    const discCommands = await getCommands(bot, guildId);
    const discCommandsNames = discCommands.map(c => c.name);
    const commandsToAdd = commands_meta.filter(c => !discCommandsNames.includes(c.name));
    const commandsToRemove = discCommands.filter(
        c => !commands_meta.some(cm => cm.name === c.name)
    );
    const commandsToUpdate = discCommands.filter(c => commands_meta.some(cm => cm.name === c.name));
    console.info(
        `Adding ${commandsToAdd.length} commands, removing ${commandsToRemove.length} commands, updating ${commandsToUpdate.length} commands (${guildId ? `in guild ${guildId}` : 'globally'})`
    );
    for (const command of commandsToUpdate) {
        const meta = commands_meta.find(c => c.name === command.name);
        if (meta) meta.id = command.id;
    }
    await bulkEditCommands(
        bot,
        commands_meta.filter(c => 'id' in c),
        guildId
    );
    for (const command of commandsToAdd) {
        await createCommand(bot, command, guildId);
    }
    for (const command of commandsToRemove) {
        await deleteCommand(bot, command.id, guildId);
    }
    bot.on('interactionCreate', async interaction => {
        if (interaction.type === Constants.InteractionTypes.APPLICATION_COMMAND) {
            const interactionData = interaction.data as CommandInteractionData;
            const cmdName = interactionData.name;
            console.debug(`Command ${cmdName} received`);
            if (cmdName in commands_runners) {
                return commands_runners[cmdName](interaction as CommandInteraction);
            }
        } else if (interaction.type == Constants.InteractionTypes.APPLICATION_COMMAND_AUTOCOMPLETE) {
            const interactionData = interaction.data as CommandInteractionData;
            const cmdName = interactionData.name;
            console.debug(`Autocomplete ${cmdName} received`);
            if (cmdName in command_autocomplete_runners) {
                return command_autocomplete_runners[cmdName](interaction as AutocompleteInteraction);
            }
        }
    });
}
