const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "tiktok",
    aliases: ["tt", "tiksearch"],
    version: "1.0",
    author: "Bokkor x69",
    countDown: 5,
    role: 0,
    description: "Search TikTok videos",
    category: "media",
    guide: "{pn} <keyword>"
  },

  onStart: async function ({ api, message, args, event }) {
    if (!args.length)
      return message.reply("❀ | 𝑷𝒍𝒆𝒂𝒔𝒆 𝒆𝒏𝒕𝒆𝒓 𝒂 𝒌𝒆𝒚𝒘𝒐𝒓𝒅.");

    const keyword = args.join(" ");
    const filePath = path.join(__dirname, "cache", `tiktok_${Date.now()}.mp4`);

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const base = await baseApiUrl();

      const { data } = await axios.get(
        `${base}/api/tiktok?keyword=${encodeURIComponent(keyword)}`
      );

      if (!data.success || !data.videos?.length) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply("❀ | 𝑵𝒐 𝒗𝒊𝒅𝒆𝒐 𝒇𝒐𝒖𝒏𝒅.");
      }

      const video =
        data.videos[Math.floor(Math.random() * data.videos.length)];

      const res = await axios({
        url: video.play,
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
        body: "✦ 𝑯𝒆𝒓𝒆'𝒔 𝒀𝒐𝒖𝒓 𝑻𝒊𝒌𝑻𝒐𝒌 𝑽𝒊𝒅𝒆𝒐 𝑩𝒂𝒃𝒚 ",
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