const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
	const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
	return base.data.mahmud;
};

module.exports = {
	config: {
		name: "tuntun",
		version: "1.7",
		author: "MahMUD",
		role: 0,
		category: "fun",
		cooldown: 10,
		guide: {
			en: "{pn} [mention/reply/UID]",
			bn: "{pn} [মেনশন/রিপ্লাই/UID]",
			vi: "{pn} [mention/reply/UID]"
		}
	},

	onStart: async function ({ api, event, args }) {
		const { threadID, messageID, messageReply, mentions } = event;
		let id2 = messageReply?.senderID || Object.keys(mentions)[0] || args[0];

		if (!id2)
			return api.sendMessage(
				"× 𝗣𝗹𝗲𝗮𝘀𝗲 𝗠𝗲𝗻𝘁𝗶𝗼𝗻, 𝗥𝗲𝗽𝗹𝘆, 𝗢𝗿 𝗣𝗿𝗼𝘃𝗶𝗱𝗲 𝗔 𝗨𝗜𝗗.",
				threadID,
				messageID
			);

		const cacheDir = path.join(__dirname, "cache");
		if (!fs.existsSync(cacheDir))
			fs.mkdirSync(cacheDir, { recursive: true });

		const filePath = path.join(cacheDir, `clown_${id2}_${Date.now()}.png`);

		try {
			api.setMessageReaction("⏳", messageID, () => {}, true);

			const apiUrl = await baseApiUrl();
			const url = `${apiUrl}/api/dig?type=tuntun&user=${id2}`;

			const response = await axios.get(url, {
				responseType: "arraybuffer"
			});

			fs.writeFileSync(filePath, Buffer.from(response.data));

			api.sendMessage(
				{
					body: "",
					attachment: fs.createReadStream(filePath)
				},
				threadID,
				(err) => {
					if (!err)
						api.setMessageReaction("💋", messageID, () => {}, true);

					if (fs.existsSync(filePath))
						fs.unlinkSync(filePath);
				},
				messageID
			);

		} catch (err) {
			api.setMessageReaction("❌", messageID, () => {}, true);

			if (fs.existsSync(filePath))
				fs.unlinkSync(filePath);

			api.sendMessage(
				`× 𝗘𝗿𝗿𝗼𝗿: ${err.message || "𝗔𝗣𝗜 𝗘𝗿𝗿𝗼𝗿"}`,
				threadID,
				messageID
			);
		}
	}
};