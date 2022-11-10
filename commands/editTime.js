const { SlashCommandBuilder, escapeNumberedList } = require("discord.js");
const RaidWeek = require("../Classes/RaidWeek");
const RaidDay = require("../Classes/RaidDay");
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
            .setDescription('(Optional) The new time. Leave empty for no raid')
        )
        .addStringOption(opt => opt.setName('day')
            .setDescription('(Optional) The new RaidDay you want to move it to')
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
    ,
    /**
     * Edits the time from the selected day
     * @param {import("discord.js").Interaction} interaction 
     */
    async execute(interaction) {
        // get user options
        const index = Number(interaction.options.getString('raidday')); // selected day
        const newIndex = Number(interaction.options.getString('day')); // move day to this
        const time = interaction.options.getString('time'); // move time to this
        let content;

        // read the raid day to be changed
        const raidWeek = new RaidWeek();
        raidWeek.readJson();
        const rDay = raidWeek.week[index];
        const rDayTime = new Date(rDay.startTime)
        content = `${new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(rDayTime.getDay())} `;

        // get the event for that raid day
        const events = await interaction.guild.scheduledEvents.fetch({ name: 'Raid', scheduledStartTimestamp: rDayTime.getTime() }); // Test: if this works
        const event = events.size >= 1 ? events.first() : null;

        // Get a new day with the new time
        const newDay = getRaidDayFromString(time === null ? '' : time, rDay.day);

        if (time === null && Number.isNaN(newIndex)) { // No time and no new day has been passed
            raidWeek.week[index] = newDay;

            content += 'No Raid';
            if (event !== null) // if an event was found - delete it
                event.delete();

            content += `has been updated to no raid`;
        } else if (!Number.isNaN(newIndex)) { // a new day has bee passed
            if (new Date().getDay() < newIndex) {
                interaction.reply({ content: 'Cannot move the event into the past' })
                return;
            }

            if (time !== null) // gave time
                raidWeek.week[index] = newDay;

            if (raidWeek.week[index].isRaid) { // move selected day to the new one
                raidWeek.week[newIndex].isRaid = true;
                raidWeek.week[newIndex].startTime = raidWeek.week[index].startTime;
                raidWeek.week[newIndex].endTime = raidWeek.week[index].endTime;
                raidWeek.week[index] = new RaidDay(raidWeek.week[index].day);
            }

            if (event !== null) // adjust the scheduled event
                event.setScheduledStartTime(raidWeek[newIndex].startTime);


            content += `has been moved to ${new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(newDate(raidWeek.week[newIndex].startTime).getDay())}`;
            if (time !== null) {
                const newDayTime = new Date(newDay.startTime);
                content += ` with the time ${newDayTime.getUTCHours()}:${newDayTime.getUTCMinutes() === 0 ? '00' : newDayTime.getUTCMinutes()}`;
            }
        } else if (time !== null) { // gave time but no new date
            raidWeek.week[index] = newDay;

            if (event !== null) // adjust the scheduled event
                event.setScheduledStartTime(newDay.startTime)

            const newDayTime = new Date(newDay.startTime);
            content += `has been updated from ${rDayTime.getUTCHours()}:${rDayTime.getUTCMinutes() === 0 ? '00' : rDayTime.getUTCMinutes()} to ${newDayTime.getUTCHours()}:${newDayTime.getUTCMinutes() === 0 ? '00' : newDayTime.getUTCMinutes()}`
        }

        // save the new raid day to the file
        raidWeek.writeJson();

        interaction.reply({ content: content });
    }
}