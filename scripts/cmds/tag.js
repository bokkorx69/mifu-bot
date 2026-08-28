const { config } = global.GoatBot;

module.exports = {
    config: {
        name: "tag",
        version: "1.7.0",
        author: "Nazrul × Bokkor x69",
        countDown: 5,
        role: 0,
        description: {
            vi: "Tag người dùng",
            en: "𝐓𝐚𝐠 𝐮𝐬𝐞𝐫𝐬 𝐯𝐢𝐚 𝐫𝐞𝐩𝐥𝐲, 𝐧𝐚𝐦𝐞 𝐬𝐞𝐚𝐫𝐜𝐡, 𝐨𝐫 𝐬𝐞𝐥𝐟-𝐭𝐚𝐠 𝐰𝐢𝐭𝐡 𝐚 𝐜𝐮𝐬𝐭𝐨𝐦 𝐦𝐞𝐬𝐬𝐚𝐠𝐞."
        },
        category: "𝐭𝐚𝐠",
        guide: {
            vi: "{pn} [name] [message]",
            en: "{pn} [𝐧𝐚𝐦𝐞] [𝐦𝐞𝐬𝐬𝐚𝐠𝐞]"
        }
    },

    onStart: async ({ message, event, api, args, usersData }) => {
        const senderID = event.senderID;
        const { messageReply } = event;

        let threadInfo;
        try {
            threadInfo = await api.getThreadInfo(event.threadID);
        } catch (err) {
            return message.reply("❌ | 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐠𝐞𝐭 𝐭𝐡𝐫𝐞𝐚𝐝 𝐢𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧!");
        }

        const participants = threadInfo.participantIDs || [];
        let targets = [];
        let customMessage = args.join(" ");

        // Safe function to get user name with fallback
        async function getSafeName(id, defaultName = "Darling") {
            try {
                const name = await usersData.getName(id);
                return name || defaultName;
            } catch (e) {
                return defaultName;
            }
        }

        if (messageReply) {
            const targetID = messageReply.senderID;
            const name = await getSafeName(targetID);
            targets.push({ id: targetID, name });
            if (!customMessage) customMessage = "";
        }
        else if (args.length > 0) {
            const searchName = args[0].toLowerCase();
            customMessage = args.slice(1).join(" ") || "";

            for (const id of participants) {
                const name = await getSafeName(id, "");
                if (name && name.toLowerCase().includes(searchName)) {
                    targets.push({ id, name });
                }
            }

            targets.sort((a, b) => a.name.localeCompare(b.name));

            if (targets.length === 0) {
                return message.reply(`❌ | 𝐍𝐨 𝐮𝐬𝐞𝐫 𝐟𝐨𝐮𝐧𝐝 𝐰𝐢𝐭𝐡 𝐭𝐡𝐞 𝐧𝐚𝐦𝐞 "${args[0]}"!`);
            }
        }
        else {
            const name = await getSafeName(senderID);
            targets.push({ id: senderID, name });
            if (!customMessage) customMessage = "";
        }

        const mentions = targets.map(user => ({ id: user.id, tag: user.name }));
        const output = targets
            .map(user => `${user.name} ${customMessage}`.trim())
            .join("\n");

        return message.reply({
            body: output,
            mentions
        });
    }
};