const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "info",
    version: 2.0,
    author: "OtinXSandip",
    usePrefix: false,
    longDescription: "info about bot and owner",
    category: "info",
    guide: {
      en: "{p}{n}",
    },
  },

  onStart: async function ({ event, message, usersData }) {

    const attachment = fs.createReadStream(
      path.join(__dirname, "cache", "info.jpg")
    );

    const id = event.senderID;
    const userData = await usersData.get(id);
    const name = userData.name;

    const ment = [{ id, tag: name }];

    message.reply({
      body: `🍒𝐎𝐰𝐧𝐞𝐫 𝐢𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧🌸\n\n- 🙋‍♂️𝘕𝘢𝘮𝘦: 𝘉𝘰𝘬𝘬𝘰𝘳\n\n- 🌸𝘈𝘨𝘦 : 18+\n\n- 🌸 𝘊𝘭𝘢𝘴𝘴: 𝗦𝗦𝗖 𝟮𝟬𝟮𝟱\n\n- 🌸 𝘍𝘳𝘰𝘮: 𝘒𝘩𝘶𝘭𝘯𝘢 , 𝘔𝘦𝘩𝘦𝘳𝘱𝘶𝘳\n\n- 🌸 𝘙𝘦𝘭𝘢𝘵𝘪𝘰𝘯𝘚𝘩𝘪𝘱: 𝘚𝘪𝘯𝘨𝘭𝘦 \n\n - 🌸 𝘗𝘳𝘰𝘧𝘪𝘭𝘦: https://www.facebook.com/bokkor.ahmed.69\n\n - 🌸 𝐇𝐨𝐛𝐛𝐢𝐞𝐬: ✨𝗥𝗲𝗹𝗶𝗴𝗶𝗼𝘂𝘀 𝗱𝗶𝘀𝗰𝘂𝘀𝘀𝗶𝗼𝗻𝘀✨ 𝗪𝗮𝘁𝗰𝗵𝗶𝗻𝗴 𝗽𝗶𝗰𝘁𝘂𝗿𝗲𝘀✨ 𝗥𝗲𝗮𝗱𝗶𝗻𝗴 𝗯𝗼𝗼𝗸𝘀✨ 𝗚𝗼𝗶𝗻𝗴 𝗳𝗼𝗿 𝗹𝗮𝘁𝗲 𝗻𝗶𝗴𝗵𝘁 𝘄𝗮𝗹𝗸𝘀✨ 𝗛𝗮𝗻𝗴𝗶𝗻𝗴 𝗼𝘂𝘁 𝘄𝗶𝘁𝗵 𝘁𝗵𝗲 𝗽𝗲𝗿𝘀𝗼𝗻 𝘆𝗼𝘂 𝗹𝗼𝘃𝗲✨ 𝗠𝗮𝗸𝗶𝗻𝗴 𝗵𝗶𝗺 𝗵𝗮𝗽𝗽𝘆.\n\n - 🌸 𝐃𝐞𝐬𝐢𝐫𝐞: 𝗧𝗼 𝗺𝗮𝗸𝗲 𝗮 𝗛𝗮𝗹𝗮𝗹 𝗠𝘂𝘀𝗹𝗶𝗺 𝘃𝗲𝗶𝗹𝗲𝗱 𝗴𝗶𝗿𝗹 𝗮𝘀 𝗮 𝗹𝗶𝗳𝗲 𝗽𝗮𝗿𝘁𝗻𝗲𝗿.❤🙂♣️\n\n\nভালো থাকুক পৃথিবীর সকল মা-বাবা💗☺♣️`,
      mentions: ment,
      attachment
    });
  }
};