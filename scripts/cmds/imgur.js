const axios = require("axios");

module.exports = {
  config: {
    name: "imgur",
    aliases: [],
    version: "2.0",
    author: "Bokkor x69",
    shortDescription: "Upload media to Imgur.",
    longDescription: "Uploads an image or video (via reply) to Imgur and returns the public Imgur link.",
    category: "tools",
    guide: "{pn} (reply to an image or video message)",
  },
  onStart: async function ({ api, event, message }) {
    if (
      event.type !== "message_reply" ||
      !event.messageReply?.attachments?.length
    ) {
      return message.reply("⚠️ Please reply to an image or video.");
    }

    try {
      if (api && typeof api.setMessageReaction === "function") {
        api.setMessageReaction("⏳", event.messageID, () => {}, true);
      }

      const mediaUrl = event.messageReply.attachments[0].url;
      const apiEndpoint = `https://azadx69x.is-a.dev/api/imgur?url=${encodeURIComponent(mediaUrl)}`;

      const res = await axios.get(apiEndpoint, {
        timeout: 30000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json, text/plain, */*"
        }
      });

      const resData = res.data;

      let fileLink = "";
      if (resData?.success && resData?.url) {
        fileLink = resData.url;
      } else if (resData?.link) {
        fileLink = resData.link;
      } else if (typeof resData === "string" && resData.startsWith("http")) {
        fileLink = resData.trim();
      }

      if (!fileLink || !fileLink.startsWith("http")) {
        if (api && typeof api.setMessageReaction === "function") {
          api.setMessageReaction("❌", event.messageID, () => {}, true);
        }
        return message.reply(`❌ Upload failed. Reason: ${resData?.message || JSON.stringify(resData)}`);
      }

      const replyText = `
━━━━━━━━━━━━━ IMGUR UPLOADER ━━━━━━━━━

❍ Display URL: \n\n ${fileLink}

`;

      let attachmentStream = null;
      if (fileLink && global.utils?.getStreamFromURL) {
        try {
          attachmentStream = await global.utils.getStreamFromURL(fileLink);
        } catch (err) {
          console.error("Image preview stream loading failed:", err.message);
        }
      }

      await message.reply({
        body: replyText,
        ...(attachmentStream && { attachment: attachmentStream })
      });

      if (api && typeof api.setMessageReaction === "function") {
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      }

    } catch (error) {
      console.error("Error uploading to Imgur:", error.response?.data || error.message);
      if (api && typeof api.setMessageReaction === "function") {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
      const errorMsg = error.response?.data?.message || error.message;
      return message.reply(`❌ Failed to upload media: ${errorMsg}`);
    }
  },
};