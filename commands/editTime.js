const { SlashCommandBuilder } = require("discord.js");
const RaidWeek = require("../Classes/RaidWeek");
const { getRaidDayFromString } = require("../utility");

module.exports = {
    // TODO: add optional option for day to move to
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
     * Edits the time from the selected day
     * @param {import("discord.js").Interaction} interaction 
     */
    async execute(interaction) {
        // get user options
        const index = Number(interaction.options.getString('raidday'));
        let content;
        let time = interaction.options.getString('time');
        if (time === null)
            time = '';

        // read the raid day to be changed
        const raidWeek = new RaidWeek();
        raidWeek.readJson();
        const rDay = raidWeek.week[index];
        const rDayTime = new Date(rDay.startTime)
        content = `${rDayTime.getDate()} has been updated from ${rDayTime.getUTCHours()}:${rDayTime.getUTCMinutes() === 0 ? '00' : rDayTime.getUTCMinutes()} to `;

        // get the event for that raid day
        const events = await interaction.guild.scheduledEvents.fetch({ name: 'Raid', scheduledStartTimestamp: rDayTime.getTime() }); // Test: if this works
        const event = events.size >= 1 ? events.first() : null;

        // adjust the raid day with the new time
        const newDay = getRaidDayFromString(time, rDay.day);
        const newDayTime = new Date(newDay.startTime);
        raidWeek.week[index] = newDay;

        if (newDay.isRaid) {
            content += `${newDayTime.getUTCHours()}:${newDayTime.getUTCMinutes() === 0 ? '00' : newDayTime.getUTCMinutes()}`
            if (event !== null)
                event.setScheduledStartTime(newDay.startTime)
        }
        else {
            content += 'No Raid';
            if (event !== null)
                event.delete();
        }

        // save the new raid day to the file
        raidWeek.writeJson();

        interaction.reply({ content: content });
    }
}