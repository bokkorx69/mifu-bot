module.exports = {
  config: {
    name: "t2a",
    version: "2.5.0",
    role: 0,
    hasPermssion: 0,
    credits: "Bokkor x69",
    description: "𝐀𝐝𝐯𝐚𝐧𝐜𝐞𝐝 𝐭𝐞𝐱𝐭 𝐭𝐨 𝐬𝐨𝐧𝐠 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐨𝐫 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐰𝐢𝐭𝐡 𝐝𝐲𝐧𝐚𝐦𝐢𝐜 𝐝𝐮𝐫𝐚𝐭𝐢𝐨𝐧",
    category: "𝐌𝐞𝐝𝐢𝐚",
    usages: "[𝐥𝐲𝐫𝐢𝐜𝐬] | [𝐝𝐮𝐫𝐚𝐭𝐢𝐨𝐧]",
    cooldowns: 5
  },
  onStart: async function({ api, event, args }) {
    const axios = require("axios");
    const { threadID, messageID } = event;

    if (args.length === 0) {
      return api.sendMessage("𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐬𝐨𝐧𝐠 𝐥𝐲𝐫𝐢𝐜𝐬! 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: /text2song 𝐲𝐨𝐮𝐫 𝐥𝐲𝐫𝐢𝐜𝐬 𝐨𝐫 /text2song 𝐥𝐲𝐫𝐢𝐜𝐬 | 15", threadID, messageID);
    }

    let lyrics = args.join(" ");
    let duration = 10;

    if (lyrics.includes("|")) {
      const parts = lyrics.split("|");
      lyrics = parts[0].trim();
      const parsedDuration = parseInt(parts[1].trim());
      if (!isNaN(parsedDuration) && parsedDuration > 0) {
        duration = parsedDuration;
      }
    }

    const processingMsg = await api.sendMessage("⏳ 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐲𝐨𝐮𝐫 𝐫𝐞𝐪𝐮𝐞𝐬𝐭, 𝐩𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭...", threadID);

    try {
      const apiEndpoint = `https://api.noobx.gt.tc/api/text2song?lyrics=${encodeURIComponent(lyrics)}&voice=&duration=${duration}`;
      const { data } = await axios.get(apiEndpoint, { 
        timeout: 120000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json, text/plain, */*"
        }
      });

      if (!data || data.status !== "success" || !data.response) {
        await api.editMessage("❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐞 𝐭𝐡𝐞 𝐬𝐨𝐧𝐠. 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧 𝐥𝐚𝐭𝐞𝐫.", processingMsg.messageID);
        return;
      }

      const audioUrl = data.response;

      const audioStream = await axios.get(audioUrl, { 
        responseType: "stream",
        timeout: 120000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });

      await api.editMessage("✅ 𝐒𝐨𝐧𝐠 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐞𝐝 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲!", processingMsg.messageID);
      
      return api.sendMessage({
        body: `🎵 𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐞𝐝 𝐒𝐨𝐧𝐠 (${duration}s)`,
        attachment: audioStream.data
      }, threadID, messageID);

    } catch (err) {
      console.error("𝐄𝐫𝐫𝐨𝐫 𝐢𝐧 𝐭𝐞𝐱𝐭𝟐𝐬𝐨𝐧𝐠 𝐜𝐨𝐦𝐦𝐚𝐧𝐝:", err.message || err);
      try {
        await api.editMessage(`❌ 𝐄𝐫𝐫𝐨𝐫: ${err.message || "𝐔𝐧𝐤𝐧𝐨𝐰𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝"}`, processingMsg.messageID);
      } catch (e) {
        api.sendMessage("❌ 𝐀𝐧 𝐮𝐧𝐞𝐱𝐩𝐞𝐜𝐭𝐞𝐝 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝 𝐰𝐡𝐢𝐥𝐞 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐢𝐧𝐠 𝐭𝐡𝐞 𝐚𝐮𝐝𝐢𝐨.", threadID, messageID);
      }
    }
  }
};