const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "blur",
    aliases: ["blured"],
    version: "1.0",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    description: "Blur Image",
    category: "image",
    guide: "{pn} <reply image> <1-100> | {pn} <url> <1-100>"
  },

  onStart: async function ({ api, args, message, event }) {
    try {
      let imageUrl;
      let blurLevel = 50;

      if (
        event.type === "message_reply" &&
        event.messageReply.attachments?.length
      ) {
        imageUrl = event.messageReply.attachments[0].url;
        if (args[0]) blurLevel = Number(args[0]);
      } else if (args[0]?.startsWith("http")) {
        imageUrl = args[0];
        if (args[1]) blurLevel = Number(args[1]);
      } else {
        return message.reply("❀ | 𝑹𝒆𝒑𝒍𝒚 𝒕𝒐 𝒂𝒏 𝒊𝒎𝒂𝒈𝒆 𝒐𝒓 𝒔𝒆𝒏𝒅 𝒂𝒏 𝒊𝒎𝒂𝒈𝒆 𝒍𝒊𝒏𝒌.");
      }

      if (isNaN(blurLevel) || blurLevel < 1 || blurLevel > 100)
        return message.reply("❀ | 𝑩𝒍𝒖𝒓 𝒍𝒆𝒗𝒆𝒍 𝒎𝒖𝒔𝒕 𝒃𝒆 𝒃𝒆𝒕𝒘𝒆𝒆𝒏 1-100.");

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const base = await baseApiUrl();

      const image = `${base}/api/blur/mahmud?url=${encodeURIComponent(
        imageUrl
      )}&blurLevel=${blurLevel}`;

      await message.reply({
        body: " ✦ 𝑯𝒆𝒓𝒆'𝒔 𝒀𝒐𝒖𝒓 𝑩𝒍𝒖𝒓𝒓𝒆𝒅 𝑰𝒎𝒂𝒈𝒆 𝑩𝒂𝒃𝒚 ",
        attachment: await global.utils.getStreamFromURL(image)
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply(`❀ | ${err.message}`);
    }
  }
};