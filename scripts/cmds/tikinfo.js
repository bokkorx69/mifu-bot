const axios = require('axios');
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
    " ": " ", ".": ".", ",": ",", "!": "!", "?": "?", ":": ":", "-": "-", "\n": "\n", "(": "(", ")": ")", "'": "'"
  };
  return text.split("").map(char => map[char] || char).join("");
}

module.exports = {
  config: {
    name: 'tikstalk',
    aliases: ['stalktik', 'tikinfo', 'tiktok', 'ttinfo'],
    prefix: false,
    author: 'Bokkor x69',
    countDown: 2,
    role: 0,
    description: toQuizFont('Show a TikTok user profile (VIP only)'),
    category: toQuizFont('VIP')
  },

  onStart: async function ({ message, args, event, api }) {
    const senderID = event.senderID;
    const threadID = event.threadID;
    const messageID = event.messageID;

    // VIP Checker
    let activeVIP;
    try {
      activeVIP = await VIP.findOne({ uid: senderID, expiry: { $gt: Date.now() } });
    } catch (e) {
      if (api && api.sendMessage) {
        await api.sendMessage(toQuizFont(`Database error: ${e.message}`), threadID, messageID);
        api.setMessageReaction("❌", messageID, () => {}, true);
      } else {
        await message.reply(toQuizFont(`Database error: ${e.message}`));
      }
      return;
    }

    if (!activeVIP) {
      if (api && api.sendMessage) {
        await api.sendMessage(toQuizFont("❌ This command is only for VIP users! Type '/vip buy' to get VIP."), threadID, messageID);
        api.setMessageReaction("❌", messageID, () => {}, true);
      } else {
        await message.reply(toQuizFont("❌ This command is only for VIP users! Type '/vip buy' to get VIP."));
      }
      return;
    }

    /* 1. Validate input */
    const userName = args.join(' ').trim().replace(/^@/, '');
    if (!userName) {
      return message.reply(toQuizFont('⚠️ Usage: tikstalk <username>'));
    }

    /* 2. Fetch data */
    try {
      const waiting = await message.reply(toQuizFont('💫 Gathering data, please wait…'));

      const url = `https://azadx69x.is-a.dev/api/ttinfo?user=${encodeURIComponent(userName)}`;
      const res = await axios.get(url, { timeout: 15000 });
      
      message.unsend(waiting.messageID); // delete the waiting message

      const resData = res.data;
      if (!resData || !resData.success || !resData.data) {
        return message.reply(toQuizFont('❌ User not found or API error.'));
      }

      /* 3. Destructure the returned data */
      const user = resData.data;
      const stats = user.stats || {};
      const avatar = user.avatar || {};

      const formatNum = (num) => {
        if (typeof num !== 'number') return '0';
        return num.toLocaleString('en-US');
      };

      const cleanBio = user.signature 
        ? user.signature.replace(/\\n/g, '\n').replace(/\[.*?\]/g, '').trim() 
        : 'N/A';

      /* 4. Build the reply – all fields in English matching style */
      const replyText = `
━━━━━━━━━━━━━ TIKTOK USER INFO ━━━━━━━━━
❍ Name: ${user.nickname || 'N/A'}
❍ Username: @${user.unique_id || 'N/A'}
❍ UID: ${user.id || 'N/A'}
❍ Verified: ${user.verified ? 'Yes' : 'No'}
❍ Private Account: ${user.private_account ? 'Yes' : 'No'}
❍ Profile URL: ${user.profile_url || `https://www.tiktok.com/@${user.unique_id}`}

━━━━━━━━━━━━━ STATS INFO ━━━━━━━━━
❍ Followers: ${formatNum(stats.followers)}
❍ Following: ${formatNum(stats.following)}
❍ Hearts: ${formatNum(stats.hearts)}
❍ Videos: ${formatNum(stats.videos)}
❍ Diggs: ${formatNum(stats.diggs)}

━━━━━━━━━━━━━ SOCIAL INFO ━━━━━━━━━
❍ Signature: ${cleanBio}


━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ ALL DATA AUTO‑UPDATED FROM TIKTOK SERVER ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Powered by
━━━━━━━━━━━━ 𝐁ᴏᴋᴋ𝐨𝐫 x69 ━━━━━━━━━
`;

      const avatarUrl = avatar.larger || avatar.medium || avatar.thumb;
      let attachmentStream = null;
      if (avatarUrl && global.utils?.getStreamFromURL) {
        try {
          attachmentStream = await global.utils.getStreamFromURL(avatarUrl);
        } catch (err) {
          console.error("Avatar stream loading failed:", err.message);
        }
      }

      return message.reply({
        body: toQuizFont(replyText),
        ...(attachmentStream && { attachment: attachmentStream })
      });

    } catch (err) {
      console.error(err);
      return message.reply(toQuizFont('❌ Error while retrieving data, try again later.'));
    }
  }
};