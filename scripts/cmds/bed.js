const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const res = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
  );
  return res.data.mahmud;
};

module.exports = {
  config: {
    name: "bed",
    version: "1.7",
    author: "MahMUD",
    role: 0,
    countDown: 5,
    description: "Bed hug image generator",
    category: "love",
    guide: "{pn} @mention",
  },

  langs: {
    bn: {
      noMention: "কাউকে মেনশন দাও।",
      success: "Here's your image baby",
      error: "%1",
    },
    en: {
      noMention: "Please mention someone.",
      success: "Here's your image baby",
      error: "%1",
    },
    vi: {
      noMention: "Vui lòng mention ai đó.",
      success: "Here's your image baby",
      error: "%1",
    },
  },

  onStart: async function ({ api, event, message, getLang }) {
    const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
    if (this.config.author.trim() !== authorName) {
      return api.sendMessage(
        "Unauthorized",
        event.threadID,
        event.messageID
      );
    }

    const mentions = Object.keys(event.mentions || {});
    if (!mentions.length) return message.reply(getLang("noMention"));

    const senderID = event.senderID;
    const targetID = mentions[0];

    const filePath = path.join(
      __dirname,
      "cache",
      `bed_${senderID}_${targetID}.png`
    );

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const base = await baseApiUrl();

      const res = await axios.post(
        `${base}/api/bed`,
        { senderID, targetID },
        { responseType: "arraybuffer" }
      );

      fs.writeFileSync(filePath, Buffer.from(res.data));

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      return message.reply(
        {
          body: getLang("success"),
          attachment: fs.createReadStream(filePath),
        },
        () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      );
    } catch (err) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return message.reply(getLang("error", err.message));
    }
  },
};