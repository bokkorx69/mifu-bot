const axios = require("axios");
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const vipSchema = new Schema({
  uid: { type: String, required: true },
  name: { type: String, default: "" },
  expiry: { type: Number, default: 0 }
});
const VIP = mongoose.models.VIP || model("VIP", vipSchema);

const mahmud = async () => {
    const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
    return base.data.mahmud;
};

module.exports = {
    config: {
        name: "remini",
        version: "1.8",
        author: "MahMUD",
        countDown: 10,
        role: 0,
        description: {
            bn: "Remini AI এর মাধ্যমে ছবির কোয়ালিটি উন্নত করুন (VIP only)",
            en: "Enhance or restore image quality using Remini AI (VIP only)",
            vi: "Nâng cao chất lượng hình ảnh bằng Remini AI (VIP only)"
        },
        category: "VIP",
        guide: {
            bn: '   {pn} [url]: ছবির লিংকের মাধ্যমে Enhance করুন\n  অথবা ছবির রিপ্লাইয়ে {pn} লিখুন',
            en: '   {pn} [url]: Enhance image via URL\n  Or reply to an image with {pn}',
            vi: '   {pn} [url]: Nâng cấp ảnh qua URL\n  Hoặc phản hồi ảnh bằng {pn}'
        }
    },

    langs: {
        bn: {
            noImage: "• বেবি, একটি ছবিতে রিপ্লাই দাও অথবা ছবির লিংক দাও! 😘",
            wait: "𝐑𝐞𝐦𝐢𝐧𝐢 𝐢𝐦𝐚𝐠𝐞𝐬 𝐥𝐨𝐚𝐝𝐢𝐧𝐠...𝐰𝐚𝐢𝐭 𝐛𝐚𝐛𝐲 😘",
            success: "✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐑𝐞𝐦𝐢𝐧𝐢 𝐢𝐦𝐚𝐠𝐞 𝐛𝐚𝐛𝐲",
            error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।"
        },
        en: {
            noImage: "• Baby, please reply to an image or provide a link! 😘",
            wait: "𝐑𝐞𝐦𝐢𝐧𝐢 𝐢𝐦𝐚𝐠𝐞𝐬 𝐥𝐨𝐚𝐝𝐢𝐧𝐠...𝐰𝐚𝐢𝐭 𝐛𝐚𝐛𝐲 😘",
            success: "✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐑𝐞𝐦𝐢𝐧𝐢 𝐢𝐦𝐚𝐠𝐞 𝐛𝐚𝐛𝐲",
            error: "× API error: %1. "
        },
        vi: {
            noImage: "• Cưng ơi, hãy phản hồi một bức ảnh hoặc gửi link! 😘",
            wait: "𝐑𝐞𝐦𝐢𝐧𝐢 𝐢𝐦𝐚𝐠𝐞𝐬 𝐥𝐨𝐚𝐝𝐢𝐧𝐠...𝐰𝐚𝐢𝐭 𝐛𝐚𝐛𝐲 😘",
            success: "✅ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐑𝐞𝐦𝐢𝐧𝐢 𝐢𝐦𝐚𝐠𝐞 𝐛𝐚𝐛𝐲",
            error: "× Lỗi: %1. Liên hệ MahMUD để được hỗ trợ."
        }
    },

    onStart: async function ({ api, message, args, event, getLang }) {
        const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
        if (this.config.author !== authorName) {
            return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
        }

        const senderID = event.senderID;
        const threadID = event.threadID;
        const messageID = event.messageID;

        // VIP Checker
        let activeVIP;
        try {
            activeVIP = await VIP.findOne({ uid: senderID, expiry: { $gt: Date.now() } });
        } catch (e) {
            api.sendMessage(`Database error: ${e.message}`, threadID, messageID);
            api.setMessageReaction("❌", messageID, () => {}, true);
            return;
        }

        if (!activeVIP) {
            api.sendMessage("❌ This command is only for VIP users! Type '/vip buy' to get VIP.", threadID, messageID);
            api.setMessageReaction("❌", messageID, () => {}, true);
            return;
        }

        let imgUrl;
        if (event.messageReply?.attachments?.[0]?.type === "photo") {
            imgUrl = event.messageReply.attachments[0].url;
        } else if (args[0]) {
            imgUrl = args.join(" ");
        }

        if (!imgUrl) return api.sendMessage(getLang("noImage"), threadID, messageID);

        const waitMsg = await api.sendMessage(getLang("wait"), threadID, messageID);
        api.setMessageReaction("⏳", messageID, () => {}, true);

        try {
            const baseUrl = await mahmud();
            const apiUrl = `${baseUrl}/api/hd/mahmud?imgUrl=${encodeURIComponent(imgUrl)}`;
            
            const res = await axios.get(apiUrl, { responseType: "stream" });

            if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
            api.setMessageReaction("✅", messageID, () => {}, true);

            return api.sendMessage({
                body: getLang("success"),
                attachment: res.data
            }, threadID, messageID);

        } catch (err) {
            console.error("Error in remini command:", err);
            if (waitMsg?.messageID) api.unsendMessage(waitMsg.messageID);
            api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage(getLang("error", err.message), threadID, messageID);
        }
    }
};