const axios = require("axios");

module.exports = {
  config: {
    name: "2k",
    version: "2.1",
    author: "bokkor x69",
    countDown: 10,
    role: 0,
    description: "Enhance image up to 4K resolution",
    category: "tools",
    premium: true,
    guide: {
      en: "{pn} [url] or reply to image"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const startTime = Date.now();
    let imgUrl = null;
    let wait = null;

    try {
      // ==========================================
      // GET IMAGE FROM REPLY
      // ==========================================

      if (
        event.messageReply?.attachments?.[0]?.type === "photo"
      ) {
        imgUrl =
          event.messageReply.attachments[0].url;
      }

      // ==========================================
      // GET IMAGE FROM URL
      // ==========================================

      else if (args.length > 0) {
        imgUrl = args.join(" ").trim();
      }

      if (!imgUrl) {
        return message.reply(
          "❌ Please reply to an image or provide a valid image URL."
        );
      }

      // ==========================================
      // PROCESSING
      // ==========================================

      api.setMessageReaction(
        "⏳",
        event.messageID,
        () => {},
        true
      );

      wait = await api.sendMessage(
        "⏳ Enhancing image...",
        event.threadID
      );

      // ==========================================
      // MAIN DOMAIN API
      // ==========================================

      const BASE_API_URL =
        "https://core.apis-noob-x69.rf.gd/api/enhance/url";

      const apiUrl =
        `${BASE_API_URL}?url=${encodeURIComponent(imgUrl)}` +
        `&scale=4` +
        `&brightness=1` +
        `&saturation=1.05` +
        `&format=png`;

      // ==========================================
      // CALL API
      // ==========================================

      const apiRes = await axios.get(apiUrl, {
        timeout: 120000
      });

      const data = apiRes.data;

      if (
        data?.status !== true ||
        !data?.data?.enhancedUrl
      ) {
        throw new Error(
          data?.error ||
          data?.details ||
          "Image enhancement failed"
        );
      }

      const enhancedUrl =
        data.data.enhancedUrl;

      // ==========================================
      // DOWNLOAD RESULT
      // ==========================================

      const imageResponse = await axios.get(
        enhancedUrl,
        {
          responseType: "stream",
          timeout: 60000
        }
      );

      const processTime =
        (
          (Date.now() - startTime) /
          1000
        ).toFixed(2);

      // ==========================================
      // SUCCESS
      // ==========================================

      api.setMessageReaction(
        "✅",
        event.messageID,
        () => {},
        true
      );

      if (wait?.messageID) {
        api.unsendMessage(wait.messageID);
      }

      return api.sendMessage(
        {
          body:
            `✅ Image enhanced successfully in ${processTime} seconds!\n\n` +
            ``,

          attachment: imageResponse.data
        },
        event.threadID,
        event.messageID
      );

    } catch (err) {
      console.error(
        "[2K ERROR]",
        err.response?.data || err.message
      );

      api.setMessageReaction(
        "❌",
        event.messageID,
        () => {},
        true
      );

      if (wait?.messageID) {
        api.unsendMessage(wait.messageID);
      }

      const error =
        err.response?.data?.error ||
        err.response?.data?.details ||
        err.message ||
        "Unknown error";

      return message.reply(
        `❌ Image enhancement failed 😞\n\n` +
        `Error: ${error}`
      );
    }
  }
};