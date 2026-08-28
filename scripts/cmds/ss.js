const axios = require('axios');

module.exports = {
  config: {
    name: "ss",
    aliases: ["screenshot"],
    version: "2.1",
    author: "Bokkor x69",
    countDown: 5,
    role: 0,
    shortDescription: "get screenshot of website",
    longDescription: "takes a screenshot of any website using API and streams the image directly.",
    category: "media",
    guide: "{pn} <url>"
  },

  onStart: async function ({ message, args, api, event }) {
    const targetUrl = args.join(" ").trim();
    if (!targetUrl) {
      return message.reply(`⚠️ | Please enter a valid website URL!`);
    }

    try {
      if (api && typeof api.setMessageReaction === 'function') {
        api.setMessageReaction("⏳", event.messageID, () => {}, true);
      }

      const apiUrl = `https://azadx69x.is-a.dev/api/screenshot?url=${encodeURIComponent(targetUrl)}`;

      const attachmentStream = await global.utils.getStreamFromURL(apiUrl);

      const replyText = `
━━━━━━━━━━━━━ WEB SCREENSHOT ━━━━━━━━━
❍ URL: ${targetUrl}
❍ Status: Success ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

      await message.reply({
        body: replyText,
        attachment: attachmentStream
      });

      if (api && typeof api.setMessageReaction === 'function') {
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      }

    } catch (error) {
      console.error("Screenshot Error:", error.message);
      if (api && typeof api.setMessageReaction === 'function') {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
      return message.reply(`❌ Failed to capture screenshot. Make sure the URL is valid and accessible.`);
    }
  }
};