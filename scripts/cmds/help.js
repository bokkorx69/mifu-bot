const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "1.18",
    author: "𝘕𝘶𝘭𝘭",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View command usage",
    },
    longDescription: {
      en: "View command usage and list all commands or commands by category",
    },
    category: "info",
    guide: {
      en: "{pn} / help cmdName\n{pn} -c <categoryName>",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = "";

      msg += `╔══════════════╗\n🔹 𝑪𝑶𝑴𝑴𝑨𝑵𝑷 𝑳𝑰𝑺𝑻 🔹\n╚══════════════╝\n`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;

        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).forEach((category) => {
        if (category !== "info") {
          msg += `\n╭────────────⭓\n│『 ${category.toUpperCase()} 』`;

          const names = categories[category].commands.sort();
          names.forEach((item) => {
            msg += `\n│𖤍 ${item}`;
          });

          msg += `\n╰────────⭓`;
        }
      });

      const totalCommands = commands.size;
      msg += `\n𝗖𝘂𝗿𝗿𝗲𝗻𝘁𝗹𝘆, 𝘁𝗵𝗲 𝗯𝗼𝘁 𝗵𝗮𝘀 ${totalCommands} 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀 𝘁𝗵𝗮𝘁 𝗰𝗮𝗻 𝗯𝗲 𝘂𝘀𝗲𝗱\n`;
      msg += `\n𝗧𝘆𝗽𝗲 ${prefix}𝗵𝗲𝗹𝗽 𝗰𝗺𝗱𝗡𝗮𝗺𝗲 𝘁𝗼 𝘃𝗶𝗲𝘄 𝘁𝗵𝗲 𝗱𝗲𝘁𝗮𝗶𝗹𝘀 𝗼𝗳 𝘁𝗵𝗮𝘁 𝗰𝗼𝗺𝗺𝗮𝗻𝗱\n`;
      msg += `\n𝑩𝑶𝑻 𝑵𝑨𝑴𝑬`
      msg += `\n• 𝑻𝒐𝒎 𝑳𝒊𝒕𝑒 🦠`;
      msg += `\n 𝐁𝐎𝐓 𝐎𝐖𝐍𝐄𝐑 `;
      msg += `\n~𝙉𝘼𝙈𝙀: 𝘉𝘰𝘬𝘬𝘰𝘳`;
      msg += `\n~𝙁𝘽: https://www.facebook.com/bokkor.ahmed.69`;

      await message.reply({
        body: msg,
      });
    } else if (args[0] === "-c") {
      if (!args[1]) {
        await message.reply("Please specify a category name.");
        return;
      }

      const categoryName = args[1].toLowerCase();
      const filteredCommands = Array.from(commands.values()).filter(
        (cmd) => cmd.config.category?.toLowerCase() === categoryName
      );

      if (filteredCommands.length === 0) {
        await message.reply(`No commands found in the category "${categoryName}".`);
        return;
      }

      let msg = `╔══════════════╗\n༒︎ ${categoryName.toUpperCase()} COMMANDS ༒︎\n╚══════════════╝\n`;

      filteredCommands.forEach((cmd) => {
        msg += `\n☠︎︎ ${cmd.config.name} `;
      });

      await message.reply(msg);
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`Command "${commandName}" not found.`);
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Unknown";

        const longDescription = configCommand.longDescription
          ? configCommand.longDescription.en || "No description"
          : "No description";

        const guideBody = configCommand.guide?.en || "No guide available.";
        const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

        const response = `✨ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 𝐃𝐞𝐭𝐚𝐢𝐥𝐬 ✨\n\n` +
          `🌟 𝐍𝐚𝐦𝐞: ${configCommand.name}\n` +
          `🔀 𝐀𝐥𝐢𝐚𝐬𝐞𝐬: ${configCommand.aliases ? configCommand.aliases.join(", ") : "None"}\n` +
          `📜 𝐃𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧: ${longDescription}\n` +
          `🛠️ 𝐔𝐬𝐚𝐠𝐞: ${usage}\n` +
          `🗂️ 𝐕𝐞𝐫𝐬𝐢𝐨𝐧: ${configCommand.version || "1.0"}\n` +
          `⏳ 𝐂𝐨𝐨𝐥𝐝𝐨𝐰𝐧: ${configCommand.countDown || 0}s\n` +
          `🔑 𝐑𝐞𝐪𝐮𝐢𝐫𝐞𝐝 𝐑𝐨𝐥𝐞: ${roleText}`;

        await message.reply({
          body: response,
        });
      }
    }
  },
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0:
      return "0 (All users)";
    case 1:
      return "1 (Group administrators)";
    case 2:
      return "2 (Admin bot)";
    default:
      return "Unknown role";
  }
}