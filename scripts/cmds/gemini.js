const axios = require("axios");

module.exports = {
    config: {
        name: "gemini",
        aliases: ["gemini3", "gem"],
        version: "1.0",
        author: "Bokkor x69",
        countDown: 5,
        role: 0,
        description: "Gemini AI chat with reply support",
        category: "ai",
        guide: {
            en: "{pn} <question> or reply to message"
        }
    },

    onStart: async function ({ api, event, args, message, getLang, commandName }) {
        const prompt = args.join(" ");
        if (!prompt) return message.reply("× Please ask something!");

        return handleGemini({ api, event, prompt, message, getLang, commandName });
    },

    onReply: async function ({ api, event, Reply, message, getLang, commandName }) {
        if (Reply.author !== event.senderID) return;
        const prompt = event.body;
        if (!prompt) return;

        return handleGemini({ api, event, prompt, message, getLang, commandName });
    }
};

async function handleGemini({ api, event, prompt, message, getLang, commandName }) {
    try {
        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        const res = await axios.get("https://www.smfahim.xyz/ai/gemini/v3", {
            params: {
                prompt: prompt
            }
        });

        const replyText = res.data?.result || "No response received";

        api.setMessageReaction("✅", event.messageID, () => {}, true);

        message.reply(replyText, (err, info) => {
            if (!err) {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName,
                    author: event.senderID
                });
            }
        }, event.messageID);

    } catch (err) {
        console.log("GEMINI ERROR:", err);

        api.setMessageReaction("❌", event.messageID, () => {}, true);

        return message.reply(
            "× AI error occurred\n\n" + (err.response?.data?.error || err.message)
        );
    }
}