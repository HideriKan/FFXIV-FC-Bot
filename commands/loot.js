const { SlashCommandBuilder, ActionRowBuilder } = require('@discordjs/builders');
const { ButtonStyle } = require('discord-api-types');

const itemTypes = [
    { name: 'Gear', value: 'gear' },
    { name: 'Weapon', value: 'weap' },
    { name: 'Body', value: 'body' },
    { name: 'Tome Weapon', value: 'tomeWeap' },
    { name: 'Tome Weapon Upgrade', value: 'tomeUp' },
    { name: 'Tome Gear Upgrade', value: 'gearUp' },
    { name: 'Tome Accessory Upgrade', value: 'accUp' },
]

module.exports = {
    data: new SlashCommandBuilder()
        .setName('Loot')
        .setDescription('Loot manager')
        .addSubcommand(subcmd => subcmd
            .setName('Got')
            .setDescription('Distrubte loot for a raid member')
            .addUserOption(opt => opt.setName('Member').setDescription('Role which got the loot').setRequired(true))
            .addStringOption(opt => opt.setName('Type').setDescription('Item Type').setChoices(itemTypes).setAutocomplete(true).setRequired(true))
        )
        .addSubcommand(subcmd => subcmd
            .setName('Show')
            .setDescription('Show who can roll / priority')
            .addStringOption(opt => opt.setName('Type').setDescription('Item Type').setChoices(itemTypes).setAutocomplete(true).setRequired(true))

        )
    ,
    /**
    * @param {Interaction} interaction
     */
    async execute(interaction) {
        const cmd = interaction.options.getSubcommand();
        const btnY = new ActionRowBuilder()
            .addComponents(new ButtonBuilder()
                .setCustomId('yes')
                .setLabel('Yes')
                .setStyle(ButtonStyle.Primary)
            )
            .addComponents(new ButtonBuilder()
                .setCustomId('no')
                .setLabel('No')
                .setStyle(ButtonStyle.Danger)
        );

        interaction.reply({
            content: `The ${cmd} command is WIP`,
            components: [row],
            ephemeral: true
        });

    }
}