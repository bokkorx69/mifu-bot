const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
	const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
	return base.data.mahmud;
};

module.exports = {
	config: {
		name: "split",
		version: "1.7",
		author: "MahMUD",
		countDown: 5,
		role: 0,
		description: {
			bn: "একটি ছবিকে দুই ভাগে বিভক্ত করুন",
			en: "Split an image into two halves",
			vi: "Chia một hình ảnh thành hai nửa"
		},
		category: "tools",
		guide: {
			bn: "   {pn} (ছবিতে রিপ্লাই দিন)",
			en: "   {pn} (reply to image)",
			vi: "   {pn} (phản hồi hình ảnh)"
		}
	},

	onStart: async function ({ api, event, message }) {
		if (!event.messageReply || !event.messageReply.attachments?.[0]?.url) {
			return message.reply("× 𝗣𝗹𝗲𝗮𝘀𝗲 𝗥𝗲𝗽𝗹𝘆 𝗧𝗼 𝗔𝗻 𝗜𝗺𝗮𝗴𝗲.");
		}

		const cacheDir = path.join(__dirname, "cache");
		if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);

		const t = Date.now();
		const leftPath = path.join(cacheDir, `left_${event.senderID}_${t}.jpg`);
		const rightPath = path.join(cacheDir, `right_${event.senderID}_${t}.jpg`);

		try {
			api.setMessageReaction("⏳", event.messageID, () => {}, true);

			const imgUrl = event.messageReply.attachments[0].url;
			const baseUrl = await baseApiUrl();

			const res = await axios.get(`${baseUrl}/api/split`, {
				params: {
					url: imgUrl
				}
			});

			if (res.data && (res.data.error || !res.data.success)) {
				throw new Error("𝗔𝗣𝗜 𝗘𝗿𝗿𝗼𝗿");
			}

			const saveImg = (b64, p) =>
				fs.writeFileSync(p, Buffer.from(b64.split(",")[1], "base64"));

			saveImg(res.data.left, leftPath);
			saveImg(res.data.right, rightPath);

			await message.reply({
				body: "✅ 𝗦𝗽𝗹𝗶𝘁 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲𝗱! 𝗛𝗲𝗿𝗲 𝗔𝗿𝗲 𝗬𝗼𝘂𝗿 𝗜𝗺𝗮𝗴𝗲𝘀:",
				attachment: [
					fs.createReadStream(leftPath),
					fs.createReadStream(rightPath)
				]
			});

			api.setMessageReaction("✅", event.messageID, () => {}, true);

			[leftPath, rightPath].forEach(p => fs.existsSync(p) && fs.unlinkSync(p));
		} catch (err) {
			console.error("𝗦𝗽𝗹𝗶𝘁 𝗘𝗿𝗿𝗼𝗿:", err);

			api.setMessageReaction("❌", event.messageID, () => {}, true);

			if (fs.existsSync(leftPath)) fs.unlinkSync(leftPath);
			if (fs.existsSync(rightPath)) fs.unlinkSync(rightPath);

			const errorMsg = err.response?.data?.error || err.message;
			return message.reply(`× 𝗘𝗿𝗿𝗼𝗿: ${errorMsg}`);
		}
	}
};