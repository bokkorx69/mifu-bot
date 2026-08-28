const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const API_ENDPOINT = "https://api.noobx.gt.tc/api/filter";
const FILTERS = ["professional", "idcard", "ghibli", "cyberpunk", "comics", "sketch", "monet", "magic", "avatar", "manga"];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function toFont(text) {
  const map = {
    A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",I:"𝐈",J:"𝐉",K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",Y:"𝐘",Z:"𝐙",
    a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",f:"𝐟",g:"𝐠",h:"𝐡",i:"𝐢",j:"𝐣",k:"𝐤",l:"𝐥",m:"𝐦",n:"𝐧",o:"𝐨",p:"𝐩",q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",u:"𝐮",v:"𝐯",w:"𝐰",x:"𝐱",y:"𝐲",z:"𝐳",
    "0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗"," ":" ",".":".",",":",","!":"!","?":"?",":":":","-":"-","_":"_","/":"/","(":"(",")":")","'":"'"
  };
  return String(text).split("").map(char => map[char] || char).join("");
}

function formatName(type) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function getFilterType(input) {
  if (!input) return null;
  const value = String(input).trim().toLowerCase();
  if (/^\d+$/.test(value)) {
    const index = Number(value) - 1;
    return (index >= 0 && index < FILTERS.length) ? FILTERS[index] : null;
  }
  return FILTERS.includes(value) ? value : null;
}

function getFilterList() {
  return FILTERS.map((filter, index) => `├‣ ${toFont(index + 1)}. 𝐅𝐈𝐋𝐓𝐄𝐑: ${toFont(formatName(filter))}`).join("\n");
}

function isValidImageAttachment(attachment) {
  if (!attachment) return false;
  return attachment.type === "photo" || attachment.type === "image";
}

module.exports = {
  config: {
    name: "filter",
    aliases: ["f", "filterimg", "imgfilter", "photoFilter"],
    version: "3.1.0",
    author: "Bokkor x69",
    countDown: 8,
    role: 0,
    description: { en: "Apply professional AI filters to photos.", bn: "আপনার ছবিতে বিভিন্ন AI filter apply করুন।" },
    category: "IMAGE",
    guide: {
      en: "{pn} list\n{pn} <number>\n{pn} <filter>\n\nReply to a photo before using the command.\n\nExample:\n{pn} 1\n{pn} ghibli\n{pn} cyberpunk",
      bn: "{pn} list\n{pn} <number>\n{pn} <filter>\n\nএকটি ছবিতে reply দিয়ে command ব্যবহার করুন।"
    }
  },
  langs: {
    en: {
      noImage: "❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚 𝐩𝐡𝐨𝐭𝐨 𝐟𝐢𝐫𝐬𝐭.",
      invalid: "❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐟𝐢𝐥𝐭𝐞𝐫.\n\n𝐔𝐬𝐞 𝐚 𝐧𝐮𝐦𝐛𝐞𝐫 𝐨𝐫 𝐟𝐢𝐥𝐭𝐞𝐫 𝐧𝐚𝐦𝐞.\n\n%1",
      processing: "╭───────────────❍\n│ 𝐀𝐈 𝐅𝐈𝐋𝐓𝐄𝐑\n╰───────────────❍\n\n⏳ 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠...\n\n✦ 𝐅𝐢𝐥𝐭𝐞𝐫: %1",
      success: "╭───────────────❍\n│ 𝐀𝐈 𝐅𝐈𝐋𝐓𝐄𝐑\n╰───────────────❍\n\n✦ 𝐅𝐢𝐥𝐭𝐞𝐫: %1\n✦ 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞𝐝",
      list: "╭──────────────────❍\n│   𝐀𝐈 𝐅𝐈𝐋𝐓𝐄𝐑𝐒\n╰──────────────────❍\n\n%1\n\n╰──────────────────‣\n𝐔𝐬𝐞: 𝐟𝐢𝐥𝐭𝐞𝐫 𝟏 𝐨𝐫 𝐟𝐢𝐥𝐭𝐞𝐫 𝐠𝐡𝐢𝐛𝐥𝐢",
      error: "╭───────────────❍\n│   ❌ 𝐅𝐈𝐋𝐓𝐄𝐑 𝐄𝐑𝐑𝐎𝐑\n╰───────────────❍\n\n✦ 𝐑𝐞𝐚𝐬𝐨𝐧: %1"
    }
  },
  onStart: async function({ api, event, args, message, getLang }) {
    const { messageID } = event;
    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    let waitMsg = null, outputPath = null;

    try {
      const action = String(args[0] || "").trim().toLowerCase();
      if (["list", "ls", "help"].includes(action)) {
        return message.reply(getLang("list", getFilterList()));
      }

      const attachment = event.messageReply?.attachments?.[0];
      if (!isValidImageAttachment(attachment)) return message.reply(getLang("noImage"));

      const filterType = getFilterType(args[0]);
      if (!filterType) return message.reply(getLang("invalid", getFilterList()));

      const filterName = formatName(filterType);

      api.setMessageReaction("⏳", messageID, () => {}, true);
      waitMsg = await message.reply(getLang("processing", toFont(filterName)));

      const response = await axios.get(API_ENDPOINT, {
        params: { url: attachment.url, type: filterType },
        timeout: 180000,
        validateStatus: status => status >= 200 && status < 500
      });

      if (response.data?.status !== "success") {
        throw new Error(response.data?.response || "API returned an error.");
      }

      const resultUrl = response.data?.response;
      if (!resultUrl || typeof resultUrl !== "string") {
        throw new Error("API did not return an image URL.");
      }

      const imageResponse = await axios.get(resultUrl, {
        responseType: "arraybuffer",
        timeout: 120000,
        maxContentLength: 25 * 1024 * 1024,
        maxBodyLength: 25 * 1024 * 1024
      });

      if (!imageResponse.data || imageResponse.data.length < 1000) {
        throw new Error("Invalid image received.");
      }

      outputPath = path.join(cacheDir, `filter_${Date.now()}.jpg`);
      await fs.writeFile(outputPath, imageResponse.data);

      if (waitMsg) {
        try { await message.unsend(waitMsg.messageID); } catch {}
      }

      await message.reply({
        body: getLang("success", toFont(filterName)),
        attachment: fs.createReadStream(outputPath)
      }, () => {
        api.setMessageReaction("✅", messageID, () => {}, true);
        setTimeout(async () => {
          try {
            if (outputPath && await fs.pathExists(outputPath)) {
              await fs.remove(outputPath);
            }
          } catch {}
        }, 15000);
      });

    } catch (error) {
      if (waitMsg) { try { await message.unsend(waitMsg.messageID); } catch {} }
      if (outputPath) { try { if (await fs.pathExists(outputPath)) await fs.remove(outputPath); } catch {} }

      api.setMessageReaction("❌", messageID, () => {}, true);
      let errorMessage = error?.message || "Unknown API error.";
      if (error?.code === "ECONNABORTED") errorMessage = "API request timed out.";

      return message.reply(getLang("error", errorMessage));
    }
  }
};