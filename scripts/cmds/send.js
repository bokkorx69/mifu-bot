const moment = require("moment-timezone");

const getTodayDate = () => moment().tz("Asia/Dhaka").format("YYYY-MM-DD");

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

module.exports = {
  config: {
    name: "send",
    version: "3.3",
    author: "Bokkor x69",
    role: 0,
    shortDescription: "Send coins with mini-statement history, lucky cashback, and leaderboard",
    category: "Economy",
    guide: "{p}send <@mention/user_id> <amount> | {p}send -m <amount> | {p}send money <@mention/user_id> <amount> | {p}send info | {p}send history | {p}send top",
  },
  onStart: async function ({ api, event, args, usersData }) {
    const { senderID, messageReply, mentions, threadID, messageID } = event;
    const today = getTodayDate();
    let action = args[0]?.toLowerCase();

    // support for "send -m"
    if (action === "-m") {
      args.shift();
      action = args[0]?.toLowerCase();
    }
    // support for "send money"
    else if (action === "money") {
      args.shift();
    }

    // ১. স্ট্যাটস বা ইনফো চেক
    if (action === "info" || action === "stats") {
      let targetID = senderID;
      if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
      } else if (Object.keys(mentions).length > 0) {
        targetID = Object.keys(mentions)[0];
      }

      let targetName = "User";
      try {
        targetName = await usersData.getName(targetID);
      } catch (e) {}

      let targetUserData = await usersData.get(targetID);
      let sendHistory = targetUserData?.data?.sendHistory || { 
        totalSentAllTime: 0, 
        todaySentCount: 0, 
        todayTotalAmount: 0, 
        lastSendTime: "None", 
        date: today 
      };

      if (sendHistory.date !== today) {
        sendHistory.todaySentCount = 0;
        sendHistory.todayTotalAmount = 0;
      }

      const infoMsg = `📊 𝙀𝘾𝙊𝙉𝙊𝙈𝙔 𝙎𝙀𝙉𝘿 𝙎𝙏𝘼𝙏𝙄𝙎𝙏𝙄𝘾𝙎\n` +
                      `───────────────────────\n` +
                      `👤 𝙋𝙡𝙖𝙮𝙚𝙧: ${targetName}\n\n` +
                      `📅 𝙏𝙤𝙙𝙖𝙮'𝙨 𝙏𝙧𝙖𝙣𝙨𝙛𝙚𝙧𝙨: ${sendHistory.todaySentCount} 𝙏𝙞𝙢𝙚𝙨\n` +
                      `🕒 𝙏𝙤𝙙𝙖𝙮'𝙨 𝙎𝙚𝙣𝙩 𝘼𝙢𝙤𝙪𝙣𝙩: ${formatBalance(sendHistory.todayTotalAmount)}\n` +
                      `🕒 𝙇𝙖𝙨𝙩 𝙎𝙚𝙣𝙙 𝙏𝙞𝙢𝙚: ${sendHistory.lastSendTime}\n` +
                      `🏆 𝙏𝙤𝙩𝙖𝙡 𝙎𝙚𝙣𝙩 (𝘼𝙡𝙡-টাইম): ${formatBalance(sendHistory.totalSentAllTime)}\n` +
                      `───────────────────────\n` +
                      `✨ 𝙎𝙖𝙛𝙚 & 𝙎𝙚𝙘𝙪𝙧𝙚 𝙏𝙧𝙖𝙣𝙨𝙖𝙘𝙩𝙞𝙤𝙣!`;

      return api.sendMessage(infoMsg, threadID, messageID);
    }

    // ২. মিনি-স্টেটমেন্ট বা লাস্ট ট্রানজেকশন হিস্ট্রি ({p}send history)
    if (action === "history" || action === "log") {
      let targetUserData = await usersData.get(senderID);
      let logs = targetUserData?.data?.transactionLogs || [];

      if (logs.length === 0) {
        return api.sendMessage("❌ | 𝙔𝙤𝙪 𝙝𝙖𝙫𝙚 𝙣𝙤 𝙧𝙚𝙘𝙚𝙣𝙩 𝙩𝙧𝙖𝙣𝙨𝙖𝙘𝙩𝙞𝙤𝙣 𝙝𝙞𝙨𝙩𝙤𝙧𝙮, 𝙗𝙖𝙗𝙮!", threadID, messageID);
      }

      let historyText = `📜 𝙍𝙀𝘾𝙀𝙉𝙏 𝙏𝙍𝘼𝙉𝙎𝘼𝘾𝙏𝙄𝙊𝙉 𝙇𝙊𝙂𝙎\n` + `───────────────────────\n`;
      logs.slice(-5).reverse().forEach((log, index) => {
        historyText += `${index + 1}. ➡️ Sent ${formatBalance(log.amount)} to ${log.receiverName}\n   🕒 ${log.time}\n\n`;
      });
      historyText += `───────────────────────`;

      return api.sendMessage(historyText, threadID, messageID);
    }

    // ৫. সেন্ড লিডারবোর্ড ({p}send top)
    if (action === "top" || action === "leaderboard") {
      try {
        const allUsers = await usersData.getAll();
        const sortedUsers = allUsers
          .filter(user => user.data && user.data.sendHistory && user.data.sendHistory.totalSentAllTime > 0)
          .sort((a, b) => b.data.sendHistory.totalSentAllTime - a.data.sendHistory.totalSentAllTime)
          .slice(0, 10);

        if (sortedUsers.length === 0) {
          return api.sendMessage("❌ | 𝙉𝙤 𝙡𝙚𝙖𝙙𝙚𝙧𝙗𝙤𝙖𝙧𝙙 𝙙𝙖𝙩𝙖 𝙛𝙤𝙪𝙣𝙙 𝙮𝙚𝙩, 𝙗𝙖𝙗𝙮!", threadID, messageID);
        }

        let topMsg = `🏆 𝙏𝙊𝙋 10 𝙈𝙊𝙉𝙀𝙔 𝙎𝙀𝙉𝘿𝙀𝙍𝙎\n` + `───────────────────────\n`;
        for (let i = 0; i < sortedUsers.length; i++) {
          const u = sortedUsers[i];
          let name = "User";
          try {
            name = await usersData.getName(u.userID);
          } catch (e) {}
          const total = u.data.sendHistory.totalSentAllTime;
          topMsg += `${i + 1}. ${name} ➪ ${formatBalance(total)}\n\n`;
        }
        topMsg += `───────────────────────`;

        return api.sendMessage(topMsg, threadID, messageID);
      } catch (e) {
        return api.sendMessage("❌ | 𝙀𝙧𝙧𝙤𝙧 𝙛𝙚𝙩𝙘𝙝𝙞𝙣𝙜 𝙡𝙚𝙖𝙙𝙚𝙧𝙗𝙤𝙖𝙧𝙙!", threadID, messageID);
      }
    }

    let recipientID;
    if (Object.keys(mentions).length > 0) {
      recipientID = Object.keys(mentions)[0]; 
    } else if (messageReply) {
      recipientID = messageReply.senderID; 
    } else {
      recipientID = args[0]; 
    }

    if (!recipientID) {
      return api.sendMessage("❌ | 𝙋𝙡𝙚𝙖𝙨𝙚 𝙢𝙚𝙣𝙩𝙞𝙤𝙣 𝙖 𝙪𝙨𝙚𝙧, 𝙧𝙚𝙥𝙡𝙮, 𝙤𝙧 𝙩𝙮𝙥𝙚 `{p}send info` / `{p}send history` / `{p}send top`, 𝙗𝙖𝙗𝙮!", threadID, messageID);
    }

    if (recipientID === senderID) {
      return api.sendMessage("❌ | 𝙔𝙤𝙪 𝙘𝙖𝙣𝙣𝙤𝙩 𝙨𝙚𝙣𝙙 𝙢𝙤𝙣𝙚𝙮 𝙩𝙤 𝙮𝙤𝙪𝙧𝙨𝙚𝙡𝙛, 𝙗𝙖𝙗𝙮!", threadID, messageID);
    }

    const recipientData = await usersData.get(recipientID);
    if (!recipientData) {
      return api.sendMessage("❌ | 𝙍𝙚𝙘𝙞𝙥𝙞𝙚𝙣𝙩 𝙙𝙖𝙩𝙖 𝙣𝙤𝙩 𝙛𝙤𝙪𝙣𝙙 𝙞𝙣 𝙩𝙝𝙚 𝙙𝙖𝙩𝙖𝙗𝙖𝙨𝙚!", threadID, messageID);
    }

    const amount = parseInt(args[args.length - 1]);
    if (isNaN(amount) || amount <= 0) {
      return api.sendMessage("❌ | 𝙋𝙡𝙚𝙖𝙨𝙚 𝙚𝙣𝙩𝙚𝙧 𝙖 𝙫𝙖𝙡𝙞𝙙 𝙖𝙢𝙤𝙪𝙣𝙩, 𝙗𝙖𝙗𝙮!", threadID, messageID);
    }

    const minAmount = 10;
    if (amount < minAmount) {
      return api.sendMessage(`❌ | 𝙔𝙤𝙪 𝙢𝙪𝙨𝙩 𝙨𝙚𝙣𝙙 𝙖𝙩 𝙡𝙚𝙖𝙨𝙩 ${formatBalance(minAmount)} 𝙘𝙤𝙞𝙣𝙨, 𝙗𝙖𝙗𝙮!`, threadID, messageID);
    }

    const userData = await usersData.get(senderID);
    const userMoney = userData.money || 0;

    if (userMoney < amount) {
      return api.sendMessage("❌ | 𝙉𝙤𝙩 𝙚𝙣𝙤𝙪𝙜𝙝 𝙢𝙤𝙣𝙚𝙮 𝙩𝙤 𝙜𝙞𝙫𝙚, 𝙗𝙖𝙗𝙮!", threadID, messageID);
    }

    userData.data = userData.data || {};
    let sendHistory = userData.data.sendHistory || { 
      totalSentAllTime: 0, 
      todaySentCount: 0, 
      todayTotalAmount: 0, 
      lastSendTime: "None", 
      date: today 
    };

    if (sendHistory.date !== today) {
      sendHistory.todaySentCount = 0;
      sendHistory.todayTotalAmount = 0;
      sendHistory.date = today;
    }

    const dailyLimit = 50000000; 
    if ((sendHistory.todayTotalAmount + amount) > dailyLimit) {
      return api.sendMessage(`🚫 | 𝘿𝙖𝙞𝙡𝙮 𝙨𝙚𝙣𝙙 𝙡𝙞𝙢𝙞𝙩 𝙚𝙭𝙘𝙚𝙚𝙙𝙚𝙙! 𝙔𝙤𝙪 𝙘𝙖𝙣 𝙤𝙣𝙡𝙮 𝙨𝙚𝙣𝙙 𝙪𝙥 𝙩𝙤 ${formatBalance(dailyLimit)} 𝙥𝙚𝙧 𝙙𝙖𝙮.`, threadID, messageID);
    }

    let recipientName = "User";
    try {
      recipientName = await usersData.getName(recipientID);
    } catch (e) {}

    const taxRate = 0.02; 
    const taxAmount = Math.floor(amount * taxRate);
    const finalAmountToSend = amount - taxAmount;

    let cashback = 0;
    const isLucky = Math.random() < 0.10; 
    if (isLucky) {
      cashback = Math.floor(amount * 0.05); 
    }

    userData.money = userData.money - amount + cashback;
    recipientData.money = (recipientData.money || 0) + finalAmountToSend;

    sendHistory.todaySentCount += 1;
    sendHistory.todayTotalAmount += amount;
    sendHistory.totalSentAllTime += amount;
    const currentTime = moment().tz("Asia/Dhaka").format("hh:mm:ss A");
    sendHistory.lastSendTime = currentTime;
    userData.data.sendHistory = sendHistory;

    userData.data.transactionLogs = userData.data.transactionLogs || [];
    userData.data.transactionLogs.push({
      receiverName: recipientName,
      amount: amount,
      time: currentTime
    });
    if (userData.data.transactionLogs.length > 10) {
      userData.data.transactionLogs.shift();
    }

    await usersData.set(senderID, userData);
    await usersData.set(recipientID, recipientData);

    let successMsg = `✅ | 𝙎𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮 𝙨𝙚𝙣𝙩 💰 ${formatBalance(finalAmountToSend)} 𝙩𝙤 ${recipientName}!\n` +
                     `📌 𝙏𝙖𝙭 𝙙𝙚𝙙𝙪𝙘𝙩𝙚𝙙 (2%): ${formatBalance(taxAmount)}\n`;

    if (isLucky && cashback > 0) {
      successMsg += `🎉 𝙇𝙪𝙘𝙠𝙮 𝘾𝙖𝙨𝙝𝙗𝙖𝙘𝙠! 𝙔𝙤𝙪 𝙜𝙤𝙩 ${formatBalance(cashback)} 𝙗𝙖𝙘𝙠!\n`;
    }

    successMsg += `💳 𝙔𝙤𝙪𝙧 𝙍𝙚𝙢𝙖𝙞𝙣𝙞𝙣𝙜: ${formatBalance(userData.money)}`;

    return api.sendMessage(successMsg, threadID, messageID);
  },
};