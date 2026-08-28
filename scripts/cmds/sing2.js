const axios = require("axios");
const yts = require("yt-search");

module.exports = {
  config: {
    name: "shazam",
    aliases: ["finds", "find", "sing2"],
    version: "4.0.0",
    author: "Bokkor x69",
    countDown: 5,
    role: 0,
    description: "Identify any song and send audio directly.",
    category: "𝐌𝐄𝐃𝐈𝐀",
    guide: "{pn} [reply to audio/video]"
  },

  onStart: async function ({ api, event, message }) {
    const { threadID, messageID, messageReply } = event;

    if (!messageReply?.attachments?.length) {
      return message.reply(
        "⚠️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐚𝐮𝐝𝐢𝐨 𝐨𝐫 𝐯𝐢𝐝𝐞𝐨 𝐟𝐢𝐥𝐞."
      );
    }

    const attachment = messageReply.attachments[0];

    const mediaUrl =
      attachment.url ||
      attachment.playable_url ||
      attachment.audio_url ||
      attachment.raw?.playable_url ||
      attachment.raw?.audio_playable_url ||
      attachment.raw?.playableUrl ||
      attachment.raw?.url;

    if (!mediaUrl) {
      return message.reply(
        "❌ 𝐍𝐨 𝐩𝐥𝐚𝐲𝐚𝐛𝐥𝐞 𝐚𝐮𝐝𝐢𝐨/𝐯𝐢𝐝𝐞𝐨 𝐟𝐨𝐮𝐧𝐝."
      );
    }

    const AUDD_TOKEN = "428da682e4e53803df74c3294e15c260";
    if (!AUDD_TOKEN) {
      return message.reply(
        "❌  𝐀𝐏𝐈 𝐭𝐨𝐤𝐞𝐧 𝐢𝐬 𝐧𝐨𝐭 𝐬𝐞𝐭."
      );
    }

    try {
      api.setMessageReaction(
        "⏳",
        messageID,
        () => {},
        true
      );

      // ==========================================
      // 1. Recognize song with AudD
      // ==========================================

      const recognition = await axios.get(
        "https://api.audd.io/",
        {
          params: {
            api_token: "428da682e4e53803df74c3294e15c260",
            url: mediaUrl,
            return: "apple_music,spotify"
          },
          timeout: 60000
        }
      );

      const data = recognition.data;

      console.log(
        "[AUDD]",
        JSON.stringify(data, null, 2)
      );

      // ==========================================
      // 2. Check API response
      // ==========================================

      if (data?.status !== "success") {
        api.setMessageReaction(
          "❌",
          messageID,
          () => {},
          true
        );

        return message.reply(
          `❌ 𝐒𝐡𝐚𝐳𝐚𝐦 𝐟𝐚𝐢𝐥𝐞𝐝.\n\n` +
          `${data?.error?.error_message || "Unknown API error"}`
        );
      }

      if (!data.result) {
        api.setMessageReaction(
          "❌",
          messageID,
          () => {},
          true
        );

        return message.reply(
          "❌ 𝐒𝐨𝐧𝐠 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝."
        );
      }

      // ==========================================
      // 3. Get song information
      // ==========================================

      const info = data.result;

      const title =
        info.title ||
        info.name ||
        "";

      const artist =
        info.artist ||
        "";

      const album =
        info.album ||
        "";

      if (!title) {
        api.setMessageReaction(
          "❌",
          messageID,
          () => {},
          true
        );

        return message.reply(
          "❌ 𝐂𝐨𝐮𝐥𝐝 𝐧𝐨𝐭 𝐫𝐞𝐭𝐫𝐢𝐞𝐯𝐞 𝐬𝐨𝐧𝐠 𝐝𝐞𝐭𝐚𝐢𝐥𝐬."
        );
      }

      // ==========================================
      // 4. Search YouTube
      // ==========================================

      const searchQuery = `${title} ${artist}`.trim();

      const searchRes = await yts(searchQuery);

      if (!searchRes?.videos?.length) {
        api.setMessageReaction(
          "❌",
          messageID,
          () => {},
          true
        );

        return message.reply(
          `❌ 𝐒𝐨𝐧𝐠 𝐟𝐨𝐮𝐧𝐝 𝐛𝐮𝐭 𝐘𝐨𝐮𝐓𝐮𝐛𝐞 𝐯𝐢𝐝𝐞𝐨 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝.\n\n` +
          `🎵 ${title}\n` +
          `👤 ${artist}`
        );
      }

      const ytUrl = searchRes.videos[0].url;

      // ==========================================
      // 5. Download audio
      // ==========================================

      const download = await axios({
        url:
          `https://arafatas.vercel.app/download/arafatadl?url=` +
          encodeURIComponent(ytUrl),

        method: "GET",

        responseType: "stream",

        timeout: 0
      });

      // ==========================================
      // 6. Send audio
      // ==========================================

      api.setMessageReaction(
        "✅",
        messageID,
        () => {},
        true
      );

      let body =
        `𝐇𝐞𝐫𝐞 𝐘𝐨𝐮 𝐒𝐨𝐧𝐠 𝐁𝐚𝐛𝐲 >𝟑 🎀`;

      return api.sendMessage(
        {
          body,
          attachment: download.data
        },
        threadID,
        () => {},
        messageID
      );

    } catch (error) {
      console.error(
        "[SHAZAM ERROR]",
        error?.response?.data || error.message || error
      );

      api.setMessageReaction(
        "❌",
        messageID,
        () => {},
        true
      );

      return message.reply(
        "❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐢𝐝𝐞𝐧𝐭𝐢𝐟𝐲 𝐭𝐡𝐞 𝐬𝐨𝐧𝐠."
      );
    }
  }
};