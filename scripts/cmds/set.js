const formatBalance = function (amount) {
    if (amount < 1000) return amount + "$";
    else if (amount < 1000000) return (amount / 1000).toFixed(1) + "k$";
    else if (amount < 1000000000) return (amount / 1000000).toFixed(1) + "M$";
    else if (amount < 1000000000000) return (amount / 1000000000).toFixed(1) + "B$";
    else if (amount < 1000000000000000) return (amount / 1000000000000).toFixed(1) + "T$";
    else if (amount < 1000000000000000000) return (amount / 1000000000000000).toFixed(1) + "Q$";
    else if (amount < 1000000000000000000000) return (amount / 1000000000000000000).toFixed(1) + "A$";
    else return (amount / 1000000000000000000000000).toFixed(1) + "D$";
};

// অ্যামাউন্ট পার্স করার জন্য স্মার্ট ফাংশন (যেমন: 1k = 1000, 10k = 10000, বা 11000)
function parseAmount(input) {
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
    } else if (str.includes('t')) {
        numPart *= 1000000000000;
    }

    return Math.floor(numPart);
}

module.exports = {
  config: {
    name: "set",
    aliases: ['ap'],
    version: "2.4",
    author: "Bokkor x69",
    role: 2,
    description: {
      en: "Set coins/exp for user, group, or clear deleted/suspended user accounts from database"
    },
    category: "economy",
    guide: {
      en: "{pn} [money|exp] <amount> [@mention/reply] | {pn} [money|exp] [add|sub] <amount> | {pn} [money|exp] all <amount> | {pn} cache"
    }
  },

  onStart: async function ({ args, event, api, usersData }) {
    const permission = global.GoatBot.config.ownerBot;
    if (!permission.includes(event.senderID)) {
      return api.sendMessage("❌ | 𝙊𝙣𝙡𝙮 𝙗𝙤𝙩 𝙤𝙬𝙣𝙚𝙧 𝙘𝙖𝙣 𝙪𝙨𝙚 𝙩𝙝𝙞𝙨 𝙘𝙤𝙢𝙢𝙖𝙣𝙙, 𝙗𝙖𝙗𝙮!", event.threadID, event.messageID);
    }

    const { senderID, threadID, messageID, messageReply, mentions } = event;
    let query = args[0]?.toLowerCase();

    // ক্যাশ ক্লিয়ার বা ডিলিটেড/সাসপেন্ডেড ইউজার রিমুভ করার কমান্ড ({pn} set cache)
    if (query === "cache" || query === "clear") {
      const waitMsg = await api.sendMessage("🔄 | 𝙎𝙘𝙖𝙣𝙣𝙞𝙣𝙜 𝙖𝙣𝙙 𝙘𝙡𝙚𝙖𝙣𝙞𝙣𝙜 𝙨𝙪𝙨𝙥𝙚𝙣𝙙𝙚𝙙/𝚍𝙚𝙡𝙚𝙩𝙚𝙙 𝙪𝙨𝙚𝙧𝙨 𝙛𝙧𝙤𝙢 𝙙𝙖𝙩𝙖𝙗𝙖𝙨𝙚, 𝙗𝙖𝙗𝙮...", threadID);
      
      try {
        const allUsers = await usersData.getAll();
        let removedCount = 0;

        for (const user of allUsers) {
          const uid = user.userID;
          try {
            const name = await api.getUserInfo(uid);
            if (!name || !name[uid] || name[uid].name === "Facebook user" || name[uid].name === "User") {
              await usersData.remove(uid);
              removedCount++;
            }
          } catch (e) {
            try {
              await usersData.remove(uid);
              removedCount++;
            } catch (err) {}
          }
        }

        return api.editMessage(`✅ | 𝙎𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮 𝙧𝙚𝙢𝙤𝙫𝙚𝙙 ${removedCount} 𝙨𝙪𝙨𝙥𝙚𝙣𝙙𝙚𝙙 𝙤𝙧 𝙙𝙚𝙡𝙚𝙩𝙚𝙙 𝙪𝙨𝙚𝙧 𝙖𝙘𝙘𝙤𝙪𝙣𝙩𝙨 𝙛𝙧𝙤𝙢 𝙩𝙝𝙚 𝙙𝙖𝙩𝙖𝙗𝙖𝙨𝙚! ✨`, waitMsg.messageID, threadID);
      } catch (e) {
        return api.sendMessage("❎ | 𝙀𝙧𝙧𝙤𝙧 𝙬𝙝𝙞𝙡𝙚 𝙘𝙡𝙚𝙖𝙣𝙞𝙣𝙜 𝙙𝙖𝙩𝙖𝙗𝙖𝙨𝙚 𝙘𝙖𝙘𝙝𝙚, 𝙗𝙖𝙗𝙮!", threadID, messageID);
      }
    }

    let action = "set"; 
    let rawAmountIndex = 1;

    if (!query || (!["money", "exp"].includes(query))) {
      return api.sendMessage("❎ | 𝙄𝙣𝙫𝙖𝙡𝙞𝙙 𝙪𝙨𝙖𝙜𝙚! 𝙐𝙨𝙚: `{pn} [money|exp] <amount>` or `{pn} [money|exp] all <amount>` or `{pn} cache`", threadID, messageID);
    }

    const isAll = args[1]?.toLowerCase() === "all";

    if (isAll) {
      rawAmountIndex = 2;
    } else if (["add", "sub", "remove"].includes(args[1]?.toLowerCase())) {
      action = args[1].toLowerCase() === "remove" ? "sub" : args[1].toLowerCase();
      rawAmountIndex = 2;
    }

    let rawAmount = args[rawAmountIndex];
    if (!rawAmount) {
      return api.sendMessage("❎ | 𝙋𝙡𝙚𝙖𝙨𝙚 𝙥𝙧𝙤𝙫𝙞𝙙𝙚 𝙖𝙣 𝙖𝙢𝙤𝙪𝙣𝙩, 𝙗𝙖𝙗𝙮!", threadID, messageID);
    }

    // আপডেট করা স্মার্ট অ্যামাউন্ট পার্সার ব্যবহার করা হয়েছে
    let amount = parseAmount(rawAmount);

    if (isNaN(amount)) {
      return api.sendMessage("❎ | 𝙄𝙣𝙫𝙖𝙡𝙞𝙙 𝙖𝙢𝙤𝙪𝙣𝙩 𝙛𝙤𝙧𝙢𝙖𝙩, 𝙗𝙖𝙗𝙮!", threadID, messageID);
    }

    if (isAll) {
      let threadInfo;
      try {
        threadInfo = await api.getThreadInfo(threadID);
      } catch (e) {
        return api.sendMessage("❎ | 𝘾𝙤𝙪𝙡𝙙 𝙣𝙤𝙩 𝙛𝙚𝙩𝙘𝙝 𝙜𝙧𝙤𝙪𝙥 𝙢𝙚𝙢𝙗𝙚𝙧𝙨!", threadID, messageID);
      }

      const participantIDs = threadInfo.participantIDs || [];
      if (participantIDs.length === 0) {
        return api.sendMessage("❎ | 𝙉𝙤 𝙢𝙚𝙢𝙗𝙚𝙧𝙨 𝙛𝙤𝙪𝙣𝙙 𝙞𝙣 𝙩𝙝𝙞𝙨 𝙜𝙧𝙤𝙪𝙥!", threadID, messageID);
      }

      let successCount = 0;
      for (const uid of participantIDs) {
        try {
          const userData = await usersData.get(uid);
          if (!userData) continue;

          let currentValue = query === 'money' ? (userData.money || 0) : (userData.exp || 0);
          let finalValue = amount;

          if (action === "add") {
            finalValue = currentValue + amount;
          } else if (action === "sub") {
            finalValue = Math.max(0, currentValue - amount);
          }

          if (query === 'exp') {
            await usersData.set(uid, { ...userData, exp: finalValue });
          } else {
            await usersData.set(uid, { ...userData, money: finalValue });
          }
          successCount++;
        } catch (err) {}
      }

      const label = query === 'money' ? 'Coins' : 'EXP';
      const formattedAmount = formatBalance(amount);
      return api.sendMessage(`✅ | 𝙎𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮 𝙪𝙥𝙙𝙖𝙩𝙚𝙙 ${label} 𝙩𝙤 ${formattedAmount} 𝙛𝙤𝙧 𝙖𝙡𝙡 ${successCount} 𝙢𝙚𝙢𝙗𝙚𝙧𝙨 𝙞𝙣 𝙩𝙝𝙞𝙨 𝙜𝙧𝙤𝙪𝙥! ✨`, threadID, messageID);
    }

    let targetUser;
    if (messageReply) {
      targetUser = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetUser = Object.keys(mentions)[0];
    } else {
      targetUser = senderID;
    }

    const userData = await usersData.get(targetUser);
    if (!userData) {
      return api.sendMessage("❎ | 𝙐𝙨𝙚𝙧 𝙙𝙖𝙩𝙖 𝙣𝙤𝙩 𝙛𝙤𝙪𝙣𝙙 𝙞𝙣 𝙩𝙝𝙚 𝙙𝙖𝙩𝙖-𝙗𝙖𝙨𝙚!", threadID, messageID);
    }

    let targetName = "User";
    try {
      targetName = await usersData.getName(targetUser);
    } catch (e) {}

    let currentValue = query === 'money' ? (userData.money || 0) : (userData.exp || 0);
    let finalValue = amount;

    if (action === "add") {
      finalValue = currentValue + amount;
    } else if (action === "sub") {
      finalValue = Math.max(0, currentValue - amount);
    }

    const formattedFinalValue = formatBalance(finalValue);

    if (query === 'exp') {
      await usersData.set(targetUser, {
        ...userData,
        exp: finalValue
      });

      return api.sendMessage(`✅ | 𝙎𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮 𝙪𝙥𝙙𝙖𝙩𝙚𝙙 𝙚𝙭𝙥𝙚𝙧𝙞𝙚𝙣𝙘𝙚 𝙥𝙤𝙞𝙣𝙩𝙨 𝙛𝙤𝙧 ${targetName}✨\n📊 𝙉𝙚𝙬 𝙀𝙓𝙥: ${formattedFinalValue}`, threadID, messageID);
    } 
    else if (query === 'money') {
      await usersData.set(targetUser, {
        ...userData,
        money: finalValue
      });

      return api.sendMessage(`✅ | 𝙎𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮 𝙪𝙥𝙙𝙖𝙩𝙚𝙙 𝙘𝙤𝙞𝙣𝙨 𝙛𝙤𝙧 ${targetName}✨\n💰 𝙉𝙚𝙬 𝘽𝙖𝙡𝙖𝙣𝙘𝙚: ${formattedFinalValue}`, threadID, messageID);
    }
  }
};