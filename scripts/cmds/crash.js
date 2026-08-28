const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

function parseValue(input) {
  if (!input) return NaN;
  const str = input.toLowerCase().trim();
  let numPart = parseFloat(str);
  
  if (isNaN(numPart)) return NaN;

  if (str.includes('k')) {
    numPart *= 1000;
  } else if (str.includes('m')) {
    numPart *= 1000000;
  } else if (str.includes('b')) {
    numPart *= 1000000000;
  }

  return Math.floor(numPart);
}

module.exports = {
  config: {
    name: "crash",
    version: "9.4",
    author: "Bokkor x69",
    countDown: 0,
    role: 0,
    category: "GAME",
    guide: "{pn} [amount] [multiplier] | {pn} top | {pn} reset | {pn} info",
  },
  langs: {
    en: {
      wrong_use: "❌ | 𝙒𝙍𝙊𝙉𝙂 𝙪𝙨𝙚: 𝙋𝙡𝙚𝙖𝙨𝙚 𝙚𝙣𝙩𝙚𝙧 𝙖 𝙫𝙖𝙡𝙞𝙙 𝙖𝙢𝙤𝙪𝙣𝙩 (e.g., 1k, 1000, 1m) and multiplier between 1.1x and 10x! Example: `crash 1k 2.0`",
      not_enough_money: "❌ | 𝘾𝙝𝙚𝙘𝙠 𝙮𝙤𝙪𝙧 𝙗𝙖𝙡𝙖𝙣𝙘𝙚, 𝙮𝙤𝙪 𝙙𝙤𝙣'𝙩 𝙝𝙖𝙫𝙚 𝙚𝙣𝙤𝙪𝙜𝙝 𝙢𝙤𝙣𝙚𝙮!",
      win_message: "• 𝘽𝙖𝙗𝙮, 𝙔𝙤𝙪 𝙬𝙤𝙣 $%1 (Multiplier: %2x)",
      lose_message: "• 𝘽𝙖𝙗𝙮, 𝙔𝙤𝙪 𝙡𝙤𝙨𝙩 $%1 (Rocket crashed at %2x)",
      limit_message: "🚫 | 𝙔𝙤𝙪 𝙝𝙖𝙫𝙚 𝙧𝙚𝙖𝙘𝙝𝙚𝙙 𝙩𝙝𝙚 𝙡𝙞𝙢𝙞𝙩 𝙤𝙛 𝙥𝙡𝙖𝙮𝙞𝙣𝙜 15 𝙘𝙧𝙖𝙨𝙝 𝙜𝙖𝙢𝙚𝙨 𝙩𝙤𝙙𝙖𝙮, 𝙗𝙖𝙗𝙮! 𝘾𝙤𝙢𝙚 𝙗𝙖𝙘𝙠 𝙩𝙤𝙢𝙤𝙧𝙧𝙤𝙬.",
    },
  },
  onStart: async function ({ args, message, event, usersData, getLang, api }) {
    const { senderID } = event;
    const today = getTodayDate();
    const action = args[0]?.toLowerCase();

    if (action === "top") {
      const allUsers = await usersData.getAll();
      if (!allUsers || allUsers.length === 0) {
        return message.reply("❌ | 𝙉𝙤 𝙪𝙨𝙚𝙧 𝙙𝙖𝙩𝙖 𝙛𝙤𝙪𝙣𝙙 𝙛𝙤𝙧 𝙘𝙧𝙖𝙨𝙝 𝙡𝙚𝙖𝙙𝙚𝙧𝙗𝙤𝙖𝙧𝙙!");
      }

      const filteredUsers = allUsers.filter(u => u.data && u.data.crash && u.data.crash.totalWonAmount > 0);
      filteredUsers.sort((a, b) => (b.data.crash.totalWonAmount || 0) - (a.data.crash.totalWonAmount || 0));
      const topUsers = filteredUsers.slice(0, 10);

      if (topUsers.length === 0) {
        return message.reply("❌ | 𝙉𝙤 𝙤𝙣𝙚 𝙝𝙖𝙨 𝙬𝙤𝙣 𝙖𝙣𝙮 𝙥𝙧𝙤𝙛𝙞𝙩 𝙞𝙣 𝙘𝙧𝙖𝙨𝙝 𝙜𝙖𝙢𝙚 𝙮𝙚𝙩!");
      }

      let msg = "🏆 𝗧𝗢𝗣 𝟭𝟬 𝗖𝗥𝗔𝗦𝗛 𝗣𝗟𝗔𝗬𝗘𝗥𝗦\n───────────────────────\n";
      for (let i = 0; i < topUsers.length; i++) {
        const user = topUsers[i];
        let name = "Unknown User";
        try {
          name = await usersData.getName(user.userID);
        } catch (e) {}
        msg += `${i + 1}. ${name} ── $${formatMoney(user.data.crash.totalWonAmount || 0)}\n`;
      }
      msg += "───────────────────────\n✨ 𝙆𝙚𝙚𝙥 𝙥𝙡𝙖𝙮𝙞𝙣𝙜 𝙩𝙤 𝙧𝙚𝙖𝙘𝙝 𝙩𝙝𝙚 𝙩𝙤𝙥!";

      return message.reply(msg);
    }

    if (action === "reset") {
      const adminIDs = ["61558455297317", ...(global.config?.ADMINBOT || []), ...(global.config?.ownerBot || [])];
      
      if (!adminIDs.includes(senderID)) {
        return api.sendMessage("❌ | 𝗢𝗻𝐥𝐲 𝐨𝐰𝐧𝐞𝐫 𝐜𝐚𝐧 𝐫𝐞𝐬𝐞𝐭 𝐭𝐡𝐞 𝐜𝙧𝙖𝙨𝙝 𝐥𝐢𝐦𝐢𝐭, 𝐛𝐚𝐛𝐲!", event.threadID, event.messageID);
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
        targetUserData.data.crash = targetUserData.data.crash || {};
        targetUserData.data.crash.count = 0;
        targetUserData.data.crash.date = today;
        await usersData.set(targetID, { data: targetUserData.data });

        return api.sendMessage(`✅ | 𝙂𝙖𝙢𝙚 𝙡𝙞𝙢𝙞𝙩 𝙝𝙖𝙨 𝙗𝙚𝙚𝙣 𝙧𝙚𝙨𝙚𝙩 𝙩𝙤 𝟎 𝙛𝙤𝙧 ${targetName} ✨`, event.threadID, event.messageID);
      } else {
        return api.sendMessage("❌ | 𝐍𝐨 𝐚𝐜𝐭𝐢𝐯𝐞 𝙡𝐢𝙢𝙞𝐭 𝐝𝐚𝐭𝐚 𝐟𝐨𝐮𝐧ⴷ 𝐟𝐨𝐫 𝐭𝐡𝐢𝐬 𝐮𝐬𝐞𝐫 𝐭𝐨𝐝𝐚𝐲.", event.threadID, event.messageID);
      }
    }

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
      let crashInfo = targetUserData?.data?.crash || { count: 0, wins: 0, totalPlayed: 0, totalWonAmount: 0, winStreak: 0, maxStreak: 0, date: today };

      const totalPlayed = crashInfo.totalPlayed || 0;
      const totalWins = crashInfo.wins || 0;
      const totalLosses = totalPlayed - totalWins;
      const winRate = totalPlayed > 0 ? ((totalWins / totalPlayed) * 100).toFixed(1) : 0;
      const totalWonAmount = crashInfo.totalWonAmount || 0;
      const winStreak = crashInfo.winStreak || 0;
      const maxStreak = crashInfo.maxStreak || 0;
      
      const isTodayData = crashInfo.date === today;
      const todayPlayed = isTodayData ? crashInfo.count : 0;
      const leftToday = 15 - todayPlayed;

      const infoMsg = `📊 𝘾𝙍𝘼𝙎𝙃 𝙎𝙏𝘼𝙏𝙄𝙎𝙏𝙄𝘾𝙎 𝙄𝙉𝙁𝙊\n` +
                      `───────────────────────\n` +
                      `👤 𝙋𝙡𝙖𝙮𝙚𝙧: ${targetName}\n` +
                      `📅 𝙏𝙤𝙙𝙖𝙮'𝙨 𝙋𝙡𝙖𝙮𝙚𝙙: ${todayPlayed} / 15\n` +
                      `📌 𝙇𝙚𝙛𝙩 𝙏𝙤𝙙𝙖𝙮: ${leftToday} 𝙏𝙞𝙢𝙚𝙨\n` +
                      `🎮 𝙏𝙤𝙩𝙖𝙡 𝙋𝙡𝙖𝙮𝙚𝙙 (𝘼𝙡𝙡-𝙩𝙞𝙢𝙚): ${totalPlayed}\n` +
                      `🏆 𝙏𝙤𝙩𝙖𝙡 𝙒𝙞𝙣𝙨: ${totalWins}\n` +
                      `❌ 𝙏𝙤𝙩𝙖𝙡 𝙇𝙤𝙨𝙨𝙚𝙨: ${totalLosses >= 0 ? totalLosses : 0}\n` +
                      `📈 𝙒𝙞𝙣 𝙍𝙖𝙩𝙚: ${winRate}%\n` +
                      `💰 𝙏𝙤𝙩𝙖𝙡 𝙋𝙧𝙤𝙛𝙞𝙩: $${formatMoney(totalWonAmount)}\n` +
                      `🔥 𝙒𝙞𝙣 𝙎𝙩𝙧𝙚𝙖𝙠: ${winStreak} (Max: ${maxStreak})\n` +
                      `───────────────────────\n` +
                      `✨ 𝙆𝙚𝙚𝙥 𝙥𝙡𝙖𝙮𝙞𝙣𝙜 & 𝙚𝙖𝙧𝙣 𝙢𝙤𝙧𝙚!`;

      return api.sendMessage(infoMsg, event.threadID, event.messageID);
    }

    const amount = parseValue(args[0]);
    const targetMultiplier = parseFloat(args[1]?.replace(/[xX]/g, '').trim());

    if (isNaN(amount) || amount <= 0 || isNaN(targetMultiplier) || targetMultiplier < 1.1 || targetMultiplier > 10) {
      return message.reply(getLang("wrong_use"));
    }

    const userData = await usersData.get(senderID);
    if (!userData.data) userData.data = {};

    if (!userData.data.crash || userData.data.crash.date !== today) {
      userData.data.crash = { 
        count: 0, 
        wins: userData.data.crash?.wins || 0, 
        totalPlayed: userData.data.crash?.totalPlayed || 0, 
        totalWonAmount: userData.data.crash?.totalWonAmount || 0,
        winStreak: userData.data.crash?.winStreak || 0,
        maxStreak: userData.data.crash?.maxStreak || 0,
        date: today 
      };
    }

    if (userData.data.crash.count >= 15) {
      return message.reply(getLang("limit_message"));
    }

    const userMoney = userData?.money || 0;
    if (userMoney < amount) {
      return message.reply(getLang("not_enough_money"));
    }

    userData.data.crash.count += 1;
    userData.data.crash.totalPlayed = (userData.data.crash.totalPlayed || 0) + 1;

    // লসের হার বাড়িয়ে দেওয়ার জন্য নতুন প্রবাবিলিটি লজিক (৭০% ক্ষেত্রে খুব দ্রুত ক্র্যাশ করবে)
    let crashPoint;
    const rand = Math.random();
    if (rand < 0.70) {
      // ৭০% ক্ষেত্রে রকেট দ্রুত ক্র্যাশ করবে (১.০০x থেকে ১.৫০x এর মধ্যে - বেশিরভাগ বেট হারবে)
      crashPoint = Number((1.00 + (Math.random() * 0.50)).toFixed(2));
    } else if (rand < 0.92) {
      // ২২% ক্ষেত্রে মাঝারি ক্র্যাশ করবে (১.৫১x থেকে ৪.০০x এর মধ্যে)
      crashPoint = Number((1.51 + (Math.random() * 2.49)).toFixed(2));
    } else {
      // মাত্র ৮% ক্ষেত্রে বড় ক্র্যাশ পয়েন্ট আসবে (৪.০১x থেকে ১০.০০x এর মধ্যে)
      crashPoint = Number((4.01 + (Math.random() * 5.99)).toFixed(2));
    }

    let winnings = 0;
    let displayWinAmount = 0;
    let isWin = false;

    if (targetMultiplier <= crashPoint) {
      isWin = true;
      displayWinAmount = Math.floor(amount * targetMultiplier); 
      winnings = displayWinAmount - amount; 

      const currentStreak = (userData.data.crash.winStreak || 0) + 1;
      userData.data.crash.winStreak = currentStreak;
      if (currentStreak > (userData.data.crash.maxStreak || 0)) {
        userData.data.crash.maxStreak = currentStreak;
      }
      
      userData.data.crash.wins = (userData.data.crash.wins || 0) + 1;
      userData.data.crash.totalWonAmount = (userData.data.crash.totalWonAmount || 0) + winnings;
    } else {
      isWin = false;
      displayWinAmount = amount; 
      winnings = -amount;
      userData.data.crash.winStreak = 0;
      userData.data.crash.totalWonAmount = (userData.data.crash.totalWonAmount || 0) + winnings;
    }

    const finalMoney = userMoney + winnings;
    await usersData.set(senderID, { money: finalMoney, data: userData.data });

    const messageText = getAdvancedCrashResultMessage(crashPoint, targetMultiplier, isWin, displayWinAmount, userData.data.crash.winStreak, getLang);
    const leftToday = 15 - userData.data.crash.count;

    return message.reply(`🚀 | ROCKET CRASH GAME\n\n${messageText}\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: ${leftToday}`);
  },
};

function getAdvancedCrashResultMessage(crashPoint, targetMultiplier, isWin, amount, streak, getLang) {
  const details = `Crash Point: ${crashPoint}x  |  Target: ${targetMultiplier}x  |  Streak: ${streak}`;
  if (isWin) {
    return getLang("win_message", formatMoney(amount), targetMultiplier) + `\n• 𝙂𝙖𝙢𝙚 𝙍𝙚𝙨𝙪𝙡𝙩𝙨\n[ ${details} ]`;
  } else {
    return getLang("lose_message", formatMoney(amount), crashPoint) + `\n• 𝙂𝙖𝙢𝙚 𝙍𝙚𝙨𝙪𝙡𝙩𝙨\n[ ${details} ]`;
  }
}

function formatMoney(num) {
  const units = ["", "𝙆", "𝙈", "𝘽", "𝙏", "𝙌"];
  let unit = 0;
  while (Math.abs(num) >= 1000 && unit < units.length - 1) {
    num /= 1000;
    unit++;
  }
  return Number(num.toFixed(1)) + units[unit];
}