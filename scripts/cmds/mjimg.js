module.exports = {
  config: {
    name: "genx",
    version: "1.0.0",
    role: 0,
    hasPermssion: 0,
    category: "image",
    credits: "Bokkor x69",
    description: "𝐀𝐝𝐯𝐚𝐧𝐜𝐞𝐝 𝐌𝐢𝐝𝐣𝐨𝐮𝐫𝐧𝐞𝐲 𝐢𝐦𝐚𝐠𝐞 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐨𝐫 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐰𝐢𝐭𝐡 𝐨𝐧𝐒𝐭𝐚𝐫𝐭",
    commandCategory: "𝐀I",
    usages: "[𝐩𝐫𝐨𝐦𝐩𝐭] | [𝐚𝐬𝐩𝐞𝐜𝐭 𝐫𝐚𝐭𝐢𝐨 (𝐞.𝐠., 1:1, 16:9, 9:16)]",
    cooldowns: 5
  },
  onStart: async function({ api, event, args }) {
    const axios = require("axios");
    const { threadID, messageID } = event;

    if (args.length === 0) {
      return api.sendMessage("𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐩𝐫𝐨𝐦𝐩𝐭! 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: /genx cat | 1:1", threadID, messageID);
    }

    let input = args.join(" ");
    let prompt = input;
    let aspectRatio = "1:1";

    if (input.includes("|")) {
      const parts = input.split("|");
      prompt = parts[0].trim();
      const parsedRatio = parts[1].trim();
      if (parsedRatio) {
        aspectRatio = parsedRatio;
      }
    }

    const processingMsg = await api.sendMessage("⏳ 𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐧𝐠 𝐢𝐦𝐚𝐠𝐞, 𝐩𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭...", threadID);

    try {
      const apiKey = "napi_42551169226fa9a3c6386835ea613885c82b41066c7fa05db9464c91afedabc6";
      const apiEndpoint = `https://api.nazrul.run.place/nazrul/mjImagine?prompt=${encodeURIComponent(prompt)}&aspectRatio=${encodeURIComponent(aspectRatio)}`;
      
      const { data } = await axios.get(apiEndpoint, { 
        timeout: 120000,
        headers: {
          "x-api-key": apiKey,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json, text/plain, */*"
        }
      });

      if (!data || !data.status || !data.image_url) {
        await api.editMessage("❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐞 𝐭𝐡𝐞 𝐢𝐦𝐚𝐠𝐞. 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.", processingMsg.messageID);
        return;
      }

      const imageUrl = data.image_url;
      const modelId = data.model_id || "𝟏𝟎𝟎𝟑𝟏";

      const imageStream = await axios.get(imageUrl, { 
        responseType: "stream",
        timeout: 120000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      
      return api.sendMessage({
        body: `✅ 𝐈𝐦𝐚𝐠𝐞 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐞𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!`,
        attachment: imageStream.data
      }, threadID, messageID);

    } catch (err) {
      console.error("𝐄𝐫𝐫𝐨𝐫 𝐢𝐧 𝐦𝐣𝐢𝐦𝐚𝐠𝐢𝐧𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝:", err.message || err);
      try {
        await api.editMessage(`❌ 𝐄𝐫𝐫𝐨𝐫: ${err.message || "𝐔𝐧𝐤𝐧𝐨𝐰𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝"}`, processingMsg.messageID);
      } catch (e) {
        api.sendMessage("❌ 𝐀𝐧 𝐮𝐧𝐞𝐱𝐩𝐞𝐜𝐭𝐞𝐝 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝 𝐰𝐡𝐢𝐥𝐞 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐧𝐠 𝐭𝐡𝐞 𝐢𝐦𝐚𝐠𝐞.", threadID, messageID);
      }
    }
  }
};