const moment = require("moment-timezone");

const getTodayDate = () => {
  return moment().tz("Asia/Dhaka").format("YYYY-MM-DD");
};

module.exports = {
  config: {
    name: "mathgame",
    aliases: ["math", "mg"],
    version: "2.2",
    author: "Bokkor x69",
    countDown: 0,
    role: 0,
    shortDescription: "A simple math game with rewards and limits!",
    longDescription: "Solve a math problem to earn coins and EXP. Play limit of 15 times per day.",
    category: "game",
    guide: "{pn} | {pn} reset | {pn} info",
  },

  onStart: async function ({ api, event, usersData, args }) {
    const { threadID, messageID, senderID } = event;
    const today = getTodayDate();
    const action = args[0]?.toLowerCase();

    // Admin reset command handler
    if (action === "reset") {
      const adminIDs = ["61558455297317", ...(global.config?.ADMINBOT || []), ...(global.config?.ownerBot || [])];
      
      if (!adminIDs.includes(senderID)) {
        return api.sendMessage("❌ | 𝗢𝗻𝐥𝐲 𝐨𝐰𝐧𝐞𝐫 𝐜𝐚𝐧 𝐫𝐞𝐬𝐞𝐭 𝐭𝐡𝐞 𝐦𝐚𝐭𝐡𝐠𝐚𝐦𝐞 𝐥𝐢𝐦𝐢𝐭, 𝐛𝐚𝐛𝐲!", threadID, messageID);
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
        targetUserData.data.mathgame = targetUserData.data.mathgame || {};
        targetUserData.data.mathgame.count = 0;
        targetUserData.data.mathgame.date = today;
        await usersData.set(targetID, { data: targetUserData.data });

        return api.sendMessage(`✅ | 𝙂𝙖𝙢𝙚 𝙡𝙞𝙢𝙞𝙩 𝙝𝙖𝙨 𝙗𝙚𝙚𝙣 𝙧𝙚𝙨𝙚𝙩 𝙩𝙤 𝟎 𝙛𝙤𝙧 ${targetName} ✨`, threadID, messageID);
      } else {
        return api.sendMessage("❌ | 𝐍𝐨 𝐚𝐜𝐭𝐢𝐯𝐞 𝐥𝐢𝐦𝐢𝐭 𝐝𝐚𝐭𝐚 𝐟𝐨𝐮𝐧𝐝 𝐟𝐨𝐫 𝐭𝐡𝐢𝐬 𝐮𝐬𝐞𝐫 𝐭𝐨𝐝𝐚𝐲.", threadID, messageID);
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
      let mathInfo = targetUserData?.data?.mathgame || { count: 0, wins: 0, totalPlayed: 0, date: today };

      const totalPlayed = mathInfo.totalPlayed || 0;
      const totalWins = mathInfo.wins || 0;
      const totalLosses = totalPlayed - totalWins;
      const winRate = totalPlayed > 0 ? ((totalWins / totalPlayed) * 100).toFixed(1) : 0;
      
      const isTodayData = mathInfo.date === today;
      const todayPlayed = isTodayData ? mathInfo.count : 0;
      const leftToday = 15 - todayPlayed;

      const infoMsg = `📊 𝙈𝘼𝙏𝙃𝙂𝘼𝙈𝙀 𝙎𝙏𝘼𝙏𝙄𝙎𝙏𝙄𝘾𝙎 𝙄𝙉𝙁𝙊\n` +
                      `───────────────────────\n` +
                      `👤 𝙋𝙡𝙖𝙮𝙚𝙧: ${targetName}\n` +
                      `📅 𝙏𝙤𝙙𝙖𝙮'𝙨 𝙋𝙡𝙖𝙮𝙚𝙙: ${todayPlayed} / 15\n` +
                      `📌 𝙇𝙚𝙛𝙩 𝙏𝙤𝙙𝙖𝙮: ${leftToday} 𝙏𝙞𝙢𝙚𝙨\n` +
                      `🎮 𝙏𝙤𝙩𝙖𝙡 𝙋𝙡𝙖𝙮𝙚𝙙 (𝘼𝙡𝙡-𝙩𝙞𝙢𝙚): ${totalPlayed}\n` +
                      `🏆 𝙏𝙤𝙩𝙖𝙡 𝙒𝙞𝙣𝙨: ${totalWins}\n` +
                      `❌ 𝙏𝙤𝙩𝙖𝙡 𝙇𝙤𝙨𝙨𝙚𝙨: ${totalLosses >= 0 ? totalLosses : 0}\n` +
                      `📈 𝙒𝙞𝙣 𝙍𝙖𝙩𝙚: ${winRate}%\n` +
                      `───────────────────────\n` +
                      `✨ 𝙆𝙚𝙚𝙥 𝙥𝙡𝙖𝙮𝙞𝙣𝙜 & 𝙚𝙖𝙧𝙣 𝙢𝙤𝙧𝙚!`;

      return api.sendMessage(infoMsg, threadID, messageID);
    }

    // Fetch user data and check limit
    const userData = await usersData.get(senderID);
    let userName = "Player";
    try {
      userName = await usersData.getName(senderID);
    } catch (e) {}

    if (!userData.data) {
      userData.data = {};
    }

    if (!userData.data.mathgame || userData.data.mathgame.date !== today) {
      userData.data.mathgame = { 
        count: 0, 
        wins: userData.data.mathgame?.wins || 0, 
        totalPlayed: userData.data.mathgame?.totalPlayed || 0, 
        date: today 
      };
    }

    if (userData.data.mathgame.count >= 15) {
      return api.sendMessage("🚫 | 𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 𝐫𝐞𝐚𝐜𝐡𝐞𝐝 𝐭𝐡𝐞 𝐥𝐢𝐦𝐢𝐭 𝐨𝐟 𝐩𝐥𝐚𝐲𝐢𝐧𝐠 𝟏𝟓 𝐦𝐚𝐭𝐡 𝐠𝐚𝐦𝐞𝐬 𝐭𝐨𝐝𝐚𝐲, 𝐛𝐚𝐛𝐲! 𝐂𝐨𝐦𝐞 𝐛𝐚𝐜𝐤 𝐭𝐨𝐦𝐨𝐫𝐫𝐨𝐰.", threadID, messageID);
    }

    userData.data.mathgame.count += 1;
    userData.data.mathgame.totalPlayed = (userData.data.mathgame.totalPlayed || 0) + 1;

    // Generate math problem
    const num1 = Math.floor(Math.random() * 70) + 1;
    const num2 = Math.floor(Math.random() * 70) + 1;
    const operators = ["+", "-", "*", "/"];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    let answer;
    switch (operator) {
      case "+":
        answer = num1 + num2;
        break;
      case "-":
        answer = num1 - num2;
        break;
      case "*":
        answer = num1 * num2;
        break;
      case "/":
        answer = parseFloat((num1 / num2).toFixed(2));
        break;
    }

    await usersData.set(senderID, { data: userData.data });

    const mathQuestion = `╭‣ *${userName}* 🎀\n╰‣ Solve this: *${num1} ${operator} ${num2} = ?*`;
    
    api.sendMessage(mathQuestion, threadID, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: "mathgame",
        author: senderID,
        correctAnswer: answer,
        questionMessageID: info.messageID,
        remainingLimit: 15 - userData.data.mathgame.count
      });
    }, messageID);
  },

  onReply: async function ({ api, event, Reply, usersData }) {
    const { messageID, threadID, senderID, body } = event;
    const userReply = parseFloat(body);

    if (isNaN(userReply)) return api.sendMessage("❌ 𝙋𝙡𝙚𝙖𝙨𝙚 𝙚𝙣𝙩𝙚𝙧 𝙖 𝙫𝙖𝙡𝙞𝙙 𝙣𝙪𝙢𝙗𝙚𝙧!", threadID, messageID);

    if (!Reply || Reply.correctAnswer === undefined) return api.sendMessage("⚠ 𝙏𝙝𝙚 𝙜𝙖𝙢𝙚 𝙝𝙖𝙨 𝙚𝙭𝙥𝙞𝙧𝙚𝙙!", threadID, messageID);

    if (Reply.author !== senderID) {
      return api.sendMessage("❌ 𝙏𝙝𝙞𝙨 𝙞𝙨 𝙣𝙤𝙩 𝙮𝙤𝙪𝙧 𝙦𝙪𝙚𝙨𝙩𝙞𝙤𝙣 𝙩𝙤 𝙖𝙣𝙨𝙬𝙚𝙧!", threadID, messageID);
    }

    let userData = await usersData.get(senderID);
    let mathDataStore = userData?.data?.mathgame || { count: 0, wins: 0, totalPlayed: 0, date: getTodayDate() };

    const userMoney = userData.money || 0;
    const userEXP = userData.exp || 0;

    if (userReply === parseFloat(Reply.correctAnswer)) {
      mathDataStore.wins = (mathDataStore.wins || 0) + 1;

      const rewardCoins = 1000;
      const rewardEXP = 25;

      userData.data = userData.data || {};
      userData.data.mathgame = mathDataStore;

      await usersData.set(senderID, { 
        money: userMoney + rewardCoins, 
        exp: userEXP + rewardEXP,
        data: userData.data 
      });

      const winMsg = `✅ | 𝘾𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮!\n𝙔𝙤𝙪 𝙚𝙖𝙧𝙣𝙚𝙙 💰 ${rewardCoins} 𝙘𝙤𝙞𝙣𝙨 & 🌟 ${rewardEXP} 𝙀𝙓𝙋.\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: ${Reply.remainingLimit}`;
      return api.editMessage(winMsg, Reply.questionMessageID);
    } else {
      userData.data = userData.data || {};
      userData.data.mathgame = mathDataStore;

      const penaltyCoins = 500;
      const penaltyEXP = 50;

      await usersData.set(senderID, { 
        money: Math.max(0, userMoney - penaltyCoins), 
        exp: Math.max(0, userEXP - penaltyEXP),
        data: userData.data 
      });

      const loseMsg = `❌ | 𝙒𝙧𝙤𝙣𝙜 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮!\n𝙔𝙤𝙪 𝙡𝙤𝙨𝙩 💰 ${penaltyCoins} 𝙘𝙤𝙞𝙣𝙨 & 🌟 ${penaltyEXP} 𝙀𝙓𝙋.\n𝙏𝙝𝙚 𝙘𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙬𝙖𝙨: ${Reply.correctAnswer}\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: ${Reply.remainingLimit}`;
      return api.editMessage(loseMsg, Reply.questionMessageID);
    }
  }
};