const axios = require('axios');

module.exports = {
    config: {
        name: "age",
        aliases: ["birthday", "birthdate"],
        version: "1.0", 
        author: "ʙᴏᴋᴋᴏʀ x69",
        description: {
            vi: "Lấy thông tin tuổi dựa trên ngày sinh.",
            en: "𝐆𝐞𝐭 𝐚𝐠𝐞 𝐢𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 𝐛𝐚𝐬𝐞𝐝 𝐨𝐧 𝐭𝐡𝐞 𝐛𝐢𝐫𝐭𝐡𝐝𝐚𝐭𝐞."
        },
        category: "𝐓𝐨𝐨𝐥𝐬",
        guide: {
            vi: "{pn} <ngày sinh (DD-MM-YYYY)>",
            en: "{pn} <𝐛𝐢𝐫𝐭𝐡𝐝𝐚𝐭𝐞 (𝐃𝐃-𝐌𝐌-𝐘𝐘𝐘𝐘)>"
        }
    },

    onStart: async function ({ api, args, event }) {
        if (!args[0]) return api.sendMessage("📌 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐛𝐢𝐫𝐭𝐡𝐝𝐚𝐭𝐞! 📅\n\n📝 𝐅𝐨𝐫𝐦𝐚𝐭: 𝐃𝐃-𝐌𝐌-𝐘𝐘𝐘𝐘", event.threadID);

        const birthdate = args[0].split("-");
        if (birthdate.length !== 3) return api.sendMessage("❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐟𝐨𝐫𝐦𝐚𝐭! 𝐏𝐥𝐞𝐚𝐬𝐞 𝐮𝐬𝐞 𝐃𝐃-𝐌𝐌-𝐘𝐘𝐘𝐘 𝐟𝐨𝐫𝐦𝐚𝐭.", event.threadID);

        const [day, month, year] = birthdate;
        const apiUrl = `https://count-age.vercel.app/age-count?year=${year}&month=${month}&day=${day}`;

        try {
            const response = await axios.get(apiUrl);
            const data = response.data;

            const formattedResponse = `
╔══════════════════╗
  🎂 𝐀𝐆𝐄 𝐈𝐍𝐅𝐎 🎂
╚══════════════════╝
📅 𝐁𝐢𝐫𝐭𝐡𝐝𝐚𝐭𝐞: ${args[0]}

✨ ${data.age}

📊 𝐋𝐈𝐅𝐄 𝐒𝐓𝐀𝐓𝐒:
🗓 𝐃𝐚𝐲𝐬 𝐋𝐢𝐯𝐞𝐝: ${data.lifeStats.daysLived}
⏱ 𝐌𝐢𝐧𝐮𝐭𝐞𝐬 𝐋𝐢𝐯𝐞𝐝: ${data.lifeStats.minutesLived}
⏳ 𝐒𝐞𝐜𝐨𝐧𝐝𝐬 𝐋𝐢𝐯𝐞𝐝: ${data.lifeStats.secondsLived}

🎉 𝐍𝐞𝐱𝐭 𝐁𝐢𝐫𝐭𝐡𝐝𝐚𝐲: ${data.nextBirthday}
`;

            await api.sendMessage(formattedResponse, event.threadID);
        } catch (error) {
            console.error('Error fetching age data:', error);
            api.sendMessage("❌ 𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝 𝐰𝐡𝐢𝐥𝐞 𝐩𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐭𝐡𝐞 𝐫𝐞𝐪𝐮𝐞𝐬𝐭!", event.threadID);
        }
    }
};