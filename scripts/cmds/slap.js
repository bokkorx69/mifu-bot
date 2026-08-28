const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
	const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
	return base.data.mahmud;
};

module.exports = {
	config: {
		name: "slap",
		aliases: ["thappor"],
		version: "1.7",
		author: "MahMUD",
		countDown: 10,
		role: 0,
		description: {
			bn: "কাউকে থাপ্পড় মারার ছবি তৈরি করুন",
			en: "Create a slap image of someone"
		},
		category: "fun",
		guide: {
			bn: '   {pn} <@tag>: কাউকে ট্যাগ করে থাপ্পড় মারুন'
				+ '\n   {pn} <uid>: UID এর মাধ্যমে থাপ্পড় মারুন'
				+ '\n   (অথবা কারো মেসেজে রিপ্লাই দিয়ে এটি ব্যবহার করুন)',
			en: '   {pn} <@tag>: Slap a tagged user'
				+ '\n   {pn} <uid>: Slap by UID'
				+ '\n   (Or reply to someone\'s message)'
		}
	},

	onStart: async function ({ api, message, args, event }) {
		const { senderID, messageReply, mentions } = event;
		let id2;

		if (messageReply) {
			id2 = messageReply.senderID;
		} else if (Object.keys(mentions).length > 0) {
			id2 = Object.keys(mentions)[0];
		} else if (args[0] && !isNaN(args[0])) {
			id2 = args[0];
		}

		if (!id2) return message.reply("Please mention, reply to, or provide a UID.");

		try {
			const baseUrl = await baseApiUrl();
			const url = `${baseUrl}/api/dig?type=slap&user=${senderID}&user2=${id2}`;

			const response = await axios.get(url, {
				responseType: "arraybuffer"
			});

			const cachePath = path.join(__dirname, "cache", `slap_${id2}.png`);

			if (!fs.existsSync(path.join(__dirname, "cache"))) {
				fs.mkdirSync(path.join(__dirname, "cache"));
			}

			fs.writeFileSync(cachePath, Buffer.from(response.data));

			await message.reply({
				body: "",
				attachment: fs.createReadStream(cachePath)
			});

			fs.unlinkSync(cachePath);
		} catch (err) {
			console.error("Error in slap command:", err);
			return message.reply(`Failed to create slap image: ${err.message}`);
		}
	}
};