const fs = require("fs-extra");
const request = require("request");
const path = require("path");

module.exports = {
  config: {
    name: "boxinfo",
    aliases: ['boxinfo', 'groupinfo'],
    version: "1.5",
    author: "TERAA BAPPP",
    countDown: 5,
    role: 0,
    shortDescription: "Detailed Group/Box info",
    longDescription: "",
    category: "box chat",
    guide: {
      en: "{p} [groupinfo|boxinfo]",
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      
      const threadMem = threadInfo.participantIDs.length;
      let male = 0, female = 0, other = 0;
      for (let z in threadInfo.userInfo) {
        let gender = threadInfo.userInfo[z].gender;
        if (gender === "MALE") male++;
        else if (gender === "FEMALE") female++;
        else other++;
      }

      let adminList = '';
      for (let admin of threadInfo.adminIDs) {
        try {
          const infu = await api.getUserInfo(admin.id);
          adminList += `• ${infu[admin.id]?.name || "Admin"}\n`;
        } catch (e) { adminList += `• Admin\n`; }
      }

      const threadName = threadInfo.threadName || "No Name";
      const id = threadInfo.threadID;
      const approval = threadInfo.approvalMode ? 'ON' : 'OFF';
      const emoji = threadInfo.emoji || "None";
      const msgCount = threadInfo.messageCount || 0;
      const theme = threadInfo.threadTheme?.accessibility_label || "Default";
      const inviteLink = threadInfo.inviteLink?.link || "Not available";

      const cachePath = path.join(__dirname, `/cache/box_${id}.png`);
      const imageUrl = threadInfo.imageSrc || "https://i.imgur.com/gW9wH25.jpg";

      const callback = () => {
        const msg = {
          body: `━━━━━━━━━━━━━━━━━━━━\n` +
                `      𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍\n` +
                `━━━━━━━━━━━━━━━━━━━━\n\n` +
                `📌 𝐍𝐚𝐦𝐞: ${threadName}\n` +
                `🆔 𝐆𝐫𝐨𝐮𝐩 𝐈𝐃: ${id}\n` +
                `🛡️ 𝐀𝐩𝐩𝐫𝐨𝐯𝐚𝐥 𝐌𝐨𝐝𝐞: ${approval}\n` +
                `🎨 𝐓𝐡𝐞𝐦𝐞: ${theme}\n` +
                `💫 𝐄𝐦𝐨𝐣𝐢: ${emoji}\n` +
                `🔗 𝐈𝐧𝐯𝐢𝐭𝐞 𝐋𝐢𝐧𝐤: ${inviteLink}\n\n` +
                `👥 𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${threadMem}\n` +
                `👨‍🦰 𝐌𝐚𝐥𝐞𝐬: ${male} | 👩‍🦰 𝐅𝐞𝐦𝐚𝐥𝐞𝐬: ${female} | 👤 𝐎𝐭𝐡𝐞𝐫𝐬: ${other}\n\n` +
                `👑 𝐀𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫𝐬:\n${adminList}\n` +
                `💬 𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐬𝐬𝐚𝐠𝐞𝐬: ${msgCount}\n\n` +
                `━━━━━━━━━━━━━━━━━━━━`,
          attachment: fs.createReadStream(cachePath)
        };

        api.sendMessage(msg, event.threadID, () => {
          if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        }, event.messageID);
      };

      request(encodeURI(imageUrl))
        .pipe(fs.createWriteStream(cachePath))
        .on('close', () => callback())
        .on('error', () => {
          api.sendMessage(`𝐆𝐫𝐨𝐮𝐩 𝐍𝐚𝐦𝐞: ${threadName}\n𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${threadMem}\n𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐬𝐬𝐚𝐠𝐞𝐬: ${msgCount}`, event.threadID, event.messageID);
        });

    } catch (error) {
      console.error(error);
      api.sendMessage("❌ Error: Could not fetch all group details.", event.threadID, event.messageID);
    }
  }
};