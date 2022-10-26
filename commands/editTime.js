const { SlashCommandBuilder, inlineCode } = require("discord.js");
const RaidWeek = require("../Classes/RaidWeek");
const { getRaidDayFromString } = require("../utility");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edittime')
        .setDescription('Edits a singular day from the schedule')
        .addStringOption(opt => opt.setName('raidday')
            .setDescription('The RaidDay that you want to change the status of')
            .setRequired(true)
            .addChoices(
                { name: 'Tu', value: '0' },
                { name: 'We', value: '1' },
                { name: 'Th', value: '2' },
                { name: 'Fr', value: '3' },
                { name: 'Sa', value: '4' },
                { name: 'So', value: '5' },
                { name: 'Mo', value: '6' }
            )
        )
        .addStringOption(opt => opt.setName('time')
            .setDescription('The new time. Leave empty for no raid')
        )
    ,
    /**
     * Edits the time from the selected day to the given one
     * @param {import("discord.js").Interaction} interaction 
     */
    async execute(interaction) {
        // get user options
        const index = Number(interaction.options.getString('raidday'));
        let time = interaction.options.getString('time');
        if (time === null)
            time = '';

        // read the current time
        const raidWeek = new RaidWeek();
        raidWeek.readJson();
        const rDay = raidWeek.week[index];

        // get the event for that raid day
        const testTimeStamp = new Date(rDay.startTime);
        testTimeStamp.setMilliseconds(000);
        const events = await interaction.guild.scheduledEvents.fetch({ name: 'Raid', scheduledStartTimestamp: testTimeStamp.getTime() });
        const event = events.size >= 1 ? events.first() : null;

        // adjust the raid day with the new time
        const newDay = getRaidDayFromString(time, rDay.day);
        raidWeek.week[index] = newDay;

        if (event !== null) {
            if (newDay.isRaid)
                event.setScheduledStartTime(newDay.startTime)
            else
                event.delete();
        }

        // save the new raid day to the file
        raidWeek.writeJson();

        interaction.reply({ content: `The raid day has been updated.\nPlease use the ${inlineCode('/raid')} command again.` });
    }
}