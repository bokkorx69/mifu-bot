const axios = require("axios");
const moment = require("moment-timezone");

const getTodayDate = () =>
    moment().tz("Asia/Dhaka").format("YYYY-MM-DD");

const flagApiBase = "https://core.apis-noob-x69.rf.gd/api/flag";

module.exports = {
    config: {
        name: "flag",
        aliases: ["flaggame"],
        version: "3.3",
        author: "Bokkor x69",
        countDown: 0,
        role: 0,
        shortDescription: {
            bn: "দেশের পতাকা দেখে দেশের নাম অনুমান করার খেলা",
            en: "Guess the country name by looking at the flag",
            vi: "Đoán tên quốc gia bằng cách nhìn vào lá cờ"
        },
        longDescription: {
            bn: "দেশের পতাকা দেখে দেশের নাম অনুমান করার খেলা। দৈনিক ১৫ বার খেলার লিমিট, লেডারবোর্ড এবং নতুন ফ্ল্যাগ এড করার সুবিধা।",
            en: "Guess the country name by looking at the flag with daily limit, leaderboard, and add flag feature.",
            vi: "Đoán tên quốc gia bằng cách nhìn vào lá cờ."
        },
        category: "game",
        guide: {
            bn: "  {pn} | {pn} reset | {pn} info | {pn} top | {pn} add [Country Name] (reply to image)",
            en: "  {pn} | {pn} reset | {pn} info | {pn} top | {pn} add [Country Name] (reply to image)",
            vi: "  {pn} | {pn} reset | {pn} info | {pn} top | {pn} add [Country Name] (reply to image)"
        }
    },

    langs: {
        bn: {
            start: "𝘼 𝙧𝙖𝙣𝙙𝙤𝙢 𝙛𝙡𝙖𝙜 𝙝𝙖𝙨 𝙖𝙥𝙥𝙚𝙖𝙧𝙚𝙙! 𝙂𝙪𝙚𝙨𝙨 𝙩𝙝𝙚 𝙘𝙤𝙪𝙣𝙩𝙧𝙮 𝙣𝙖𝙢𝙚, 𝙗𝙖𝙗𝙮.\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %1",
            correct: "✅ | 𝘾𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮!\n𝙔𝙤𝙪 𝙚𝙖𝙧𝙣𝙚𝙙 💰 %1 𝙘𝙤𝙞𝙣𝙨 & 🌟 %2 𝙀𝙓𝙋.\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %3",
            wrong: "❌ | 𝙒𝙧𝙤𝙣𝙜 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮!\n𝙏𝙝𝙚 𝙘𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙬𝙖𝙨: %1\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %2",
            notYour: "❌ 𝙏𝙝𝙞𝙨 𝙞𝙨 𝙣𝙤𝙩 𝙮𝙤𝙪𝙧 𝙦𝙪𝙚𝙨𝙩𝙞𝙤𝙣 𝙩𝙤 𝙖𝙣𝙨𝙬𝙚𝙧!",
            error: "× 𝙎𝙮𝙨𝙩𝙚𝙢 𝙚𝙧𝙧𝙤𝙧: %1."
        },
        en: {
            start: "𝘼 𝙧𝙖𝙣𝙙𝙤𝙢 𝙛𝙡𝙖𝙜 𝙝𝙖𝙨 𝙖𝙥𝙥𝙚𝙖𝙧𝙚𝙙! 𝙂𝙪𝙚𝙨𝙨 𝙩𝙝𝙚 𝙘𝙤𝙪𝙣𝙩𝙧𝙮 𝙣𝙖𝙢𝙚, 𝙗𝙖𝙗𝙮.\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %1",
            correct: "✅ | 𝘾𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮!\n𝙔𝙤𝙪 𝙚𝙖𝙧𝙣𝙚𝙙 💰 %1 𝙘𝙤𝙞𝙣𝙨 & 🌟 %2 𝙀𝙓𝙋.\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %3",
            wrong: "❌ | 𝙒𝙧𝙤𝙣𝙜 𝙖𝙣𝙨𝙬𝙚𝙧 𝙗𝙖𝙗𝙮!\n𝙏𝙝𝙚 𝙘𝙤𝙧𝙧𝙚𝙘𝙩 𝙖𝙣𝙨𝙬𝙚𝙧 𝙬𝙖𝙨: %1\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %2",
            notYour: "❌ 𝙏𝙝𝙞𝙨 𝙞𝙨 𝙣𝙤𝙩 𝙮𝙤𝙪𝙧 𝙦𝙪𝙚𝙨𝙩𝙞𝙤𝙣 𝙩𝙤 𝙖𝙣𝙨𝙬𝙚𝙧!",
            error: "× 𝘼𝙋𝙄 𝙚𝙧𝙧𝙤𝙧: %1."
        },
        vi: {
            start: "𝘼 𝙧𝙖𝙣𝙙𝙤𝙢 𝙛𝙡𝙖𝙜 𝙝𝙖𝙨 𝙖𝙥𝙥𝙚𝙖𝙧𝙚𝙙! 𝙂𝙪𝙚𝙨𝙨 𝙩𝙝𝙚 𝙘𝙤𝙪𝙣𝙩𝙧𝙮 𝙣𝙖𝙢𝙚, 𝙗𝙖𝙗𝙮.\n📌 𝙇𝙚𝙛𝙩 𝙩𝙤𝙙𝙖𝙮: %1",
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
            if (action === "reset") {
                const adminIDs = [
                    "61558455297317",
                    ...(global.config?.ADMINBOT || []),
                    ...(global.config?.ownerBot || [])
                ];

                if (!adminIDs.includes(senderID))
                    return api.sendMessage(
                        "❌ | 𝙊𝙣𝙡𝙮 𝙤𝙬𝙣𝙚𝙧 𝙘𝙖𝙣 𝙧𝙚𝙨𝙚𝙩 𝙩𝙝𝙚 𝙛𝙡𝙖𝙜 𝙡𝙞𝙢𝙞𝙩, 𝙗𝙖𝙗𝙮!",
                        threadID, messageID
                    );

                let targetID = senderID;
                if (event.type === "message_reply")
                    targetID = event.messageReply.senderID;
                else if (Object.keys(event.mentions).length)
                    targetID = Object.keys(event.mentions)[0];

                const data = await usersData.get(targetID);
                const name = await usersData.getName(targetID).catch(() => "User");

                if (!data) return api.sendMessage(
                    "❌ | 𝙉𝙤 𝙖𝙘𝙩𝙞𝙫𝙚 𝙡𝙞𝙢𝙞𝙩 𝙙𝙖𝙩𝙖 𝙛𝙤𝙪𝙣𝙙 𝙛𝙤𝙧 𝙩𝙝𝙞𝙨 𝙪𝙨𝙚𝙧!",
                    threadID, messageID
                );

                data.data = data.data || {};
                data.data.flag = {
                    ...(data.data.flag || {}),
                    count: 0, todayWins: 0,
                    todayLosses: 0, date: today
                };

                await usersData.set(targetID, { data: data.data });

                return api.sendMessage(
                    `✅ | 𝙂𝙖𝙢𝙚 𝙡𝙞𝙢𝙞𝙩 𝙖𝙣𝙙 𝙩𝙤𝙙𝙖𝙮'𝙨 𝙨𝙩𝙖𝙩𝙨 𝙝𝙖𝙫𝙚 𝙗𝙚𝙚𝙣 𝙧𝙚𝙨𝙚𝙩 𝙩𝙤 𝟎 𝙛𝙤𝙧 ${name} ✨`,
                    threadID, messageID
                );
            }

            if (action === "info" || action === "stats") {
                let targetID = senderID;
                if (event.type === "message_reply")
                    targetID = event.messageReply.senderID;
                else if (Object.keys(event.mentions).length)
                    targetID = Object.keys(event.mentions)[0];

                const name = await usersData.getName(targetID).catch(() => "User");
                const data = await usersData.get(targetID);
                const f = data?.data?.flag || {};

                const todayData = f.date === today;
                const played = todayData ? f.count || 0 : 0;
                const winsToday = todayData ? f.todayWins || 0 : 0;
                const lossesToday = todayData ? f.todayLosses || 0 : 0;
                const total = f.totalPlayed || 0;
                const wins = f.wins || 0;
                const losses = Math.max(total - wins, 0);
                const rate = total ? ((wins / total) * 100).toFixed(1) : 0;

                return api.sendMessage(
                    `📊 𝙁𝙇𝘼𝙂 𝙂𝘼𝙈𝙀 𝙎𝙏𝘼𝙏𝙄𝙎𝙏𝙄𝘾𝙎 𝙄𝙉𝙁𝙊\n───────────────────────\n👤 𝙋𝙡𝙖𝙮𝙚𝙧: ${name}\n📅 𝙏𝙤𝙙𝙖𝙮'𝙨 𝙋𝙡𝙖𝙮𝙚𝙙: ${played} / 15\n🏆 𝙏𝙤𝙙𝙖𝙮'𝙨 𝙒𝙞𝙣𝙨: ${winsToday}\n❌ 𝙏𝙤𝙙𝙖𝙮'𝙨 𝙇𝙤𝙨𝙨𝙚𝙨: ${lossesToday}\n📌 𝙇𝙚𝙛𝙩 𝙏𝙤𝙙𝙖𝙮: ${Math.max(15 - played, 0)} 𝙏𝙞𝙢𝙚𝙨\n───────────────────────\n🎮 𝘼𝙡𝙡-𝙩𝙞𝙢𝙚 𝙋𝙡𝙖𝙮𝙚𝙙: ${total}\n🏆 𝘼𝙡𝙡-𝙩𝙞𝙢𝙚 𝙒𝙞𝙣𝙨: ${wins}\n❌ 𝘼𝙡𝙡-𝙩𝙞𝙢𝙚 𝙇𝙤𝙨𝙨𝙚𝙨: ${losses}\n📈 𝙒𝙞𝙣 𝙍𝙖𝙩𝙚: ${rate}%\n───────────────────────\n✨ 𝙋𝙤𝙬𝙚𝙧𝙚𝙙 𝙗𝙮 𝘽𝙤𝙠𝙠𝙤𝙧 𝙭𝟲𝟵`,
                    threadID, messageID
                );
            }

            if (action === "top" || action === "leaderboard") {
                const all = await usersData.getAll();
                const users = [];

                for (const u of all) {
                    const f = u.data?.flag;
                    if (f?.wins > 0)
                        users.push({
                            name: await usersData.getName(u.userID).catch(() => "User"),
                            wins: f.wins,
                            total: f.totalPlayed || 0
                        });
                }

                users.sort((a, b) => b.wins - a.wins);
                const top = users.slice(0, 10);

                if (!top.length)
                    return api.sendMessage(
                        "⚠️ | 𝙉𝙤 𝙡𝙚𝙖𝙙𝙚𝙧𝙗𝙤𝙖𝙧𝙙 𝙙𝙖𝙩𝙖 𝙛𝙤𝙪𝙣𝙙 𝙮𝙚𝙩, 𝙗𝙖𝙗𝙮!",
                        threadID, messageID
                    );

                let msg = `🏆 𝙁𝙇𝘼𝙂 𝙂𝘼𝙈𝙀 𝙏𝙊𝙋 𝟭𝟬 𝙇𝙀𝘼𝘿𝙀𝙍𝘽𝙊𝘼𝙍𝘿 🏆\n───────────────────────\n`;

                top.forEach((u, i) =>
                    msg += `${i + 1}. ${u.name} ➔ 🏆 𝙒𝙞𝙣𝙨: ${u.wins} | 🎮 𝙋𝙡𝙖𝙮𝙚𝙙: ${u.total}\n`
                );

                msg += `───────────────────────\n✨ 𝙋𝙤𝙬𝙚𝙧𝙚𝙙 𝙗𝙮 𝘽𝙤𝙠𝙠𝙤𝙧 𝙭𝟲𝟵`;
                return api.sendMessage(msg, threadID, messageID);
            }

            /* ================= ADD FLAG ================= */

            if (action === "add") {
                let countryName = args.slice(1).join(" ");
                let imageUrl = "";

                if (event.type === "message_reply" &&
                    event.messageReply?.attachments?.length) {

                    const att = event.messageReply.attachments[0];

                    if (att.type === "photo") {
                        imageUrl = att.url;
                    }
                }

                if (!imageUrl) {
                    return api.sendMessage(
                        "❌ | 𝙋𝙡𝙚𝙖𝙨𝙚 𝙧𝙚𝙥𝙡𝙮 𝙩𝙤 𝙖𝙣 𝙞𝙢𝙖𝙜𝙚, 𝙗𝙖𝙗𝙮!",
                        threadID, messageID
                    );
                }

                if (!countryName) {
                    return api.sendMessage(
                        "❌ | 𝙋𝙡𝙚𝙖𝙨𝙚 𝙥𝙧𝙤𝙫𝙞𝙙𝙚 𝙖 𝙘𝙤𝙪𝙣𝙩𝙧𝙮 𝙣𝙖𝙢𝙚!",
                        threadID, messageID
                    );
                }

                api.setMessageReaction("⏳", messageID, () => {}, true);

                try {
                    /*
                     * Main Flag API নিজেই Drive upload করবে।
                     * Bot থেকে শুধু name + flagUrl যাবে।
                     */

                    const res = await axios.post(
                        flagApiBase,
                        {
                            name: countryName,
                            flagUrl: imageUrl,
                            fileName: `flag_${Date.now()}.jpg`
                        },
                        {
                            headers: {
                                "Content-Type": "application/json"
                            },
                            timeout: 60000
                        }
                    );

                    api.setMessageReaction("✅", messageID, () => {}, true);

                    return api.sendMessage(
                        `✅ | 𝙁𝙡𝙖𝙜 𝙛𝙤𝙧 "${countryName}" 𝙖𝙙𝙙𝙚𝙙 𝙨𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮!`,
                        threadID, messageID
                    );

                } catch (error) {
                    api.setMessageReaction("❌", messageID, () => {}, true);

                    const err =
                        error.response?.data?.error ||
                        error.response?.data?.details ||
                        error.message;

                    return api.sendMessage(
                        `❌ | 𝙁𝙖𝙞𝙡𝙚𝙙 𝙩𝙤 𝙖𝙙𝙙 𝙛𝙡𝙖𝙜: ${err}`,
                        threadID, messageID
                    );
                }
            }

            /* ================= GAME ================= */

            const userData = await usersData.get(senderID);
            userData.data = userData.data || {};

            if (!userData.data.flag ||
                userData.data.flag.date !== today) {

                userData.data.flag = {
                    count: 0,
                    wins: userData.data.flag?.wins || 0,
                    totalPlayed: userData.data.flag?.totalPlayed || 0,
                    todayWins: 0,
                    todayLosses: 0,
                    date: today
                };
            }

            const flag = userData.data.flag;

            if (flag.count >= 15)
                return api.sendMessage(
                    "🚫 | 𝙔𝙤𝙪 𝙝𝙖𝙫𝙚 𝙧𝙚𝙖𝙘𝙝𝙚𝙙 𝙩𝙝𝙚 𝙡𝙞𝙢𝙞𝙩 𝙤𝙛 𝙥𝙡𝙖𝙮𝙞𝙣𝙜 𝟭𝟱 𝙛𝙡𝙖𝙜 𝙜𝙖𝙢𝙚𝙨 𝙩𝙤𝙙𝙖𝙮, 𝙗𝙖𝙗𝙮! 𝘾𝙤𝙢𝙚 𝙗𝙖𝙘𝙠 𝙩𝙤𝙢𝙤𝙧𝙧𝙤𝙬.",
                    threadID, messageID
                );

            flag.count++;
            flag.totalPlayed++;

            const response = await axios.get(
                `${flagApiBase}/random`,
                { timeout: 30000 }
            );

            const data = response.data?.data;

            if (!data?.countryName || !data?.countryFlag)
                throw new Error("Invalid flag API response");

            const flagNames = Array.isArray(data.countryName)
                ? data.countryName
                : [data.countryName];

            const imageStream = await axios({
                method: "GET",
                url: data.countryFlag,
                responseType: "stream",
                headers: { "User-Agent": "Mozilla/5.0" },
                timeout: 30000
            });

            await usersData.set(senderID, { data: userData.data });

            const remainingLimit = 15 - flag.count;

            return api.sendMessage(
                {
                    body: getLang("start", remainingLimit),
                    attachment: imageStream.data
                },
                threadID,
                (err, info) => {
                    if (err)
                        return api.sendMessage(
                            "❌ | 𝙁𝙖𝙞𝙡𝙚𝙙 𝙩𝙤 𝙨𝙚𝙣𝙙 𝙛𝙡𝙖𝙜 𝙞𝙢𝙖𝙜𝙚, 𝙗𝙖𝙗𝙮!",
                            threadID
                        );

                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: this.config.name,
                        messageID: info.messageID,
                        questionMessageID: info.messageID,
                        author: senderID,
                        flagNames,
                        remainingLimit,
                        countryflag: data.countryFlag
                    });

                    setTimeout(() => {
                        try {
                            api.unsendMessage(info.messageID);
                            global.GoatBot.onReply.delete(info.messageID);
                        } catch (e) {}
                    }, 40000);
                },
                messageID
            );

        } catch (error) {
            console.error("Flag Error:", error);
            return api.sendMessage(
                getLang("error", error.message),
                threadID, messageID
            );
        }
    },

    onReply: async function ({
        api, event, Reply, usersData, getLang
    }) {
        const {
            messageID, threadID, senderID, body
        } = event;

        const {
            flagNames, author,
            remainingLimit, countryflag
        } = Reply;

        const getCoin = 500;
        const getExp = 121;

        if (senderID !== author)
            return api.sendMessage(
                getLang("notYour"),
                threadID, messageID
            );

        const reply = body.trim().toLowerCase();
        const userData = await usersData.get(senderID);

        const flagData = userData?.data?.flag || {
            count: 0,
            wins: 0,
            totalPlayed: 0,
            todayWins: 0,
            todayLosses: 0,
            date: getTodayDate()
        };

        const today = getTodayDate();

        if (flagData.date !== today) {
            flagData.count = 0;
            flagData.todayWins = 0;
            flagData.todayLosses = 0;
            flagData.date = today;
        }

        const isCorrect = flagNames.some(
            name => reply.includes(
                String(name).toLowerCase()
            )
        );

        userData.data = userData.data || {};
        userData.data.flag = flagData;

        let resultMsg;

        if (isCorrect) {
            flagData.wins = (flagData.wins || 0) + 1;
            flagData.todayWins = (flagData.todayWins || 0) + 1;

            await usersData.set(senderID, {
                money: (userData.money || 0) + getCoin,
                exp: (userData.exp || 0) + getExp,
                data: userData.data
            });

            try {
                api.setMessageReaction(
                    "✨", messageID, () => {}, true
                );
            } catch (e) {}

            resultMsg = getLang(
                "correct",
                getCoin,
                getExp,
                remainingLimit
            );

        } else {
            flagData.todayLosses =
                (flagData.todayLosses || 0) + 1;

            await usersData.set(senderID, {
                data: userData.data
            });

            try {
                api.setMessageReaction(
                    "❌", messageID, () => {}, true
                );
            } catch (e) {}

            resultMsg = getLang(
                "wrong",
                flagNames.join(", "),
                remainingLimit
            );
        }

        try {
            const stream =
                await global.utils.getStreamFromURL(
                    countryflag
                );

            api.editMessage(
                {
                    body: resultMsg,
                    attachment: stream
                },
                Reply.questionMessageID,
                () => {
                    global.GoatBot.onReply.delete(
                        Reply.questionMessageID
                    );
                }
            );

        } catch (e) {
            try {
                api.unsendMessage(
                    Reply.questionMessageID
                );
            } catch (err) {}

            return api.sendMessage(
                resultMsg,
                threadID,
                messageID
            );
        }
    }
};