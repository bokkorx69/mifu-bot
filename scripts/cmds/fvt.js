const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "favorite",
    aliases: ["fvt", "fav"],
    version: "1.0",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    description: "𝑭𝒂𝒗𝒐𝒓𝒊𝒕𝒆 𝑪𝒂𝒓𝒅",
    category: "love",
    guide: "{pn} <@𝒎𝒆𝒏𝒕𝒊𝒐𝒏/𝒓𝒆𝒑𝒍𝒚>"
  },

  onStart: async function ({ api, event, usersData, message }) {
    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const { threadID, senderID, mentions, messageReply } = event;
      let uid;

      if (Object.keys(mentions).length)
        uid = Object.keys(mentions)[0];
      else if (messageReply)
        uid = messageReply.senderID;
      else {
        const info = await api.getThreadInfo(threadID);
        const users = info.userInfo.filter(u => u.id != senderID);

        if (!users.length)
          return message.reply(" | 𝑵𝒐 𝑼𝒔𝒆𝒓 𝑭𝒐𝒖𝒏𝒅.");

        uid = users[Math.floor(Math.random() * users.length)].id;
      }

      const user = await usersData.get(uid);
      const name = user.name || "Unknown";

      const base = await baseApiUrl();
      const filePath = path.join(__dirname, "cache", `favorite_${Date.now()}.png`);

      const res = await axios({
        url: `${base}/api/fvt?uid=${uid}&name=${encodeURIComponent(name)}`,
        method: "GET",
        responseType: "arraybuffer"
      });

      fs.writeFileSync(filePath, Buffer.from(res.data));

      await message.reply({
        body: ``,
        mentions: [{ tag: name, id: uid }],
        attachment: fs.createReadStream(filePath)
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      if (fs.existsSync(filePath))
        fs.unlinkSync(filePath);

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply(`❀ | 𝑬𝒓𝒓𝒐𝒓: ${err.message}`);
    }
  }
};