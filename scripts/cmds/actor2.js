const axios = require("axios");
const moment = require("moment-timezone");

const getTodayDate = () => {
  return moment().tz("Asia/Dhaka").format("YYYY-MM-DD");
};

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "actor",
                aliases: ["actorgame"],
                version: "2.5",
                author: "Bokkor x69",
                countDown: 0,
                role: 0,
                shortDescription: {
                        bn: "অভিনেতার ছবি দেখে নাম অনুমান করার খেলা",
                        en: "Guess the actor name by looking at the picture",
                        vi: "Đoán tên diễn viên bằng cách nhìn vào bức ảnh"
                },
                longDescription: {
                        bn: "অভিনেতার ছবি দেখে নাম অনুমান করার খেলা। দৈনিক ১৫ বার খেলার লিমিট।",
                        en: "Guess the actor name by looking at the picture. Play limit of 15 times per day.",
                        vi: "Đoán tên diễn viên bằng cách nhìn vào bức ảnh."
                },
                category: "game",
                guide: {
                        bn: '   {pn} | {pn} reset | {pn} info',
                        en: '   {pn} | {pn} reset | {pn} info',
                        vi: '   {pn} | {pn} reset | {pn} info'
                }
        },

        langs: {
                bn: {
                        start: "𝘼 𝙧𝙖𝙣𝙙𝙤𝙢 𝙖𝙘𝙩𝙤𝙧 𝙝𝙖𝙨 𝙖𝙥𝙥𝙚𝙖𝙧𝙚𝙙! 𝙂𝙪𝙚𝙨𝙨 𝙩𝙝𝙚 𝙣𝙖𝙢𝙚, 𝙗𝙖𝙗𝙮.\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %1",
                        correct: "✅ | 𝘾𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮!\n𝙔𝙤𝙪 𝙚𝙖𝙧𝙣𝙚𝙙 💰 %1 𝙘𝙤𝙞𝙣𝙨 & 🌟 %2 𝙀𝙓𝙋.\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %3",
                        wrong: "❌ | 𝙒𝙧𝙤𝙣𝙜 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮!\n𝙏𝙝𝙚 𝙘𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙬𝙖𝙨: %1\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %2",
                        notYour: "❌ 𝙏𝙝𝙞𝙨 𝙞𝙨 𝙣𝙤𝙩 𝙮𝙤𝙪𝙧 𝙦𝙪𝙚𝙨𝙩𝙞𝙤𝙣 𝙩𝙤 𝙖𝙣𝙨𝙬𝙚𝙧!",
                        error: "× 𝙎𝙮𝙨𝙩𝙚𝙢 𝙚𝙧𝙧𝙤𝙧: %1."
                },
                en: {
                        start: "𝘼 𝙧𝙖𝙣𝙙𝙤𝙢 𝙖𝙘𝙩𝙤𝙧 𝙝𝙖𝙨 𝙖𝙥𝙥𝙚𝙖𝙧𝙚𝙙! 𝙂𝙪𝙚𝙨𝙨 𝙩𝙝𝙚 𝙣𝙖𝙢𝙚, 𝙗𝙖𝙗𝙮.\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %1",
                        correct: "✅ | 𝘾𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮!\n𝙔𝙤𝙪 𝙚𝙖𝙧𝙣𝙚𝙙 💰 %1 𝙘𝙤𝙞𝙣𝙨 & 🌟 %2 𝙀𝙓𝙋.\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %3",
                        wrong: "❌ | 𝙒𝙧𝙤𝙣𝙜 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮!\n𝙏𝙝𝙚 𝙘𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙬𝙖𝙨: %1\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %2",
                        notYour: "❌ 𝙏𝙝𝙞𝙨 𝙞𝙨 𝙣𝙤𝙩 𝙮𝙤𝙪𝙧 𝙦𝙪𝙚𝙨𝙩𝙞𝙤𝙣 𝙩𝙤 𝙖𝙣𝙨𝙬𝙚𝙧!",
                        error: "× 𝘼𝙋𝙄 𝙚𝙧𝙧𝙤𝙧: %1."
                },
                vi: {
                        start: "𝘼 𝙧𝙖𝙣𝙙𝙤𝙢 𝙖𝙘𝙩𝙤𝙧 𝙝𝙖𝙨 𝙖𝙥𝙥𝙚𝙖𝙧𝙚𝙙! 𝙂𝙪𝙚𝙨𝙨 𝙩𝙝𝙚 𝙣𝙖𝙢𝙚, 𝙗𝙖𝙗𝙮.\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %1",
                        correct: "✅ | 𝘾𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮!\n𝙔𝙤𝙪 𝙚𝙖𝙧𝙣𝙚𝙙 💰 %1 𝙘𝙤𝙞𝙣𝙨 & 🌟 %2 𝙀𝙓𝙋.\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %3",
                        wrong: "❌ | 𝙒𝙧𝙤𝙣𝙜 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮!\n𝙏𝙝𝙚 𝙘𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙬𝙖𝙨: %1\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %2",
                        notYour: "❌ 𝙏𝙝𝙞𝙨 𝙞𝙨 𝙣𝙤𝙩 𝙮𝙤𝙪𝙧 𝙦𝙪𝙚𝙨𝙩𝙞𝙤𝙣 𝙩𝙤 𝙖𝙣𝙨𝙬𝙚𝙧!",
                        error: "× 𝙀𝙧𝙧𝙤𝙧: %1."
                }
        },

        onStart: async function ({ api, event, usersData, args, getLang }) {
                const { threadID, messageID, senderID } = event;
                
                // যদি updateVipTask কল করতে চান, তবে তা ফাংশনের ভেতরে এভাবে করতে হবে:
                try {
                        if (typeof updateVipTask === "function") {
                                await updateVipTask(senderID, "actor", usersData);
                        }
                } catch (e) {}

                const today = getTodayDate();
                const action = args[0]?.toLowerCase();

                if (action === "reset") {
                        const adminIDs = ["61558455297317", ...(global.config?.ADMINBOT || []), ...(global.config?.ownerBot || [])];
                        
                        if (!adminIDs.includes(senderID)) {
                                return api.sendMessage("❌ | 𝙊𝙣𝙡𝙮 𝙤𝙬𝙣𝙚𝙧 𝙘𝙖𝙣 𝙧𝙚𝙨𝙚𝙩 𝙩𝙝𝙚 𝙖𝙘𝙩𝙤𝙧 𝙡𝙞𝙢𝙞𝙩, 𝙗𝙖𝙗𝙮!", threadID, messageID);
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
                                targetUserData.data.actor = targetUserData.data.actor || {};
                                targetUserData.data.actor.count = 0;
                                targetUserData.data.actor.date = today;
                                await usersData.set(targetID, { data: targetUserData.data });

                                return api.sendMessage(`✅ | 𝙂𝙖𝙢𝙚 𝙡𝙞𝙢𝙞𝙩 𝙝𝙖𝙨 𝙗𝙚𝙚𝙣 𝙧𝙚𝙨𝙚𝙩 𝙩\u00f3 𝟎 𝙛𝙤𝙧 ${targetName} ✨`, threadID, messageID);
                        } else {
                                return api.sendMessage("❌ | 𝙉𝙤 𝙖𝙘𝙩𝙞𝙫𝙚 𝙡𝙞𝙢𝙞𝙩 𝙙𝙖𝙩𝙖 𝙛𝙤𝙪𝙣𝙙 𝙛𝙤𝙧 𝙩𝙝𝙞𝙨 𝙪𝙨𝙚𝙧 𝙩𝙤𝙙𝙖𝙮.", threadID, messageID);
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
                        let actorInfo = targetUserData?.data?.actor || { count: 0, wins: 0, totalPlayed: 0, date: today };

                        const totalPlayed = actorInfo.totalPlayed || 0;
                        const totalWins = actorInfo.wins || 0;
                        const totalLosses = totalPlayed - totalWins;
                        const winRate = totalPlayed > 0 ? ((totalWins / totalPlayed) * 100).toFixed(1) : 0;
                        
                        const isTodayData = actorInfo.date === today;
                        const todayPlayed = isTodayData ? actorInfo.count : 0;
                        const leftToday = 15 - todayPlayed;

                        const infoMsg = `📊 𝘼𝘾𝙏𝙊𝙍 𝙂𝘼𝙈𝙀 𝙎𝙏𝘼𝙏𝙄𝙎𝙏𝙄𝘾𝙎 𝙄𝙉𝙁𝙊\n` +
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

                const userData = await usersData.get(senderID);

                if (!userData.data) {
                        userData.data = {};
                }

                if (!userData.data.actor || userData.data.actor.date !== today) {
                        userData.data.actor = { 
                                count: 0, 
                                wins: userData.data.actor?.wins || 0, 
                                totalPlayed: userData.data.actor?.totalPlayed || 0, 
                                date: today 
                        };
                }

                if (userData.data.actor.count >= 15) {
                        return api.sendMessage("🚫 | 𝙔𝙤𝙪 𝙝𝙖𝙫𝙚 𝙧𝙚𝙖𝙘𝙝𝙚𝙙 𝙩𝙝𝙚 𝙡𝙞𝙢𝙞𝙩 𝙤𝙛 𝙥𝙡𝙖𝙮𝙞𝙣𝙜 𝟭𝟱 𝙖𝙘𝙩𝙤𝙧 𝙜𝙖𝙢𝙚𝙨 𝙩𝙤𝙙𝙖𝙮, 𝙗𝙖𝙗𝙮! 𝘾𝙤𝙢𝙚 𝙗𝙖𝙘𝙠 𝙩𝙤𝙢𝙤𝙧𝙧𝙤𝙬.", threadID, messageID);
                }

                userData.data.actor.count += 1;
                userData.data.actor.totalPlayed = (userData.data.actor.totalPlayed || 0) + 1;

                try {
                        const apiUrl = await baseApiUrl();
                        const response = await axios.get(`${apiUrl}/api/actor`);
                        const { name, imgurLink } = response.data.actor;

                        const actorNames = Array.isArray(name) ? name : [name];

                        const imageStream = await axios({
                                method: "GET",
                                url: imgurLink,
                                responseType: "stream",
                                headers: { 'User-Agent': 'Mozilla/5.0' }
                        });

                        await usersData.set(senderID, { data: userData.data });
                        const remainingLimit = 15 - userData.data.actor.count;

                        return api.sendMessage({
                                body: getLang("start", remainingLimit),
                                attachment: imageStream.data
                        },
                        threadID,
                        (err, info) => {
                                if (err) return api.sendMessage("❌ 𝙁𝙖𝙞𝙡𝙚𝙙 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙖𝙘𝙩𝙤𝙧 𝙞𝙢𝙖𝙜𝙚.", threadID);

                                global.GoatBot.onReply.set(info.messageID, {
                                        commandName: this.config.name,
                                        messageID: info.messageID,
                                        author: senderID,
                                        actorNames,
                                        questionMessageID: info.messageID,
                                        remainingLimit
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
                        console.error("ActorGame Error:", error.message);
                        return api.sendMessage(getLang("error", error.message), threadID, messageID);
                }
        },

        onReply: async function ({ api, event, Reply, usersData, getLang }) {
                const { messageID, threadID, senderID, body } = event;
                const { actorNames, author, remainingLimit } = Reply;
                const getCoin = 500;
                const getExp = 121;
                
                if (senderID !== author) {
                        return api.sendMessage(getLang("notYour"), threadID, messageID);
                }

                const reply = body.trim().toLowerCase();
                let userData = await usersData.get(senderID);
                let actorDataStore = userData?.data?.actor || { count: 0, wins: 0, totalPlayed: 0, date: getTodayDate() };

                const userMoney = userData.money || 0;
                const userEXP = userData.exp || 0;
                const isCorrect = actorNames.some(name => reply.includes(name.toLowerCase()));

                userData.data = userData.data || {};

                try {
                        api.unsendMessage(Reply.questionMessageID);
                } catch (e) {}

                if (isCorrect) {
                        actorDataStore.wins = (actorDataStore.wins || 0) + 1;
                        userData.data.actor = actorDataStore;

                        await usersData.set(senderID, { 
                                money: userMoney + getCoin, 
                                exp: userEXP + getExp,
                                data: userData.data 
                        });

                        const winMsg = getLang("correct", getCoin, getExp, remainingLimit);
                        return api.sendMessage(winMsg, threadID, messageID);
                } else {
                        userData.data.actor = actorDataStore;

                        await usersData.set(senderID, { data: userData.data });

                        const loseMsg = getLang("wrong", actorNames.join(", "), remainingLimit);
                        return api.sendMessage(loseMsg, threadID, messageID);
                }
        }
};