const fs = require('fs');

module.exports = {
  config: {
    name: "file",
    version: "2.0",
    author: "ST | Sheikh Tamim",
    countDown: 2,
    role: 2, // Only bot admin
    shortDescription: "Send bot script file",
    longDescription: "Send the content of a specified bot script file",
    category: "owner",
    guide: "{pn} <file name>\nEx: {pn} fileName"
  },

  onStart: async function ({ message, args, api, event, usersData }) {
    const { threadID, senderID, messageID } = event;
    
    // Bot Admin check
    const botAdmins = global.GoatBot.config?.ownerBot || [];//in to this box u and manual set user uid or others user uid for whos can just get access this command
    if (!botAdmins.includes(senderID)) {
      return api.sendMessage("⛔ 𝗬𝗼𝘂 𝗮𝗿𝗲 𝗻𝗼𝘁 𝗮𝘂𝘁𝗵𝗼𝗿𝗶𝘇𝗲𝗱 𝘁𝗼 𝘂𝘀𝗲 𝘁𝗵𝗶𝘀 𝗰𝗼𝗺𝗺𝗮𝗻𝗱.", threadID, messageID);
    }

    const fileName = args[0];
    if (!fileName) {
      return api.sendMessage("⚠️ Please provide a file name.\nExample: .file index", threadID, messageID);
    }

    const filePath = __dirname + `/${fileName}.js`;
    if (!fs.existsSync(filePath)) {
      return api.sendMessage(`❌ File not found: ${fileName}.js`, threadID, messageID);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    api.sendMessage({ body: `${fileContent}` }, threadID);
  }
};
