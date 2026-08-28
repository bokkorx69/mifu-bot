const axios = require("axios");
const ytSearch = require("yt-search");

module.exports = {
  config: {
    name: "sing3",
    version: "25.2",
    author: "Bokkor x69",
    role: 0,
    description: {
      en: "Music Downloader"
    },
    category: "audio"
  },

  onStart: async ({ api, args, event }) => {
    if (!args.length) {
      return api.sendMessage(
        "𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐲𝐩𝐞 𝐚 𝐬𝐨𝐧𝐠 𝐧𝐚𝐦𝐞.",
        event.threadID,
        event.messageID
      );
    }

    const keyword = args.join(" ");

    try {
      api.setMessageReaction(
        "⏳",
        event.messageID,
        () => {},
        true
      );

      let results = [];

      // YouTube Search
      try {
        const searchResult = await ytSearch(keyword);
        results = searchResult.videos.slice(0, 1);
      } catch (err) {
        console.log("YT-SEARCH ERROR:", err.message);
      }

      if (!results.length) {
        api.setMessageReaction(
          "❌",
          event.messageID,
          () => {},
          true
        );

        return api.sendMessage(
          "𝐍𝐨 𝐬𝐨𝐧𝐠𝐬 𝐟𝐨𝐮𝐧𝐝.",
          event.threadID,
          event.messageID
        );
      }

      const video = results[0];

      console.log("YouTube URL:", video.url);

      // New SingXarafat API
      const finalURL =
        `https://singxarafat-production.up.railway.app/fast?url=${encodeURIComponent(video.url)}`;

      console.log("Download API:", finalURL);

      let res;

      try {
        res = await axios({
          url: finalURL,
          method: "GET",
          responseType: "stream",
          timeout: 60000,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36"
          },
          maxRedirects: 5
        });
      } catch (axiosErr) {
        console.log("DOWNLOAD API ERROR:", axiosErr.message);

        api.setMessageReaction(
          "❌",
          event.messageID,
          () => {},
          true
        );

        return api.sendMessage(
          `𝐀𝐏𝐈 𝐫𝐞𝐪𝐮𝐞𝐬𝐭 𝐟𝐚𝐢𝐥𝐞𝐝.\n𝐑𝐞𝐚𝐬𝐨𝐧: ${axiosErr.message}`,
          event.threadID,
          event.messageID
        );
      }

      if (!res || res.status !== 200) {
        api.setMessageReaction(
          "❌",
          event.messageID,
          () => {},
          true
        );

        return api.sendMessage(
          `𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐟𝐚𝐢𝐥𝐞𝐝.\n𝐒𝐭𝐚𝐭𝐮𝐬: ${res?.status || "Unknown"}`,
          event.threadID,
          event.messageID
        );
      }

      api.setMessageReaction(
        "✅",
        event.messageID,
        () => {},
        true
      );

      // Send audio
      await api.sendMessage(
        {
          body: `𝐇𝐞𝐫𝐞 𝐘𝐨𝐮 𝐒𝐨𝐧𝐠 𝐁𝐚𝐛𝐲 >𝟑 🎀`,
          attachment: res.data
        },
        event.threadID,
        event.messageID
      );

    } catch (err) {
      console.log("SING ERROR:", err);

      api.setMessageReaction(
        "❌",
        event.messageID,
        () => {},
        true
      );

      return api.sendMessage(
        `𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐟𝐞𝐭𝐜𝐡 𝐚𝐮𝐝𝐢𝐨.\n𝐑𝐞𝐚𝐬𝐨𝐧: ${err.message}`,
        event.threadID,
        event.messageID
      );
    }
  }
};