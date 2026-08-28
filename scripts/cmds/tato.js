const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "tato",
    version: "1.7",
    author: "MahMUD",
    role: 0,
    category: "fun",
    cooldown: 10,
    guide: "tato [mention/reply/UID]",
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, messageReply, mentions } = event;

    let id2 = messageReply?.senderID || Object.keys(mentions)[0] || args[0];

    if (!id2)
      return api.sendMessage(
        "× 𝗣𝗹𝗲𝗮𝘀𝗲 𝗠𝗲𝗻𝘁𝗶𝗼𝗻, 𝗥𝗲𝗽𝗹𝘆, 𝗢𝗿 𝗣𝗿𝗼𝘃𝗶𝗱𝗲 𝗔 𝗨𝗜𝗗.",
        threadID,
        messageID
      );

    try {
      const url = `${await baseApiUrl()}/api/dig?type=tatoo&user=${id2}`;
      const img = await axios.get(url, { responseType: "arraybuffer" });

      const file = path.join(__dirname, `tatoo_${id2}.png`);
      fs.writeFileSync(file, img.data);

      api.sendMessage(
        {
          body: "",
          attachment: fs.createReadStream(file)
        },
        threadID,
        () => fs.unlinkSync(file),
        messageID
      );

    } catch (err) {
      api.sendMessage(
        `× 𝗘𝗿𝗿𝗼𝗿: ${err.message}`,
        threadID,
        messageID
      );
    }
  }
};