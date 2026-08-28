const axios = require('axios');

module.exports = {
  config: {
    name: "colorize",
    aliases: ["color", "recolor"],
    author: "Bokkor x69",
    version: "1.0.0",
    countDown: 10,
    description: "Colorize black and white images",
    guide: "{pn} <imageUrl> or reply to an image",
    category: "Tools"
  },

  onStart: async function ({ api, args, event, message }) {
    let imageUrl;

    // চেক করা হচ্ছে রিপ্লাই দেওয়া ছবিতে URL আছে কি না
    if (event.type === "message_reply" && event.messageReply.attachments && event.messageReply.attachments[0]) {
      imageUrl = event.messageReply.attachments[0].url;
    } else if (args[0]) {
      imageUrl = args[0];
    }

    if (!imageUrl) {
      return api.sendMessage(
        "Please reply to a black & white image or provide an image URL!\n\nUsage:\n{pn} <imageUrl>\nOr reply to an image with {pn}",
        event.threadID,
        event.messageID
      );
    }

    api.setMessageReaction("⏳", event.messageID, (err) => {}, true);
    const loadMsg = await message.reply("⏳ 𝙬𝙖𝙞𝙩 𝙗𝙗𝙮, 𝙮𝙤𝙪𝙧 𝙞𝙢𝙖𝙜𝙚 𝙞𝙨 𝙘𝙤𝙡𝙤𝙧𝙞𝙯𝙞𝙣𝙜...");

    try {
      const res = await axios.get(`https://www.smfahim.xyz/tools/colorize/v1?imageUrl=${encodeURIComponent(imageUrl)}`);

      const resultUrl = res.data.result || (res.data.meta && res.data.meta.downloadUrls && res.data.meta.downloadUrls[0]);

      if (!res.data.success || !resultUrl) {
        throw new Error("Failed to colorize image.");
      }

      const ext = resultUrl.split('.').pop().split('?')[0] || 'jpg';

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);
      api.unsendMessage(loadMsg.messageID);

      await api.sendMessage({
        body: "✨ 𝙃𝙚𝙧𝙚 𝙞𝙨 𝙮𝙤𝙪𝙧 𝙘𝙤𝙡𝙤𝙧𝙞𝙯𝙚𝙙 𝙞𝙢𝙖𝙜𝙚:",
        attachment: await global.utils.getStreamFromURL(resultUrl, `colorize.${ext}`)
      }, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      api.unsendMessage(loadMsg.messageID);
      api.sendMessage(
        "An error occurred while colorizing your image, please try again later..🙂",
        event.threadID,
        event.messageID
      );
    }
  }
};