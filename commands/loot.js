const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loot')
        .setDescription('Loot tracker')
        .addSubcommand(subcmd => subcmd // cmd: got, opt: [user, type]
            .setName('got')
            .setDescription('Distrubte loot for a raid member')
            .addUserOption(opt => opt
                .setName('user')
                .setDescription('who got the loot')
                .setRequired(true))
            .addStringOption(opt => opt
                .setName('type')
                .setDescription('Item Type')
                .setRequired(true)
                .addChoices(
                    { name: 'Gear', value: 'gear' },
                    { name: 'Weapon', value: 'weap' },
                    { name: 'Body', value: 'body' },
                    { name: 'Tome Weapon', value: 'tomeWeap' },
                    { name: 'Tome Weapon Upgrade', value: 'tomeUp' },
                    { name: 'Tome Gear Upgrade', value: 'gearUp' },
                    { name: 'Tome Accessory Upgrade', value: 'accUp' }
                )
            )
        )
        .addSubcommand(subcmd => subcmd // cmd: show, opt: type
            .setName('show')
            .setDescription('Show who can roll / priority')
            .addStringOption(opt => opt
                .setName('type')
                .setDescription('Item Type')
                .setRequired(true)
                .addChoices(
                    { name: 'Gear', value: 'gear' },
                    { name: 'Weapon', value: 'weap' },
                    { name: 'Body', value: 'body' },
                    { name: 'Tome Weapon', value: 'tomeWeap' },
                    { name: 'Tome Weapon Upgrade', value: 'tomeUp' },
                    { name: 'Tome Gear Upgrade', value: 'gearUp' },
                    { name: 'Tome Accessory Upgrade', value: 'accUp' }
                )
            )
        )
    ,
    /**
    * @param {Interaction} interaction
     */
    async execute(interaction) {
        // await interaction.deferReply();
        const cmd = interaction.options.getSubcommand();
        const type = interaction.options.getString('type');
        let content = `The ${cmd} with options: "${type}" is a WIP command`;

        const row = new ActionRowBuilder()
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
            content: content,
            components: [row],
            ephemeral: true
        });

    }
}