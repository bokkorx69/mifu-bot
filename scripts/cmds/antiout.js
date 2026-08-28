module.exports = {
 config: {
 name: "antiout",
 version: "1.0",
 author: "Chitron Bhattacharjee",
 countDown: 5,
 role: 1, // Only admin can use this command
 shortDescription: {
 en: "Prevent members from leaving the group"
 },
 longDescription: {
 en: "Enable/disable anti-out feature that automatically adds back members who leave the group"
 },
 category: "admin",
 guide: {
 en: "{pn} [on|off] - Turn anti-out feature on or off"
 }
 },

 langs: {
 en: {
 turnedOn: "🛡️ 𝘼𝙣𝙩𝙞-𝙤𝙪𝙩 𝙛𝙚𝙖𝙩𝙪𝙧𝙚 𝙝𝙖𝙨 𝙗𝙚𝙚𝙣 𝙚𝙣𝙖𝙗𝙡𝙚𝙙 𝙛𝙤𝙧 𝙩𝙝𝙞𝙨 𝙜𝙧𝙤𝙪𝙥",
turnedOff: "🛡️ 𝘼𝙣𝙩𝙞-𝙤𝙪𝙩 𝙛𝙚𝙖𝙩𝙪𝙧𝙚 𝙝𝙖𝙨 𝙗𝙚𝙚𝙣 𝙙𝙞𝙨𝙖𝙗𝙡𝙚𝙙 𝙛𝙤𝙧 𝙩𝙝𝙞𝙨 𝙜𝙧𝙤𝙪𝙥",
missingPermission: "❌ 𝙎𝙤𝙧𝙧𝙮 𝙗𝙤𝙨𝙨! 𝙄 𝙘𝙤𝙪𝙡𝙙𝙣'𝙩 𝙖𝙙𝙙 𝙩𝙝𝙚 𝙪𝙨𝙚𝙧 𝙗𝙖𝙘𝙠.\n𝙐𝙨𝙚𝙧 %1 𝙢𝙞𝙜𝙝𝙩 𝙝𝙖𝙫𝙚 𝙗𝙡𝙤𝙘𝙠𝙚𝙙 𝙢𝙚 𝙤𝙧 𝙙𝙤𝙚𝙨𝙣'𝙩 𝙝𝙖𝙫𝙚 𝙈𝙚𝙨𝙨𝙚𝙣𝙜𝙚𝙧 𝙤𝙥𝙩𝙞𝙤𝙣 𝙚𝙣𝙖𝙗𝙡𝙚𝙙.",
addedBack: "⚠️ 𝘼𝙩𝙩𝙚𝙣𝙩𝙞𝙤𝙣 %1!\n𝙏𝙝𝙞𝙨 𝙜𝙧𝙤𝙪𝙥 𝙗𝙚𝙡𝙤𝙣𝙜𝙨 𝙩𝙤 𝙢𝙮 𝙗𝙤𝙨𝙨!\n𝙔𝙤𝙪 𝙣𝙚𝙚𝙙 𝙖𝙙𝙢𝙞𝙣 𝙘𝙡𝙚𝙖𝙧𝙖𝙣𝙘𝙚 𝙩𝙤 𝙡𝙚𝙖𝙫𝙚 𝙩𝙝𝙞𝙨 𝙜𝙧𝙤𝙪𝙥!"
 }
 },

 onStart: async function ({ args, message, event, threadsData, getLang }) {
 if (args[0] === "on") {
 await threadsData.set(event.threadID, true, "data.antiout");
 message.reply(getLang("turnedOn"));
 } 
 else if (args[0] === "off") {
 await threadsData.set(event.threadID, false, "data.antiout");
 message.reply(getLang("turnedOff"));
 }
 else {
 message.reply("Please specify 'on' or 'off' to enable/disable anti-out feature");
 }
 },

 onEvent: async function ({ event, api, threadsData, usersData, getLang }) {
 if (event.logMessageType !== "log:unsubscribe") 
 return;

 const antiout = await threadsData.get(event.threadID, "data.antiout");
 if (!antiout) 
 return;

 if (event.logMessageData.leftParticipantFbId === api.getCurrentUserID()) 
 return;

 const name = await usersData.getName(event.logMessageData.leftParticipantFbId);
 
 try {
 await api.addUserToGroup(event.logMessageData.leftParticipantFbId, event.threadID);
 api.sendMessage(getLang("addedBack", name), event.threadID);
 } 
 catch (error) {
 api.sendMessage(getLang("missingPermission", name), event.threadID);
 }
 }
};