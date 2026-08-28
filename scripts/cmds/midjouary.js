const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");

const apiUrll = "https://api.nazrul.run.place";
const apiKey = "napi_00109790837e441b30b52b93d0ae01b6d570cfb42108c139785d1a5ad2153f80";
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
  setTimeout(() => { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); TEMP_FILES.delete(outPath); }, 1000 * 60 * 60);
  return outPath;
}

async function cropImage(pathImg, index, id) {
  if (!fs.existsSync(pathImg)) throw new Error("Source image not found");
  const img = await Jimp.read(pathImg);
  const w = img.bitmap.width / 2;
  const h = img.bitmap.height / 2;
  const pos = { "1": [0, 0], "2": [w, 0], "3": [0, h], "4": [w, h] };
  const [sx, sy] = pos[index];
  const crop = img.clone().crop(sx, sy, w, h);
  const out = path.join(__dirname, `ok_crop_${id}_${index}_${Date.now()}.png`);
  await crop.writeAsync(out);
  TEMP_FILES.add(out);
  setTimeout(() => { if (fs.existsSync(out)) fs.unlinkSync(out); TEMP_FILES.delete(out); }, 1000 * 60 * 60);
  return out;
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
    name: "midjourney",
    version: "1.8.0",
    aliases: ["mj"],
    author: "Nazrul",
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
    const apiUrl = `${apiUrll}/nazrul/imagine?prompt=${encodeURIComponent(basePrompt)}&ratio=1%3A1&resolution=1k`;
    const loadingMsg = await message.send("⏳ Mj Process started.. please wait!");
    message.reaction("⏳", event.messageID);

    try {
      const res = await axios.get(apiUrl, {
        headers: {
          "accept": "application/json",
          "x-api-key": apiKey
        },
        timeout: 180000
      });
      const data = res.data;
      if (!data.images || !data.images[0]) throw new Error("No images returned");

      const imageBuffers = [];
      for (const url of data.images) {
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

      const gridPath = path.join(__dirname, `ok_grid_${data.jobId}_${Date.now()}.png`);
      await gridImage.writeAsync(gridPath);
      TEMP_FILES.add(gridPath);
      setTimeout(() => { if (fs.existsSync(gridPath)) fs.unlinkSync(gridPath); TEMP_FILES.delete(gridPath); }, 1000 * 60 * 60);

      const body = `✅ Midjourney process completed!\n• taskID: ${data.jobId}\n• Reply with 1-4 to get image`;

      message.reply({ body, attachment: fs.createReadStream(gridPath) }, (err, info) => {
        if (!err) {
          if (!global.GoatBot.onReply) global.GoatBot.onReply = new Map();
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: event.senderID,
            taskId: data.jobId,
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
    const { author, taskId } = Reply;
    if (event.senderID !== author) return;

    const input = event.body.trim().toUpperCase();
    const validCropChoices = ["1", "2", "3", "4"];

    try {
      if (validCropChoices.includes(input)) {
        if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0]) {
          return message.reply("❌ No image found in the replied message.");
        }
        const imageUrl = event.messageReply.attachments[0].url;
        const tempPath = await saveImage(imageUrl, `ok_reply_${taskId}_${Date.now()}.png`);
        const cropPath = await cropImage(tempPath, input, taskId);
        return message.reply({ body: `✅ Here's selected image number: ${input}!`, attachment: fs.createReadStream(cropPath) });
      }

      message.reply("• Invalid input. Reply with 1-4 to get the image.");
    } catch (e) {
      message.reaction("❌", event.messageID);
      console.log(e);
    }
  }
};