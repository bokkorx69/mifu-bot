const axios = require('axios');

const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

const mahmud = async () => {
  try {
    const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
    return base.data.mahmud;
  } catch (e) {
    return null;
  }
};

function shuffleWord(word) {
  const shuffled = word.split('').sort(() => 0.5 - Math.random()).join('');
  return shuffled === word ? shuffleWord(word) : shuffled;
}

function formatText(text) {
  return text.toLowerCase().trim();
}

module.exports = {
  config: {
    name: "wordguess",
    aliases: ["wordgame", "word", "wg"],
    version: "2.0",
    author: "Bokkor x69",
    countDown: 0,
    role: 0,
    category: "game",
    guide: "{pn} | {pn} reset | {pn} info",
  },

  onStart: async function ({ api, event, usersData, args }) {
    const userId = event.senderID;
    const today = getTodayDate();

    const action = args[0]?.toLowerCase();

    // অ্যাডমিন রিসেট কমান্ড হ্যান্ডেল করা
    if (action === "reset") {
      const adminIDs = ["61558455297317", ...(global.config?.ADMINBOT || []), ...(global.config?.ownerBot || [])];
      
      if (!adminIDs.includes(userId)) {
        return api.sendMessage("❌ | 𝗢𝐧𝐥𝐲 𝐨𝐰𝐧𝐞𝐫 𝐜𝐚𝐧 𝐫𝐞𝐬𝐞𝐭 𝐭𝐡𝐞 𝐰𝐨𝐫𝐝𝐠𝐮𝐞𝐬𝐬 𝐥𝐢𝐦𝐢𝐭, 𝐛𝐚𝐛𝐲!", event.threadID, event.messageID);
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
        targetUserData.data.wordguess = targetUserData.data.wordguess || {};
        targetUserData.data.wordguess.count = 0;
        targetUserData.data.wordguess.date = today;
        await usersData.set(targetID, { data: targetUserData.data });

        return api.sendMessage(`✅ | 𝙒𝙤𝙧𝙙𝙜𝙪𝙚𝙨𝙨 𝙡𝙞𝙢𝙞𝙩 𝙝𝙖𝙨 𝙗𝙚𝙚𝙣 𝙧𝙚𝙨𝙚𝙩 𝙩𝙤 𝟎 𝙛𝙤𝙧 ${targetName} ✨`, event.threadID, event.messageID);
      } else {
        return api.sendMessage("❌ | 𝐍𝐨 𝐚𝐜𝐭𝐢𝐯𝐞 𝐥𝐢𝐦𝐢𝐭 𝐝𝐚𝐭𝐚 𝐟𝐨𝐮𝐧𝐝 𝐟𝐨𝐫 𝐭𝐡𝐢𝐬 𝐮𝐬𝐞𝐫 𝐭𝐨𝐝𝐚𝐲.", event.threadID, event.messageID);
      }
    }

    // ইউজার ইনফো / স্ট্যাটস কমান্ড হ্যান্ডেল করা
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
      let wgInfo = targetUserData?.data?.wordguess || { count: 0, wins: 0, totalPlayed: 0, date: today };

      const totalPlayed = wgInfo.totalPlayed || 0;
      const totalWins = wgInfo.wins || 0;
      const totalLosses = totalPlayed - totalWins;
      const winRate = totalPlayed > 0 ? ((totalWins / totalPlayed) * 100).toFixed(1) : 0;
      
      const isTodayData = wgInfo.date === today;
      const todayPlayed = isTodayData ? wgInfo.count : 0;
      const leftToday = 15 - todayPlayed;

      const infoMsg = `📊 𝙒𝙊𝙍𝘿𝙶𝙐𝙀𝙎𝙎 𝙎𝙏𝘼𝙏𝙄𝙎𝙏𝙄𝘾𝙎 𝙄𝙉𝙁𝙊\n` +
                      `───────────────────────\n` +
                      `👤 𝐏𝐥𝐚𝐲𝐞𝐫: ${targetName}\n` +
                      `📅 𝐓𝐨𝐝𝐚𝐲'𝐬 𝐏𝐥𝐚𝐲𝐞𝐝: ${todayPlayed} / 15\n` +
                      `📌 𝐋𝐞𝐟𝐭 𝐓𝐨𝐝𝐚𝐲: ${leftToday} 𝐓𝐢𝐦𝐞𝐬\n` +
                      `🎮 𝐓𝐨𝐭𝐚𝐥 𝐏𝐥𝐚𝐲𝐞𝐝 (𝐀𝐥𝐥-𝐭𝐢𝐦𝐞): ${totalPlayed}\n` +
                      `🏆 𝐓𝐨𝐭𝐚𝐥 𝐖𝐢𝐧𝐬: ${totalWins}\n` +
                      `❌ 𝐓𝐨𝐭𝐚𝐥 𝐋𝐨𝐬𝐬𝐞𝐬: ${totalLosses >= 0 ? totalLosses : 0}\n` +
                      `📈 𝐖𝐢𝐧 𝐑𝐚𝐭𝐞: ${winRate}%\n` +
                      `───────────────────────\n` +
                      `✨ 𝙆𝙚𝙚𝙥 𝙥𝙡𝙖𝙮𝙞𝙣𝙜 & 𝙚𝙖𝙧𝙣 𝙢𝙤𝙧𝙚!`;

      return api.sendMessage(infoMsg, event.threadID, event.messageID);
    }

    // ইউজার ডাটা ফেচ এবং লিমিট চেক
    let currentUserData = await usersData.get(userId);
    let wgDataStore = currentUserData?.data?.wordguess || { count: 0, wins: 0, totalPlayed: 0, date: "" };

    if (wgDataStore.date !== today) {
      wgDataStore.count = 0;
      wgDataStore.date = today;
    }

    if (wgDataStore.count >= 15) {
      return api.sendMessage("🚫 | 𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 𝐫𝐞𝐚𝐜𝐡𝐞𝐝 𝐭𝐡𝐞 𝐥𝐢𝐦𝐢𝐭 𝐨𝐟 𝐩𝐥𝐚𝐲𝐢𝐧𝐠 𝟏𝟓 𝐰𝐨𝐫𝐝𝐠𝐮𝐞𝐬𝐬 𝐠𝐚𝐦𝐞𝐬 𝐭𝐨𝐝𝐚𝐲, 𝐛𝐚𝐛𝐲! 𝐂𝐨𝐦𝐞 𝐛𝐚𝐜𝐤 𝐭𝐨𝐦𝐨𝐫𝐫𝐨𝐰.", event.threadID, event.messageID);
    }

    wgDataStore.count += 1;
    wgDataStore.totalPlayed = (wgDataStore.totalPlayed || 0) + 1;

    currentUserData.data = currentUserData.data || {};
    currentUserData.data.wordguess = wgDataStore;
    await usersData.set(userId, { data: currentUserData.data });

    try {
      let wordData = null;
      const useMahmudApi = Math.random() < 0.5;

      if (useMahmudApi) {
        try {
          const apiUrl = await mahmud();
          if (apiUrl) {
            const res = await axios.get(`${apiUrl}/api/word/random`);
            if (res.data && res.data.word) {
              const rawWord = res.data.word;
              wordData = {
                question: shuffleWord(rawWord),
                answer: rawWord
              };
            }
          }
        } catch (err) {}
      }

      if (!wordData) {
        const response = await axios.get("https://azadx69x.is-a.dev/api/word");
        if (response.data && response.data.success && response.data.word) {
          wordData = {
            question: response.data.word.question,
            answer: response.data.word.answer
          };
        }
      }

      if (!wordData) {
        throw new Error("Failed to fetch word data from available APIs.");
      }

      const { question, answer: correctWord } = wordData;
      const namePlayerReact = await usersData.getName(userId);

      const gameMsg = `╭──✦ 𝙂𝙐𝙀𝙎𝙎 𝙏𝙃𝙀 𝙒𝙊𝙍𝘿\n` +
                      `├‣ 𝙌𝙪𝙚𝙨𝙩𝙞𝙤𝙣: "${question}"\n` +
                      `╰──────────────────‣\n` +
                      `𝚁𝚎𝚙𝚕𝚢 𝚝𝚘 𝚝𝚑𝚒𝚜 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚠𝚒𝚝𝚑 𝚢𝚘𝚞𝚛 𝚊𝚗𝚜𝚠𝚎𝚛.`;

      api.sendMessage(gameMsg, event.threadID, (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          type: "reply",
          commandName: this.config.name,
          author: userId,
          messageID: info.messageID,
          answer: correctWord.toLowerCase().trim(),
          nameUser: namePlayerReact,
          remainingLimit: 15 - wgDataStore.count
        });
      }, event.messageID);

    } catch (error) {
      console.error("❌ | Error occurred:", error);
      api.sendMessage(`❌ | ${error.response?.data?.message || error.message}`, event.threadID, event.messageID);
    }
  },

  onReply: async ({ event, api, Reply, usersData }) => {
    const { answer, author, messageID, remainingLimit } = Reply;
    
    if (event.senderID !== author)
      return api.sendMessage("Who are you bby🐸🦎", event.threadID, event.messageID);

    let userReply = formatText(event.body);

    let userData = await usersData.get(author);
    let wgDataStore = userData?.data?.wordguess || { count: 0, wins: 0, totalPlayed: 0, date: getTodayDate() };

    let resultMsg = "";
    if (userReply === answer) {
      wgDataStore.wins = (wgDataStore.wins || 0) + 1;

      let rewardCoins = 500;
      let rewardExp = 121;
      await usersData.set(author, {
        money: userData.money + rewardCoins,
        exp: userData.exp + rewardExp,
        data: { ...userData.data, wordguess: wgDataStore },
      });
      resultMsg = `✅ | 𝙲𝚘𝚛𝚛𝚎𝚌𝚝 𝚊𝚗𝚜𝚠𝚎𝚛 𝚋𝚊𝚋𝚢! 𝚈𝚘𝚞 𝚎𝚊𝚛𝚗𝚎𝚍 ${rewardCoins} 𝚌𝚘𝚒𝚗𝚜 💰 & ${rewardExp} 𝚎𝙭𝚙 🌟\n📌 Left today: ${remainingLimit}`;
    } else {
      await usersData.set(author, {
        data: { ...userData.data, wordguess: wgDataStore },
      });
      resultMsg = `❌ | 𝚆𝚛𝚘𝚗𝚐 𝚊𝚗𝚜𝚠𝚎𝚛 𝚋𝚊𝚋𝚢! 𝚃𝚑𝚎 𝚌𝚘𝚛𝚛𝚎𝚌𝚝 𝚊𝚗𝚜𝚠𝚎𝚛 𝙬𝚊𝚜: ${answer.toUpperCase()}\n📌 Left today: ${remainingLimit}`;
    }

    api.editMessage(resultMsg, messageID, () => {
      global.GoatBot.onReply.delete(messageID);
    });

    try {
      api.unsendMessage(event.messageID);
    } catch (e) {}
  }
};