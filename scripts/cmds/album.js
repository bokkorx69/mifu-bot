const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// 🌐 API base URL এবং Admin UID
const API_BASE_URL = "https://core.apis-noob-x69.rf.gd"; 
const ADMIN_UID = "61558455297317"; 

// 🔤 Font Map System
const fontMap = {
  'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
  'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
  '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
};

function fontChange(text) {
  if (!text) return "";
  return String(text).split('').map(char => fontMap[char] || char).join('');
}

// 🎭 Safe Reaction Helper
function setReact(api, messageID, icon) {
  try {
    if (api.setMessageReaction) {
      api.setMessageReaction(icon, messageID, () => {}, true);
    }
  } catch (e) {
    console.error("Reaction Error:", e.message);
  }
}

// 📥 ভিডিও ডাউনলোড ও ২৫MB সাইজ চেক
async function downloadVideo(url) {
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  const filePath = path.join(cacheDir, `video_${Date.now()}.mp4`);
  const response = await axios({
    method: "GET",
    url: url,
    responseType: "stream",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    },
    timeout: 45000
  });

  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => {
      const stats = fs.statSync(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);

      if (fileSizeInMB > 25) {
        fs.unlinkSync(filePath);
        return reject(new Error("FILE_TOO_LARGE"));
      }

      resolve(filePath);
    });
    writer.on("error", (err) => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      reject(err);
    });
  });
}

// 🎬 ভিডিও পাঠানো ও রিপ্লাই ক্যাশ সেভ করা
async function sendCategoryVideo(api, threadID, messageID, senderID, category) {
  setReact(api, messageID, "⏳");
  try {
    // validateStatus ব্যবহায় করা হয়েছে যেন 404 এ Axios Error Throw না করে
    const res = await axios.get(`${API_BASE_URL}/api/album/${encodeURIComponent(category)}`, {
      validateStatus: (status) => status < 500,
      timeout: 45000 // Render wake-up time allowance
    });

    if (res.data && res.data.error) {
      setReact(api, messageID, "❌");
      return api.sendMessage(fontChange(res.data.error), threadID, messageID);
    }

    if (!res.data || !res.data.video) {
      setReact(api, messageID, "❌");
      return api.sendMessage(`❌ ${fontChange("No video found in this category!")}`, threadID, messageID);
    }

    const filePath = await downloadVideo(res.data.video);

    let msg = `🎬 ${fontChange("CATEGORY")}: ${fontChange(category.toUpperCase())}\n`;
    msg += `🔄 ${fontChange("Reply 'next' to get another video!")}`;

    setReact(api, messageID, "✅");
    return api.sendMessage({
      body: msg,
      attachment: fs.createReadStream(filePath)
    }, threadID, (err, info) => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (err) return;

      if (global.client && global.client.handleReply) {
        global.client.handleReply.push({
          name: "album",
          messageID: info.messageID,
          author: senderID,
          type: "next_video",
          category: category
        });
      }
    }, messageID);

  } catch (e) {
    console.error("SendCategoryVideo Error:", e.message);
    setReact(api, messageID, "❌");
    if (e.message === "FILE_TOO_LARGE") {
      return api.sendMessage(`⚠️ ${fontChange("Video size exceeds 25MB limit! Cannot send via Messenger.")}`, threadID, messageID);
    }
    return api.sendMessage(`❌ ${fontChange(`Failed: ${e.message || "Server connection error"}`)}`, threadID, messageID);
  }
}

// 📩 সরাসরি event.messageReply প্রসেসিং ফাংশন
async function processDirectReply({ api, event }) {
  const { threadID, messageID, senderID, body, messageReply } = event;
  if (!messageReply || !body) return false;

  const userText = body.trim().toLowerCase();
  const replyBody = (messageReply.body || "").normalize("NFKC");

  // 1. Next Video Reply
  if (["next", "nxt", "নেক্সট"].includes(userText) && replyBody.includes("CATEGORY:")) {
    const match = replyBody.match(/CATEGORY:\s*([^\n]+)/i);
    if (match) {
      const category = match[1].trim().toLowerCase();
      await sendCategoryVideo(api, threadID, messageID, senderID, category);
      return true;
    }
  }

  // 2. Album List Number Selection Reply
  if (replyBody.includes("ALBUM CATEGORIES")) {
    const choice = parseInt(userText);
    if (!isNaN(choice) && choice > 0) {
      const lines = replyBody.split("\n");
      const categories = [];

      for (let line of lines) {
        const catMatch = line.match(/\d+\.\s*([A-Za-z0-9_-]+)/);
        if (catMatch) {
          categories.push(catMatch[1].trim().toLowerCase());
        }
      }

      if (choice <= categories.length) {
        const selectedCategory = categories[choice - 1];
        await sendCategoryVideo(api, threadID, messageID, senderID, selectedCategory);
        return true;
      }
    }
  }

  return false;
}

module.exports = {
  config: {
    name: "album",
    version: "4.3",
    author: "Bokkor",
    countDown: 5,
    role: 0,
    shortDescription: fontChange("Advanced Video Album System"),
    longDescription: fontChange("Get videos by category or index, reply next for endless stream, list, stats, add/dlt."),
    category: "media",
    guide: {
      en: fontChange("{p}album <category>\n{p}album <category> <index_no>\n{p}album list\n{p}album stats\n{p}album search <query>\n{p}album add <category> <url/reply_video>\n{p}album dlt <category>\n{p}album remove <category> <url/reply_video>")
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID, messageReply } = event;
    const subCommand = args[0]?.toLowerCase();

    setReact(api, messageID, "⏳");

    try {
      // 📊 STATS
      if (subCommand === "stats") {
        const res = await axios.get(`${API_BASE_URL}/api/album/stats`, { timeout: 30000 });
        const { summary, mostPopularCategory } = res.data;

        let msg = `📊 ${fontChange("ALBUM SYSTEM STATS")} 📊\n`;
        msg += `━━━━━━━━━━━━━━━━━━\n`;
        msg += `📂 ${fontChange("Total Categories")}: ${fontChange(summary.totalCategories)}\n`;
        msg += `🎬 ${fontChange("Total Videos")}: ${fontChange(summary.totalVideos)}\n`;
        msg += `👀 ${fontChange("Total Views")}: ${fontChange(summary.totalViews)}\n\n`;

        if (mostPopularCategory) {
          msg += `🔥 ${fontChange("Top Category")}: ${fontChange(mostPopularCategory.category.toUpperCase())}\n`;
          msg += `👀 ${fontChange("Views")}: ${fontChange(mostPopularCategory.views)}\n`;
        }

        setReact(api, messageID, "✅");
        return api.sendMessage(msg, threadID, messageID);
      }

      // 📜 LIST
      if (subCommand === "list") {
        const res = await axios.get(`${API_BASE_URL}/api/album/list`, { timeout: 30000 });
        const { totalCategories, data } = res.data;

        let msg = `📂 ${fontChange("ALBUM CATEGORIES")} (${fontChange(totalCategories)})\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

        const categoryKeys = Object.keys(data);
        categoryKeys.forEach((cat, index) => {
          const num = String(index + 1).padStart(2, '0');
          const count = typeof data[cat] === 'object' ? data[cat].count : data[cat];
          const views = typeof data[cat] === 'object' ? (data[cat].views || 0) : 0;

          msg += `✨ ${fontChange(`${num}.`)} ${fontChange(cat.toUpperCase())}\n`;
          msg += `   └─ 🦋 ${fontChange(`${count} Videos`)} │ 👀 ${fontChange(`${views} Views`)}\n\n`;
        });

        msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `👉 ${fontChange("Reply with category number or type:")} album <category>`;

        setReact(api, messageID, "✅");
        return api.sendMessage(msg, threadID, (err, info) => {
          if (err) return;
          if (global.client && global.client.handleReply) {
            global.client.handleReply.push({
              name: this.config.name,
              messageID: info.messageID,
              author: senderID,
              type: "select_category",
              categories: categoryKeys
            });
          }
        }, messageID);
      }

      // 🔍 SEARCH
      if (subCommand === "search") {
        const query = args[1];
        if (!query) {
          setReact(api, messageID, "❌");
          return api.sendMessage(`⚠️ ${fontChange("Please enter a search query!")}`, threadID, messageID);
        }

        const res = await axios.get(`${API_BASE_URL}/api/album/search?q=${encodeURIComponent(query)}`, { timeout: 30000 });
        const { resultsCount, data } = res.data;

        if (resultsCount === 0) {
          setReact(api, messageID, "❌");
          return api.sendMessage(`❌ ${fontChange("No category found matching:")} ${fontChange(query)}`, threadID, messageID);
        }

        let msg = `🔍 ${fontChange("SEARCH RESULTS FOR")} "${fontChange(query)}"\n`;
        msg += `━━━━━━━━━━━━━━━━━━\n`;

        data.forEach((item, i) => {
          msg += `${fontChange(i + 1)}. ${fontChange(item.category.toUpperCase())} - ${fontChange(item.count)} ${fontChange("videos")}\n`;
        });

        setReact(api, messageID, "✅");
        return api.sendMessage(msg, threadID, messageID);
      }

      // ➕ ADD
      if (subCommand === "add") {
        const category = args[1]?.toLowerCase();
        let videoUrl = args[2];

        if (!videoUrl && messageReply && messageReply.attachments && messageReply.attachments[0]) {
          videoUrl = messageReply.attachments[0].url;
        }

        if (!category || !videoUrl) {
          setReact(api, messageID, "❌");
          return api.sendMessage(`⚠️ ${fontChange("Usage:")} album add <category> <url_or_reply_video>`, threadID, messageID);
        }

        const res = await axios.get(`${API_BASE_URL}/api/album/add/${encodeURIComponent(category)}?url=${encodeURIComponent(videoUrl)}`, {
          validateStatus: (status) => status < 500,
          timeout: 45000
        });
        
        if (res.data && res.data.error) {
          setReact(api, messageID, "❌");
          return api.sendMessage(`❌ ${fontChange(res.data.error)}`, threadID, messageID);
        }

        let msg = `✅ ${fontChange("SUCCESSFULLY ADDED")}\n`;
        msg += `📁 ${fontChange("Category")}: ${fontChange(category.toUpperCase())}\n`;
        msg += `🎬 ${fontChange("Total Videos")}: ${fontChange(res.data.totalVideos)}`;

        setReact(api, messageID, "✅");
        return api.sendMessage(msg, threadID, messageID);
      }

      // 🗑️ REMOVE / DELETE CATEGORY OR SINGLE VIDEO
      if (subCommand === "remove" || subCommand === "delete" || subCommand === "dlt") {
        if (senderID !== ADMIN_UID) {
          setReact(api, messageID, "❌");
          return api.sendMessage(`❌ ${fontChange("Only Admin can use delete command!")}`, threadID, messageID);
        }

        let category = args[1]?.toLowerCase();
        let videoUrl = args[2];

        if (messageReply) {
          if (!videoUrl && messageReply.attachments && messageReply.attachments[0]) {
            videoUrl = messageReply.attachments[0].url;
          }
          if (!category && messageReply.body && messageReply.body.includes("CATEGORY:")) {
            const match = messageReply.body.match(/CATEGORY:\s*([^\n]+)/i);
            if (match) category = match[1].trim().toLowerCase();
          }
        }

        if (!category) {
          setReact(api, messageID, "❌");
          return api.sendMessage(`⚠️ ${fontChange("Usage:")} album dlt <category> (or reply to a video with 'album dlt')`, threadID, messageID);
        }

        if (!videoUrl) {
          const res = await axios.get(`${API_BASE_URL}/api/album/delete-category/${encodeURIComponent(category)}?uid=${senderID}`, { timeout: 30000 });
          setReact(api, messageID, "✅");
          const replyText = res.data.message || res.data.error || `Category '${category}' deleted successfully!`;
          return api.sendMessage(`✅ ${fontChange(replyText)}`, threadID, messageID);
        }

        const res = await axios.get(`${API_BASE_URL}/api/album/remove/${encodeURIComponent(category)}?url=${encodeURIComponent(videoUrl)}&uid=${senderID}`, { timeout: 30000 });
        setReact(api, messageID, "✅");
        const replyText = res.data.message || res.data.error || "Video removed successfully!";
        return api.sendMessage(`✅ ${fontChange(replyText)}`, threadID, messageID);
      }

      // 🎲 GET SPECIFIC INDEX OR RANDOM VIDEO
      const category = subCommand;
      if (!category) {
        setReact(api, messageID, "❌");
        return api.sendMessage(`⚠️ ${fontChange("Please specify a category or type:")} album list`, threadID, messageID);
      }

      const indexNumber = parseInt(args[1]);
      if (!isNaN(indexNumber) && indexNumber > 0) {
        const listRes = await axios.get(`${API_BASE_URL}/api/album/${encodeURIComponent(category)}/list`, {
          validateStatus: (status) => status < 500,
          timeout: 45000
        });

        if (listRes.data && listRes.data.error) {
          setReact(api, messageID, "❌");
          return api.sendMessage(`❌ ${fontChange(listRes.data.error)}`, threadID, messageID);
        }

        const videos = listRes.data.videos || [];

        if (indexNumber > videos.length) {
          setReact(api, messageID, "❌");
          return api.sendMessage(`❌ ${fontChange(`Category '${category}' only has ${videos.length} videos!`)}`, threadID, messageID);
        }

        const videoUrl = videos[indexNumber - 1];
        const filePath = await downloadVideo(videoUrl);

        let msg = `🎬 ${fontChange("CATEGORY")}: ${fontChange(category.toUpperCase())}\n`;
        msg += `🔄 ${fontChange("Reply 'next' to get another video!")}`;

        setReact(api, messageID, "✅");
        return api.sendMessage({
          body: msg,
          attachment: fs.createReadStream(filePath)
        }, threadID, (err, info) => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          if (err) return;
          if (global.client && global.client.handleReply) {
            global.client.handleReply.push({
              name: this.config.name,
              messageID: info.messageID,
              author: senderID,
              type: "next_video",
              category: category
            });
          }
        }, messageID);

      } else {
        return await sendCategoryVideo(api, threadID, messageID, senderID, category);
      }

    } catch (err) {
      console.error("❌ Album Command Error:", err.message);
      setReact(api, messageID, "❌");
      return api.sendMessage(`❌ ${fontChange(`Error: ${err.message}`)}`, threadID, messageID);
    }
  },

  // 🔄 Handle Reply Event
  onReply: async function ({ api, event, handleReply }) {
    const processed = await processDirectReply({ api, event });
    if (processed) return;

    if (!handleReply) return;

    const { threadID, messageID, senderID, body } = event;
    const bodyText = body?.trim().toLowerCase();

    if (handleReply.type === "select_category") {
      const { categories } = handleReply;
      const choice = parseInt(bodyText);

      if (!isNaN(choice) && choice >= 1 && choice <= categories.length) {
        const selectedCategory = categories[choice - 1];
        return await sendCategoryVideo(api, threadID, messageID, senderID, selectedCategory);
      }
    } else if (handleReply.type === "next_video") {
      if (["next", "nxt", "নেক্সট"].includes(bodyText)) {
        return await sendCategoryVideo(api, threadID, messageID, senderID, handleReply.category);
      }
    }
  },

  // 💬 Handle Event / Chat
  handleEvent: async function ({ api, event }) {
    if (event.type === "message_reply" || event.messageReply) {
      await processDirectReply({ api, event });
    }
  },

  onChat: async function ({ api, event }) {
    if (event.type === "message_reply" || event.messageReply) {
      await processDirectReply({ api, event });
    }
  }
};