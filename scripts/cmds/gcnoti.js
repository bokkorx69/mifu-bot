
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "gcnoti",
    version: "2.4.74",
    author: "ST",
    countDown: 5,
    role: 2,
    description: {
      en: "Manage group notification settings"
    },
    category: "admin",
    guide: {
      en: "{pn} enable - Enable group notifications globally\n"
        + "{pn} disable - Disable group notifications globally\n"
        + "{pn} add [threadID] - Add thread to allowed list (use current thread if no ID provided)\n"
        + "{pn} remove [threadID] - Remove thread from allowed list\n"
        + "{pn} list - Show all allowed threads with serial numbers\n"
        + "{pn} r <serial> - Remove thread by serial number from list"
    }
  },

  langs: {
    en: {
     enabled: "✅ 𝙂𝙧𝙤𝙪𝙥 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣𝙨 𝙝𝙖𝙫𝙚 𝙗𝙚𝙚𝙣 𝙚𝙣𝙖𝙗𝙡𝙚𝙙 𝙜𝙡𝙤𝙗𝙖𝙡𝙡𝙮.",
disabled: "❌ 𝙂𝙧𝙤𝙪𝙥 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣𝙨 𝙝𝙖𝙫𝙚 𝙗𝙚𝙚𝙣 𝙙𝙞𝙨𝙖𝙗𝙡𝙚𝙙 𝙜𝙡𝙤𝙗𝙖𝙡𝙡𝙮.",
addedCurrent: "✅ 𝘼𝙙𝙙𝙚𝙙 𝙘𝙪𝙧𝙧𝙚𝙣𝙩 𝙩𝙝𝙧𝙚𝙖𝙙 𝙩𝙤 𝙜𝙧𝙤𝙪𝙥 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣 𝙡𝙞𝙨𝙩.\n𝙏𝙝𝙧𝙚𝙖𝙙 𝙄𝘿: %1\n𝙏𝙝𝙧𝙚𝙖𝙙 𝙉𝙖𝙢𝙚: %2",
addedSpecific: "✅ 𝘼𝙙𝙙𝙚𝙙 𝙩𝙝𝙧𝙚𝙖𝙙 𝙩𝙤 𝙜𝙧𝙤𝙪𝙥 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣 𝙡𝙞𝙨𝙩.\n𝙏𝙝𝙧𝙚𝙖𝙙 𝙄𝘿: %1\n𝙏𝙝𝙧𝙚𝙖𝙙 𝙉𝙖𝙢𝙚: %2",
removed: "✅ 𝙍𝙚𝙢𝙤𝙫𝙚𝙙 𝙩𝙝𝙧𝙚𝙖𝙙 𝙛𝙧𝙤𝙢 𝙜𝙧𝙤𝙪𝙥 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣 𝙡𝙞𝙨𝙩.\n𝙏𝙝𝙧𝙚𝙖𝙙 𝙄𝘿: %1",
removedBySerial: "✅ 𝙍𝙚𝙢𝙤𝙫𝙚𝙙 𝙩𝙝𝙧𝙚𝙖𝙙 𝙛𝙧𝙤𝙢 𝙡𝙞𝙨𝙩.\n𝙏𝙝𝙧𝙚𝙖𝙙 𝙄𝘿: %1\n𝙏𝙝𝙧𝙚𝙖𝙙 𝙉𝙖𝙢𝙚: %2",
alreadyExists: "⚠️ 𝙏𝙝𝙞𝙨 𝙩𝙝𝙧𝙚𝙖𝙙 𝙞𝙨 𝙖𝙡𝙧𝙚𝙖𝙙𝙮 𝙞𝙣 𝙩𝙝𝙚 𝙖𝙡𝙡𝙤𝙬𝙚𝙙 𝙡𝙞𝙨𝙩.",
notInList: "⚠️ 𝙏𝙝𝙞𝙨 𝙩𝙝𝙧𝙚𝙖𝙙 𝙞𝙨 𝙣𝙤𝙩 𝙞𝙣 𝙩𝙝𝙚 𝙖𝙡𝙡𝙤𝙬𝙚𝙙 𝙡𝙞𝙨𝙩.",
invalidSerial: "❌ 𝙄𝙣𝙫𝙖𝙡𝙞𝙙 𝙨𝙚𝙧𝙞𝙖𝙡 𝙣𝙪𝙢𝙗𝙚𝙧. 𝙋𝙡𝙚𝙖𝙨𝙚 𝙪𝙨𝙚 𝙖 𝙣𝙪𝙢𝙗𝙚𝙧 𝙛𝙧𝙤𝙢 𝙩𝙝𝙚 𝙡𝙞𝙨𝙩.",
emptyList: "📋 𝙂𝙧𝙤𝙪𝙥 𝙣𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣 𝙩𝙝𝙧𝙚𝙖𝙙 𝙡𝙞𝙨𝙩 𝙞𝙨 𝙚𝙢𝙥𝙩𝙮.\n\n𝘾𝙪𝙧𝙧𝙚𝙣𝙩 𝙨𝙩𝙖𝙩𝙪𝙨: %1\n\n𝙐𝙨𝙚 '{pn} 𝙖𝙙𝙙' 𝙩𝙤 𝙖𝙙𝙙 𝙩𝙝𝙧𝙚𝙖𝙙𝙨.",
listHeader: "📋 𝙂𝙧𝙤𝙪𝙥 𝙉𝙤𝙩𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣 𝙎𝙚𝙩𝙩𝙞𝙣𝙜𝙨\n━━━━━━━━━━━━━━━━━━━━━\n\n",
listStatus: "𝙎𝙩𝙖𝙩𝙪𝙨: %1\n\n",
listThreads: "𝘼𝙡𝙡𝙤𝙬𝙚𝙙 𝙏𝙝𝙧𝙚𝙖𝙙𝙨 (%1):\n",
listItem: "%1. %2\n   𝙄𝘿: %3\n",
noThreadName: "𝙐𝙣𝙠𝙣𝙤𝙬𝙣 𝙏𝙝𝙧𝙚𝙖𝙙",
restartRequired: "\n⚠️ 𝙋𝙡𝙚𝙖𝙨𝙚 𝙧𝙚𝙨𝙩𝙖𝙧𝙩 𝙩𝙝𝙚 𝙗𝙤𝙩 𝙛𝙤𝙧 𝙘𝙝𝙖𝙣𝙜𝙚𝙨 𝙩𝙤 𝙩𝙖𝙠𝙚 𝙚𝙛𝙛𝙚𝙘𝙩.\n𝙐𝙨𝙚: {pn}𝙧𝙚𝙨𝙩𝙖𝙧𝙩",
invalidThreadId: "❌ 𝙄𝙣𝙫𝙖𝙡𝙞𝙙 𝙩𝙝𝙧𝙚𝙖𝙙 𝙄𝘿 𝙥𝙧𝙤𝙫𝙞𝙙𝙚𝙙.",
cannotGetThreadInfo: "⚠️ 𝘾𝙤𝙪𝙡𝙙 𝙣𝙤𝙩 𝙜𝙚𝙩 𝙩𝙝𝙧𝙚𝙖𝙙 𝙞𝙣𝙛𝙤𝙧𝙢𝙖𝙩𝙞𝙤𝙣 𝙛𝙤𝙧 𝙄𝘿: %1"
    }
  },

  ST: async function({ message, args, threadsData, getLang, commandName, api, event }) {
    const configPath = path.join(__dirname, '../../config.json');
    const config = require(configPath);
    
    if (!config.groupNoti) {
      config.groupNoti = {
        enable: true,
        threadIds: []
      };
    }

    const action = args[0]?.toLowerCase();

    switch (action) {
      case "enable": {
        config.groupNoti.enable = true;
        await fs.writeJson(configPath, config, { spaces: 2 });
        global.GoatBot.config.groupNoti = config.groupNoti;
        return message.reply(getLang("enabled") + getLang("restartRequired"));
      }

      case "disable": {
        config.groupNoti.enable = false;
        await fs.writeJson(configPath, config, { spaces: 2 });
        global.GoatBot.config.groupNoti = config.groupNoti;
        return message.reply(getLang("disabled") + getLang("restartRequired"));
      }

      case "add": {
        const threadIdToAdd = args[1] || event.threadID;
        
        if (!/^\d+$/.test(threadIdToAdd)) {
          return message.reply(getLang("invalidThreadId"));
        }

        if (config.groupNoti.threadIds.includes(threadIdToAdd)) {
          return message.reply(getLang("alreadyExists"));
        }

        let threadName;
        try {
          const threadInfo = await api.getThreadInfo(threadIdToAdd);
          threadName = threadInfo.threadName || getLang("noThreadName");
        } catch (err) {
          threadName = getLang("noThreadName");
        }

        config.groupNoti.threadIds.push(threadIdToAdd);
        await fs.writeJson(configPath, config, { spaces: 2 });
        global.GoatBot.config.groupNoti = config.groupNoti;

        if (args[1]) {
          return message.reply(getLang("addedSpecific", threadIdToAdd, threadName) + getLang("restartRequired"));
        } else {
          return message.reply(getLang("addedCurrent", threadIdToAdd, threadName) + getLang("restartRequired"));
        }
      }

      case "remove": {
        const threadIdToRemove = args[1] || event.threadID;
        
        if (!/^\d+$/.test(threadIdToRemove)) {
          return message.reply(getLang("invalidThreadId"));
        }

        const index = config.groupNoti.threadIds.indexOf(threadIdToRemove);
        if (index === -1) {
          return message.reply(getLang("notInList"));
        }

        config.groupNoti.threadIds.splice(index, 1);
        await fs.writeJson(configPath, config, { spaces: 2 });
        global.GoatBot.config.groupNoti = config.groupNoti;

        return message.reply(getLang("removed", threadIdToRemove) + getLang("restartRequired"));
      }

      case "r": {
        const serial = parseInt(args[1]);
        
        if (isNaN(serial) || serial < 1 || serial > config.groupNoti.threadIds.length) {
          return message.reply(getLang("invalidSerial"));
        }

        const threadIdToRemove = config.groupNoti.threadIds[serial - 1];
        let threadName;
        
        try {
          const threadInfo = await api.getThreadInfo(threadIdToRemove);
          threadName = threadInfo.threadName || getLang("noThreadName");
        } catch (err) {
          threadName = getLang("noThreadName");
        }

        config.groupNoti.threadIds.splice(serial - 1, 1);
        await fs.writeJson(configPath, config, { spaces: 2 });
        global.GoatBot.config.groupNoti = config.groupNoti;

        return message.reply(getLang("removedBySerial", threadIdToRemove, threadName) + getLang("restartRequired"));
      }

      case "list":
      default: {
        const status = config.groupNoti.enable ? "✅ Enabled" : "❌ Disabled";
        
        if (config.groupNoti.threadIds.length === 0) {
          return message.reply(getLang("emptyList", status));
        }

        let msg = getLang("listHeader");
        msg += getLang("listStatus", status);
        msg += getLang("listThreads", config.groupNoti.threadIds.length);

        for (let i = 0; i < config.groupNoti.threadIds.length; i++) {
          const tid = config.groupNoti.threadIds[i];
          let threadName;
          
          try {
            const threadInfo = await api.getThreadInfo(tid);
            threadName = threadInfo.threadName || getLang("noThreadName");
          } catch (err) {
            threadName = getLang("cannotGetThreadInfo", tid);
          }

          msg += getLang("listItem", i + 1, threadName, tid);
        }

        msg += "\n━━━━━━━━━━━━━━━━━━━━━";
        msg += `\n\n💡 Use '{pn} r <serial>' to remove by number`;

        return message.reply(msg);
      }
    }
  }
};
