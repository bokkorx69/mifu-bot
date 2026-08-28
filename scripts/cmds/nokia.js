const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

module.exports.config = {
  name: "nokia",
  version: "1.0",
  role: 0,
  author: "MahMUD",
  description: "Nokia Screen Effect",
  category: " FUN",
  countDown: 5
};

module.exports.onStart = async ({ api, event, args }) => {
  try {
    let uid;

    if (Object.keys(event.mentions).length > 0) {
      uid = Object.keys(event.mentions)[0];
    } else if (event.type === "message_reply") {
      uid = event.messageReply.senderID;
    } else if (args[0]) {
      uid = args[0];
    }

    if (!uid) {
      return api.sendMessage(
        "Please mention, reply, or provide a UID.",
        event.threadID,
        event.messageID
      );
    }

    const startTime = Date.now();

    const waitMessage = await api.sendMessage(
      "Generating image...",
      event.threadID
    );

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    const baseUrl = await baseApiUrl();
    const imageUrl = `${baseUrl}/api/nokia?uid=${uid}`;

    const stream = await global.utils.getStreamFromURL(imageUrl);

    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);

    api.setMessageReaction("✅", event.messageID, () => {}, true);

    if (waitMessage?.messageID) {
      api.unsendMessage(waitMessage.messageID);
    }

    return api.sendMessage(
      {
        body: `Image generated in ${timeTaken}s`,
        attachment: stream
      },
      event.threadID,
      event.messageID
    );

  } catch (e) {
    console.error("Nokia Error:", e);

    api.setMessageReaction("❌", event.messageID, () => {}, true);

    return api.sendMessage(
      `Error: ${e.message}`,
      event.threadID,
      event.messageID
    );
  }
};