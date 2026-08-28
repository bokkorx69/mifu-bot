const formatBalance = function (amount) {
    const num = isNaN(amount) ? 0 : amount;
    if (num < 1000) return num + "$";
    if (num < 1000000) return (num / 1000).toFixed(1) + "k$";
    if (num < 1000000000) return (num / 1000000).toFixed(1) + "M$";
    if (num < 1000000000000) return (num / 1000000000).toFixed(1) + "B$";
    if (num < 1000000000000000) return (num / 1000000000000).toFixed(1) + "T$";
    if (num < 1000000000000000000) return (num / 1000000000000000).toFixed(1) + "Q$";
    if (num < 1000000000000000000000) return (num / 1000000000000000000).toFixed(1) + "A$";
    return (num / 1000000000000000000000000).toFixed(1) + "D$";
};

module.exports = {
    config: {
        name: "bal",
        aliases: ["balance"],
        version: "1.13",
        author: "NTKhang",
        countDown: 3,
        role: 0,
        description: {
            vi: "xem số tiền hiện có của bạn hoặc người được tag",
            en: "view your money or the money of the tagged person"
        },
        category: "economy",
        guide: {
            vi: "   {pn}: xem số tiền của bạn"
                + "\n   {pn} <@tag>: xem số tiền của người được tag"
                + "\n   {pn} <reply>: xem số tiền của người được reply"
                + "\n   {pn} <uid>: xem số tiền của người có UID tương ứng",
            en: "   {pn}: view your money"
                + "\n   {pn} <@tag>: view the money of the tagged person"
                + "\n   {pn} <reply>: view the money of the replied person"
                + "\n   {pn} <uid>: view the money of the user with the given UID"
        }
    },

    langs: {
        vi: {
            money: "Bạn đang có %1$",
            moneyOf: "%1 đang có %2$"
        },
        en: {
            money: "𝐇𝐞𝐲 %1 %2\n𝐘𝐨𝐮𝐫 𝐁𝐚𝐥𝐚𝐧𝐜𝐞 𝐢𝐬 %3",
            moneyOf: "𝐇𝐞𝐲 %1 %2\n𝐘𝐨𝐮𝐫 𝐁𝐚𝐥𝐚𝐧𝐜𝐞 𝐢𝐬 %3"
        }
    },

    onStart: async function ({ message, usersData, event, getLang, args }) {
        const targetIDs = new Set();
        const emojis = ["🎀", "🧸", "🦋", "✨", "💫", "🕊️", "⚡", "😑", "🌟", "💋"];

        if (event.mentions && Object.keys(event.mentions).length > 0) {
            Object.keys(event.mentions).forEach(id => targetIDs.add(id));
        }
        if (event.messageReply) {
            targetIDs.add(event.messageReply.senderID);
        }
        if (args.length > 0) {
            args.forEach(arg => {
                if (!isNaN(arg)) targetIDs.add(arg);
            });
        }

        if (targetIDs.size === 0) {
            targetIDs.add(event.senderID);
        }

        let msg = "";
        for (const targetID of targetIDs) {
            const [userData, userName] = await Promise.all([
                usersData.get(targetID, "money"),
                usersData.getName(targetID).catch(() => "User")
            ]);

            const formattedMoney = formatBalance(userData);
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

            msg += getLang("money", userName, randomEmoji, formattedMoney) + '\n';
        }

        return message.reply(msg.trim());
    }
};