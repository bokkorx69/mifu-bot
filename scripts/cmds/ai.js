const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

module.exports.config = {
  name: "ai",
  aliases: ["chat"],
  version: "2.0.0",
  author: "MahMUD",
  role: 0,
  description: "AI chat ",
  category: "ai",
  countDown: 5,
  guide: "{pn} <question>"
};

// MAIN
module.exports.onStart = async function ({ api, args, event }) {
  const author = event.senderID;
  const prompt = args.join(" ");

  if (!prompt) {
    return api.sendMessage(
      "Please ask something",
      event.threadID,
      event.messageID
    );
  }

  try {
    const baseUrl = await baseApiUrl();

    const res = await axios.get(
      `${baseUrl}/api/ai`,
      {
        params: {
          prompt: prompt,
          ai: "ai"
        }
      }
    );

    const replyText = res.data.response || "No response";

    const sent = await api.sendMessage(
      { body: replyText },
      event.threadID,
      event.messageID
    );

    global.GoatBot.onReply.set(sent.messageID, {
      commandName: "ai",
      type: "reply",
      author
    });

  } catch (err) {
    console.log("AI ERROR:", err?.response?.data || err.message);

    return api.sendMessage(
      "AI error occurred",
      event.threadID,
      event.messageID
    );
  }
};

// REPLY
module.exports.onReply = async function ({ api, event, Reply }) {
  if (Reply.author !== event.senderID) return;

  const prompt = event.body;
  if (!prompt) return;

  try {
    const baseUrl = await baseApiUrl();

    const res = await axios.get(
      `${baseUrl}/api/ai`,
      {
        params: {
          prompt: prompt,
          ai: "ai"
        }
      }
    );

    const replyText = res.data.response || "No response";

    const sent = await api.sendMessage(
      { body: replyText },
      event.threadID,
      event.messageID
    );

    global.GoatBot.onReply.set(sent.messageID, {
      commandName: "ai",
      type: "reply",
      author: event.senderID
    });

  } catch (err) {
    console.log(err?.response?.data || err.message);

    return api.sendMessage(
      "AI error occurred",
      event.threadID,
      event.messageID
    );
  }
};