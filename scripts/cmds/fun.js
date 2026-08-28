const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
    const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
    return base.data.mahmud;
};

module.exports = {
    config: {
        name: "fun",
        aliases: ["dig", "funny"],
        version: "1.7",
        author: "MahMUD",
        countDown: 10,
        role: 0,
        category: "fun",
        description: "Image effect generator"
    },

    onStart: async function ({ api, event, usersData, args, getLang }) {
        const { threadID, messageID, messageReply, senderID, mentions } = event;

        const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68);
        if (this.config.author !== obfuscatedAuthor) {
            return api.sendMessage("auth error", threadID, messageID);
        }

        const type = args[0]?.toLowerCase();
        const baseUrl = await baseApiUrl();

        if (!type) return api.sendMessage("no type", threadID, messageID);

        if (type === "list") {
            try {
                const res = await axios.get(`${baseUrl}/api/dig/list`);
                return api.sendMessage((res.data.types || []).join(","), threadID, messageID);
            } catch (err) {
                return api.sendMessage("list error", threadID, messageID);
            }
        }

        let targetID;

        if (messageReply) {
            targetID = messageReply.senderID;
        } else if (Object.keys(mentions || {}).length > 0) {
            targetID = Object.keys(mentions)[0];
        } else if (args[1]) {
            targetID = args[1];
        }

        if (!targetID) return api.sendMessage("no target", threadID, messageID);

        try {
            api.setMessageReaction("⏳", messageID, () => {}, true);

            let url = `${baseUrl}/api/dig?type=${type}&user=${targetID}`;

            let response;
            try {
                response = await axios.get(url, { responseType: "arraybuffer" });
            } catch (err) {
                if (err.response?.status === 400) {
                    url = `${baseUrl}/api/dig?type=${type}&user=${senderID}&user2=${targetID}`;
                    response = await axios.get(url, { responseType: "arraybuffer" });
                } else {
                    throw err;
                }
            }

            const ext = ["trigger", "triggered"].includes(type) ? "gif" : "png";

            const cacheDir = path.join(__dirname, "cache");
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

            const filePath = path.join(cacheDir, `fun_${Date.now()}.${ext}`);

            fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

            const targetData = await usersData.get(targetID);
            const targetName = targetData?.name || "User";

            return api.sendMessage(
                {
                    attachment: fs.createReadStream(filePath)
                },
                threadID,
                () => {
                    api.setMessageReaction("🕊️", messageID, () => {}, true);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                },
                messageID
            );

        } catch (err) {
            api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage("error", threadID, messageID);
        }
    }
};