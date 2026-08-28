module.exports = {
  config: {
    name: "pending",
    version: "1.0",
    author: "S A I M",
    countDown: 5,
    role: 2,
    shortDescription: {
      vi: "",
      en: ""
    },
    longDescription: {
      vi: "",
      en: ""
    },
    category: "Admin"
  },

  langs: {
    en: {
      invaildNumber: "%1 𝙞𝙨 𝙣𝙤𝙩 𝙖 𝙫𝙖𝙡𝙞𝙙 𝙣𝙪𝙢𝙗𝙚𝙧",
cancelSuccess: "✅ 𝙍𝙚𝙛𝙪𝙨𝙚𝙙 %1 𝙩𝙝𝙧𝙚𝙖𝙙!",
approveSuccess: "✅ 𝘼𝙥𝙥𝙧𝙤𝙫𝙚𝙙 %1 𝙩𝙝𝙧𝙚𝙖𝙙(𝙨) 𝙨𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮!",
cantGetPendingList: "❌ 𝘾𝙖𝙣'𝙩 𝙜𝙚𝙩 𝙩𝙝𝙚 𝙥𝙚𝙣𝙙𝙞𝙣𝙜 𝙡𝙞𝙨𝙩!",
returnListPending: "»「𝙋𝙀𝙉𝘿𝙄𝙉𝙂」«❮ 𝙉𝙪𝙢𝙗𝙚𝙧 𝙤𝙛 𝙩𝙝𝙧𝙚𝙖𝙙𝙨 𝙩𝙤 𝙖𝙥𝙥𝙧𝙤𝙫𝙚: %1 ❯\n\n%2",
returnListClean: "「𝙋𝙀𝙉𝘿𝙄𝙉𝙂」𝙏𝙝𝙚𝙧𝙚 𝙞𝙨 𝙣𝙤 𝙩𝙝𝙧𝙚𝙖𝙙 𝙞𝙣 𝙩𝙝𝙚 𝙥𝙚𝙣𝙙𝙞𝙣𝙜 𝙡𝙞𝙨𝙩"
}
  },

  onReply: async function ({ api, event, Reply, getLang, commandName }) {
    if (String(event.senderID) !== String(Reply.author)) return;
    const { body, threadID, messageID } = event;
    let count = 0;

    if ((isNaN(body) && body.indexOf("c") == 0) || body.indexOf("cancel") == 0) {
      const index = (body.slice(1)).split(/\s+/);
      for (const i of index) {
        if (isNaN(i) || i <= 0 || i > Reply.pending.length)
          return api.sendMessage(getLang("invaildNumber", i), threadID, messageID);
        api.removeUserFromGroup(api.getCurrentUserID(), Reply.pending[i - 1].threadID);
        count++;
      }
      return api.sendMessage(getLang("cancelSuccess", count), threadID, messageID);
    } else {
      const index = body.split(/\s+/);
      for (const i of index) {
        if (isNaN(i) || i <= 0 || i > Reply.pending.length)
          return api.sendMessage(getLang("invaildNumber", i), threadID, messageID);

        const targetThread = Reply.pending[i - 1].threadID;
        const threadInfo = await api.getThreadInfo(targetThread);
        const groupName = threadInfo.threadName || "Unnamed Group";
        const memberCount = threadInfo.participantIDs.length;
        const time = new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' });

        api.sendMessage(
`╔═══✦〘 𝙶𝚁𝙾𝚄𝙿 𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳 〙✦═══╗
┃
┃  𝙽𝚊𝚖𝚎: ${groupName}
┃  𝙶𝚛𝚘𝚞𝚙 𝙸𝙳: ${targetThread}
┃  𝙼𝚎𝚖𝚋𝚎𝚛𝚜: ${memberCount}
┃  𝙰𝚙𝚙𝚛𝚘𝚟𝚊𝚕 𝙼𝚘𝚍𝚎: ${threadInfo.approvalMode ? "On" : "Off"}
┃  𝙴𝚖𝚘𝚓𝚒: ${threadInfo.emoji || "None"}
┃  𝙹𝚘𝚒𝚗𝚎𝚍: ${time}
┃   
╚════════════════════╝`, targetThread);

        count++;
      }
      return api.sendMessage(getLang("approveSuccess", count), threadID, messageID);
    }
  },

  onStart: async function ({ api, event, getLang, commandName }) {
    const { threadID, messageID } = event;
    let msg = "", index = 1;

    try {
      const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      const pending = await api.getThreadList(100, null, ["PENDING"]) || [];
      const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);

      for (const item of list) msg += `${index++}/ ${item.name} (${item.threadID})\n`;

      if (list.length != 0) {
        return api.sendMessage(getLang("returnListPending", list.length, msg), threadID, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author: event.senderID,
            pending: list
          });
        }, messageID);
      } else return api.sendMessage(getLang("returnListClean"), threadID, messageID);

    } catch (e) {
      return api.sendMessage(getLang("cantGetPendingList"), threadID, messageID);
    }
  }
};