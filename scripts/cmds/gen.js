const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "gen",
    aliases: ["horde", "sdgen"],
    author: "Bokkor x69",
    version: "1.0.0",
    countDown: 10,
    description: "Generate image using AI Horde / Stable Diffusion",
    guide: "{pn} <prompt>",
    category: "MEDIA"
  },

  onStart: async function ({ api, args, event, message }) {
    const prompt = args.join(" ");

    if (!prompt) {
      return api.sendMessage(
        "Please provide a prompt to generate an image",
        event.threadID,
        event.messageID
      );
    }

    api.setMessageReaction("⏳", event.messageID, (err) => {}, true);
    const loadMsg = await message.reply("⏳ 𝙬𝙖𝙞𝙩 𝙗𝙗𝙮, 𝙮𝙤𝙪𝙧 𝙞𝙢𝙖𝙜𝙚 𝙞𝙨 𝙜𝙚𝙣𝙚𝙧𝙖𝙩𝙞𝙣𝙜...");

    try {
      const res = await axios.get("https://www.smfahim.xyz/ai/aihorde", {
        params: {
          action: "image",
          prompt: prompt
        }
      });

      // API রেসপন্স থেকে ছবির লিংক বের করা
      const resultUrl = res.data.generations && res.data.generations[0] ? res.data.generations[0].img : null;

      if (!resultUrl) {
        throw new Error("Failed to generate image.");
      }

      // ১. ক্যাশ ফোল্ডার ও ফাইল পাথ ঠিক করা
      const ext = resultUrl.split('.').pop().split('?')[0] || 'webp';
      const cacheDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      const filePath = path.join(cacheDir, `horde_${Date.now()}.${ext}`);

      // ২. ছবি ডাটা স্ট্রীম ডাউনলোড করে ক্যাশে সেভ করা
      const response = await axios({
        method: 'GET',
        url: resultUrl,
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);
      api.unsendMessage(loadMsg.messageID);

      // ৩. লোকাল ফাইল থেকে স্ট্রীম পাঠানো এবং সেন্ড হলে ফাইলটি মুছে ফেলা
      await api.sendMessage({
        body: `✨ 𝙃𝙚𝙧𝙚 𝙞𝙨 𝙮𝙤𝙪𝙧 𝙜𝙚𝙣𝙚𝙧𝙖𝙩𝙚𝙙 𝙞𝙢𝙖𝙜𝙚`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, event.messageID);

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      api.unsendMessage(loadMsg.messageID);
      api.sendMessage(
        "An error occurred while generating your image, please try again later..🙂",
        event.threadID,
        event.messageID
      );
    }
  }
};