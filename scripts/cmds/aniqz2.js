const axios = require("axios");
const moment = require("moment-timezone");

const getTodayDate = () => {
    return moment().tz("Asia/Dhaka").format("YYYY-MM-DD");
};

const mahmudApiUrl = async () => {
    try {
        const res = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return res.data.mahmud;
    } catch (e) {
        return null;
    }
};

module.exports = {
    config: {
        name: "aniqz2",
        aliases: ["animeqz2"],
        version: "7.0",
        author: "Bokkor x69",
        countDown: 0,
        role: 0,
        description: {
            bn: "𝙖𝙣𝙞𝙢𝙚 𝙦𝙪𝙞𝙯 𝙆𝙝𝙚𝙡𝙚 𝙘𝙤𝙮𝙚𝙣 𝙚𝙗𝙤𝙣𝙜 𝙚𝙭𝙥 𝙟𝙞𝙩𝙪𝙣",
            en: "𝙋𝙡𝙖𝙮 𝙖𝙣𝙞𝙢𝙚 𝙦𝙪𝙞𝙯 𝙩𝙤 𝙬𝙞𝙣 𝙘𝙤𝙞𝙣𝙨 𝙖𝙣𝙙 𝙚𝙭𝙥",
            vi: "𝘾𝙝𝙤̛𝙞 đố 𝙫𝙪𝙞 𝙖𝙣𝙞𝙢𝙚 để 𝙜𝙞à𝙣𝙝 đượ𝙘 𝙭𝙪 và 𝙚𝙭𝙥"
        },
        category: "game",
        guide: {
            bn: "  {pn} | {pn} en | {pn} reset | {pn} info | {pn} top",
            en: "  {pn} | {pn} en | {pn} reset | {pn} info | {pn} top",
            vi: "  {pn} | {pn} en | {pn} reset | {pn} info | {pn} top"
        }
    },

    langs: {
        bn: {
            reply: "𝙧𝙚𝙥𝙡𝙮 𝙩𝙤 𝙩𝙝𝙞𝙨 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙬𝙞𝙩𝙝 𝙮𝙤𝙪𝙧 𝙖𝙣𝙨𝙬𝙚𝙧.",
            correct: "✅ | 𝙘𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮! 𝙮𝙤𝙪 𝙚𝙖𝙧𝙣𝙚𝙙 %1 𝙘𝙤𝙞𝙣𝙨 💰 & %2 𝙚𝙭𝙥 🌟\n📌 𝙡𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %3",
            wrong: "❌ | 𝙬𝙧𝙤𝙣𝙜 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮! 𝙩𝙝𝙚 𝙘𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙬𝙖𝙨: %1\n📌 𝙡𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %2",
            notYour: "𝙬𝙝𝙤 𝙖𝙧𝙚 𝙮𝙤𝚞 𝙗𝙗𝙮🐸🦎",
            error: "❌ | %1"
        },
        en: {
            reply: "𝙧𝙚𝙥𝙡𝙮 𝙩𝙤 𝙩𝙝𝙞𝙨 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙬𝙞𝙩𝙝 𝙮𝙤𝙪𝙧 𝙖𝙣𝙨𝙬𝙚𝙧.",
            correct: "✅ | 𝙘𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮! 𝙮𝙤𝙪 𝙚𝙖𝙧𝙣𝙚𝙙 %1 𝙘𝙤𝙞𝙣𝙨 💰 & %2 𝙚𝙭𝙥 🌟\n📌 𝙡𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %3",
            wrong: "❌ | 𝙬𝙧𝙤𝙣𝙜 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮! 𝙩𝙝𝙚 𝙘𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙬𝙖𝙨: %1\n📌 𝙡𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %2",
            notYour: "𝙬𝙝𝙤 𝙖𝙧𝙚 𝙮𝙤𝚞 𝙗𝙗𝙮🐸🦎",
            error: "❌ | %1"
        },
        vi: {
            reply: "𝙧𝙚𝙥𝙡𝙮 𝙩𝙤 𝙩𝙝𝙞𝙨 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙬𝙞𝙩𝙝 𝙮𝙤𝙪𝙧 𝙖𝙣𝙨𝙬𝙚𝙧.",
            correct: "✅ | 𝙘𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮! 𝙮𝙤𝙪 𝙚𝙖𝙧𝙣𝙚𝙙 %1 𝙘𝙤𝙞𝙣𝙨 💰 & %2 𝙚𝙭𝙥 🌟\n📌 𝙡𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %3",
            wrong: "❌ | 𝙬𝙧𝙤𝙣𝙜 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮! 𝙩𝙝𝙚 𝙘𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙬𝙖𝙨: %1\n📌 𝙡𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %2",
            notYour: "𝙬𝙝𝙤 𝙖𝙧𝙚 𝙮𝙤𝚞 𝙗𝙗𝙮🐸🦎",
            error: "❌ | %1"
        }
    },

    onStart: async function ({ api, event, usersData, args, getLang }) {
        const userId = event.senderID;
        const today = getTodayDate();
        const action = args[0]?.toLowerCase();

        if (action === "reset") {
            const adminIDs = ["61558455297317", ...(global.config?.ADMINBOT || []), ...(global.config?.ownerBot || [])];
            
            if (!adminIDs.includes(userId)) {
                return api.sendMessage("❌ | 𝙤𝙣𝙡𝙮 𝙤𝙬𝙣𝙚𝙧 𝙘𝙖𝙣 𝙧𝙚𝙨𝙚𝙩 𝙩𝙝𝙚 𝙦𝙪𝙞𝙯 𝙡𝙞𝙢𝙞𝙩, 𝙗𝙖𝙗𝙮!", event.threadID, event.messageID);
            }

            let targetID = userId;
            if (event.type === "message_reply") {
                targetID = event.messageReply.senderID;
            } else if (Object.keys(event.mentions).length > 0) {
                targetID = Object.keys(event.mentions)[0];
            }

            let targetUserData = await usersData.get(targetID);
            let targetName = "𝙪𝙨𝙚𝙧";
            try {
                targetName = await usersData.getName(targetID);
            } catch (e) {}

            if (targetUserData && targetUserData.data) {
                targetUserData.data.aniqz2 = targetUserData.data.aniqz2 || {};
                targetUserData.data.aniqz2.count = 0;
                targetUserData.data.aniqz2.date = today;
                await usersData.set(targetID, { data: targetUserData.data });

                return api.sendMessage(`✅ | 𝙦𝙪𝙞𝙯 𝙡𝙞𝙢𝙞𝙩 𝙝𝙖𝙨 𝙗𝙚𝙚𝙣 𝙧𝙚𝙨𝙚𝙩 𝙩𝙤 𝟎 𝙛𝙤𝙧 **${targetName}** ✨`, event.threadID, event.messageID);
            } else {
                return api.sendMessage("❌ | 𝙣𝙤 𝙖𝙘𝙩𝙞𝙫𝙚 𝙡𝙞𝙢𝙞𝙩 𝙙𝙖𝙩𝙖 𝙛𝙤𝙪𝙣𝙙 𝙛𝙤𝙧 𝙩𝙝𝙞𝙨 𝙪𝙨𝙚𝙧 𝙩𝙤𝙙𝙖𝙮.", event.threadID, event.messageID);
            }
        }

        if (action === "info" || action === "stats") {
            let targetID = userId;
            if (event.type === "message_reply") {
                targetID = event.messageReply.senderID;
            } else if (Object.keys(event.mentions).length > 0) {
                targetID = Object.keys(event.mentions)[0];
            }

            let targetName = "𝙪𝙨𝙚𝙧";
            try {
                targetName = await usersData.getName(targetID);
            } catch (e) {}

            let targetUserData = await usersData.get(targetID);
            let quizInfo = targetUserData?.data?.aniqz2 || { count: 0, wins: 0, totalPlayed: 0, date: today };

            const totalPlayed = quizInfo.totalPlayed || 0;
            const totalWins = quizInfo.wins || 0;
            const totalLosses = totalPlayed - totalWins;
            const winRate = totalPlayed > 0 ? ((totalWins / totalPlayed) * 100).toFixed(1) : 0;
            
            const isTodayData = quizInfo.date === today;
            const todayPlayed = isTodayData ? quizInfo.count : 0;
            const leftToday = 15 - todayPlayed;

            const infoMsg = `📊 𝙖𝙣𝙞𝙢𝙚 𝙦𝙪𝙞𝙯 𝙨𝙩𝙖𝙩𝙨 𝙞𝙣𝙛𝙤\n` +
                            `───────────────────────\n` +
                            `👤 𝙥𝙡𝙖𝙮𝙚𝙧: ${targetName}\n` +
                            `📅 𝙩𝙤𝙙𝙖𝙮'𝙨 𝙥𝙡𝙖𝙮𝙚𝙙: ${todayPlayed} / 15\n` +
                            `📌 𝙡𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: ${leftToday} 𝙩𝙞𝙢𝙚𝙨\n` +
                            `🎮 𝙩𝙤𝙩𝙖𝙡 𝙥𝙡𝙖𝙮𝙚𝙙 (𝙖𝙡𝙡-𝙩𝙞𝙢𝙚): ${totalPlayed}\n` +
                            `🏆 𝙩𝙤𝙩𝙖𝙡 𝙬𝙞𝙣𝙨: ${totalWins}\n` +
                            `❌ 𝙩𝙤𝙩𝙖𝙡 𝙡𝙤𝙨𝙨𝙚𝙨: ${totalLosses >= 0 ? totalLosses : 0}\n` +
                            `📈 𝙬𝙞𝙣 𝙧𝙖𝙩𝙚: ${winRate}%\n` +
                            `───────────────────────\n` +
                            `✨ 𝙠𝙚𝙚𝙥 𝙥𝙡𝙖𝙮𝙞𝙣𝙜 & 𝙚𝙖𝙧𝙣 𝙢𝙤𝙧𝙚!`;

            return api.sendMessage(infoMsg, event.threadID, event.messageID);
        }

        if (action === "top" || action === "leaderboard") {
            try {
                const allUsers = await usersData.getAll();
                const sortedUsers = [];

                for (const u of allUsers) {
                    if (u.data && u.data.aniqz2 && typeof u.data.aniqz2.wins === "number" && u.data.aniqz2.wins > 0) {
                        let name = "𝙪𝙨𝙚𝙧";
                        try {
                            name = await usersData.getName(u.userID) || "𝙪𝙨𝙚𝙧";
                        } catch (e) {}

                        sortedUsers.push({
                            name,
                            wins: u.data.aniqz2.wins,
                            total: u.data.aniqz2.totalPlayed || 0
                        });
                    }
                }

                sortedUsers.sort((a, b) => b.wins - a.wins);
                const top10 = sortedUsers.slice(0, 10);

                if (top10.length === 0) {
                    return api.sendMessage("⚠️ | 𝙣𝙤 𝙡𝙚𝙖𝙙𝙚𝙧𝙗𝙤𝙖𝙧𝙙 𝙙𝙖𝙩𝙖 𝙛𝙤𝙪𝙣𝙙 𝙮𝙚𝙩, 𝙗𝙖𝙗𝙮!", event.threadID, event.messageID);
                }

                let msg = `🏆 𝙖𝙣𝙞𝙢𝙚 𝙦𝙪𝙞𝙯 𝙩𝙤𝙥 𝟭𝟬 𝙡𝙚𝙖𝙙𝙚𝙧𝙗𝙤𝙖𝙧𝙙 🏆\n───────────────────────\n`;
                top10.forEach((user, index) => {
                    msg += `${index + 1}. ${user.name} ➔ 🏆 𝙬𝙞𝙣𝙨: ${user.wins} | 🎮 𝙥𝙡𝙖𝙮𝙚𝙙: ${user.total}\n`;
                });
                msg += `───────────────────────\n✨ 𝙥𝙤𝙬𝙚𝙧𝙚𝙙 𝙗𝙮 𝙗𝙤𝙠𝙠𝙤𝙧 𝙭𝟲𝟵`;

                return api.sendMessage(msg, event.threadID, event.messageID);
            } catch (err) {
                return api.sendMessage("❌ | 𝙛𝙖𝙞𝙡𝙚𝙙 𝙩𝙤 𝙡𝙤𝙖𝙙 𝙡𝙚𝙖𝙙𝙚𝙧𝙗𝙤𝙖𝙧𝙙, 𝙗𝙖𝙗𝙮!", event.threadID, event.messageID);
            }
        }

        let currentUserData = await usersData.get(userId);
        let quizDataStore = currentUserData?.data?.aniqz2 || { count: 0, wins: 0, totalPlayed: 0, date: "" };

        if (quizDataStore.date !== today) {
            quizDataStore.count = 0;
            quizDataStore.date = today;
        }

        if (quizDataStore.count >= 15) {
            return api.sendMessage("🚫 | 𝙮𝙤𝙪 𝙝𝙖𝙫𝙚 𝙧𝙚𝙖𝙘𝙝𝙚𝙙 𝙩𝙝𝙚 𝙡𝙞𝙢𝙞𝙩 𝙤𝙛 𝙥𝙡𝙖𝙮𝙞𝙣𝙜 𝟭𝟓 𝙖𝙣𝙞𝙢𝙚 𝙦𝙪𝙞𝙯𝙯𝙚𝙨 𝙩𝙤𝙙𝙖𝙮, 𝙗𝙖𝙗𝙮! 𝙘𝙤𝙢𝙚 𝙗𝙖𝙘𝙠 𝙩𝙤𝙢𝙤𝙧𝙧𝙤𝙬.", event.threadID, event.messageID);
        }

        quizDataStore.count += 1;
        quizDataStore.totalPlayed = (quizDataStore.totalPlayed || 0) + 1;

        currentUserData.data = currentUserData.data || {};
        currentUserData.data.aniqz2 = quizDataStore;
        await usersData.set(userId, { data: currentUserData.data });

        try {
            const input = args[0]?.toLowerCase() || "bn";
            const category = (input === "en" || input === "english") ? "english" : "bangla";

            const apiUrl = await mahmudApiUrl();
            if (!apiUrl) return api.sendMessage("❌ 𝙖𝙥𝙞 𝙪𝙧𝙡 𝙣𝙤𝙩 𝙛𝙤𝙪𝙣𝙙!", event.threadID, event.messageID);

            const res = await axios.get(`${apiUrl}/api/aniqz2?category=${category}`);
            const quiz = res.data?.data || res.data;

            if (!quiz || !quiz.question) return api.sendMessage("× 𝙣𝙤 𝙦𝙪𝙞𝙯 𝙖𝙫𝙖𝙞𝙡𝙖𝙗𝙡𝙚 𝙗𝙖𝙗𝙮.", event.threadID, event.messageID);

            const { question, correctAnswer, options } = quiz;
            const { a, b, c, d } = options;
            const remainingLimit = 15 - quizDataStore.count;

            const quizMsg = `╭──✦ ${question}\n`
                + `├‣ 𝗔) ${a}\n`
                + `├‣ 𝗕) ${b}\n`
                + `├‣ 𝗖) ${c}\n`
                + `├‣ 𝗗) ${d}\n`
                + `╰──────────────────‣\n`
                + `${getLang("reply")}\n`
                + `📌 𝙡𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: ${remainingLimit}`;

            api.sendMessage(quizMsg, event.threadID, (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    type: "reply",
                    commandName: this.config.name,
                    author: userId,
                    messageID: info.messageID,
                    correctAnswer,
                    remainingLimit
                });
            }, event.messageID);

        } catch (error) {
            api.sendMessage(getLang("error", error.message), event.threadID, event.messageID);
        }
    },

    onReply: async function ({ event, api, Reply, usersData, getLang }) {
        const { correctAnswer, author, messageID, remainingLimit } = Reply;
        if (event.senderID !== author) return api.sendMessage(getLang("notYour"), event.threadID, event.messageID);

        let userReply = event.body.trim().toLowerCase();
        userReply = userReply.replace(/^[a-d]\.\s*/, '');
        const correct = correctAnswer.toLowerCase();
        
        let userData = await usersData.get(author);
        let quizDataStore = userData?.data?.aniqz2 || { count: 0, wins: 0, totalPlayed: 0, date: getTodayDate() };

        const rewardCoins = 500;
        const rewardExp = 121;
        let resultMsg = "";

        if (userReply === correct || userReply === correct[0]) {
            quizDataStore.wins = (quizDataStore.wins || 0) + 1;
            
            await usersData.set(author, {
                money: userData.money + rewardCoins,
                exp: userData.exp + rewardExp,
                data: { ...userData.data, aniqz2: quizDataStore }
            });
            resultMsg = getLang("correct", rewardCoins, rewardExp, remainingLimit);
        } else {
            await usersData.set(author, {
                data: { ...userData.data, aniqz2: quizDataStore }
            });
            resultMsg = getLang("wrong", correctAnswer.toUpperCase(), remainingLimit);
        }

        api.editMessage(resultMsg, messageID, () => {
            global.GoatBot.onReply.delete(messageID);
        });

        try {
            api.unsendMessage(event.messageID);
        } catch (e) {}
    }
};