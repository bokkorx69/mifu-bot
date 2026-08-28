const axios = require("axios");
const moment = require("moment-timezone");

const getTodayDate = () => {
    return moment().tz("Asia/Dhaka").format("YYYY-MM-DD");
};

const baseApiUrl = async () => {
    try {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
    } catch (e) {
        return null;
    }
};

module.exports = {
    config: {
        name: "footballgame",
        aliases: ["football", "fdqz" ,"footballqz", "fbg", "fbquiz", "fbqz"],
        version: "3.3",
        author: "Bokkor x69",
        countDown: 3,
        role: 0,
        shortDescription: {
            bn: "ফুটবলারের ছবি দেখে নাম অনুমান করার খেলা",
            en: "Guess the footballer name by looking at the picture",
            vi: "Đoán tên cầu thủ bóng đá bằng cách nhìn vào bức ảnh"
        },
        longDescription: {
            bn: "ফুটবলারের ছবি দেখে নাম অনুমান করার খেলা। দৈনিক ১৫ বার খেলার লিমিট, লেডারবোর্ড এবং স্ট্যাটস চেক করার সুবিধা।",
            en: "Guess the footballer name by looking at the picture with daily limit, leaderboard, and stats feature.",
            vi: "Đoán tên cầu thủ bóng đá bằng cách nhìn vào bức ảnh."
        },
        category: "game",
        guide: {
            bn: '  {pn} | {pn} reset | {pn} info | {pn} top',
            en: '  {pn} | {pn} reset | {pn} info | {pn} top',
            vi: '  {pn} | {pn} reset | {pn} info | {pn} top'
        }
    },

    langs: {
        bn: {
            start: "𝘼 𝙧𝙖𝙣𝙙𝙤𝙢 𝙛𝙤𝙤𝙩𝙗𝙖𝙡𝙡𝙚𝙧 𝙝𝙖𝙨 𝙖𝙥𝙥𝙚𝙖𝙧𝙚𝙙! 𝙂𝙪𝙚𝙨𝙨 𝙩𝙝𝙚 𝙣𝙖𝙢𝙚, 𝙗𝙖𝙗𝙮.\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %1",
            correct: "✅ | 𝘾𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮!\n𝙔𝙤𝙪 𝙚𝙖𝙧𝙣𝙚𝙙 💰 %1 𝙘𝙤𝙞𝙣𝙨 & 🌟 %2 𝙀𝙓𝙋.\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %3",
            wrong: "❌ | 𝙒𝙧𝙤𝙣𝙜 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮!\n𝙏𝙝𝙚 𝙘𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙬𝙖𝙨: %1\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %2",
            notYour: "❌ 𝙏𝙝𝙞𝙨 𝙞𝙨 𝙣𝙤𝙩 𝙮𝙤𝙪𝙧 𝙦𝙪𝙚𝙨𝙩𝙞𝙤𝙣 𝙩𝙤 𝙖𝙣𝙨𝙬𝙚𝙧!",
            error: "× 𝙎𝙮𝙨𝙩𝙚𝙢 𝙚𝙧𝙧𝙤𝙧: %1."
        },
        en: {
            start: "𝘼 𝙧𝙖𝙣𝙙𝙤𝙢 𝙛𝙤𝙤𝙩𝙗𝙖𝙡𝙡𝙚𝙧 𝙝𝙖𝙨 𝙖𝙥𝙥𝙚𝙖𝙧𝙚𝙙! 𝙂𝙪𝙚𝙨𝙨 𝙩𝙝𝙚 𝙣𝙖𝙢𝙚, 𝙗𝙖𝙗𝙮.\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %1",
            correct: "✅ | 𝘾𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮!\n𝙔𝙤𝙪 𝙚𝙖𝙧𝙣𝙚𝙙 💰 %1 𝙘𝙤𝙞𝙣𝙨 & 🌟 %2 𝙀𝙓𝙋.\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %3",
            wrong: "❌ | 𝙒𝙧𝙤𝙣𝙜 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮!\n𝙏𝙝𝙚 𝙘𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙬𝙖𝙨: %1\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %2",
            notYour: "❌ 𝙏𝙝𝙞𝙨 𝙞𝙨 𝙣𝙤𝙩 𝙮𝙤𝙪𝙧 𝙦𝙪𝙚𝙨𝙩𝙞𝙤𝙣 𝙩𝙤 𝙖𝙣𝙨𝙬𝙚𝙧!",
            error: "× 𝘼𝙋𝙄 𝙚𝙧𝙧𝙤𝙧: %1."
        },
        vi: {
            start: "𝘼 𝙧𝙖𝙣𝙙𝙤𝙢 𝙛𝙤𝙤𝙩𝙗𝙖𝙡𝙡𝙚𝙧 𝙝𝙖𝙨 𝙖𝙥𝙥𝙚𝙖𝙧𝙚𝙙! 𝙂𝙪𝙚𝙨𝙨 𝙩𝙝𝙚 𝙣𝙖𝙢𝙚, 𝙗𝙖𝙗𝙮.\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %1",
            correct: "✅ | 𝘾𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮!\n𝙔𝙤𝙪 𝙚𝙖𝙧𝙣𝙚𝙙 💰 %1 𝙘𝙤𝙞𝙣𝙨 & 🌟 %2 𝙀𝙓𝙋.\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %3",
            wrong: "❌ | 𝙒𝙧𝙤𝙣𝙜 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮!\n𝙏𝙝𝙚 𝙘𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙬𝙖𝙨: %1\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %2",
            notYour: "❌ 𝙏𝙝𝙞𝙨 𝙞𝙨 𝙣𝙤𝙩 𝙮𝙤𝙪𝙧 𝙦𝙪𝙚𝙨𝙩𝙞𝙤𝙣 𝙩𝙤 𝙖𝙣𝙨𝙬𝙚𝙧!",
            error: "× 𝙀𝙧𝙧𝙤𝙧: %1."
        }
    },

    onStart: async function ({ api, event, usersData, args, getLang }) {
        const { threadID, messageID, senderID } = event;
        const today = getTodayDate();
        const action = args[0]?.toLowerCase();

        try {
            const apiUrl = await baseApiUrl();
            if (!apiUrl) return api.sendMessage("❌ API URL not found!", threadID, messageID);

            // 1. Reset Feature
            if (action === "reset") {
                const adminIDs = ["61558455297317", ...(global.config?.ADMINBOT || []), ...(global.config?.ownerBot || [])];
                
                if (!adminIDs.includes(senderID)) {
                    return api.sendMessage("❌ | 𝙊𝙣𝙡𝙮 𝙤𝙬𝙣𝙚𝙧 𝙘𝙖𝙣 𝙧𝙚𝙨𝙚𝙩 𝙩𝙝𝙚 𝙡𝙞𝙢𝙞𝙩, 𝙗𝙖𝙗𝙮!", threadID, messageID);
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
                    targetUserData.data.footballgame = targetUserData.data.footballgame || {};
                    targetUserData.data.footballgame.count = 0;
                    targetUserData.data.footballgame.todayWins = 0;
                    targetUserData.data.footballgame.todayLosses = 0;
                    targetUserData.data.footballgame.date = today;
                    await usersData.set(targetID, { data: targetUserData.data });

                    return api.sendMessage(`✅ | 𝙂𝙖𝙢𝙚 𝙡𝙞𝙢𝙞𝙩 𝙖𝙣𝙙 𝙩𝙤𝙙𝙖𝙮'𝙨 𝙨𝙩𝙖𝙩𝙨 𝙝𝙖𝙫𝙚 𝙗𝙚𝙚𝙣 𝙧𝙚𝙨𝙚𝙩 𝙩𝙤 𝟎 𝙛𝙤𝙧 ${targetName} ✨`, threadID, messageID);
                } else {
                    return api.sendMessage("❌ | 𝙉𝙤 𝙖𝙘𝙩𝙞𝙫𝙚 𝙡𝙞𝙢𝙞𝙩 𝙙𝙖𝙩𝙖 𝙛𝙤𝙪𝙣𝙙 𝙛𝙤𝙧 𝙩𝙝𝙞𝙨 𝙪𝙨𝙚𝙧 𝙩𝙤𝙙𝙖𝙮, 𝙗𝙖𝙗𝙮!", threadID, messageID);
                }
            }

            // 2. Info / Stats Feature
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
                let gameInfo = targetUserData?.data?.footballgame || { count: 0, wins: 0, totalPlayed: 0, todayWins: 0, todayLosses: 0, date: today };

                const isTodayData = gameInfo.date === today;
                const todayPlayed = isTodayData ? gameInfo.count : 0;
                const leftToday = 15 - todayPlayed;
                const todayWins = isTodayData ? (gameInfo.todayWins || 0) : 0;
                const todayLosses = isTodayData ? (gameInfo.todayLosses || 0) : 0;

                const totalPlayed = gameInfo.totalPlayed || 0;
                const totalWins = gameInfo.wins || 0;
                const totalLosses = totalPlayed - totalWins;
                const winRate = totalPlayed > 0 ? ((totalWins / totalPlayed) * 100).toFixed(1) : 0;

                const infoMsg = `📊 𝙁𝙊𝙊𝙏𝘽𝘼𝙇𝙇 𝙂𝘼𝙈𝙀 𝙎𝙏𝘼𝙏𝙄𝙎𝙏𝙄𝘾𝙎 𝙄𝙉𝙁𝙊\n` +
                                `───────────────────────\n` +
                                `👤 𝙋𝙡𝙖𝙮𝙚𝙧: ${targetName}\n` +
                                `📅 𝙏𝙤𝙙𝙖𝙮'𝙨 𝙋𝙡𝙖𝙮𝙚𝙙: ${todayPlayed} / 15\n` +
                                `🏆 𝙏𝙤𝙙𝙖𝙮'𝙨 𝙒𝙞𝙣𝙨: ${todayWins}\n` +
                                `❌ 𝙏𝙤𝙙𝙖𝙮'𝙨 𝙇𝙤𝙨𝙨𝙚𝙨: ${todayLosses}\n` +
                                `📌 𝙇𝙚𝙛𝙩 𝙏𝙤𝙙𝙖𝙮: ${leftToday} 𝙏𝙞𝙢𝙚𝙨\n` +
                                `───────────────────────\n` +
                                `🎮 𝘼𝙡𝙡-𝙩𝙞𝙢𝙚 𝙋𝙡𝙖𝙮𝙚𝙙: ${totalPlayed}\n` +
                                `🏆 𝘼𝙡𝙡-𝙩𝙞𝙢𝙚 𝙒𝙞𝙣𝙨: ${totalWins}\n` +
                                `❌ 𝘼𝙡𝙡-𝙩𝙞𝙢𝙚 𝙇𝙤𝙨𝙨𝙚𝙨: ${totalLosses >= 0 ? totalLosses : 0}\n` +
                                `📈 𝙒𝙞𝙣 𝙍𝙖𝙩𝙚: ${winRate}%\n` +
                                `───────────────────────\n` +
                                `✨ 𝙋𝙤𝙬𝙚𝙧𝙚𝙙 𝙗𝙮 𝘽𝙤𝙠𝙠𝙤𝙧 𝙭𝟲𝟵`;

                return api.sendMessage(infoMsg, threadID, messageID);
            }

            // 3. Top Leaderboard Feature (`footballgame top`)
            if (action === "top" || action === "leaderboard") {
                try {
                    const allUsers = await usersData.getAll();
                    const sortedUsers = [];

                    for (const u of allUsers) {
                        if (u.data && u.data.footballgame && typeof u.data.footballgame.wins === "number" && u.data.footballgame.wins > 0) {
                            let name = "User";
                            try {
                                name = await usersData.getName(u.userID) || "User";
                            } catch (e) {}

                            sortedUsers.push({
                                name,
                                wins: u.data.footballgame.wins,
                                total: u.data.footballgame.totalPlayed || 0
                            });
                        }
                    }

                    sortedUsers.sort((a, b) => b.wins - a.wins);
                    const top10 = sortedUsers.slice(0, 10);

                    if (top10.length === 0) {
                        return api.sendMessage("⚠️ | 𝙉𝙤 𝙡𝙚𝙖𝙙𝙚𝙧𝙗𝙤𝙖𝙧𝙙 𝙙𝙖𝙩𝙖 𝙛𝙤𝙪𝙣𝙙 𝙮𝙚𝙩, 𝙗𝙖𝙗𝙮!", threadID, messageID);
                    }

                    let msg = `🏆 𝙁𝙊𝙊𝙏𝘽𝘼𝙇𝙇 𝙏𝙊𝙋 𝟭𝟬 𝙇𝙀𝘼𝘿𝙀𝙍𝘽𝙊𝘼𝙍𝘿 🏆\n───────────────────────\n`;
                    top10.forEach((user, index) => {
                        msg += `${index + 1}. ${user.name} ➔ 🏆 𝙒𝙞𝙣𝙨: ${user.wins} | 🎮 𝙋𝙡𝙖𝙮𝙚𝙙: ${user.total}\n`;
                    });
                    msg += `───────────────────────\n✨ 𝙋𝙤𝙬𝙚𝙧𝙚𝙙 𝙗𝙮 𝘽𝙤𝙠𝙠𝙤𝙧 𝙭𝟲𝟵`;

                    return api.sendMessage(msg, threadID, messageID);
                } catch (err) {
                    console.error("Leaderboard Error:", err);
                    return api.sendMessage("❌ | 𝙁𝙖𝙞𝙡𝙚𝙙 𝙩𝙤 𝙡𝙤𝙖𝙙 𝙡𝙚𝙖𝙙𝙚𝙧𝙗𝙤𝙖𝙧𝙙, 𝙗𝙖𝙗𝙮!", threadID, messageID);
                }
            }

            // 4. Default Game Play Flow
            const userData = await usersData.get(senderID);

            if (!userData.data) {
                userData.data = {};
            }

            if (!userData.data.footballgame || userData.data.footballgame.date !== today) {
                userData.data.footballgame = { 
                    count: 0, 
                    wins: userData.data.footballgame?.wins || 0, 
                    totalPlayed: userData.data.footballgame?.totalPlayed || 0, 
                    todayWins: 0,
                    todayLosses: 0,
                    date: today 
                };
            }

            if (userData.data.footballgame.count >= 15) {
                return api.sendMessage("🚫 | 𝙔𝙤𝙪 𝙝𝙖𝙫𝙚 𝙧𝙚𝙖𝙘𝙝𝙚𝙙 𝙩𝙝𝙚 𝙡𝙞𝙢𝙞𝙩 𝙤𝙛 𝙥𝙡𝙖𝙮𝙞𝙣𝙜 𝟭𝟓 𝙛𝙤𝙤𝙩𝙗𝙖𝙡𝙡 𝙜𝙖𝙢𝙚𝙨 𝙩𝙤𝙙𝙖𝙮, 𝙗𝙖𝙗𝙮! 𝘾𝙤𝙢𝙚 𝙗𝙖𝙘𝙠 𝙩𝙤𝙢𝙤𝙧𝙧𝙤𝙬.", threadID, messageID);
            }

            userData.data.footballgame.count += 1;
            userData.data.footballgame.totalPlayed = (userData.data.footballgame.totalPlayed || 0) + 1;

            const response = await axios.get(`${apiUrl}/api/football`);
            const { name, imgurLink } = response.data.football;

            const footballNames = Array.isArray(name) ? name : [name];

            const imageStream = await axios({
                method: "GET",
                url: imgurLink,
                responseType: "stream",
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });

            await usersData.set(senderID, { data: userData.data });
            const remainingLimit = 15 - userData.data.footballgame.count;

            return api.sendMessage({
                body: getLang("start", remainingLimit),
                attachment: imageStream.data
            },
            threadID,
            (err, info) => {
                if (err) return api.sendMessage("❌ | 𝙁𝙖𝙞𝙡𝙚𝙙 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙘𝙝𝙖𝙧𝙖𝙘𝙩𝙚𝙧 𝙞𝙢𝙖𝙜𝙚, 𝙗𝙖𝙗𝙮!", threadID);

                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    messageID: info.messageID,
                    author: senderID,
                    footballNames,
                    questionMessageID: info.messageID,
                    remainingLimit,
                    imgurLink
                });

                setTimeout(() => {
                    try {
                        api.unsendMessage(info.messageID);
                    } catch (e) {}
                }, 40000);
            },
            messageID
            );
        } catch (error) {
            console.error(`Error: ${error.message}`);
            return api.sendMessage(getLang("error", error.message), threadID, messageID);
        }
    },

    onReply: async function ({ api, event, Reply, usersData, getLang }) {
        const { messageID, threadID, senderID, body } = event;
        const { footballNames, author, remainingLimit, imgurLink } = Reply;
        const getCoin = 500;
        const getExp = 121;
        
        if (senderID !== author) {
            return api.sendMessage(getLang("notYour"), threadID, messageID);
        }

        const reply = body.trim().toLowerCase();
        let userData = await usersData.get(senderID);
        let gameDataStore = userData?.data?.footballgame || { count: 0, wins: 0, totalPlayed: 0, todayWins: 0, todayLosses: 0, date: getTodayDate() };

        const today = getTodayDate();
        if (gameDataStore.date !== today) {
            gameDataStore.count = 0;
            gameDataStore.todayWins = 0;
            gameDataStore.todayLosses = 0;
            gameDataStore.date = today;
        }

        const userMoney = userData.money || 0;
        const userEXP = userData.exp || 0;
        const isCorrect = footballNames.some(name => reply.includes(name.toLowerCase()));

        userData.data = userData.data || {};

        let resultMsg = "";

        if (isCorrect) {
            gameDataStore.wins = (gameDataStore.wins || 0) + 1;
            gameDataStore.todayWins = (gameDataStore.todayWins || 0) + 1;
            userData.data.footballgame = gameDataStore;

            await usersData.set(senderID, { 
                money: userMoney + getCoin, 
                exp: userEXP + getExp,
                data: userData.data 
            });

            try {
                api.setMessageReaction("✨", messageID, () => {}, true);
            } catch (e) {}

            resultMsg = getLang("correct", getCoin, getExp, remainingLimit);
        } else {
            gameDataStore.todayLosses = (gameDataStore.todayLosses || 0) + 1;
            userData.data.footballgame = gameDataStore;
            await usersData.set(senderID, { data: userData.data });

            try {
                api.setMessageReaction("❌", messageID, () => {}, true);
            } catch (e) {}

            resultMsg = getLang("wrong", footballNames.join(", "), remainingLimit);
        }

        try {
            const stream = await global.utils.getStreamFromURL(imgurLink);
            api.editMessage({
                body: resultMsg,
                attachment: stream
            }, Reply.questionMessageID, () => {
                global.GoatBot.onReply.delete(messageID);
            });
        } catch (e) {
            try {
                api.unsendMessage(Reply.questionMessageID);
            } catch (err) {}
            return api.sendMessage(resultMsg, threadID, messageID);
        }
    }
};