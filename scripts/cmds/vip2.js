const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const vipSchema = new Schema({
  uid: String,
  name: String,
  expiry: Number,
  lastRewardDate: { type: String, default: "" }
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

function getRemainingTime(expiry) {
  const now = Date.now();
  const diff = expiry - now;
  if (diff <= 0) return toQuizFont("𝐄𝐱𝐩𝐢𝐫𝐞𝐝");
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return toQuizFont(`${days} 𝐝𝐚𝐲(𝐬) ${hours} 𝐡𝐨𝐮𝐫(𝐬)`);
}

module.exports = {
  config: {
    name: "vip",
    version: "5.2",
    author: "Bokkor x69",
    countDown: 5,
    role: 0,
    shortDescription: { en: toQuizFont("Manage VIP users & membership") },
    longDescription: { en: toQuizFont("Add, remove, list, info, buy VIP plans") },
    category: toQuizFont("OWNER"),
    guide: {
      en: toQuizFont("{pn} add <days> [mention/reply/uid]\n{pn} remove [mention/reply]\n{pn} list\n{pn} info \n{pn} buy <days>\n{pn} cmd")
    }
  },

  onStart: async function ({ event, args, message, usersData }) {
    const senderID = event.senderID;
    const mentionID = Object.keys(event.mentions || {})[0];
    const replyID = event.messageReply?.senderID;
    const cmd = args[0]?.toLowerCase();

    if (!global.GoatBot) global.GoatBot = {};
    if (!global.GoatBot.botGlobalData) global.GoatBot.botGlobalData = {};
    const botGlobalData = global.GoatBot.botGlobalData;

    const now = Date.now();
    if (!cmd) return message.reply(toQuizFont("❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐮𝐬𝐚𝐠𝐞. 𝐔𝐬𝐞: 𝐯𝐢𝐩 𝐚𝐝𝐝/𝐫𝐞𝐦𝐨𝐯𝐞/𝐥𝐢𝐬𝐭/𝐢𝐧𝐟𝐨/𝐛𝐮𝐲/𝐜𝐦𝐝"));

    await VIP.deleteMany({ expiry: { $lte: now } });

    // === ADD ===
    if (cmd === "add") {
      if (!["61558455297317", "61577187920090"].includes(senderID))
        return message.reply(toQuizFont("❌ 𝐎𝐧𝐥𝐲 𝐁𝐨𝐤𝐤𝐨𝐫 𝐱𝟔𝟗 𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐞 '𝐚𝐝𝐝' 𝐜𝐨𝐦𝐦𝐚𝐧𝐝."));
      
      const days = parseInt(args[1]);
      if (isNaN(days) || days <= 0)
        return message.reply(toQuizFont("❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐧𝐮𝐦𝐛𝐞𝐫 𝐨𝐟 𝐝𝐚𝐲𝐬.\n𝐄𝐱𝐚𝐦𝐩𝐥𝐞: 𝐯𝐢𝐩 𝐚𝐝𝐝 𝟕 @𝐮𝐬𝐞𝐫"));

      const uid = mentionID || replyID || args[2];
      if (!uid) return message.reply(toQuizFont("❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐦𝐞𝐧𝐭𝐢𝐨𝐧, 𝐫𝐞𝐩𝐥𝐲, 𝐨𝐫 𝐠𝐢𝐯𝐞 𝐮𝐬𝐞𝐫 𝐈𝐃 𝐭𝐨 𝐚𝐝𝐝."));

      const ms = days * 24 * 60 * 60 * 1000;
      let currentExpiry = (botGlobalData[uid] && botGlobalData[uid].expiry > now) ? botGlobalData[uid].expiry : now;
      let newExpiry = currentExpiry + ms;

      const name = (await usersData.getName(uid)) || "𝐔𝐧𝐤𝐧𝐨𝐰𝐧";

      await VIP.findOneAndDelete({ uid });
      await new VIP({ uid, name, expiry: newExpiry }).save();
      botGlobalData[uid] = { name, expiry: newExpiry };

      return message.reply(toQuizFont(`✅ 𝐕𝐈𝐏 𝐚𝐝𝐝𝐞𝐝 𝐟𝐨𝐫 ${days} 𝐝𝐚𝐲(𝐬) 𝐭𝐨 ${name} (${uid})`));
    }

    // === REMOVE ===
    else if (cmd === "remove") {
      if (!["61558455297317", "61577187920090"].includes(senderID))
        return message.reply(toQuizFont("❌ 𝐎𝐧𝐥𝐲 𝐁𝐨𝐤𝐤𝐨𝐫 𝐱𝟔𝟗 𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐞 '𝐫𝐞𝐦𝐨𝐯𝐞' 𝐜𝐨𝐦𝐦𝐚𝐧𝐝."));
      
      const uid = mentionID || replyID;
      if (!uid) return message.reply(toQuizFont("❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐦𝐞𝐧𝐭𝐢𝐨𝐧 𝐨𝐫 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚 𝐮𝐬𝐞𝐫 𝐭𝐨 𝐫𝐞𝐦𝐨𝐯𝐞 𝐟𝐫𝐨𝐦 𝐕𝐈𝐏."));

      const removed = await VIP.findOneAndDelete({ uid });
      if (!removed) return message.reply(toQuizFont("⚠️ 𝐓𝐡𝐢𝐬 𝐮𝐬𝐞𝐫 𝐢𝐬 𝐧𝐨𝐭 𝐚 𝐕𝐈𝐏."));
      delete botGlobalData[uid];

      return message.reply(toQuizFont(`✅ ${removed.name} 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐫𝐞𝐦𝐨𝐯𝐞𝐝 𝐟𝐫𝐨𝐦 𝐕𝐈𝐏.`));
    }

    // === INFO ===
    else if (cmd === "info") {
      const targetID = mentionID || replyID || senderID;
      const vipUser = await VIP.findOne({ uid: targetID, expiry: { $gt: now } });

      if (!vipUser) {
        return message.reply(toQuizFont("⚠️ 𝐓𝐡𝐢𝐬 𝐮𝐬𝐞𝐫 𝐝𝐨𝐞𝐬 𝐧𝐨𝐭 𝐡𝐚𝐯𝐞 𝐚𝐧 𝐚𝐜𝐭𝐢𝐯𝐞 𝐕𝐈𝐏 𝐦𝐞𝐦𝐛𝐞𝐫𝐬𝐡𝐢𝐩."));
      }

      const timeLeft = getRemainingTime(vipUser.expiry);
      return message.reply(toQuizFont(
        `👑 𝐕𝐈𝐏 𝐏𝐫𝐨𝐟𝐢𝐥𝐞 𝐃𝐞𝐭𝐚𝐢𝐥𝐬:\n\n` +
        `👑 𝐁𝐚𝐝𝐠𝐞: 𝐕𝐈𝐏 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐔𝐬𝐞𝐫\n` +
        `🐤 𝐍𝐚𝐦𝐞: ${vipUser.name}\n` +
        `🔗 𝐈𝐃: ${vipUser.uid}\n` +
        `⏳ 𝐓𝐢𝐦𝐞 𝐑𝐞𝐦𝐚𝐢𝐧𝐢𝐧𝐠: ${timeLeft}\n` +
        `─────────────────────`
      ));
    }

    
    // === LIST ===
    else if (cmd === "list") {
      const vipData = await VIP.find({ expiry: { $gt: now } });
      if (vipData.length === 0) return message.reply(toQuizFont("⚠️ 𝐍𝐨 𝐕𝐈𝐏 𝐮𝐬𝐞𝐫𝐬 𝐟𝐨𝐮𝐧𝐝."));

      const list = vipData.map(v => {
        const timeLeft = getRemainingTime(v.expiry);
        return `👑 𝐍𝐚𝐦𝐞: ${v.name}\n🔗 𝐈𝐃: ${v.uid}\n⏳ 𝐑𝐞𝐦𝐚𝐢𝐧𝐢𝐧𝐠: ${timeLeft}\n─────────────────────`;
      }).join("\n");

      return message.reply(toQuizFont(`👑 𝐕𝐈𝐏 𝐔𝐬𝐞𝐫𝐬 𝐁𝐫𝐨𝐚𝐝𝐜𝐚𝐬𝐭 𝐋𝐢𝐬𝐭:\n📊 𝐓𝐨𝐭𝐚𝐥 𝐀𝐜𝐭𝐢𝐯𝐞 𝐕𝐈𝐏𝐬: ${vipData.length}\n\n${list}`));
    }

    // === BUY ===
    else if (cmd === "buy") {
      const days = parseInt(args[1]);
      const validPlans = {
        1: 50000,
        3: 200000,
        5: 500000,
        10: 1000000,
        15: 3000000,
        30: 10000000,
        60: 20000000
      };

      if (!validPlans[days]) {
        return message.reply(toQuizFont(
          `𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐕𝐈𝐏 𝐩𝐥𝐚𝐧!\n\n` +
          `𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐩𝐥𝐚𝐧𝐬:\n` +
          `𝟏 𝐝𝐚𝐲 → 𝟓𝟎𝐤\n` +
          `𝟑 𝐝𝐚𝐲𝐬 → 𝟐𝟎𝟎𝐤\n` +
          `𝟓 𝐝𝐚𝐲𝐬 → 𝟓𝟎𝟎𝐤\n` +
          `𝟏𝟎 𝐝𝐚𝐲𝐬 → 𝟏𝐌\n` +
          `𝟏𝟓 𝐝𝐚𝐲𝐬 → 𝟑𝐌\n` +
          `𝟑𝟎 𝐝𝐚𝐲𝐬 → 𝟏𝟎𝐌\n` +
          `𝟔𝟎 𝐝𝐚𝐲𝐬 → 𝟐𝟎𝐌\n\n` +
          `𝐔𝐬𝐚𝐠𝐞: /𝐯𝐢𝐩 𝐛𝐮𝐲 <𝐝𝐚𝐲𝐬>`
        ));
      }

      const totalCost = validPlans[days];
      let userDataInfo = await usersData.get(senderID);
      let userMoney = userDataInfo?.money || 0;

      if (userMoney < totalCost) {
        let displayCost = totalCost >= 1000000 ? `${totalCost / 1000000}𝐌` : `${totalCost / 1000}𝐤`;
        let displayMoney = userMoney >= 1000000 ? `${(userMoney / 1000000).toFixed(1)}𝐌` : `${Math.floor(userMoney / 1000)}𝐤`;
        return message.reply(toQuizFont(`❌ 𝐘𝐨𝐮 𝐝𝐨 𝐧𝐨𝐭 𝐡𝐚𝐯𝐞 𝐞𝐧𝐨𝐮𝐠𝐡 𝐦𝐨𝐧𝐞𝐲! 𝐘𝐨𝐮 𝐧𝐞𝐞𝐝 ${displayCost} 𝐟𝐨𝐫 ${days} 𝐝𝐚𝐲𝐬 𝐨𝐟 𝐕𝐈𝐏, 𝐛𝐮𝐭 𝐲𝐨𝐮 𝐡𝐚𝐯𝐞 ${displayMoney}.`));
      }

      await usersData.set(senderID, { money: userMoney - totalCost });

      const ms = days * 24 * 60 * 60 * 1000;
      let currentExpiry = (botGlobalData[senderID] && botGlobalData[senderID].expiry > now) ? botGlobalData[senderID].expiry : now;
      let newExpiry = currentExpiry + ms;
      let name = (await usersData.getName(senderID)) || "𝐔𝐧𝐤𝐧𝐨𝐰𝐧";

      await VIP.findOneAndDelete({ uid: senderID });
      await new VIP({ uid: senderID, name, expiry: newExpiry }).save();
      botGlobalData[senderID] = { name, expiry: newExpiry };

      return message.reply(toQuizFont(`👑 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐛𝐨𝐮𝐠𝐡𝐭 ${days} 𝐝𝐚𝐲𝐬 𝐨𝐟 𝐕𝐈𝐏 𝐦𝐞𝐦𝐛𝐞𝐫𝐬𝐡𝐢𝐩 𝐰𝐢𝐭𝐡 𝐂𝐮𝐬𝐭𝐨𝐦 𝐁𝐚𝐝𝐠𝐞 𝐮𝐧𝐥𝐨𝐜𝐤𝐞𝐝!`));
    }

    // === CMD ===
    else if (cmd === "cmd") {
      return message.reply(toQuizFont(
        "👑 𝐕𝐈𝐏 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬:\n\n" +
        "𝟏. 𝐁𝐨𝐨𝐦𝐛𝐞𝐫\n" +
        "2. 𝐄𝐝𝐢𝐭\n" +
        "3. 𝐑𝐞𝐦𝐢𝐧𝐢\n" +
        "4. 𝐓𝐢𝐤𝐬𝐭𝐚𝐥𝐤\n" +
        "5. 𝐅𝐟𝐢𝐧𝐟𝐨\n\n" +
        "🐤 𝐓𝐨 𝐛𝐮𝐲 𝐕𝐈𝐏: 𝐔𝐬𝐞 '/𝐯𝐢𝐩 𝐛𝐮𝐲 <𝐝𝐚𝐲𝐬>'\n" +
        "🐤 𝐓𝐨 𝐜𝐡𝐞𝐜𝐤 𝐕𝐈𝐏: 𝐔𝐬𝐞 '/𝐯𝐢𝐩 𝐢𝐧𝐟𝐨'" 
      ));
    }

    // === UNKNOWN ===
    else {
      return message.reply(toQuizFont("❌ 𝐔𝐧𝐤𝐧𝐨𝐰𝐧 𝐬𝐮𝐛𝐜𝐨𝐦𝐦𝐚𝐧𝐝. 𝐔𝐬𝐞: 𝐯𝐢𝐩 𝐚𝐝𝐝/𝐫𝐞𝐦𝐨𝐯𝐞/𝐥𝐢𝐬𝐭/𝐢𝐧𝐟𝐨/𝐛𝐮𝐲/𝐜𝐦𝐝"));
    }
  }
};