const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");

const API_ENDPOINT = "https://azadx69x.is-a.dev/api/mj";
const TEMP_FILES = new Set();

async function saveImage(url, name) {
  const outPath = path.join(__dirname, name);
  const res = await axios.get(url, { responseType: "stream" });
  const writer = fs.createWriteStream(outPath);
  await new Promise((resolve, reject) => {
    res.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
  TEMP_FILES.add(outPath);
  setTimeout(() => { 
    if (fs.existsSync(outPath)) fs.unlinkSync(outPath); 
    TEMP_FILES.delete(outPath); 
  }, 1000 * 60 * 2);
  return outPath;
}

async function downloadWithRetry(url, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, { 
        responseType: "arraybuffer",
        timeout: 120000,
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      return response.data;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

module.exports = {
  config: {
    name: "mj2",
    version: "1.8.4",
    aliases: ["midjourney2"],
    author: "Bokkor x69",
    countDown: 20,
    role: 0,
    isPremium: true,
    requiredMoney: 1000,
    description: "Generate AI images with Midjourney",
    category: "ai",
    guide: { en: "{pn} [prompt]" }
  },

  onStart: async function({ event, args, message }) {
    if (!args[0]) return message.reply(`• Please provide a prompt.\nExample: ${global.GoatBot.config.prefix}mj A Cat --ar 16:9`);
    const basePrompt = args.join(" ").trim();
    const loadingMsg = await message.send("⏳ Mj Process started.. please wait!");
    message.reaction("⏳", event.messageID);

    try {
      const res = await axios.get(API_ENDPOINT, {
        params: { prompt: basePrompt },
        timeout: 180000
      });

      const data = res.data;
      console.log("API Response:", data);

      let imageUrls = [];
      if (Array.isArray(data)) {
        imageUrls = data;
      } else if (data?.images && Array.isArray(data.images)) {
        imageUrls = data.images;
      } else if (data?.data?.images && Array.isArray(data.data.images)) {
        imageUrls = data.data.images;
      } else if (data?.url) {
        imageUrls = [data.url];
      }

      if (imageUrls.length === 0) {
        throw new Error("No images returned from API");
      }

      const imageBuffers = [];
      for (const url of imageUrls) {
        const buffer = await downloadWithRetry(url);
        imageBuffers.push(buffer);
      }
      
      const jimpImages = await Promise.all(imageBuffers.map(buf => Jimp.read(buf)));
      const width = jimpImages[0].bitmap.width;
      const height = jimpImages[0].bitmap.height;

      const gridImage = new Jimp(width * 2, height * 2);
      gridImage.composite(jimpImages[0], 0, 0);
      gridImage.composite(jimpImages[1], width, 0);
      gridImage.composite(jimpImages[2], 0, height);
      gridImage.composite(jimpImages[3], width, height);

      const jobId = Date.now();
      const gridPath = path.join(__dirname, `ok_grid_${jobId}_${Date.now()}.png`);
      await gridImage.writeAsync(gridPath);
      TEMP_FILES.add(gridPath);
      setTimeout(() => { 
        if (fs.existsSync(gridPath)) fs.unlinkSync(gridPath); 
        TEMP_FILES.delete(gridPath); 
      }, 1000 * 60 * 2);

      const body = `✅ Midjourney process completed!\n• taskID: ${jobId}\n• Reply with 1-4 to get image`;

      message.reply({ body, attachment: fs.createReadStream(gridPath) }, (err, info) => {
        if (!err) {
          if (!global.GoatBot.onReply) global.GoatBot.onReply = new Map();
          global.GostBot?.onReply?.set?.(info.messageID, {
            commandName: this.config.name,
            author: event.senderID,
            taskId: jobId,
            imageUrls: imageUrls,
            prompt: basePrompt
          }) || global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: event.senderID,
            taskId: jobId,
            imageUrls: imageUrls,
            prompt: basePrompt
          });
        }
      });
      await message.unsend(loadingMsg.messageID);
      await message.reaction("✅", event.messageID);
    } catch (e) {
      console.error(e);
      await message.unsend(loadingMsg.messageID);
      message.reaction("❌", event.messageID);
      message.reply(`❌ Error: ${e.message || "Unknown error occurred"}`);
    }
  },

  onReply: async function({ event, Reply, message }) {
    if (!Reply) return;
    const { author, taskId, imageUrls } = Reply;
    if (event.senderID !== author) return;

    const input = event.body.trim().toUpperCase();
    const validChoices = ["1", "2", "3", "4"];

    try {
      if (validChoices.includes(input)) {
        const index = parseInt(input) - 1;
        if (!imageUrls || !imageUrls[index]) {
          return message.reply("❌ Image URL not found for this choice.");
        }
        
        message.reaction("⏳", event.messageID);
        const targetUrl = imageUrls[index];
        const filePath = await saveImage(targetUrl, `ok_single_${taskId}_${index}_${Date.now()}.png`);
        
        await message.reply({ 
          body: `✅ Here is your selected image number: ${input}!`, 
          attachment: fs.createReadStream(filePath) 
        });
        message.reaction("✅", event.messageID);
        return;
      }

      message.reply("• Invalid input. Reply with 1-4 to get the image.");
    } catch (e) {
      message.reaction("❌", event.messageID);
      console.log(e);
      message.reply(`❌ Error: ${e.message || "Failed to fetch image"}`);
    }
  }
};