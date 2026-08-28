const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const API_URL =
  "https://core.apis-noob-x69.rf.gd/api/pinterest";

module.exports = {
  config: {
    name: "pinsr",
    aliases: ["pinsearch", "pinterest"],
    version: "3.0",
    author: "Bokkor x69",
    countDown: 7,
    role: 0,
    description: "Search Pinterest videos",
    category: "media",
    guide: "{pn} <search>"
  },

  onStart: async function ({ api, message, args, event }) {
    if (!args.length) {
      return message.reply(
        "❀ | 𝑷𝒍𝒆𝒂𝒔𝒆 𝒆𝒏𝒕𝒆𝒓 𝒂 𝑷𝒊𝒏𝒕𝒆𝒓𝒆𝒔𝒕 𝒔𝒆𝒂𝒓𝒄𝒉."
      );
    }

    const query = args.join(" ");

    const cacheDir = path.join(__dirname, "cache");

    const filePath = path.join(
      cacheDir,
      `pinsr_${Date.now()}.mp4`
    );

    try {
      await fs.ensureDir(cacheDir);

      api.setMessageReaction(
        "⏳",
        event.messageID,
        () => {},
        true
      );

      // ─────────────────────────────
      // 𝑷𝑰𝑵𝑻𝑬𝑹𝑬𝑺𝑻 𝑨𝑷𝑰
      // ─────────────────────────────

      const response = await axios.get(API_URL, {
        params: {
          q: query
        },
        timeout: 15000,
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      });

      const data = response.data;

      if (!data?.status) {
        throw new Error("Pinterest video not found.");
      }

      // NEW RESPONSE FORMAT:
      // data.response.video

      const videoUrl = data?.response?.video;

      if (!videoUrl) {
        throw new Error("Pinterest video not found.");
      }

      // ─────────────────────────────
      // 𝑴𝑷𝟒 𝑫𝑰𝑹𝑬𝑪𝑻
      // ─────────────────────────────

      const videoResponse = await axios({
        method: "GET",
        url: videoUrl,
        responseType: "stream",
        timeout: 90000,
        maxRedirects: 5,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
          "Referer":
            "https://www.pinterest.com/"
        }
      });

      const writer =
        fs.createWriteStream(filePath);

      videoResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
        videoResponse.data.on("error", reject);
      });

      // ─────────────────────────────
      // 𝑭𝑰𝑳𝑬 𝑪𝑯𝑬𝑪𝑲
      // ─────────────────────────────

      if (
        !(await fs.pathExists(filePath)) ||
        (await fs.stat(filePath)).size === 0
      ) {
        throw new Error(
          "Video download failed."
        );
      }

      // ─────────────────────────────
      // 𝑺𝑬𝑵𝑫 𝑽𝑰𝑫𝑬𝑶
      // ─────────────────────────────

      await message.reply({
        body:
          "𝐇𝐄𝐑𝐄 𝐘𝐎𝐔𝐑 𝐕𝐈𝐃𝐄𝐎 𝐁𝐀𝐁𝐘 >𝟑 🎀",
        attachment:
          fs.createReadStream(filePath)
      });

      api.setMessageReaction(
        "✅",
        event.messageID,
        () => {},
        true
      );

    } catch (error) {
      console.error(
        "[PINSR ERROR]",
        error
      );

      api.setMessageReaction(
        "❌",
        event.messageID,
        () => {},
        true
      );

      await message.reply(
        `❀ | 𝑷𝒊𝒏𝒕𝒆𝒓𝒆𝒔𝒕 𝒗𝒊𝒅𝒆𝒐 𝒅𝒐𝒘𝒏𝒍𝒐𝒂𝒅 𝒇𝒂𝒊𝒍𝒆𝒅.`
      );

    } finally {
      try {
        if (await fs.pathExists(filePath)) {
          await fs.remove(filePath);
        }
      } catch (e) {
        console.error(
          "Cache cleanup error:",
          e.message
        );
      }
    }
  }
};