const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "dog",
    aliases: ["kutta"],
    version: "1.0",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    description: "Dog Effect",
    category: "fun",
    guide: "{pn} @mention"
  },

  onStart: async function ({ api, event, message }) {
    const mentions = Object.keys(event.mentions);

    if (!mentions.length)
      return message.reply(" | 𝑷𝒍𝒆𝒂𝒔𝒆 𝑴𝒆𝒏𝒕𝒊𝒐𝒏 𝑺𝒐𝒎𝒆𝒐𝒏𝒆.");

    const senderID = event.senderID;
    const targetID = mentions[0];
    const filePath = path.join(__dirname, "cache", `dog_${Date.now()}.png`);

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const base = await baseApiUrl();

      const res = await axios({
        url: `${base}/api/dog`,
        method: "POST",
        data: { senderID, targetID },
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