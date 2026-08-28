const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "outfit",
    Aliases: ["ffoutfit", "ffimg"],
    version: "1.0",
    author: "Bokkor x69",
    countDown: 5,
    role: 0,
    shortDescription: "Get outfit image",
    longDescription: "Generate outfit image by UID",
    category: "FF"
  },

  onStart: async function ({ api, event, args }) {
    const uid = args[0];

    if (!uid) {
      await api.setMessageReaction("❌", event.messageID, () => {}, true);
      return api.sendMessage(
        "⚠️ ব্যবহার:\noutfit <uid>",
        event.threadID,
        event.messageID
      );
    }

    try {
      await api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const imgPath = path.join(__dirname, "cache", `outfit_${uid}.jpg`);

      const response = await axios({
        url: `https://all-agajayofficial-online.vercel.app/outfit-image?uid=${uid}`,
        method: "GET",
        responseType: "stream"
      });

      const writer = fs.createWriteStream(imgPath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        await api.setMessageReaction("✅", event.messageID, () => {}, true);

        api.sendMessage(
          {
            body: `✅ Outfit Image for UID: ${uid}`,
            attachment: fs.createReadStream(imgPath)
          },
          event.threadID,
          () => {
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
          },
          event.messageID
        );
      });

      writer.on("error", async () => {
        await api.setMessageReaction("❌", event.messageID, () => {}, true);
        api.sendMessage(
          "❌ Image download failed.",
          event.threadID,
          event.messageID
        );
      });

    } catch (err) {
      await api.setMessageReaction("❌", event.messageID, () => {}, true);

      api.sendMessage(
        `❌ Error: ${err.message}`,
        event.threadID,
        event.messageID
      );
    }
  }
};