const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

async function generateLensCanvas(imageObjects, query, page, totalPages) {
  const canvasWidth = 900;
  const canvasHeight = 1700;
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  bgGradient.addColorStop(0, '#0a0f1d');
  bgGradient.addColorStop(0.5, '#172033');
  bgGradient.addColorStop(1, '#05070c');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(30, 25, canvasWidth - 60, 90, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('🔍 Google Lens Visual Search', 60, 65);

  ctx.font = '15px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`Similar visual matches • Page ${page} of ${totalPages}`, 60, 95);

  const numColumns = 3;
  const padding = 20;
  const startX = 30;
  const startY = 145;
  const availableWidth = canvasWidth - (startX * 2);
  const columnWidth = (availableWidth - (padding * (numColumns - 1))) / numColumns;
  const columnHeights = Array(numColumns).fill(startY);

  const loadedPairs = await Promise.all(
    imageObjects.map(obj =>
      loadImage(obj.url)
        .then(img => ({ img, originalIndex: obj.originalIndex, url: obj.url }))
        .catch(e => {
          return null;
        })
    )
  );

  const successful = loadedPairs.filter(x => x !== null);

  if (successful.length === 0) {
    ctx.fillStyle = '#ef4444';
    ctx.font = '18px sans-serif';
    ctx.fillText(`No images could be loaded for this page.`, 60, 160);
    const outputPath = path.join(__dirname, 'cache', `lens_page_${Date.now()}.png`);
    await fs.ensureDir(path.dirname(outputPath));
    fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));
    return { outputPath, displayedMap: [] };
  }

  let displayNumber = 0;
  const displayedMap = [];

  for (let i = 0; i < successful.length; i++) {
    const { img, originalIndex } = successful[i];

    const minHeight = Math.min(...columnHeights);
    const columnIndex = columnHeights.indexOf(minHeight);

    const x = startX + columnIndex * (columnWidth + padding);
    const y = minHeight;

    const scale = columnWidth / img.width;
    const scaledHeight = img.height * scale;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;
    
    ctx.beginPath();
    ctx.roundRect(x, y, columnWidth, scaledHeight, 14);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, columnWidth, scaledHeight, 14);
    ctx.clip();
    ctx.drawImage(img, x, y, columnWidth, scaledHeight);
    ctx.restore();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, columnWidth, scaledHeight, 14);
    ctx.stroke();

    displayNumber += 1;
    displayedMap.push(originalIndex);

    ctx.save();
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const badgeWidth = 48;
    const badgeHeight = 28;
    
    const badgeGrad = ctx.createLinearGradient(x + 12, y + 12, x + 12 + badgeWidth, y + 12 + badgeHeight);
    badgeGrad.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
    badgeGrad.addColorStop(1, 'rgba(30, 41, 59, 0.9)');
    
    ctx.fillStyle = badgeGrad;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 1.5;
    
    ctx.beginPath();
    ctx.roundRect(x + 12, y + 12, badgeWidth, badgeHeight, 9);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`#${displayNumber}`, x + 12 + (badgeWidth / 2), y + 12 + (badgeHeight / 2));

    const resText = `${img.width}x${img.height}`;
    ctx.font = '10px sans-serif';
    const textWidth = ctx.measureText(resText).width;
    
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.beginPath();
    ctx.roundRect(x + columnWidth - textWidth - 18, y + scaledHeight - 28, textWidth + 12, 20, 7);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(resText, x + columnWidth - 12, y + scaledHeight - 14);

    columnHeights[columnIndex] += scaledHeight + padding;
  }

  const maxColHeight = Math.max(...columnHeights);
  const footerY = Math.max(maxColHeight + 25, canvasHeight - 40);

  ctx.fillStyle = '#64748b';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`💡 Reply with the image number or type "next" for more results`, canvasWidth / 2, footerY);

  const outputPath = path.join(__dirname, 'cache', `lens_page_${Date.now()}.png`);
  await fs.ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));

  return { outputPath, displayedMap };
}

module.exports = {
  config: {
    name: "lens",
    aliases: ["similar", "googlelens"],
    version: "3.6",
    author: "MahMUD",
    countDown: 10,
    role: 0,
    shortDescription: "Search similar images using Google Lens API with glowing canvas preview",
    longDescription: "Reply to an image with 'lens' to search similar images with a glowing modern canvas view or direct send using count.",
    category: "utility",
    guide: {
      en: "{pn} -[count] (reply to an image)\n" +
        "• If count is used, it sends images directly.\n" +
        "• If no count, it shows an interactive glowing canvas view.\n" +
        "• Example: lens -5 (direct send)\n" +
        "• Example: lens (glowing canvas view via reply)"
    }
  },

  onStart: async function({ api, args, message, event }) {
    let processingMessage = null;
    try {
      const { messageReply, type } = event;
      const apiKey = "5dMsshimQwGTNCMg9SSisbxM";

      if (type !== "message_reply" || !messageReply.attachments || messageReply.attachments.length === 0) {
        return message.reply("❌ Please reply to an image with 'lens' to perform a reverse image search.");
      }

      const imageUrl = messageReply.attachments[0].url;

      let count = null;
      const countArg = args.find(arg => /^-\d+$/.test(arg));
      if (countArg) {
        count = parseInt(countArg.slice(1), 10);
      }

      processingMessage = await message.reply("🔍 Searching via Google Lens and loading assets...");

      let allImageUrls = [];

      try {
        const response = await axios.get(`https://www.searchapi.io/api/v1/search`, {
          params: {
            engine: "google_lens",
            url: imageUrl,
            api_key: apiKey
          }
        });

        const results = response.data.visual_matches || [];
        allImageUrls = results.map(item => item.thumbnail || item.image).filter(Boolean);
      } catch (err) {
        console.error("SearchAPI failed, falling back to secondary API:", err.message);
      }

      if (allImageUrls.length === 0) {
        try {
          const fallbackRes = await axios.get(`https://azadx69x.is-a.dev/api/similar`, {
            params: { url: imageUrl }
          });
          const fallbackData = fallbackRes.data.results || [];
          allImageUrls = fallbackData.map(item => item.image || item.thumbnail).filter(Boolean);
        } catch (fallbackErr) {
          console.error("Fallback API failed:", fallbackErr.message);
        }
      }

      if (allImageUrls.length === 0) {
        if (processingMessage) await message.unsend(processingMessage.messageID).catch(() => {});
        return message.reply("😔 Sorry, no similar images were found for this picture.");
      }

      if (count) {
        const urls = allImageUrls.slice(0, count);
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

        const attachments = [];
        for (let i = 0; i < urls.length; i++) {
          try {
            const imgRes = await axios.get(urls[i], { responseType: "arraybuffer" });
            const imgPath = path.join(cacheDir, `lens_${Date.now()}_${i}.jpg`);
            await fs.outputFile(imgPath, imgRes.data);
            attachments.push(fs.createReadStream(imgPath));
          } catch (e) {
            console.error(`Failed to download: ${urls[i]}`, e.message);
          }
        }

        if (processingMessage) await message.unsend(processingMessage.messageID).catch(() => {});

        return message.reply({
          body: `✅ Google Lens Result:\nFound ${attachments.length} similar image(s) matching this picture.`,
          attachment: attachments
        }, () => {
          attachments.forEach(att => {
            if (fs.existsSync(att.path)) fs.unlinkSync(att.path);
          });
        });

      } else {
        const imagesPerPage = 21;
        const totalPages = Math.ceil(allImageUrls.length / imagesPerPage);
        const startIndex = 0;
        const endIndex = Math.min(allImageUrls.length, imagesPerPage);
        const imagesForPage1 = allImageUrls.slice(startIndex, endIndex).map((url, idx) => ({
          url,
          originalIndex: startIndex + idx
        }));

        const { outputPath: canvasPath, displayedMap } = await generateLensCanvas(imagesForPage1, "Google Lens", 1, totalPages);

        const sentMessage = await message.reply({
          body: `🖼️ Found ${allImageUrls.length} similar images.\nReply with a number (shown on canvas) to get that image, or type "next" for more.`,
          attachment: fs.createReadStream(canvasPath)
        });

        fs.unlink(canvasPath, (err) => {
          if (err) console.error(err);
        });

        global.GoatBot.onReply.set(sentMessage.messageID, {
          commandName: this.config.name,
          author: event.senderID,
          allImageUrls,
          imagesPerPage,
          currentPage: 1,
          totalPages,
          displayedMap,
          displayCount: Array.isArray(displayedMap) ? displayedMap.length : 0
        });

        if (processingMessage) await message.unsend(processingMessage.messageID).catch(() => {});
      }

    } catch (error) {
      console.error(error);
      if (processingMessage) {
        try { await message.unsend(processingMessage.messageID); } catch (e) {}
      }
      message.reply("⚠️ An error occurred on the server or API credit has expired.");
    }
  },

  onReply: async function({ api, event, message, Reply }) {
    try {
      if (!Reply) return message.reply("Session expired. Please run the command again.");

      const { author, allImageUrls, imagesPerPage, currentPage, totalPages, displayedMap, displayCount } = Reply;
      if (event.senderID !== author) return;

      const input = (event.body || "").trim().toLowerCase();

      if (input === 'next') {
        if (currentPage >= totalPages) {
          return message.reply("This is the last page of results.");
        }
        const nextPage = currentPage + 1;
        const startIndex = (nextPage - 1) * imagesPerPage;
        const endIndex = Math.min(startIndex + imagesPerPage, allImageUrls.length);

        const imagesForNextPage = allImageUrls.slice(startIndex, endIndex).map((url, idx) => ({
          url,
          originalIndex: startIndex + idx
        }));

        const processingMessage = await message.reply(`✨ Loading page ${nextPage}...`);
        const { outputPath: canvasPath, displayedMap: nextDisplayedMap } = await generateLensCanvas(imagesForNextPage, "Google Lens", nextPage, totalPages);

        const sentMessage = await message.reply({
          body: `🖼️ Page ${nextPage}/${totalPages}.\nReply with a number (shown on canvas) to get that image, or "next" for more.`,
          attachment: fs.createReadStream(canvasPath)
        });
        fs.unlink(canvasPath, (err) => {
          if (err) console.error(err);
        });

        await message.unsend(processingMessage.messageID).catch(() => {});

        global.GoatBot.onReply.set(sentMessage.messageID, {
          commandName: this.config.name,
          author,
          allImageUrls,
          imagesPerPage,
          currentPage: nextPage,
          totalPages,
          displayedMap: nextDisplayedMap,
          displayCount: Array.isArray(nextDisplayedMap) ? nextDisplayedMap.length : 0
        });

      } else {
        const number = parseInt(input, 10);
        if (!isNaN(number) && number > 0) {
          if (!Array.isArray(displayedMap) || typeof displayCount !== 'number') {
            return message.reply("This page's images aren't available anymore. Please run the command again or type 'next'.");
          }

          if (number > displayCount) {
            return message.reply(`Invalid number. The current canvas shows only ${displayCount} image(s). Choose a number from 1 to ${displayCount}, or type "next" to load more images.`);
          }

          const originalIndex = displayedMap[number - 1];
          if (originalIndex == null || originalIndex < 0 || originalIndex >= allImageUrls.length) {
            return message.reply(`Could not find that image. Please try again or request a different number.`);
          }
          const imageUrl = allImageUrls[originalIndex];
          
          const cacheDir = path.join(__dirname, "cache");
          if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

          const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
          const imgPath = path.join(cacheDir, `lens_single_${Date.now()}.jpg`);
          await fs.outputFile(imgPath, imgRes.data);
          const stream = fs.createReadStream(imgPath);

          if (!stream) return message.reply("Failed to fetch the requested image.");
          
          await message.reply({
            body: `✨ Similar Image #${number}:`,
            attachment: stream
          }, () => {
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
          });
        } else {
          return message.reply(`Reply with a number (from the canvas) to get that image, or "next" for more pages.`);
        }
      }
    } catch (error) {
      console.error(error);
      message.reply("An error occurred while handling your reply.");
    }
  }
};