const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
    config: {
        name: "admin",
        version: "1.7",
        author: "NTKhang × Bokkor x69",
        countDown: 5,
        role: 0,
        description: {
            vi: "Thêm, xóa, sửa quyền admin",
            en: "𝐀𝐝𝐝, 𝐫𝐞𝐦𝐨𝐯𝐞, 𝐞𝐝𝐢𝐭 𝐚𝐝𝐦𝐢𝐧 𝐫𝐨𝐥𝐞"
        },
        category: "𝐛𝐨𝐱 𝐜𝐡𝐚𝐭",
        guide: {
            vi: '   {pn} [add | -a] <uid | @tag>: Thêm quyền admin cho người dùng'
                + '\n    {pn} [remove | -r] <uid | @tag>: Xóa quyền admin của người dùng'
                + '\n    {pn} [list | -l]: Liệt kê danh sách admin',
            en: '   {pn} [add | -a] <uid | @tag>: 𝐀𝐝𝐝 𝐚𝐝𝐦𝐢𝐧 𝐫𝐨𝐥𝐞 𝐟𝐨𝐫 𝐮𝐬𝐞𝐫'
                + '\n    {pn} [remove | -r] <uid | @tag>: 𝐑𝐞𝐦𝐨𝐯𝐞 𝐚𝐝𝐦𝐢𝐧 𝐫𝐨𝐥𝐞 𝐨𝐟 𝐮𝐬𝐞𝐫'
                + '\n    {pn} [list | -l]: 𝐋𝐢𝐬𝐭 𝐚𝐥𝐥 𝐚𝐝𝐦𝐢𝐧𝐬'
        }
    },

    langs: {
        vi: {
            added: "✅ | Đã thêm quyền admin cho %1 người dùng:\n%2",
            alreadyAdmin: "\n⚠️ | %1 người dùng đã có quyền admin từ trước rồi:\n%2",
            missingIdAdd: "⚠️ | Vui lòng nhập ID hoặc tag người dùng muốn thêm quyền admin",
            removed: "✅ | Đã xóa quyền admin của %1 người dùng:\n%2",
            notAdmin: "⚠️ | %1 người dùng không có quyền admin:\n%2",
            missingIdRemove: "⚠️ | Vui lòng nhập ID hoặc tag người dùng muốn xóa quyền admin",
            listAdmin: "👑 | Danh sách admin:\n%1"
        },
        en: {
            added: "✅ | 𝐀𝐝𝐝𝐞𝐝 𝐚𝐝𝐦𝐢𝐧 𝐫𝐨𝐥𝐞 𝐟𝐨𝐫 %𝟏 𝐮𝐬𝐞𝐫𝐬:\n%2",
            alreadyAdmin: "\n⚠️ | %1 𝐮𝐬𝐞𝐫𝐬 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐡𝐚𝐯𝐞 𝐚𝐝𝐦𝐢𝐧 𝐫𝐨𝐥𝐞:\n%2",
            missingIdAdd: "⚠️ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐈𝐃 𝐨𝐫 𝐭𝐚𝐠 𝐮𝐬𝐞𝐫 𝐭𝐨 𝐚𝐝𝐝 𝐚𝐝𝐦𝐢𝐧 𝐫𝐨𝐥𝐞",
            removed: "✅ | 𝐑𝐞𝐦𝐨𝐯𝐞𝐝 𝐚𝐝𝐦𝐢𝐧 𝐫𝐨𝐥𝐞 𝐨𝐟 %𝟏 𝐮𝐬𝐞𝐫𝐬:\n%2",
            notAdmin: "⚠️ | %1 𝐮𝐬𝐞𝐫𝐬 𝐝𝐨𝐧'𝐭 𝐡𝐚𝐯𝐞 𝐚𝐝𝐦𝐢𝐧 𝐫𝐨𝐥𝐞:\n%2",
            missingIdRemove: "⚠️ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐈𝐃 𝐨𝐫 𝐭𝐚𝐠 𝐮𝐬𝐞𝐫 𝐭𝐨 𝐫𝐞𝐦𝐨𝐯𝐞 𝐚𝐝𝐦𝐢𝐧 𝐫𝐨𝐥𝐞",
            listAdmin: "👑 | 𝐋𝐢𝐬𝐭 𝐨𝐟 𝐚𝐝𝐦𝐢𝐧𝐬:\n%1"
        }
    },

    onStart: async function ({ message, args, usersData, event, getLang }) {
        const action = (args[0] || "").toLowerCase();

        /*
        =========================
        LIST (Accessible to Everyone)
        =========================
        */
        if (action === "list" || action === "-l") {
            const getNames = await Promise.all(config.adminBot.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
            return message.reply(getLang("listAdmin", getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")));
        }

        /*
        =========================
        OWNER/ADMIN CHECK FOR ADD/REMOVE
        =========================
        */
        const owners = config.adminBot || [];
        if (!owners.includes(event.senderID)) {
            return message.reply(
                `╭────────────────────❍\n` +
                `│  ❌ 𝐀𝐂𝐂𝐄𝐒𝐒 𝐃𝐄𝐍𝐈𝐄𝐃\n` +
                `╰────────────────────❍\n\n` +
                `│ 𝐎𝐧𝐥𝐲 𝐁𝐨𝐭 𝐀𝐝𝐦𝐢𝐧 𝐂𝐚𝐧 𝐔𝐬𝐞 𝐓𝐡𝐢𝐬 𝐂𝐨𝐦𝐦𝐚𝐧𝐝\n` +
                `╰────────────────────`
            );
        }

        switch (action) {
            case "add":
            case "-a": {
                if (args[1]) {
                    let uids = [];
                    if (Object.keys(event.mentions).length > 0)
                        uids = Object.keys(event.mentions);
                    else if (event.messageReply)
                        uids.push(event.messageReply.senderID);
                    else
                        uids = args.filter(arg => !isNaN(arg));
                    const notAdminIds = [];
                    const adminIds = [];
                    for (const uid of uids) {
                        if (config.adminBot.includes(uid))
                            adminIds.push(uid);
                        else
                            notAdminIds.push(uid);
                    }

                    config.adminBot.push(...notAdminIds);
                    const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
                    writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
                    return message.reply(
                        (notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
                        + (adminIds.length > 0 ? getLang("alreadyAdmin", adminIds.length, adminIds.map(uid => `• ${uid}`).join("\n")) : "")
                    );
                }
                else
                    return message.reply(getLang("missingIdAdd"));
            }
            case "remove":
            case "-r": {
                if (args[1]) {
                    let uids = [];
                    if (Object.keys(event.mentions).length > 0)
                        uids = Object.keys(event.mentions);
                    else if (event.messageReply)
                        uids.push(event.messageReply.senderID);
                    else
                        uids = args.filter(arg => !isNaN(arg));
                    const notAdminIds = [];
                    const adminIds = [];
                    for (const uid of uids) {
                        if (config.adminBot.includes(uid))
                            adminIds.push(uid);
                        else
                            notAdminIds.push(uid);
                    }
                    for (const uid of adminIds)
                        config.adminBot.splice(config.adminBot.indexOf(uid), 1);
                    const getNames = await Promise.all(adminIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
                    writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
                    return message.reply(
                        (adminIds.length > 0 ? getLang("removed", adminIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
                        + (notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• ${uid}`).join("\n")) : "")
                    );
                }
                else
                    return message.reply(getLang("missingIdRemove"));
            }
            default:
                return message.SyntaxError();
        }
    }
};