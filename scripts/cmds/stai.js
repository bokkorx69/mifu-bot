"use strict"; 
 
module.exports = { 
  config: { 
    name: "bbyai", 
    aliases: ["mifu", "leo"], 
    version: "2.1.0", 
    author: "BABYAI |", 
    countDown: 3, 
    role: 0, 
    usePrefix: false,   
    description: { 
      en: "BBYAI  — full project AI agent. Shell, files, web, GIF, auto-install, full bot API, multi-provider." 
    }, 
    category: "ai", 
    guide: { 
      en: "{pn} <prompt>\n" 
        + "{pn} read @login.js @account.txt\n" 
        + "{pn} find <filename>\n" 
        + "{pn} commands | events\n" 
        + "{pn} -c name.js <create command>\n" 
        + "{pn} -e name.js <create event>\n" 
        + "{pn} -fc file.js <fix command>\n" 
        + "{pn} -fe file.js <fix event>\n" 
        + "{pn} -sh <shell command>\n" 
        + "{pn} -read path/to/file\n" 
        + "{pn} -provider openrouter|groq|\n" 
        + "{pn} -clear\n" 
        + "Reply to any leo message to continue same chat." 
    } 
  }, 
 
  onStart: async function(params) { 
    return global.GoatBot.stagent.handleCommand(params); 
  }, 
 
  onReply: async function(params) { 
    const { Reply, event } = params; 
    if (!Reply || Reply.commandName !== "bbyai") return; 
    if (Reply.author && event.senderID !== Reply.author && !global.utils.isAdmin(event.senderID)) return; 
    return global.GoatBot.stagent.handleReply(params); 
  } 
};