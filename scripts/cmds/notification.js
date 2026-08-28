const { getStreamsFromAttachment } = global.utils;

const ADMIN_ID = "61558455297317";

const MEDIA_TYPES = [
	"photo",
	"png",
	"animated_image",
	"video",
	"audio"
];

module.exports = {
	config: {
		name: "noti",
		version: "7.0",
		author: "Bokkor x69",
		countDown: 5,

		// Must be 0 so normal users can reply to broadcast
		role: 0,

		description: {
			en: "Admin broadcast with two-way reply system"
		},

		category: "owner",

		guide: {
			en: "{pn} <message>"
		},

		envConfig: {
			delayPerGroup: 300,
			maxConcurrent: 3,
			skipCurrentThread: false
		}
	},

	langs: {
		en: {
			noMessage:
				"╭━━〔 𝐁𝐎𝐊𝐊𝐎𝐑 𝐗𝟔𝟗 〕━━╮\n" +
				"│ ❌ 𝐌𝐞𝐬𝐬𝐚𝐠𝐞 𝐫𝐞𝐪𝐮𝐢𝐫𝐞𝐝\n" +
				"╰━━━━━━━━━━━━━━━━╯",

			noPermission:
				"╭━━〔 𝐁𝐎𝐊𝐊𝐎𝐑 𝐗𝟔𝟗 〕━━╮\n" +
				"│ ❌ 𝐎𝐧𝐥𝐲 𝐚𝐝𝐦𝐢𝐧 𝐜𝐚𝐧 𝐮𝐬𝐞 𝐧𝐨𝐭𝐢\n" +
				"╰━━━━━━━━━━━━━━━━╯",

			noGroups:
				"╭━━〔 𝐁𝐎𝐊𝐊𝐎𝐑 𝐗𝟔𝟗 〕━━╮\n" +
				"│ ⚠️ 𝐍𝐨 𝐠𝐫𝐨𝐮𝐩𝐬 𝐟𝐨𝐮𝐧𝐝\n" +
				"╰━━━━━━━━━━━━━━━━╯",

			start:
				"╭━━〔 𝐁𝐎𝐊𝐊𝐎𝐑 𝐗𝟔𝟗 〕━━╮\n" +
				"│ 📢 𝐁𝐫𝐨𝐚𝐝𝐜𝐚𝐬𝐭\n" +
				"│ 👥 %1 𝐆𝐫𝐨𝐮𝐩𝐬\n" +
				"│ 🔄 𝐒𝐞𝐧𝐝𝐢𝐧𝐠...\n" +
				"╰━━━━━━━━━━━━━━━━╯",

			progress:
				"╭━━〔 𝐁𝐎𝐊𝐊𝐎𝐑 𝐗𝟔𝟗 〕━━╮\n" +
				"│ 📤 %1/%2\n" +
				"│ ✅ %3   ❌ %4\n" +
				"│ 🔄 𝐒𝐞𝐧𝐝𝐢𝐧𝐠...\n" +
				"╰━━━━━━━━━━━━━━━━╯",

			done:
				"╭━━〔 𝐁𝐎𝐊𝐊𝐎𝐑 𝐗𝟔𝟗 〕━━╮\n" +
				"│ 📢 𝐁𝐫𝐨𝐚𝐝𝐜𝐚𝐬𝐭 𝐃𝐨𝐧𝐞\n" +
				"│ 👥 %1   ✅ %2   ❌ %3\n" +
				"│ ⏱️ %4𝐬\n" +
				"╰━━━━━━━━━━━━━━━━╯",

			inbox:
				"╭━━〔 📩 𝐍𝐄𝐖 𝐑𝐄𝐏𝐋𝐘 〕━━╮\n" +
				"│ 👥 %1\n" +
				"│ 👤 %2\n" +
				"╰━━━━━━━━━━━━━━━━╯\n" +
				"│ 💬 %3\n\n" +
				"↩️ 𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧𝐬𝐰𝐞𝐫",

			replied:
				"╭━━〔 📤 𝐑𝐄𝐏𝐋𝐈𝐄𝐃 〕━━╮\n" +
				"│ 👥 %1\n" +
				"│ 👤 %2\n" +
				"│ ✅ 𝐒𝐞𝐧𝐭 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲\n" +
				"╰━━━━━━━━━━━━━━━━╯",

			replyError:
				"╭━━〔 ❌ 𝐄𝐑𝐑𝐎𝐑 〕━━╮\n" +
				"│ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐬𝐞𝐧𝐝 𝐫𝐞𝐩𝐥𝐲\n" +
				"╰━━━━━━━━━━━━━━━━╯"
		}
	},

	// ============================================================
	// NOTI COMMAND
	// ============================================================

	onStart: async function ({
		message,
		api,
		event,
		args,
		commandName,
		envCommands,
		threadsData,
		getLang
	}) {

		// ========================================================
		// MANUAL ADMIN CHECK
		// ========================================================

		if (
			String(event.senderID) !==
			String(ADMIN_ID)
		) {
			return message.reply(
				getLang("noPermission")
			);
		}

		// ========================================================
		// CONFIG
		// ========================================================

		const config =
			envCommands?.[commandName] || {};

		const delay =
			Math.max(
				0,
				Number(config.delayPerGroup) || 300
			);

		const concurrent =
			Math.max(
				1,
				Number(config.maxConcurrent) || 3
			);

		const skipCurrent =
			config.skipCurrentThread === true;

		// ========================================================
		// MESSAGE
		// ========================================================

		if (!args?.length) {
			return message.reply(
				getLang("noMessage")
			);
		}

		const text =
			args.join(" ").trim();

		if (!text) {
			return message.reply(
				getLang("noMessage")
			);
		}

		// ========================================================
		// BOT ID
		// ========================================================

		let botID;

		try {
			botID =
				api.getCurrentUserID();
		}
		catch {
			return message.reply(
				"❌ 𝐁𝐨𝐭 𝐈𝐃 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝"
			);
		}

		// ========================================================
		// ATTACHMENTS
		// ========================================================

		let attachments = [];

		try {
			attachments = [
				...(event.attachments || []),
				...(event.messageReply?.attachments || [])
			].filter(item =>
				MEDIA_TYPES.includes(
					item?.type
				)
			);
		}
		catch {}

		let attachmentStreams = [];

		if (attachments.length) {
			try {
				attachmentStreams =
					await getStreamsFromAttachment(
						attachments
					);
			}
			catch {}
		}

		// ========================================================
		// BROADCAST MESSAGE
		// ========================================================

		const broadcast = {
			body:
				"╭━━〔 𝐁𝐎𝐊𝐊𝐎𝐑 𝐗𝟔𝟗 〕━━╮\n" +
				"│ 📢 𝐀𝐝𝐦𝐢𝐧 𝐍𝐨𝐭𝐢𝐜𝐞\n" +
				"╰━━━━━━━━━━━━━━━━╯\n\n" +
				text +
				"\n\n" +
				"↩️ 𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐜𝐨𝐧𝐭𝐚𝐜𝐭 𝐚𝐝𝐦𝐢𝐧"
		};

		if (
			attachmentStreams &&
			attachmentStreams.length
		) {
			broadcast.attachment =
				attachmentStreams;
		}

		// ========================================================
		// GET ALL GROUPS
		// ========================================================

		let allThreads;

		try {
			allThreads =
				await threadsData.getAll();
		}
		catch {
			return message.reply(
				"❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐥𝐨𝐚𝐝 𝐠𝐫𝐨𝐮𝐩𝐬"
			);
		}

		const groups =
			allThreads
				.filter(thread => {

					if (!thread?.isGroup)
						return false;

					const botMember =
						thread.members?.find(
							member =>
								String(
									member.userID
								) ===
								String(botID)
						);

					if (
						!botMember ||
						!botMember.inGroup
					) {
						return false;
					}

					if (
						skipCurrent &&
						String(
							thread.threadID
						) ===
						String(
							event.threadID
						)
					) {
						return false;
					}

					return true;
				})
				.map(thread =>
					String(thread.threadID)
				)
				.filter(
					(id, index, arr) =>
						arr.indexOf(id) ===
						index
				);

		if (!groups.length) {
			return message.reply(
				getLang("noGroups")
			);
		}

		// ========================================================
		// STATUS MESSAGE
		// ========================================================

		const status =
			await message.reply(
				getLang(
					"start",
					groups.length
				)
			);

		const statusID =
			status?.messageID;

		const editStatus =
			async content => {

				if (!statusID)
					return;

				try {
					await api.editMessage(
						content,
						statusID
					);
				}
				catch {}
			};

		let success = 0;
		let failed = 0;
		let processed = 0;

		const started =
			Date.now();

		// ========================================================
		// SEND GROUP
		// ========================================================

		const sendGroup =
			async threadID => {

				try {

					const sent =
						await api.sendMessage(
							broadcast,
							threadID
						);

					success++;

					// ============================================
					// REGISTER BROADCAST REPLY
					// ============================================

					if (
						sent?.messageID &&
						global.GoatBot?.onReply
					) {

						global.GoatBot.onReply.set(
							sent.messageID,
							{
								commandName:
									"noti",

								type:
									"notiUserReply",

								adminID:
									ADMIN_ID,

								groupThreadID:
									String(
										threadID
									),

								broadcastMessageID:
									String(
										sent.messageID
									)
							}
						);
					}

				}
				catch (error) {
					failed++;
				}

				processed++;
			};

		// ========================================================
		// BATCH SEND
		// ========================================================

		for (
			let i = 0;
			i < groups.length;
			i += concurrent
		) {

			const batch =
				groups.slice(
					i,
					i + concurrent
				);

			await Promise.all(
				batch.map(
					threadID =>
						sendGroup(threadID)
				)
			);

			await editStatus(
				getLang(
					"progress",
					processed,
					groups.length,
					success,
					failed
				)
			);

			if (
				i + concurrent <
					groups.length &&
				delay > 0
			) {
				await new Promise(
					resolve =>
						setTimeout(
							resolve,
							delay
						)
				);
			}
		}

		// ========================================================
		// FINAL EDIT
		// ========================================================

		const seconds =
			(
				(Date.now() -
					started) /
				1000
			).toFixed(1);

		await editStatus(
			getLang(
				"done",
				groups.length,
				success,
				failed,
				seconds
			)
		);
	},

	// ============================================================
	// REPLY SYSTEM
	// ============================================================

	onReply: async function ({
		api,
		event,
		Reply,
		usersData
	}) {

		try {

			if (!Reply)
				return;

			// ====================================================
			// USER -> ADMIN
			// ====================================================

			if (
				Reply.type ===
				"notiUserReply"
			) {

				const groupID =
					String(
						Reply.groupThreadID
					);

				// ----------------------------------------------
				// GROUP NAME
				// ----------------------------------------------

				let groupName =
					"Unknown Group";

				try {

					const threadInfo =
						await api.getThreadInfo(
							groupID
						);

					groupName =
						threadInfo?.threadName ||
						"Unknown Group";

				}
				catch {}

				// ----------------------------------------------
				// USER NAME
				// ----------------------------------------------

				let userName =
					"Unknown User";

				try {

					userName =
						await usersData.getName(
							event.senderID
						);

				}
				catch {

					try {

						const info =
							await api.getUserInfo(
								event.senderID
							);

						userName =
							info?.[
								event.senderID
							]?.name ||
							"Unknown User";

					}
					catch {}
				}

				// ----------------------------------------------
				// USER MESSAGE
				// ----------------------------------------------

				const body =
					event.body?.trim() ||
					"📎 𝐀𝐭𝐭𝐚𝐜𝐡𝐦𝐞𝐧𝐭";

				// ----------------------------------------------
				// USER ATTACHMENTS
				// ----------------------------------------------

				let media = [];

				try {

					const attachments =
						(event.attachments || [])
							.filter(item =>
								MEDIA_TYPES.includes(
									item?.type
								)
							);

					if (attachments.length) {

						media =
							await getStreamsFromAttachment(
								attachments
							);
					}

				}
				catch {}

				// ----------------------------------------------
				// ADMIN INBOX
				// ----------------------------------------------

				const inbox = {
					body:
						"╭━━〔 📩 𝐍𝐄𝐖 𝐑𝐄𝐏𝐋𝐘 〕━━╮\n" +
						`│ 👥 ${groupName}\n` +
						`│ 👤 ${userName}\n` +
						"╰━━━━━━━━━━━━━━━━╯\n" +
						`│ 💬 ${body}\n\n` +
						"↩️ 𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧𝐬𝐰𝐞𝐫"
				};

				if (media.length) {
					inbox.attachment =
						media;
				}

				// ----------------------------------------------
				// SEND TO ADMIN
				// ----------------------------------------------

				const sent =
					await api.sendMessage(
						inbox,
						ADMIN_ID
					);

				// ----------------------------------------------
				// REGISTER ADMIN REPLY
				// ----------------------------------------------

				if (
					sent?.messageID &&
					global.GoatBot?.onReply
				) {

					global.GoatBot.onReply.set(
						sent.messageID,
						{
							commandName:
								"noti",

							type:
								"notiAdminReply",

							adminID:
								ADMIN_ID,

							groupThreadID:
								groupID,

							userID:
								String(
									event.senderID
								),

							userName:
								userName,

							userMessageID:
								String(
									event.messageID
								),

							inboxMessageID:
								String(
									sent.messageID
								)
						}
					);
				}

				return;
			}

			// ====================================================
			// ADMIN -> USER
			// ====================================================

			if (
				Reply.type ===
				"notiAdminReply"
			) {

				// ----------------------------------------------
				// ADMIN SECURITY
				// ----------------------------------------------

				if (
					String(event.senderID) !==
					String(ADMIN_ID)
				) {
					return;
				}

				const groupID =
					String(
						Reply.groupThreadID
					);

				const body =
					event.body?.trim() ||
					"📎 𝐀𝐭𝐭𝐚𝐜𝐡𝐦𝐞𝐧𝐭";

				// ----------------------------------------------
				// ADMIN ATTACHMENTS
				// ----------------------------------------------

				let media = [];

				try {

					const attachments =
						(event.attachments || [])
							.filter(item =>
								MEDIA_TYPES.includes(
									item?.type
								)
							);

					if (attachments.length) {

						media =
							await getStreamsFromAttachment(
								attachments
							);
					}

				}
				catch {}

				// ----------------------------------------------
				// ADMIN REPLY MESSAGE
				// ----------------------------------------------

				const replyMessage = {
					body:
						"╭━━〔 📩 𝐀𝐃𝐌𝐈𝐍 〕━━╮\n" +
						"│ 💬 𝐑𝐞𝐩𝐥𝐲\n" +
						"╰━━━━━━━━━━━━━━╯\n\n" +
						body
				};

				if (media.length) {
					replyMessage.attachment =
						media;
				}

				// ----------------------------------------------
				// SEND TO SAME GROUP
				// AND REPLY TO SAME USER MESSAGE
				// ----------------------------------------------

				await api.sendMessage(
					replyMessage,
					groupID,
					undefined,
					Reply.userMessageID
				);

				// ----------------------------------------------
				// EDIT ADMIN INBOX MESSAGE
				// ----------------------------------------------

				try {

					await api.editMessage(
						"╭━━〔 📤 𝐑𝐄𝐏𝐋𝐈𝐄𝐃 〕━━╮\n" +
						`│ 👥 ${Reply.groupThreadID}\n` +
						`│ 👤 ${Reply.userName || Reply.userID}\n` +
						"│ ✅ 𝐒𝐞𝐧𝐭 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲\n" +
						"╰━━━━━━━━━━━━━━━━╯",
						Reply.inboxMessageID
					);

				}
				catch {}

				return;
			}

		}
		catch (error) {

			console.error(
				"[NOTI ERROR]",
				error
			);
		}
	}
};