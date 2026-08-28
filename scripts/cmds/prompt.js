const axios = require('axios');

module.exports = {
  config: {
    name: "prompt",
    aliases: ["p", "img2prompt"],
    version: "1.4",
    author: "Bokkor x69",
    countDown: 5,
    role: 0,
    description: "Get detailed prompt from an image",
    category: "utility",
    guide: "{pn} (reply to an image) or {pn} <imageUrl>"
  },

  onStart: async function ({ api, event, args, message }) {
    let imageUrl;

    // ১. ছবির ওপর রিপ্লাই দেওয়া থাকলে
    if (event.type === "message_reply") {
      const attachment = event.messageReply.attachments[0];
      if (attachment && ["photo", "sticker"].includes(attachment.type)) {
        imageUrl = attachment.url;
      } else {
        return message.reply("❌ | Reply must be an image.");
      }
    } 
    // ২. সরাসরি ইমেজের URL দেওয়া থাকলে
    else if (args[0] && args[0].match(/https?:\/\/.+/g)) {
      imageUrl = args[0];
    }

    if (!imageUrl) {
      return message.reply("❌ | Reply to an image or provide a valid image URL.");
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const res = await axios.get(`https://azadx69x.is-a.dev/api/prompt`, {
        params: {
          url: imageUrl
        }
      });

      // নতুন রেসপন্স স্ট্রাকচার অনুযায়ী ভ্যালিডেশন
      if (!res.data || !res.data.success || !res.data.data || !res.data.data.prompt) {
        throw new Error("Failed to extract prompt from the image.");
      }

      const generatedPrompt = res.data.data.prompt;

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      await message.reply(generatedPrompt);

    } catch (error) {
      console.error("PROMPT ERROR:", error);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply(`❌ | An error occurred: ${error.response?.data?.message || error.message}`);
    }
  }
};