const { findUid } = global.utils;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    config: {
        name: "add",
        version: "1.6",
        author: "NTKhang × Bokkor x69",
        countDown: 5,
        role: 1,
        description: {
            vi: "Thêm thành viên vào box chat của bạn",
            en: "𝐀𝐝𝐝 𝐮𝐬𝐞𝐫 𝐭𝐨 𝐛𝐨𝐱 𝐜𝐡𝐚𝐭 𝐨𝐟 𝐲𝐨𝐮"
        },
        category: "𝐛𝐨𝐱 𝐜𝐡𝐚𝐭",
        guide: {
            en: "   {pn} [𝐥𝐢𝐧𝐤 𝐩𝐫𝐨𝐟𝐢𝐥𝐞 | 𝐮𝐢𝐝] 𝐨𝐫 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚 𝐮𝐬𝐞𝐫 𝐦𝐞𝐬𝐬𝐚𝐠𝐞"
        }
    },

    langs: {
        vi: {
            alreadyInGroup: "Đã có trong nhóm",
            successAdd: "- Đã thêm thành công %1 thành viên vào nhóm",
            failedAdd: "- Không thể thêm %1 thành viên vào nhóm",
            approve: "- Đã thêm %1 thành viên vào danh sách phê duyệt",
            invalidLink: "Vui lòng nhập link facebook hợp lệ",
            cannotGetUid: "Không thể lấy được uid của người dùng này",
            linkNotExist: "Profile url này không tồn tại",
            cannotAddUser: "Bot bị chặn tính năng hoặc người dùng này chặn người lạ thêm vào nhóm"
        },
        en: {
            alreadyInGroup: "𝐀𝐥𝐫𝐞𝐚𝐝𝐲 𝐢𝐧 𝐠𝐫𝐨𝐮𝐩",
            successAdd: "✅ - 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲 𝐚𝐝𝐝𝐞𝐝 %𝟏 𝐦𝐞𝐦𝐛𝐞𝐫𝐬 𝐭𝐨 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩",
            failedAdd: "❌ - 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐚𝐝𝐝 %𝟏 𝐦𝐞𝐦𝐛𝐞𝐫𝐬 𝐭𝐨 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩",
            approve: "⏳ - 𝐀𝐝𝐝𝐞𝐝 %𝟏 𝐦𝐞𝐦𝐛𝐞𝐫𝐬 𝐭𝐨 𝐭𝐡𝐞 𝐚𝐩𝐩𝐫𝐨𝐯𝐚𝐥 𝐥𝐢𝐬𝐭",
            invalidLink: "𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐟𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐥𝐢𝐧𝐤",
            cannotGetUid: "𝐂𝐚𝐧𝐧𝐨𝐭 𝐠𝐞𝐭 𝐮𝐢𝐝 𝐨𝐟 𝐭𝐡𝐢𝐬 𝐮𝐬𝐞𝐫",
            linkNotExist: "𝐓𝐡𝐢𝐬 𝐩𝐫𝐨𝐟𝐢𝐥𝐞 𝐮𝐫𝐥 𝐝𝐨𝐞𝐬 𝐧𝐨𝐭 𝐞𝐱𝐢𝐬𝐭",
            cannotAddUser: "𝐁𝐨𝐭 𝐢𝐬 𝐛𝐥𝐨𝐜𝐤𝐞𝐝 𝐨𝐫 𝐭𝐡𝐢𝐬 𝐮𝐬𝐞𝐫 𝐛𝐥𝐨𝐜𝐤𝐞𝐝 𝐬𝐭𝐫𝐚𝐧𝐠𝐞𝐫𝐬 𝐟𝐫𝐨𝐦 𝐚𝐝𝐝𝐢𝐧𝐠 𝐭𝐨 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩"
        }
    },

    onStart: async function ({ message, api, event, args, threadsData, getLang }) {
        const { members, adminIDs, approvalMode } = await threadsData.get(event.threadID);
        const botID = api.getCurrentUserID();

        const targetList = [...args];
        if (event.type === "message_reply" && event.messageReply?.senderID) {
            targetList.push(event.messageReply.senderID);
        }

        const success = [
            {
                type: "success",
                uids: []
            },
            {
                type: "waitApproval",
                uids: []
            }
        ];
        const failed = [];

        function checkErrorAndPush(messageError, item) {
            item = item.replace(/(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)/i, '');
            const findType = failed.find(error => error.type == messageError);
            if (findType)
                findType.uids.push(item);
            else
                failed.push({
                    type: messageError,
                    uids: [item]
                });
        }

        const regExMatchFB = /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]+)(?:\/)?/i;
        for (const item of targetList) {
            let uid;
            let continueLoop = false;

            if (isNaN(item) && regExMatchFB.test(item)) {
                for (let i = 0; i < 10; i++) {
                    try {
                        uid = await findUid(item);
                        break;
                    }
                    catch (err) {
                        if (err.name == "SlowDown" || err.name == "CannotGetData") {
                            await sleep(1000);
                            continue;
                        }
                        else if (i == 9 || (err.name != "SlowDown" && err.name != "CannotGetData")) {
                            checkErrorAndPush(
                                err.name == "InvalidLink" ? getLang('invalidLink') :
                                    err.name == "CannotGetData" ? getLang('cannotGetUid') :
                                        err.name == "LinkNotExist" ? getLang('linkNotExist') :
                                            err.message,
                                item
                            );
                            continueLoop = true;
                            break;
                        }
                    }
                }
            }
            else if (!isNaN(item))
                uid = item;
            else
                continue;

            if (continueLoop == true)
                continue;

            if (members.some(m => m.userID == uid && m.inGroup)) {
                checkErrorAndPush(getLang("alreadyInGroup"), item);
            }
            else {
                try {
                    await api.addUserToGroup(uid, event.threadID);
                    if (approvalMode === true && !adminIDs.includes(botID))
                        success[1].uids.push(uid);
                    else
                        success[0].uids.push(uid);
                }
                catch (err) {
                    checkErrorAndPush(getLang("cannotAddUser"), item);
                }
            }
        }

        const lengthUserSuccess = success[0].uids.length;
        const lengthUserWaitApproval = success[1].uids.length;
        const lengthUserError = failed.length;

        let msg = "";
        if (lengthUserSuccess)
            msg += `${getLang("successAdd", lengthUserSuccess)}\n`;
        if (lengthUserWaitApproval)
            msg += `${getLang("approve", lengthUserWaitApproval)}\n`;
        if (lengthUserError)
            msg += `${getLang("failedAdd", failed.reduce((a, b) => a + b.uids.length, 0))} ${failed.reduce((a, b) => a += `\n    + ${b.uids.join('\n      ')}: ${b.type}`, "")}`;
        await message.reply(msg);
    }
};