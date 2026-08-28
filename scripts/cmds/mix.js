const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "emojimix",
    aliases: ["mix", "ইমোজি"],
    version: "1.4",
    author: "MahMUD",
    countDown: 5,
    role: 0,
    description: "Emoji Mix",
    category: "fun",
    guide: "{pn} <emoji1> <emoji2> বা {pn} -r"
  },

  onStart: async function ({ api, message, event, args }) {
    let emoji1, emoji2;

    const emojis = [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
      "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
      "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
      "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
      "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬",
      "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "🤗", "🤔",
      "🫡", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🤠",
      "🥳", "😎", "🤓", "🧐", "😕", "😟", "🙁", "☹️", "😮", "😯",
      "😲", "🥱", "😴", "🤤", "😪", "😮‍💨", "🤒", "🤕", "🤢", "🤮",
      "🤧", "🥵", "🥶", "🥴", "😵", "😵‍💫", "🤯", "🤠", "🥳", "😎",
      "🐱", "🐶", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷",
      "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅",
      "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🪱", "🐛", "🦋",
      "🐌", "🐞", "🐜", "🪰", "🪲", "蟑", "🦟", "🦗", "🕷️", "🕸️",
      "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞",
      "🦀", "🪸", "🐟", "🐠", "🐡", "🐬", "🦭", "🐳", "🐋", "🦈",
      "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🐘", "🦛", "🦏", "🐪",
      "🐫", "🦒", "🦘", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑",
      "🦙", "🐐", "🦌", "🐕", "🐩", "🦮", "🐕‍🦺", "🐈", "🐈‍⬛", "feather",
      "🐓", "🦃", "🦤", "🦚", "🦜", "🦢", "🦩", "🕊️", "🐇", "🦝",
      "skunk", "🦡", "🦫", "🦦", "🦥", "🐁", "🐀", "🐿️", "🦔", "🐾",
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "❤️‍🔥", "❤️‍🩹", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "✨",
      "🔥", "⭐", "🌟", "💫", "💥", "💢", "💯", "💀", "👻", "👽",
      "💩", "🎉", "🎊", "🎈", "🎁", "🏆", "👑", "🌹", "🌸", "🌻",
      "🌺", "🌷", "💐", "🌾", "🌿", "🍀", "🍁", "🍂", "🍃", "🍄",
      "🍎", "🍏", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐",
      "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑"
    ];

    if (args[0] === "-r") {
      const getRandomEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];
      emoji1 = getRandomEmoji();
      emoji2 = getRandomEmoji();
    } else {
      [emoji1, emoji2] = args;
    }

    if (!emoji1 || !emoji2)
      return message.reply("• 𝐏𝐥𝐞𝐚𝐬𝐞 𝐏𝐫𝐨𝐯𝐢𝐝𝐞 𝐓𝐰𝐨 𝐄𝐦𝐨𝐣𝐢 𝐨𝐫 𝐮𝐬𝐞 `-r` 𝐟𝐨𝐫 𝐫𝐚𝐧𝐝𝐨𝐦 𝐦𝐢𝐱.\n\n• 𝐄𝐱𝐚𝐦𝐩𝐥𝐞: 𝐦𝐢𝐱 😘 🙂 𝐨𝐫 𝐦𝐢𝐱 -𝐫");

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const res = await axios({
        url: `https://azadx69x.is-a.dev/api/emojimix?e1=${encodeURIComponent(emoji1)}&e2=${encodeURIComponent(emoji2)}`,
        method: "GET",
        responseType: "stream"
      });

      await message.reply({
        body: `• 𝐌𝐢𝐱𝐞𝐝: ${emoji1} + ${emoji2}`,
        attachment: res.data
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply("• 𝐓𝐡𝐞𝐬𝐞 𝐄𝐦𝐨𝐣𝐢𝐬 𝐂𝐚𝐧'𝐭 𝐁𝐞 𝐌𝐢𝐱𝐞𝐝.");
    }
  }
};