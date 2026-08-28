const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "anisr",
    aliases: ["animesr", "anisearch"],
    version: "1.7",
    author: "MahMUD",
    countDown: 7,
    role: 0,
    description: "Search and download anime videos",
    category: "anime",
    guide: "{pn} <anime name>"
  },

  onStart: async function ({ api, message, args, event }) {
    if (!args.length)
      return message.reply("❀ | 𝑷𝒍𝒆𝒂𝒔𝒆 𝒆𝒏𝒕𝒆𝒓 𝒂𝒏 𝒂𝒏𝒊𝒎𝒆 𝒏𝒂𝒎𝒆.");

    const query = args.join(" ");
    const filePath = path.join(__dirname, "cache", `anisr_${Date.now()}.mp4`);

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const base = await baseApiUrl();

      const res = await axios({
        url: `${base}/api/anisr?search=${encodeURIComponent(query)}`,
        method: "GET",
        responseType: "stream"
      });

      const writer = fs.createWriteStream(filePath);
      res.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await message.reply({
        body: `╭─❍\n│ ✦ 𝑯𝒆𝒓𝒆'𝒔 𝒚𝒐𝒖𝒓 𝑨𝒏𝒊𝒎𝒆 𝑽𝒊𝒅𝒆𝒐 \n│ ✦ 𝑺𝒆𝒂𝒓𝒄𝒉: ${query}\n╰──────────`,
        attachment: fs.createReadStream(filePath)
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply(`❀ | 𝑬𝒓𝒓𝒐𝒓: ${err.message}`);
    } finally {
      if (fs.existsSync(filePath))
        fs.unlinkSync(filePath);
    }
  }
};