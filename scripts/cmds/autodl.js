const axios = require("axios");
const fs = require("fs");
const { shortenURL } = global.utils;

const baseApiUrl = "https://noobs-api.top/dipto";
const settingsPath = __dirname + "/autolink.json";

if (!fs.existsSync(settingsPath)) {
  fs.writeFileSync(settingsPath, JSON.stringify({}));
}

module.exports = {
  config: {
    name: "autodl",
    aliases: ["autodownload", "autolink"],
    version: "1.1.0",
    author: "404 & Bokkor x69",
    countDown: 0,
    role: 0,
    description: {
      en: "Auto download video from social media links"
    },
    category: "media",
    guide: {
      en: "{pn} on\n{pn} off"
    }
  },

  onStart: async function ({ api, event, args }) {
    const settings = JSON.parse(fs.readFileSync(settingsPath));

    if (args[0]?.toLowerCase() === "on") {
      settings[event.threadID] = true;
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      return api.sendMessage(
        "✅ Auto Download Enabled",
        event.threadID,
        event.messageID
      );
    }

    if (args[0]?.toLowerCase() === "off") {
      settings[event.threadID] = false;
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      return api.sendMessage(
        "❌ Auto Download Disabled",
        event.threadID,
        event.messageID
      );
    }

    return api.sendMessage(
      "📥 Usage:\nautodl on\nautodl off",
      event.threadID,
      event.messageID
    );
  },

  onChat: async function ({ api, event }) {
    try {
      if (!event.body) return;

      const settings = JSON.parse(fs.readFileSync(settingsPath));
      if (!settings[event.threadID]) return;

      const link = event.body.trim();

      const supportedLinks = [
        "https://vt.tiktok.com/",
        "https://vm.tiktok.com/",
        "https://www.tiktok.com/",
        "https://facebook.com/",
        "https://www.facebook.com/",
        "https://fb.watch/",
        "https://instagram.com/",
        "https://www.instagram.com/",
        "https://youtu.be/",
        "https://youtube.com/",
        "https://www.youtube.com/",
        "https://x.com/",
        "https://twitter.com/"
      ];

      const isValidLink = supportedLinks.some(url =>
        link.startsWith(url)
      );

      if (!isValidLink) return;

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const cacheDir = __dirname + "/cache";

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const videoPath = `${cacheDir}/${event.messageID}.mp4`;

      const res = await axios.get(
        `${baseApiUrl}/alldl?url=${encodeURIComponent(link)}`
      );

      if (!res.data?.result) {
        throw new Error("Video URL not found");
      }

      const videoUrl = res.data.result;

      const video = await axios.get(videoUrl, {
        responseType: "arraybuffer"
      });

      fs.writeFileSync(videoPath, Buffer.from(video.data));

      let shortLink = "Unavailable";

      try {
        shortLink = await shortenURL(videoUrl);
      } catch {}

      api.sendMessage(
        {
          body: `${res.data.cp || "Downloaded Successfully"}\n\n🔗 Link: ${shortLink}`,
          attachment: fs.createReadStream(videoPath)
        },
        event.threadID,
        () => {
          if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
          }
        },
        event.messageID
      );

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      console.error(err);

      api.setMessageReaction("❌", event.messageID, () => {}, true);

      api.sendMessage(
        `❌ Error: ${err.message}`,
        event.threadID,
        event.messageID
      );
    }
  }
};