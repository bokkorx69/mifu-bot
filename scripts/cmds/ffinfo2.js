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
    name: 'ffinfo',
    prefix: false,
    author: 'Bokkor x69',
    countDown: 2,
    role: 0,
    description: toQuizFont('Show a Free‑Fire player profile (VIP only)'),
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
    if (args.length < 1) {
      return message.reply(toQuizFont('⚠️ Usage: ffinfo <uid>'));
    }

    const uid = args[0];
    if (!/^\d{5,15}$/.test(uid)) {
      return message.reply(toQuizFont('⚠️ Invalid UID. Please provide a valid Free‑Fire UID.'));
    }

    /* 2. Fetch data */
    try {
      const waiting = await message.reply(toQuizFont('💫 Gathering data, please wait…'));

      const url = `https://api.noobs-api.rf.gd/dipto/ff-info?uid=${uid}`;

      const res = await axios.get(url);
      message.unsend(waiting.messageID); 

      const data = res.data;
      if (!data || !data.info) {
        return message.reply(toQuizFont('❌ Player not found or API error.'));
      }

      /* 3. Destructure the returned data */
      const {
        basicInfo,
        captainBasicInfo,
        clanBasicInfo,
        creditScoreInfo,
        diamondCostRes,
        petInfo,
        profileInfo,
        socialInfo
      } = data.info;

      /* 4. Build the reply – all fields in English */
      const replyText = `
━━━━━━━━━━━━━ FREE FIRE PLAYER INFO ━━━━━━━━━
❍ Name: ${basicInfo.nickname}
❍ UID: ${basicInfo.accountId}
❍ Region: ${basicInfo.region}
❍ Level: ${basicInfo.level}
❍ Likes: ${basicInfo.liked}
❍ Rank: ${basicInfo.rank}
❍ Ranking Points: ${basicInfo.rankingPoints}
❍ CS Rank: ${basicInfo.csRank}
❍ CS Ranking Points: ${basicInfo.csRankingPoints}
❍ Max CS Rank: ${basicInfo.csMaxRank}
❍ Max Rank: ${basicInfo.maxRank}
❍ Experience: ${basicInfo.exp}
❍ Season ID: ${basicInfo.seasonId}
❍ Release Version: ${basicInfo.releaseVersion}

━━━━━━━━━━━━━ CAPTAIN INFO ━━━━━━━━━
❍ Captain Name: ${captainBasicInfo.nickname}
❍ Captain UID: ${captainBasicInfo.accountId}
❍ Captain Level: ${captainBasicInfo.level}
❍ Captain Rank: ${captainBasicInfo.rank}
❍ Captain Ranking Points: ${captainBasicInfo.rankingPoints}
❍ Captain CS Rank: ${captainBasicInfo.csRank}
❍ Captain CS Ranking Points: ${captainBasicInfo.csRankingPoints}
❍ Captain Experience: ${captainBasicInfo.exp}

━━━━━━━━━━━━━ CLAN INFO ━━━━━━━━━
❍ Clan Name: ${clanBasicInfo?.clanName ?? 'N/A'}
❍ Clan Level: ${clanBasicInfo?.clanLevel ?? 'N/A'}
❍ Members: ${clanBasicInfo?.memberNum ?? 'N/A'} / ${clanBasicInfo?.capacity ?? 'N/A'}
❍ Clan ID: ${clanBasicInfo?.clanId ?? 'N/A'}
❍ Captain ID: ${clanBasicInfo?.captainId ?? 'N/A'}

━━━━━━━━━━━━━ PET INFO ━━━━━━━━━
❍ Pet Name: ${petInfo?.name ?? 'N/A'}
❍ Pet Level: ${petInfo?.level ?? 'N/A'}
❍ Pet Skill ID: ${petInfo?.selectedSkillId ?? 'N/A'}
❍ Pet Experience: ${petInfo?.exp ?? 'N/A'}
❍ Pet ID: ${petInfo?.id ?? 'N/A'}

━━━━━━━━━━━━━ PROFILE INFO ━━━━━━━━━
❍ Avatar ID: ${profileInfo?.avatarId ?? 'N/A'}
❍ Unlock Type: ${profileInfo?.unlockType ?? 'N/A'}
❍ Unlock Time: ${profileInfo?.unlockTime ?? 'N/A'}
❍ Skin Color: ${profileInfo?.skinColor ?? 'N/A'}
❍ Star Marked: ${profileInfo?.isMarkedStar ? 'Yes' : 'No'}
❍ Selected: ${profileInfo?.isSelected ? 'Yes' : 'No'}
❍ Awakened: ${profileInfo?.isSelectedAwaken ? 'Yes' : 'No'}
❍ Clothes IDs: ${profileInfo?.clothes?.join(', ') ?? 'N/A'}
❍ Skill IDs: ${profileInfo?.equipedSkills?.join(', ') ?? 'N/A'}

━━━━━━━━━━━━━ SOCIAL INFO ━━━━━━━━━
❍ Gender: ${socialInfo?.gender?.replace('Gender_', '') ?? 'N/A'}
❍ Language: ${socialInfo?.language?.replace('Language_', '') ?? 'N/A'}
❍ Signature: ${socialInfo?.signature?.replace(/\[.*?\]/g, '') ?? 'N/A'}
❍ Rank Show: ${socialInfo?.rankShow ?? 'N/A'}

━━━━━━━━━━━━━ CREDIT SCORE ━━━━━━━━━
❍ Score: ${creditScoreInfo?.creditScore ?? 'N/A'}
❍ State: ${creditScoreInfo?.rewardState?.replace('REWARD_STATE_', '') ?? 'N/A'}
❍ End Time: ${creditScoreInfo?.periodicSummaryEndTime ?? 'N/A'}

━━━━━━━━━━━━━ DIAMOND COST ━━━━━━━━━
❍ Diamond Cost: ${diamondCostRes?.diamondCost ?? 'N/A'}


━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ ALL DATA AUTO‑UPDATED FROM FREE FIRE SERVER ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Powered by
━━━━━━━━━━━━ 𝐁ᴏᴋᴋ𝐨𝐫 x69 ━━━━━━━━━
`;

      return message.reply({ body: toQuizFont(replyText) });

    } catch (err) {
      console.error(err);
      return message.reply(toQuizFont('❌ Error while retrieving data, try again later.'));
    }
  }
};