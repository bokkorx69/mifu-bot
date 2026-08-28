const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "4k",
    aliases: ["hd", "upscale"],
    version: "1.7",
    author: "bokkor x69",
    countDown: 10,
    role: 0,
    description: "Upscale image to 4K using AI",
    category: "tools",
    premium: true,
    guide: {
      en: "{pn} [url] or reply to image"
    }
  },

  onStart: async function ({ api, event, args, message, getLang }) {
    const startTime = Date.now();

    let imgUrl;

    // reply image
    if (event.messageReply?.attachments?.[0]?.type === "photo") {
      imgUrl = event.messageReply.attachments[0].url;
    }
    // url input
    else if (args[0]) {
      imgUrl = args.join(" ");
    }

    if (!imgUrl) {
      return message.reply("Please reply to an image or provide a URL");
    }

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const wait = await api.sendMessage(
        "Enhancing image to 4K... please wait 😘",
        event.threadID
      );

      const baseUrl = await baseApiUrl();

      const apiUrl = `${baseUrl}/api/hd/mahmud?imgUrl=${encodeURIComponent(imgUrl)}`;

      // 🔥 STREAM RESPONSE (like second cmd style)
      const response = await axios.get(apiUrl, {
        responseType: "stream",
        timeout: 120000
      });

      const processTime = ((Date.now() - startTime) / 1000).toFixed(2);

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      if (wait?.messageID) api.unsendMessage(wait.messageID);

      return api.sendMessage(
        {
          body: `✅ Here's your 4K image!\n⌛ Process time: ${processTime}s`,
          attachment: response.data
        },
        event.threadID,
        event.messageID
      );

    } catch (err) {
      console.error("4K Upscale Error:", err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);

      return message.reply(
        `Failed to upscale image\n${err.response?.data?.message || err.message}`
      );
    }
  }
};