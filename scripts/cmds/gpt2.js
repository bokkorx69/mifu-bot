const axios = require("axios");

module.exports = {
    config: {
        name: "g2",
        aliases: ["gpt2", "ai"],
        version: "1.0",
        author: "Bokkor x69",
        countDown: 5,
        role: 0,
        description: "AI4Chat AI chat with reply support",
        category: "ai",
        guide: {
            en: "{pn} <question> or reply to message"
        }
    },

    onStart: async function ({ api, event, args, message, getLang, commandName }) {
        const prompt = args.join(" ");
        if (!prompt) return message.reply("× Please ask something!");

        return handleAI4Chat({ api, event, prompt, message, getLang, commandName });
    },

    onReply: async function ({ api, event, Reply, message, getLang, commandName }) {
        if (Reply.author !== event.senderID) return;
        const prompt = event.body;
        if (!prompt) return;

        return handleAI4Chat({ api, event, prompt, message, getLang, commandName });
    }
};

async function handleAI4Chat({ api, event, prompt, message, getLang, commandName }) {
    try {
        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        const res = await axios.get("https://www.smfahim.xyz/ai/ai4chat", {
            params: {
                action: "chat",
                prompt: prompt
            }
        });

        const replyText = res.data?.output?.result || "No response received";

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
        console.log("AI4CHAT ERROR:", err);

        api.setMessageReaction("❌", event.messageID, () => {}, true);

        return message.reply(
            "× AI error occurred\n\n" + (err.response?.data?.error || err.message)
        );
    }
}