const axios = require("axios");

module.exports = {
  config: {
    name: "imgx",
    version: "0.0.7",
    author: "Bokkor x69",
    countDown: 5,
    role: 0,
    shortDescription: "Generate image",
    longDescription: "Generate AI image",
    category: "image",
    guide: "{pn} [prompt]"
  },

  onStart: async function ({ api, event, args }) {

    const react = (e) => api.setMessageReaction(e, event.messageID, () => {}, true);

    try {
      const prompt = args.join(" ");

      if (!prompt) {
        react("⚠️");
        return api.sendMessage("⚠️ | 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝗽𝗿𝗼𝗺𝗽𝘁", event.threadID);
      }

      react("⏳");

      const url = `https://azadx69x.is-a.dev/api/magicstudio?prompt=${encodeURIComponent(prompt)}`;

      const res = await axios.get(url, { responseType: "stream" });

      react("✅");

      api.sendMessage({
        body: `𝗶𝗺𝗮𝗴𝗲 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲𝗱 !`,
        attachment: res.data
      }, event.threadID);

    } catch (e) {
      console.log(e);
      react("❌");
      api.sendMessage("❌ | 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗴𝗲𝗻𝗲𝗿𝗮𝘁𝗲 𝗶𝗺𝗮𝗴𝗲", event.threadID);
    }
  }
};