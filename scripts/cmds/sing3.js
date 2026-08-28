const axios = require("axios");
const ytSearch = require("yt-search");

module.exports = {
  config: {
    name: "sing",
    version: "1.0",
    author: "Bokkor x69",
    role: 0,
    description: {
      en: "Search and download songs"
    },
    category: "audio",
    aliases: ["song", "music"]
  },

  onStart: async ({ api, args, event }) => {
    if (!args.length) {
      return api.sendMessage(
        "𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐲𝐩𝐞 𝐚 𝐬𝐨𝐧𝐠 𝐧𝐚𝐦𝐞.",
        event.threadID,
        event.messageID
      );
    }

    const keyword = args.join(" ").trim();

    try {
      api.setMessageReaction(
        "⏳",
        event.messageID,
        () => {},
        true
      );

      // YouTube Search
      let results = [];

      try {
        const search = await ytSearch(keyword);

        if (search && Array.isArray(search.videos)) {
          results = search.videos.slice(0, 1);
        }
      } catch (err) {
        console.log("Search failed");
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

      // Your own Song API
      const apiURL =
        `https://core.apis-noob-x69.rf.gd/api/sing?url=${encodeURIComponent(video.url)}`;

      let response;

      try {
        response = await axios({
          method: "GET",
          url: apiURL,
          responseType: "stream",
          timeout: 90000,
          maxRedirects: 5,
          headers: {
            "User-Agent": "Mozilla/5.0",
            Accept: "audio/mpeg,audio/*,*/*"
          }
        });
      } catch (err) {
        console.log("API failed");

        api.setMessageReaction(
          "❌",
          event.messageID,
          () => {},
          true
        );

        return api.sendMessage(
          "𝐒𝐨𝐧𝐠 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐟𝐚𝐢𝐥𝐞𝐝. 😿",
          event.threadID,
          event.messageID
        );
      }

      if (!response || response.status !== 200) {
        api.setMessageReaction(
          "❌",
          event.messageID,
          () => {},
          true
        );

        return api.sendMessage(
          "𝐒𝐨𝐧𝐠 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐟𝐚𝐢𝐥𝐞𝐝. 😿",
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
          body: "𝐇𝐞𝐫𝐞 𝐘𝐨𝐮𝐫 𝐒𝐨𝐧𝐠 𝐁𝐚𝐛𝐲 >𝟑 🎀",
          attachment: response.data
        },
        event.threadID,
        event.messageID
      );

    } catch (err) {
      console.log("Sing failed");

      api.setMessageReaction(
        "❌",
        event.messageID,
        () => {},
        true
      );

      return api.sendMessage(
        "𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐟𝐞𝐭𝐜𝐡 𝐚𝐮𝐝𝐢𝐨. 😿",
        event.threadID,
        event.messageID
      );
    }
  }
};