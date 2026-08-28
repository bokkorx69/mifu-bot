const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "cockroach",
    aliases: ["cock", "তেলাপোকা","c"],
    version: "1.0",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    description: "Cockroach Image",
    category: "fun",
    guide: "{pn} <@tag/reply/uid>"
  },

  onStart: async function ({ api, event, args, message }) {
    let uid;

    if (Object.keys(event.mentions).length)
      uid = Object.keys(event.mentions)[0];
    else if (event.messageReply)
      uid = event.messageReply.senderID;
    else if (args[0] && !isNaN(args[0]))
      uid = args[0];

    if (!uid)
      return message.reply("❀ | 𝑴𝒆𝒏𝒕𝒊𝒐𝒏, 𝑹𝒆𝒑𝒍𝒚 𝒐𝒓 𝑷𝒓𝒐𝒗𝒊𝒅𝒆 𝒂 𝑼𝑰𝑫.");

    const filePath = path.join(__dirname, "cache", `cockroach_${Date.now()}.png`);

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const base = await baseApiUrl();

      const res = await axios({
        url: `${base}/api/cockroach?user=${uid}`,
        method: "GET",
        responseType: "arraybuffer"
      });

      fs.writeFileSync(filePath, Buffer.from(res.data));

      await message.reply({
        body: "",
        attachment: fs.createReadStream(filePath)
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply(`❀ | ${err.message}`);
    } finally {
      if (fs.existsSync(filePath))
        fs.unlinkSync(filePath);
    }
  }
};