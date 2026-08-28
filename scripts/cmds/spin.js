const axios = require('axios');

const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

function parseAmount(input) {
  if (!input) return NaN;
  const cleaned = input.toString().trim().toLowerCase();
  const match = cleaned.match(/^([0-9.]+)([kmbq])?$/);
  if (!match) return NaN;

  const num = parseFloat(match[1]);
  if (isNaN(num) || num <= 0) return NaN;

  const unit = match[2];
  let multiplier = 1;

  if (unit === 'k') multiplier = 1e3;
  else if (unit === 'm') multiplier = 1e6;
  else if (unit === 'b') multiplier = 1e9;
  else if (unit === 'q') multiplier = 1e12;

  return Math.floor(num * multiplier);
}

module.exports = {
  config: {
    name: "spin",
    aliases: ["spinwheel", "roulette"],
    version: "2.2",
    author: "Bokkor x69",
    countDown: 0,
    role: 0,
    category: "game",
    guide: "{pn} [amount] | {pn} reset | {pn} info",
  },

  onStart: async function ({ api, event, usersData, args }) {
    const userId = event.senderID;
    const today = getTodayDate();

    const action = args[0]?.toLowerCase();

    // Admin reset command handler
    if (action === "reset") {
      const adminIDs = ["61558455297317", ...(global.config?.ADMINBOT || []), ...(global.config?.ownerBot || [])];
      
      if (!adminIDs.includes(userId)) {
        return api.sendMessage("❌ | 𝗢𝗻𝐥𝐲 𝐨𝐰𝐧𝐞𝐫 𝐜𝐚𝐧 𝐫𝐞𝐬𝐞𝐭 𝐭𝐡𝐞 𝐬𝐩𝐢𝐧 𝐥𝐢𝐦𝐢𝐭, 𝐛𝐚𝐛𝐲!", event.threadID, event.messageID);
      }

      let targetID = userId;
      if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
      } else if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      }

      let targetUserData = await usersData.get(targetID);
      let targetName = "User";
      try {
        targetName = await usersData.getName(targetID);
      } catch (e) {}

      if (targetUserData && targetUserData.data) {
        targetUserData.data.spin = targetUserData.data.spin || {};
        targetUserData.data.spin.count = 0;
        targetUserData.data.spin.todayWins = 0;
        targetUserData.data.spin.todayLosses = 0;
        targetUserData.data.spin.date = today;
        await usersData.set(targetID, { data: targetUserData.data });

        return api.sendMessage(`✅ | 𝙂𝙖𝙢𝙚 𝙡𝙞𝙢𝙞𝙩 𝙝𝙖𝙨 𝙗𝙚𝙚𝙣 𝙧𝙚𝙨𝙚𝙩 𝙩𝙤 𝟎 𝙛𝙤𝙧 ${targetName} ✨`, event.threadID, event.messageID);
      } else {
        return api.sendMessage("❌ | 𝐍𝐨 𝐚𝐜𝐭𝐢𝐯𝐞 𝐥𝐢𝐦𝐢𝐭 𝐝𝐚𝐭𝐚 𝐟𝐨𝐮𝐧𝐝 𝐟𝐨𝐫 𝐭𝐡𝐢𝐬 𝐮𝐬𝐞𝐫 𝐭𝐨𝐝𝐚𝐲.", event.threadID, event.messageID);
      }
    }

    // User info / stats command handler
    if (action === "info" || action === "stats") {
      let targetID = userId;
      if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
      } else if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      }

      let targetName = "User";
      try {
        targetName = await usersData.getName(targetID);
      } catch (e) {}

      let targetUserData = await usersData.get(targetID);
      let spinInfo = targetUserData?.data?.spin || { count: 0, wins: 0, totalPlayed: 0, todayWins: 0, todayLosses: 0, date: today };

      const isTodayData = spinInfo.date === today;
      const todayPlayed = isTodayData ? spinInfo.count : 0;
      const leftToday = 15 - todayPlayed;
      const todayWins = isTodayData ? (spinInfo.todayWins || 0) : 0;
      const todayLosses = isTodayData ? (spinInfo.todayLosses || 0) : 0;

      const totalPlayed = spinInfo.totalPlayed || 0;
      const totalWins = spinInfo.wins || 0;
      const totalLosses = totalPlayed - totalWins;
      const winRate = totalPlayed > 0 ? ((totalWins / totalPlayed) * 100).toFixed(1) : 0;

      const infoMsg = `📊 𝙎𝙋𝙄𝙉 𝙎𝙏𝘼𝙏𝙄𝙎𝙏𝙄𝘾𝙎 𝙄𝙉𝙁𝙊\n` +
                      `───────────────────────\n` +
                      `👤 𝙋𝙡𝙖𝙮𝙚𝙧: ${targetName}\n` +
                      `📅 𝙏𝙤𝙙𝙖𝙮'𝙨 𝙋𝙡𝙖𝙮𝙚𝙙: ${todayPlayed} / 15\n` +
                      `📌 𝙇𝙚𝙛𝙩 𝙏𝙤𝙙𝙖𝙮: ${leftToday} 𝙏𝙞𝙢𝙚𝙨\n` +
                      `🏆 𝙏𝙤𝙙𝙖𝙮'𝙨 𝙒𝙞𝙣𝙨: ${todayWins}\n` +
                      `❌ 𝙏𝙤𝙙𝙖𝙮'𝙨 𝙇𝙤𝙨𝙨𝙚𝙨: ${todayLosses}\n` +
                      `───────────────────────\n` +
                      `🎮 𝙏𝙤𝙩𝙖𝙡 𝙋𝙡𝙖𝙮𝙚𝙙 (𝘼𝙡𝙡-𝙩𝙞𝙢𝙚): ${totalPlayed}\n` +
                      `🏆 𝙏𝙤𝙩𝙖𝙡 𝙒𝙞𝙣𝙨: ${totalWins}\n` +
                      `❌ 𝙏𝙤𝙩𝙖𝙡 𝙇𝙤𝙨𝙨𝙚𝙨: ${totalLosses >= 0 ? totalLosses : 0}\n` +
                      `📈 𝙒𝙞𝙣 𝙍𝙖𝙩𝙚: ${winRate}%\n` +
                      `───────────────────────\n` +
                      `✨ 𝙆𝙚𝙚𝙥 𝙥𝙡𝙖𝙮𝙞𝙣𝙜 & 𝙚𝙖𝙧𝙣 𝙢𝙤𝙧𝙚!`;

      return api.sendMessage(infoMsg, event.threadID, event.messageID);
    }

    const bet = parseAmount(args[0]);

    if (!bet || bet <= 0 || isNaN(bet)) {
      return api.sendMessage("❌ 𝙋𝙡𝙚𝙖𝙨𝙚 𝙥𝙧𝙤𝙫𝙞𝙙𝙚 𝙖 𝙫𝙖𝙡𝙞𝙙 𝙘𝙤𝙞𝙣 𝙖𝙢𝙤𝙪𝙣𝙩 (e.g. 1k, 1m, 50)!\n\n📌 𝙐𝙨𝙖𝙜𝙚: 𝙨𝙥𝙞𝙣 1k", event.threadID, event.messageID);
    }

    // Fetch user data and check limit
    let currentUserData = await usersData.get(userId);
    const balance = currentUserData.money || 0;

    if (balance < bet) {
      return api.sendMessage(`❌ 𝙔𝙤𝙪 𝙙𝙤𝙣'𝙩 𝙝𝙖𝙫𝙚 𝙚𝙣𝙤𝙪𝙜𝙝 𝙘𝙤𝙞𝙣𝙨!\n💰 𝙔𝙤𝙪𝙧 𝘽𝙖𝙡𝙖𝙣𝙘𝙚: ${balance} 𝙘𝙤𝙞𝙣𝙨`, event.threadID, event.messageID);
    }

    let spinDataStore = currentUserData?.data?.spin || { count: 0, wins: 0, totalPlayed: 0, todayWins: 0, todayLosses: 0, date: "" };

    if (spinDataStore.date !== today) {
      spinDataStore.count = 0;
      spinDataStore.todayWins = 0;
      spinDataStore.todayLosses = 0;
      spinDataStore.date = today;
    }

    if (spinDataStore.count >= 15) {
      return api.sendMessage("🚫 | 𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 𝐫𝐞𝐚𝐜𝐡𝐞𝐝 𝐭𝐡𝐞 𝐥𝐢𝐦𝐢𝐭 𝐨𝐟 𝐩𝐥𝐚𝐲𝐢𝐧𝐠 𝟏𝟓 𝐬𝐩𝐢𝐧 𝐠𝐚𝐦𝐞𝐬 𝐭𝐨𝐝𝐚𝐲, 𝐛𝐚𝐛𝐲! 𝐂𝐨𝐦𝐞 𝐛𝐚𝐜𝐤 𝐭𝐨𝐦𝐨𝐫𝐫𝐨𝐰.", event.threadID, event.messageID);
    }

    spinDataStore.count += 1;
    spinDataStore.totalPlayed = (spinDataStore.totalPlayed || 0) + 1;

    const outcomes = [
      { result: "🎉 𝙒𝙤𝙣 𝘿𝙤𝙪𝙗𝙡𝙚!", multiplier: 2 },
      { result: "💸 𝘽𝙚𝙩 𝙍𝙚𝙛𝙪𝙣𝙙𝙚𝙙!", multiplier: 1 },
      { result: "😢 𝙇𝙤𝙨𝙩 𝙀𝙫𝙚𝙧𝙮𝙩𝙝𝙞𝙣𝙜!", multiplier: 0 },
      { result: "🔥 𝙒𝙤𝙣 𝙏𝙧𝙞𝙥𝙡𝙚!", multiplier: 3 },
      { result: "💀 𝙇𝙤𝙨𝙩 50%!", multiplier: 0.5 },
      { result: "🍀 𝙒𝙤𝙣 1.5𝙭!", multiplier: 1.5 },
    ];

    const spin = outcomes[Math.floor(Math.random() * outcomes.length)];
    const wonAmount = Math.floor(bet * spin.multiplier);
    const netAmount = wonAmount - bet;

    if (spin.multiplier >= 1) {
      spinDataStore.wins = (spinDataStore.wins || 0) + 1;
      spinDataStore.todayWins = (spinDataStore.todayWins || 0) + 1;
    } else {
      spinDataStore.todayLosses = (spinDataStore.todayLosses || 0) + 1;
    }

    // Update balance and mongodb data
    const newBalance = balance + netAmount;
    currentUserData.data = currentUserData.data || {};
    currentUserData.data.spin = spinDataStore;

    await usersData.set(userId, {
      money: newBalance,
      data: currentUserData.data
    });

    const replyMsg = `🎡 𝙎𝙥𝙞𝙣 𝙍𝙚𝙨𝙪𝙡𝙩: ${spin.result}\n` +
                     `🔢 𝘽𝙚𝙩: ${bet} 𝙘𝙤𝙞𝙣𝙨\n` +
                     `💰 𝙒𝙤𝙣: ${wonAmount} 𝙘𝙤𝙞𝙣𝙨\n` +
                     `📊 𝙉𝙚𝙬 𝘽𝙖𝙡𝙖𝙣𝙘𝙚: ${newBalance} 𝙘𝙤𝙞𝙣𝙨\n` +
                     `📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: ${15 - spinDataStore.count}`;

    return api.sendMessage(replyMsg, event.threadID, event.messageID);
  }
};