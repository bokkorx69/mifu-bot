
module.exports = {
    config: {
      name: "d",
      aliases: ["del"],
      author: "S",
  role: 2,
      category: "system"
    },
  
    onStart: async function ({ api, event, args }) {
      const permission = global.GoatBot.config.ownerBot;
        if (!permission.includes(event.senderID)) {
            return message.reply("❌ ᴏɴʟʏ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ. ᴛʏᴘᴇ !ɪɴꜰᴏ ꜰᴏʀ ᴏᴡɴᴇʀ ɪɴꜰᴏ ");
        }
      const fs = require('fs');
      const path = require('path');
  
      const fileName = args[0];
  
      if (!fileName) {
        api.sendMessage("Please provide a file name to delete.", event.threadID);
        return;
      }
  
      const filePath = path.join(__dirname, fileName);
  
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
          api.sendMessage(`❎ | Failed to delete ${fileName}.`, event.threadID);
          return;
        }
        api.sendMessage(`✅ ( ${fileName} ) Deleted successfully!`, event.threadID);
      });
    }
  };