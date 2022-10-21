const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

class Member {
    constructor(name, id) {
        this.name = name;
        this.id = id;
    }



}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loot')
        .setDescription('Loot tracker')
        .addSubcommand(subcmd => subcmd.setName('got') // opt: [user, type]
            .setDescription('Distrubte loot for a raid member')
            .addUserOption(opt => opt.setName('user')
                .setDescription('who got the loot')
                .setRequired(true))
            .addStringOption(opt => opt.setName('type')
                .setDescription('Item Type')
                .setRequired(true)
                .addChoices(
                    { name: 'Gear', value: 'gear' },
                    { name: 'Weapon', value: 'weap' },
                    { name: 'Body', value: 'body' },
                    { name: 'Tome Weapon', value: 'tomeWeap' },
                    { name: 'Tome Weapon Upgrade', value: 'tomeUp' },
                    { name: 'Tome Gear Upgrade', value: 'gearUp' },
                    { name: 'Tome Accessory Upgrade', value: 'accUp' },
                    { name: 'Priority', value: 'prio' }
                )
            )
        )
        .addSubcommand(subcmd => subcmd.setName('show') // opt: type
            .setDescription('Show who can roll / priority')
            .addStringOption(opt => opt.setName('type')
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
        await interaction.deferReply();
        const cmd = interaction.options.getSubcommand();
        const type = interaction.options.getString('type');
        let reply = {
            content: null,
            components: null,
            ephemeral: true
        };

        switch (cmd) {
            case 'got':
                const user = interaction.options.getUser('member');
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
                reply.content = `Give ${user} an item type of "${type}"?`
                reply.components = [row];
                break;
            case 'show':
                reply.content = `The ${cmd} with options: "${type}" is a WIP command`;
                break;
        }


        interaction.editReply(reply);
    }
}