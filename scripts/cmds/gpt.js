const axios = require("axios");

const baseApiUrl = async () => {
    const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
    return base.data.mahmud;
};

module.exports = {
    config: {
        name: "gpt",
        aliases: ["gpt4"],
        version: "2.0",
        author: "MahMUD",
        countDown: 5,
        role: 0,
        description: "GPT AI chat with reply support",
        category: "ai",
        guide: {
            en: "{pn} <question> or reply to message"
        }
    },

    onStart: async function ({ api, event, args, message, getLang, commandName }) {
        const prompt = args.join(" ");
        if (!prompt) return message.reply("× Please ask something!");

        return handleGPT({ api, event, prompt, message, getLang, commandName });
    },

    onReply: async function ({ api, event, Reply, message, getLang, commandName }) {
        if (Reply.author !== event.senderID) return;
        const prompt = event.body;
        if (!prompt) return;

        return handleGPT({ api, event, prompt, message, getLang, commandName });
    }
};

async function handleGPT({ api, event, prompt, message, getLang, commandName }) {
    try {
        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        const baseUrl = await baseApiUrl();

        const res = await axios.get(`${baseUrl}/api/ai`, {
            params: {
                prompt: prompt,
                ai: "gpt"
            }
        });

        const replyText = res.data?.response || "No response received";

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
        console.log("GPT ERROR:", err);

        api.setMessageReaction("❌", event.messageID, () => {}, true);

        return message.reply(
            "× AI error occurred\n\n" + (err.response?.data?.error || err.message)
        );
    }
}