const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "dalle",
    version: "1.0",
    author: "MahMUD",
    countDown: 15,
    role: 0,
    description: "Generate AI Image",
    category: "image gen",
    guide: "{pn} <prompt>"
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ");

    if (!prompt)
      return message.reply(" | 𝑷𝒍𝒆𝒂𝒔𝒆 𝑬𝒏𝒕𝒆𝒓 𝑨 𝑷𝒓𝒐𝒎𝒑𝒕.");

    const filePath = path.join(__dirname, "cache", `dalle3_${Date.now()}.png`);

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const base = await baseApiUrl();

      const res = await axios({
        url: `${base}/api/dalle3`,
        method: "POST",
        data: { prompt },
        responseType: "arraybuffer"
      });

      fs.writeFileSync(filePath, Buffer.from(res.data));

      await message.reply({
        body: " 𝑯𝒆𝒓𝒆'𝒔 𝒀𝒐𝒖𝒓 𝑫𝑨𝑳𝑳•𝑬 𝟑 𝑰𝒎𝒂𝒈𝒆 𝑩𝒂𝒃𝒚 ",
        attachment: fs.createReadStream(filePath)
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply(` | ${err.message}`);
    } finally {
      if (fs.existsSync(filePath))
        fs.unlinkSync(filePath);
    }
  }
};