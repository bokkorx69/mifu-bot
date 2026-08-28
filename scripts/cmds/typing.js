const fs = require("fs-extra");

module.exports = {
	config: {
		name: "typing",
		aliases: [],
		version: "2.4.78",
		author: "ST | Sheikh Tamim",
		countDown: 5,
		role: 2,
		description: "Manage typing indicator for bot messages",
		category: "config",
		guide: {
			vi: "{pn} status: hiển thị trạng thái hiện tại\n" +
				"{pn} on|off: bật/tắt typing indicator\n" +
				"{pn} duration <milliseconds>: đặt thời lượng typing (ví dụ 4000)",
			en: "{pn} status: show current typing setting\n" +
				"{pn} on|off: enable/disable typing indicator\n" +
				"{pn} duration <milliseconds>: set typing duration (e.g. 4000)"
		}
	},

	langs: {
		vi: {
			status: "Typing indicator: %1\nThời lượng: %2 ms",
			enabled: "Typing indicator đã bật.",
			disabled: "Typing indicator đã tắt.",
			duration: "Typing duration đặt thành %1 ms.",
			invalidDuration: "Giá trị thời lượng không hợp lệ (phải là số > 0).",
			invalidSyntax: "Cú pháp không hợp lệ. Sử dụng: {pn} on|off|status|duration <ms>"
		},
		en: {
			status: "⌨️ 𝙏𝙮𝙥𝙞𝙣𝙜 𝙞𝙣𝙙𝙞𝙘𝙖𝙩𝙤𝙧: %1\n⏱️ 𝘿𝙪𝙧𝙖𝙩𝙞𝙤𝙣: %2 𝙢𝙨",
enabled: "✅ 𝙏𝙮𝙥𝙞𝙣𝙜 𝙞𝙣𝙙𝙞𝙘𝙖𝙩𝙤𝙧 𝙞𝙨 𝙚𝙣𝙖𝙗𝙡𝙚𝙙.",
disabled: "❌ 𝙏𝙮𝙥𝙞𝙣𝙜 𝙞𝙣𝙙𝙞𝙘𝙖𝙩𝙤𝙧 𝙞𝙨 𝙙𝙞𝙨𝙖𝙗𝙡𝙚𝙙.",
duration: "✅ 𝙏𝙮𝙥𝙞𝙣𝙜 𝙙𝙪𝙧𝙖𝙩𝙞𝙤𝙣 𝙨𝙚𝙩 𝙩𝙤 %1 𝙢𝙨.",
invalidDuration: "❌ 𝙄𝙣𝙫𝙖𝙡𝙞𝙙 𝙙𝙪𝙧𝙖𝙩𝙞𝙤𝙣 (𝙢𝙪𝙨𝙩 𝙗𝙚 𝙖 𝙣𝙪𝙢𝙗𝙚𝙧 > 0).",
invalidSyntax: "❌ 𝙄𝙣𝙫𝙖𝙡𝙞𝙙 𝙨𝙮𝙣𝙩𝙖𝙭. 𝙐𝙨𝙚: {pn} 𝙤𝙣|𝙤𝙛𝙛|𝙨𝙩𝙖𝙩𝙪𝙨|𝙙𝙪𝙧𝙖𝙩𝙞𝙤𝙣 <𝙢𝙨>"
		}
	},

	ST: async function({ message, args, getLang }) {
		const command = args[0] ? args[0].toString().toLowerCase() : "";
		const config = global.GoatBot.config || {};

		if (!command || command === "status") {
			const enabled = config.enableTypingIndicator ? "ON" : "OFF";
			const duration = Number(config.typingDuration) || 4000;
			return message.reply(getLang("status", enabled, duration));
		}

		if (command === "on" || command === "off") {
			config.enableTypingIndicator = command === "on";
			fs.writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
			if (global.GoatBot && typeof global.GoatBot.refreshFcaConfig === 'function') {
				global.GoatBot.refreshFcaConfig();
			}
			return message.reply(getLang(config.enableTypingIndicator ? "enabled" : "disabled"));
		}

		if (command === "duration") {
			if (!args[1]) return message.reply(getLang("invalidSyntax"));
			const duration = parseInt(args[1]);
			if (isNaN(duration) || duration <= 0) return message.reply(getLang("invalidDuration"));
			config.typingDuration = duration;
			fs.writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
			if (global.GoatBot && typeof global.GoatBot.refreshFcaConfig === 'function') {
				global.GoatBot.refreshFcaConfig();
			}
			return message.reply(getLang("duration", duration));
		}

		return message.reply(getLang("invalidSyntax"));
	}
};