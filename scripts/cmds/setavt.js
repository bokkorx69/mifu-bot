const axios = require("axios");

const font = (text) => {
	const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const bold = "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗";

	return text
		.split("")
		.map(char => {
			const index = normal.indexOf(char);
			return index !== -1 ? bold[index] : char;
		})
		.join("");
};

module.exports = {
	config: {
		name: "setavt",
		aliases: ["changeavt", "setavatar", "avt"],
		version: "2.0",
		author: "Bokkor x69",
		countDown: 5,
		role: 2,

		description: {
			vi: font("Đổi avatar bot"),
			en: font("Change bot avatar")
		},

		category: "owner",

		guide: {
			vi:
				font("Dùng lệnh kèm URL ảnh hoặc reply ảnh.") +
				"\n\n" +
				font("Ví dụ:") +
				"\n" +
				font("{pn} https://example.com/image.jpg") +
				"\n" +
				font("{pn} https://example.com/image.jpg Hello") +
				"\n" +
				font("{pn} https://example.com/image.jpg Hello 3600"),

			en:
				font("Use the command with an image URL or reply to an image.") +
				"\n\n" +
				font("Examples:") +
				"\n" +
				font("{pn} https://example.com/image.jpg") +
				"\n" +
				font("{pn} https://example.com/image.jpg Hello") +
				"\n" +
				font("{pn} https://example.com/image.jpg Hello 3600")
		}
	},

	langs: {
		vi: {
			cannotGetImage: font("❌ | Không thể tải hình ảnh từ URL"),
			invalidImageFormat: font("❌ | Định dạng hình ảnh không hợp lệ"),
			changedAvatar: font("✅ | Đã thay đổi avatar bot thành công"),
			noImage: font("❌ | Vui lòng cung cấp URL ảnh hoặc reply một tin nhắn có ảnh"),
			invalidUrl: font("❌ | URL hình ảnh không hợp lệ")
		},

		en: {
			cannotGetImage: font("❌ | Failed to download image from URL"),
			invalidImageFormat: font("❌ | Invalid image format"),
			changedAvatar: font("✅ | Bot avatar changed successfully"),
			noImage: font("❌ | Please provide an image URL or reply to a message containing an image"),
			invalidUrl: font("❌ | Invalid image URL")
		}
	},

	onStart: async function ({ message, event, api, args, getLang }) {

		// Get image URL
		let imageURL = null;

		if (args[0] && /^https?:\/\//i.test(args[0])) {
			imageURL = args.shift();
		}

		if (!imageURL && event.messageReply?.attachments?.length) {
			const attachment = event.messageReply.attachments.find(
				item => item.type === "photo" || item.type === "image"
			);

			imageURL = attachment?.url;
		}

		if (!imageURL && event.attachments?.length) {
			const attachment = event.attachments.find(
				item => item.type === "photo" || item.type === "image"
			);

			imageURL = attachment?.url;
		}

		if (!imageURL)
			return message.reply(getLang("noImage"));

		if (!/^https?:\/\//i.test(imageURL))
			return message.reply(getLang("invalidUrl"));

		// Expiration time
		let expirationAfter = null;

		if (args.length && /^\d+$/.test(args[args.length - 1])) {
			expirationAfter = Number(args.pop());

			if (expirationAfter <= 0)
				expirationAfter = null;
		}

		// Caption
		const caption = args.join(" ").trim();

		let response;

		try {
			response = await axios.get(imageURL, {
				responseType: "stream",
				timeout: 30000,
				maxContentLength: 15 * 1024 * 1024,
				maxBodyLength: 15 * 1024 * 1024,
				validateStatus: status => status >= 200 && status < 400
			});
		}
		catch (err) {
			return message.reply(getLang("cannotGetImage"));
		}

		// Check content type
		const contentType = response.headers["content-type"] || "";

		if (!contentType.toLowerCase().startsWith("image/")) {
			return message.reply(getLang("invalidImageFormat"));
		}

		// Required filename for FCA
		response.data.path = "avatar.jpg";

		const expirationMs = expirationAfter
			? expirationAfter * 1000
			: null;

		try {
			api.changeAvatar(
				response.data,
				caption,
				expirationMs,
				(err) => {
					if (err)
						return message.err(err);

					return message.reply(
						getLang("changedAvatar")
					);
				}
			);
		}
		catch (err) {
			return message.err(err);
		}
	}
};