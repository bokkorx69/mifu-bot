module.exports = {
    config: {
        name: "addfriend",
        aliases: ["fbadd", "friendadd", "autofriend", "adfd"],
        version: "0.0.7",
        author: "Bokkor x69",
        countDown: 10,
        role: 6,
        shortDescription: {
            en: "Auto send friend requests to public users"
        },
        description: {
            en: "Automatically find public users and send friend requests."
        },
        category: "owner",
        guide: {
            en: "{pn} <count> - Auto add random public users"
        }
    },

    onStart: async function ({ api, message, args, event }) {
        try {
            let count = parseInt(args[0]);

            if (!count || isNaN(count) || count < 1) {
                return message.reply(`❌ | 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝘃𝗮𝗹𝗶𝗱 𝗻𝘂𝗺𝗯𝗲𝗿.`);
            }

            if (count > 50) {
                return message.reply(`⚠️ | 𝗠𝗮𝘅𝗶𝗺𝘂𝗺 𝗹𝗶𝗺𝗶𝘁 𝗶𝘀 𝟱𝟬 𝗽𝗲𝗿 𝗰𝗼𝗺𝗺𝗮𝗻𝗱.\n📊 | 𝗬𝗼𝘂 𝗿𝗲𝗾𝘂𝗲𝘀𝘁𝗲𝗱: ${count}`);
            }

            await message.reply(`⏳ | 𝗦𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝗳𝗿𝗶𝗲𝗻𝗱 𝗿𝗲𝗾𝘂𝗲𝘀𝘁...\n🎯 | 𝗧𝗮𝗿𝗴𝗲𝘁: ${count} 𝘂𝘀𝗲𝗿𝘀\n🔍 | 𝗦𝗲𝗮𝗿𝗰𝗵𝗶𝗻𝗴 𝗽𝘂𝗯𝗹𝗶𝗰 𝘂𝘀𝗲𝗿𝘀...`);

            let added = 0;
            let failed = 0;
            let skipped = 0;
            let processedUsers = new Set();

            const threads = await api.getThreadList(50, null, ["INBOX"]);

            if (!threads || threads.length === 0) {
                return message.reply("❌ | 𝗡𝗼 𝗳𝗼𝘂𝗻𝗱 𝘁𝗼 𝘀𝗲𝗮𝗿𝗰𝗵 𝗳𝗼𝗿 𝘂𝘀𝗲𝗿𝘀.");
            }

            for (const thread of threads) {
                if (added >= count) break;

                try {
                    const threadInfo = await api.getThreadInfo(thread.threadID);
                    const participants = threadInfo.participantIDs || [];

                    for (const userID of participants) {
                        if (added >= count) break;
                        if (processedUsers.has(userID)) continue;
                        processedUsers.add(userID);

                        if (userID === api.getCurrentUserID()) continue;

                        try {
                            const userInfo = await api.getUserInfo(userID);
                            const user = userInfo[userID];

                            if (!user) continue;

                            if (user.isFriend) {
                                skipped++;
                                continue;
                            }

                            if (user.isFriend === false) {
                                const result = await api.sendFriendRequest(userID);

                                if (result && (result.success || result.friendshipStatus === "OUTGOING_REQUEST_SENT")) {
                                    added++;

                                    if (added % 5 === 0 && added < count) {
                                        await message.reply(`📊 | 𝗣𝗿𝗼𝗴𝗿𝗲𝘀𝘀: ${added}/${count} 𝘀𝗲𝗻𝘁`);
                                    }

                                    await new Promise(resolve => setTimeout(resolve, 2000));
                                } else {
                                    failed++;
                                }
                            }

                        } catch (userError) {
                            continue;
                        }
                    }

                } catch (threadError) {
                    continue;
                }
            }

            const report =
                `✅ | 𝗔𝗨𝗧𝗢 𝗙𝗥𝗜𝗘𝗡𝗗 𝗥𝗘𝗤𝗨𝗘𝗦𝗧 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘\n` +
                `\n` +
                `📊 | 𝗧𝗼𝘁𝗮𝗹 𝗥𝗲𝗾𝘂𝗲𝘀𝘁𝗲𝗱: ${count}\n` +
                `✅ | 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆 𝗦𝗲𝗻𝘁: ${added}\n` +
                `❌ | 𝗙𝗮𝗶𝗹𝗲𝗱: ${failed}\n` +
                `⏭️ | 𝗦𝗸𝗶𝗽𝗽𝗲𝗱 𝗔𝗹𝗿𝗲𝗮𝗱𝘆 𝗙𝗿𝗶𝗲𝗻𝗱𝘀: ${skipped}`;

            return message.reply(report);

        } catch (error) {
            console.error("AutoAddFriend Error:", error);
            return message.reply(`❌ | 𝗘𝗿𝗿𝗼𝗿: ${error.message || "𝗨𝗻𝗸𝗻𝗼𝘄𝗻 𝗲𝗿𝗿𝗼𝗿 𝗼𝗰𝗰𝘂𝗿𝗿𝗲𝗱"}`);
        }
    },

    onChat: async function ({ api, message, args, event }) {
        if (!args[0]) return;

        const firstArg = args[0].toLowerCase();
        if (firstArg === "adfd" && args[1]) {
            return this.onStart({ api, message, args: [args[1]], event });
        }

        if (this.config.aliases.includes(firstArg) && args[1]) {
            return this.onStart({ api, message, args: [args[1]], event });
        }
    }
};