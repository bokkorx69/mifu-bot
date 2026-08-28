module.exports = {
    config: {
        name: "theme",
        version: "2.4.70",
        author: "Sheikh Tamim",
        countDown: 5,
        role: 2,
        description: "Generate AI themes for messenger chat",
        category: "owner",
        guide: {
            en: "{pn} <prompt> - Generate AI theme based on your prompt\nExample: {pn} 𝗯𝗲𝗮𝘂𝘁𝗶𝗳𝘂𝗹 𝘁𝗿𝗼𝗽𝗶𝗰𝗮𝗹 𝗯𝗲𝗮𝗰𝗵"
        }
    },

    onReply: async function ({ message, Reply, event, api, args }) {
        const { author, themes, threadID, messageID } = Reply;

        // Handle both Messenger and potential other platforms
        const currentUserId = event.senderID || event.userID || (event.from && event.from.id);
        
        if (currentUserId !== author) {
            return message.reply("❌ 𝗢𝗻𝗹𝘆 𝘁𝗵𝗲 𝗽𝗲𝗿𝘀𝗼𝗻 𝘄𝗵𝗼 𝗴𝗲𝗻𝗲𝗿𝗮𝘁𝗲𝗱 𝘁𝗵𝗲𝘀𝗲 𝘁𝗵𝗲𝗺𝗲𝘀 𝗰𝗮𝗻 𝘀𝗲𝗹𝗲𝗰𝘁 𝗼𝗻𝗲.");
        }

        const selection = parseInt(args[0]) || parseInt((event.body || event.text || "").trim());

        if (!selection || selection < 1 || selection > themes.length) {
            return message.reply(`❌ Invalid selection. Please reply with a number between 1 and ${themes.length}.`);
        }

        const selectedTheme = themes[selection - 1];

        try {
            // Unsend the previous message
            api.unsendMessage(messageID);


            await new Promise((resolve, reject) => {
                api.setThreadTheme(threadID, selectedTheme.themeId, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            let successMsg = `✅ Successfully applied theme "${selectedTheme.name}"!\n`;
            successMsg += `🆔 Theme ID: ${selectedTheme.themeId}\n`;
            successMsg += `🎨 Primary Color: ${selectedTheme.colors.fallback}`;

            const attachments = [];
            if (selectedTheme.images.background) {
                try {
                    const stream = await global.utils.getStreamFromURL(selectedTheme.images.background);
                    attachments.push(stream);
                } catch (imgErr) {
                    console.log("Failed to load theme image:", imgErr);
                }
            }

            return message.reply(successMsg);

        } catch (error) {
            console.error("Theme setting error:", error);
            return message.reply(`❌ Failed to set theme: ${error.message || error}`);
        }
    },

    ST: async function ({ message, args, api, event }) {
        try {
            // Parse arguments for options
            let prompt = "";
            let numThemes = 1;
            let imageUrl = null;

            for (let i = 0; i < args.length; i++) {
                if (args[i] === "--n" && i + 1 < args.length) {
                    numThemes = parseInt(args[i + 1]) || 1;
                    i++; // Skip next arg as it's the number
                } else if (args[i] === "--img" && i + 1 < args.length) {
                    imageUrl = args[i + 1];
                    i++; // Skip next arg as it's the URL
                } else {
                    prompt += args[i] + " ";
                }
            }

            prompt = prompt.trim();

            if (!prompt) {
                return message.reply("❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝗽𝗿𝗼𝗺𝗽𝘁 𝗳𝗼𝗿 𝘁𝗵𝗲𝗺𝗲 𝗴𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗼𝗻!\n\n𝗨𝘀𝗮𝗴𝗲 :\n• 𝗕𝗮𝘀𝗶𝗰: !𝗺𝗲𝘁𝗮𝘁𝗵𝗲𝗺𝗲 𝗯𝗲𝗮𝘂𝘁𝗶𝗳𝘂𝗹 𝘁𝗿𝗼𝗽𝗶𝗰𝗮𝗹 𝗯𝗲𝗮𝗰𝗵\n• 𝗠𝘂𝗹𝘁𝗶𝗽𝗹𝗲: !𝗺𝗲𝘁𝗮𝘁𝗵𝗲𝗺𝗲 𝗯𝗲𝗮𝘂𝘁𝗶𝗳𝘂𝗹 𝗯𝗲𝗮𝗰𝗵 --𝗻 𝟯\n• 𝗪𝗶𝘁𝗵 𝗶𝗺𝗮𝗴𝗲: !𝗺𝗲𝘁𝗮𝘁𝗵𝗲𝗺𝗲 𝗼𝗰𝗲𝗮𝗻 --𝗶𝗺𝗴 𝗵𝘁𝘁𝗽𝘀://𝗲𝘅𝗮𝗺𝗽𝗹𝗲.𝗰𝗼𝗺/𝗶𝗺𝗮𝗴𝗲.𝗷𝗽𝗴");
            }

            // Limit number of themes
            numThemes = Math.min(Math.max(numThemes, 1), 5);

            message.reply(`𝗪𝗔𝗜𝗧 𝗕𝗔𝗕𝗬 🎀`);

            const options = { numThemes };
            if (imageUrl) options.imageUrl = imageUrl;

            const result = await new Promise((resolve, reject) => {
                api.metaTheme(prompt, options, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });

            if (result && result.success) {
                const themes = result.themes || [result];
                const attachments = [];

                let response = `𝗛𝗘𝗥𝗘 𝗬𝗢𝗨𝗥 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗥𝗘𝗗 𝗧𝗛𝗘𝗠𝗘 𝗕𝗔𝗕𝗬`;

                for (let i = 0; i < themes.length; i++) {
                    const theme = themes[i];
                    response += ``;
                    response += ``;
                    response += ``;
                    response += ``;

                    if (theme.images.background) {
                        response += ``;
                        try {
                            const stream = await global.utils.getStreamFromURL(theme.images.background);
                            attachments.push(stream);
                        } catch (imgErr) {
                            console.log("Failed to load background image:", imgErr);
                        }
                    }

                    response += `\n`;
                }

                response += ` 𝗥𝗲𝗽𝗹𝘆 𝘄𝗶𝘁𝗵 𝘁𝗵𝗲 𝘀𝗲𝗿𝗶𝗮𝗹 𝗻𝘂𝗺𝗯𝗲𝗿 (𝟭-${themes.length}) 𝘁𝗼 𝘀𝗲𝘁 𝘁𝗵𝗮𝘁 𝘁𝗵𝗲𝗺𝗲\n`;
                response += `
𝗘𝘅𝗮𝗺𝗽𝗹𝗲: 𝗥𝗲𝗽𝗹𝘆 𝘄𝗶𝘁𝗵 "𝟭" 𝘁𝗼 𝘀𝗲𝘁 𝘁𝗵𝗲 𝗳𝗶𝗿𝘀𝘁 𝘁𝗵𝗲𝗺𝗲
`;

                const replyMessage = await message.reply({
                    body: response,
                    attachment: attachments.length > 0 ? attachments : undefined
                });

                const currentUserId = event.senderID || event.userID || (event.from && event.from.id);
                const currentThreadId = event.threadID || event.threadId || (event.chat && event.chat.id);
                
                global.GoatBot.onReply.set(replyMessage.messageID, {
                    commandName: module.exports.config.name,
                    messageID: replyMessage.messageID,
                    author: currentUserId,
                    themes: themes,
                    threadID: currentThreadId
                });

                return replyMessage;
            } else {
                return message.reply("❌ Failed to generate AI theme. Please try with a different prompt.");
            }

        } catch (error) {
            console.error("MetaTheme Error:", error);

            let errorMsg = "❌ An error occurred while generating the theme.";

            if (error.error) {
                if (error.error.includes("not authorized") || error.error.includes("not support")) {
                    errorMsg = "❌ 𝗬𝗼𝘂𝗿 𝗮𝗰𝗰𝗼𝘂𝗻𝘁 𝗱𝗼𝗲𝘀 𝗻𝗼𝘁 𝘀𝘂𝗽𝗽𝗼𝗿𝘁 𝗠𝗲𝘁𝗮 𝗔𝗜 𝘁𝗵𝗲𝗺𝗲 𝗴𝗲𝗻𝗲𝗿𝗮𝘁𝗶𝗼𝗻. 𝗧𝗵𝗶𝘀 𝗳𝗲𝗮𝘁𝘂𝗿𝗲 𝗺𝗮𝘆 𝗻𝗼𝘁 𝗯𝗲 𝗮𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲 𝗳𝗼𝗿 𝘆𝗼𝘂𝗿 𝗮𝗰𝗰𝗼𝘂𝗻𝘁 𝘁𝘆𝗽𝗲.";
                } else if (error.error.includes("rate limit")) {
                    errorMsg = "❌ Rate limit exceeded. Please wait a moment before trying again.";
                } else {
                    errorMsg = `❌ ${error.error}`;
                }
            }

            return message.reply(errorMsg);
        }
    }
};