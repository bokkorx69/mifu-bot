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
    name: "slot",
    version: "2.2",
    author: "Bokkor x69",
    countDown: 0,
    role: 0,
    category: "GAME",
    guide: "{pn} [amount] | {pn} reset | {pn} info",
  },
  langs: {
    en: {
      invalid_amount: "❌ 𝙋𝙡𝙚𝙖𝙨𝙚 𝙚𝙣𝙩𝙚𝙧 𝙖 𝙫𝙖𝙡𝙞𝙙 𝙖𝙣𝙙 𝙥𝙤𝙨𝙞𝙩𝙞𝙫𝙚 𝙖𝙢𝙤𝙪𝙣𝙩 𝙩𝙤 𝙝𝙖𝙫𝙚 𝙖 𝙘𝙝𝙖𝙣𝙘𝙚 𝙩𝙤 𝙬𝙞𝙣 𝙙𝙤𝙪𝙗𝙡𝙚",
      not_enough_money: "❌ 𝘾𝙝𝙚𝙘𝙠 𝙮𝙤𝙪𝙧 𝙗𝙖𝙡𝙖𝙣𝙘𝙚 𝙞𝙛 𝙮𝙤𝙪 𝙝𝙖𝙫𝙚 𝙩𝙝𝙖𝙩 𝙖𝙢𝙤𝙪𝙣𝙩",
      spin_message: "Spinning...",
      win_message: "• 𝘽𝙖𝙗𝙮, 𝙔𝙤𝙪 𝙬𝙤𝙣 $%1",
      lose_message: "• 𝘽𝙖𝙗𝙮, 𝙔𝙤𝙪 𝙡𝙤𝙨𝙩 $%1",
      spin_count: ">🎀",
      wrong_use_message: "❌ | 𝙒𝙍𝙊𝙉𝙂 𝙪𝙨𝙚: 𝙋𝙡𝙚𝙖𝙨𝙚 𝙚𝙣𝙩𝙚𝙧 𝙖 𝙫𝙖𝙡𝙞𝙙 𝙖𝙣𝙙 𝙥𝙤𝙨𝙞𝙩𝙞𝙫𝙚 𝙣𝙪𝙢𝙗𝙚𝙧 𝙖𝙨 𝙮𝙤𝙪𝙧 𝙗𝙚𝙩 𝙖𝙢𝙤𝙪𝙣𝙩 (e.g. 1k, 1m, 10000).",
      limit_message: "🚫 | 𝙔𝙤𝙪 𝙝𝙖𝙫𝙚 𝙧𝙚𝙖𝙘𝙝𝙚𝙙 𝙩𝙝𝙚 𝙡𝙞𝙢𝙞𝙩 𝙤𝙛 𝙥𝙡𝙖𝙮𝙞𝙣𝙜 15 𝙨𝙡𝙤𝙩 𝙜𝙖𝙢𝙚𝙨 𝙩𝙤𝙙𝙖𝙮, 𝙗𝙖𝙗𝙮! 𝘾𝙤𝙢𝙚 𝙗𝙖𝙘𝙠 𝙩𝙤𝙢𝙤𝙧𝙧𝙤𝙬.",
    },
  },
  onStart: async function ({ args, message, event, usersData, getLang, api }) {
    const { senderID } = event;
    const today = getTodayDate();
    const action = args[0]?.toLowerCase();

    // Admin reset command handler
    if (action === "reset") {
      const adminIDs = ["61558455297317", ...(global.config?.ADMINBOT || []), ...(global.config?.ownerBot || [])];
      
      if (!adminIDs.includes(senderID)) {
        return api.sendMessage("❌ | 𝗢𝗻𝐥𝐲 𝐨𝐰𝐧𝐞𝐫 𝐜𝐚𝐧 𝐫𝐞𝐬𝐞𝐭 𝐭𝐡𝐞 𝐬𝐥𝐨𝐭 𝐥𝐢𝐦𝐢𝐭, 𝐛𝐚𝐛𝐲!", event.threadID, event.messageID);
      }

      let targetID = senderID;
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
        targetUserData.data.slots = targetUserData.data.slots || {};
        targetUserData.data.slots.count = 0;
        targetUserData.data.slots.todayWins = 0;
        targetUserData.data.slots.todayLosses = 0;
        targetUserData.data.slots.date = today;
        await usersData.set(targetID, { data: targetUserData.data });

        return api.sendMessage(`✅ | 𝙂𝙖𝙢𝙚 𝙡𝙞𝙢𝙞𝙩 𝙝𝙖𝙨 𝙗𝙚𝙚𝙣 𝙧𝙚𝙨𝙚𝙩 𝙩𝙤 𝟎 𝙛𝙤𝙧 ${targetName} ✨`, event.threadID, event.messageID);
      } else {
        return api.sendMessage("❌ | 𝐍𝐨 𝐚𝐜𝐭𝐢𝐯𝐞 𝐥𝐢𝐦𝐢𝐭 𝐝𝐚𝐭𝐚 𝐟𝐨𝐮𝐧𝐝 𝐟𝐨𝐫 𝐭𝐡𝐢𝐬 𝐮𝐬𝐞𝐫 𝐭𝐨𝐝𝐚𝐲.", event.threadID, event.messageID);
      }
    }

    // User info / stats command handler
    if (action === "info" || action === "stats") {
      let targetID = senderID;
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
      let slotInfo = targetUserData?.data?.slots || { count: 0, wins: 0, totalPlayed: 0, todayWins: 0, todayLosses: 0, date: today };

      const isTodayData = slotInfo.date === today;
      const todayPlayed = isTodayData ? slotInfo.count : 0;
      const leftToday = 15 - todayPlayed;
      const todayWins = isTodayData ? (slotInfo.todayWins || 0) : 0;
      const todayLosses = isTodayData ? (slotInfo.todayLosses || 0) : 0;

      const totalPlayed = slotInfo.totalPlayed || 0;
      const totalWins = slotInfo.wins || 0;
      const totalLosses = totalPlayed - totalWins;
      const winRate = totalPlayed > 0 ? ((totalWins / totalPlayed) * 100).toFixed(1) : 0;

      const infoMsg = `📊 𝙎𝙇𝙊𝙏 𝙎𝙏𝘼𝙏𝙄𝙎𝙏𝙄𝘾𝙎 𝙄𝙉𝙁𝙊\n` +
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

    const userData = await usersData.get(senderID);

    if (!userData.data) {
      userData.data = {};
    }

    if (!userData.data.slots || userData.data.slots.date !== today) {
      userData.data.slots = { 
        count: 0, 
        wins: userData.data.slots?.wins || 0, 
        totalPlayed: userData.data.slots?.totalPlayed || 0, 
        todayWins: 0, 
        todayLosses: 0, 
        date: today 
      };
    }

    if (userData.data.slots.count >= 15) {
      return api.sendMessage(getLang("limit_message"), event.threadID, event.messageID);
    }

    const amount = parseAmount(args[0]);
    if (isNaN(amount) || amount <= 0) {
      return api.sendMessage(getLang("wrong_use_message"), event.threadID, event.messageID);
    }
    if (userData.money < amount) {
      return api.sendMessage(getLang("not_enough_money"), event.threadID, event.messageID);
    }

    userData.data.slots.count += 1;
    userData.data.slots.totalPlayed = (userData.data.slots.totalPlayed || 0) + 1;

    const slots = ["❤", "💜", "🖤", "🤍", "🤎", "💙", "💚", "💛"];
    let slot1, slot2, slot3, winnings;

    const probability = Math.random();
    if (probability < 0.3) { 
      slot1 = slot2 = slot3 = slots[Math.floor(Math.random() * slots.length)];
      winnings = amount * 2;
      userData.data.slots.wins = (userData.data.slots.wins || 0) + 1;
      userData.data.slots.todayWins = (userData.data.slots.todayWins || 0) + 1;
    } else {
      slot1 = slots[Math.floor(Math.random() * slots.length)];
      slot2 = slots[Math.floor(Math.random() * slots.length)];
      slot3 = slots[Math.floor(Math.random() * slots.length)];
      winnings = -amount;
      userData.data.slots.todayLosses = (userData.data.slots.todayLosses || 0) + 1;
    }

    const netProfit = winnings > 0 ? winnings : -amount;
    const finalMoney = userData.money + netProfit;

    await usersData.set(senderID, { money: finalMoney, data: userData.data });
    
    const messageText = getSpinResultMessage(slot1, slot2, slot3, winnings, getLang);
    const leftToday = 15 - userData.data.slots.count;
    
    return message.reply(`${getLang("spin_count")}\n${messageText}\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: ${leftToday}`);
  },
};

function getSpinResultMessage(slot1, slot2, slot3, winnings, getLang) {
  if (winnings > 0) {
    return getLang("win_message", formatMoney(winnings)) + `\n• 𝙂𝙖𝙢𝙚 𝙍𝙚𝙨𝙪𝙡𝙩𝙨 \n [ ${slot1} | ${slot2} | ${slot3} ]`;
  } else {
    return getLang("lose_message", formatMoney(-winnings)) + `\n• 𝙂𝙖𝙢𝙚 𝙍𝙚𝙨𝙪𝙡𝙩𝙨 \n [ ${slot1} | ${slot2} | ${slot3} ]`;
  }
}

function formatMoney(num) {
  const units = ["", "𝙆", "𝙈", "𝘽", "𝙏", "𝙌"];
  let unit = 0;
  while (num >= 1000 && unit < units.length - 1) {
    num /= 1000;
    unit++;
  }
  return Number(num.toFixed(1)) + units[unit];
}