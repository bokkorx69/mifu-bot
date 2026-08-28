const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

const styles = {
  pair: { style: 2, isBase: true },
  pair1: { style: 3, isBase: false },
  pair2: { style: 5, isBase: false },
  pair3: { style: 8, isBase: false },
  pair4: { style: 10, isBase: false },
  pair5: { style: 11, isBase: false },
  pair6: { style: 12, isBase: false },
  pair7: { style: 14, isBase: false },
  pair8: { style: 14, isBase: false },
  pair9: { style: 15, isBase: false },
  pair10: { style: 17, isBase: false }
};

module.exports = {
  config: {
    name: "pair",
    aliases: ["pair1", "pair2", "pair3", "pair4", "pair5", "pair6", "pair7", "pair8", "pair9", "pair10"],
    version: "2.12",
    author: "MahMUD",
    role: 0,
    category: "LOVE",
    countDown: 2
  },

  onStart: async function ({ api, event, message, args, commandName }) {
    const vipID = "61558455297317";
    const senderID = event.senderID;
    if (!senderID) return message.reply("Could not retrieve sender ID!");

    // API কল শুরু হওয়ার আগেই ওয়েটিং রিয়্যাকশন (⏳) দিয়ে দেওয়া হলো
    if (event.messageID) {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);
    }

    let targetKey = "pair";
    let rawCmd = (commandName || "pair").toLowerCase();
    let firstArg = args[0] ? args[0].toLowerCase() : "";

    if (styles[rawCmd] && rawCmd !== "pair") {
      targetKey = rawCmd;
    } else if (rawCmd === "pair" && firstArg) {
      let cleanArg = firstArg.replace(/[^0-9]/g, "");
      let combined = `pair${cleanArg}`;
      if (styles[combined]) {
        targetKey = combined;
      }
    }

    const currentStyle = styles[targetKey] ? styles[targetKey].style : 2;
    const isBasePair = styles[targetKey] ? styles[targetKey].isBase : false;

    const cacheDir = path.join(__dirname, "cache");
    fs.ensureDirSync(cacheDir);

    const outputPath = path.join(cacheDir, `pair_${senderID}_${Date.now()}.png`);

    try {
      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo || [];

      const myData = users.find(u => (u.id || u.userFbId || u.userId) == senderID);
      if (!myData) {
        if (event.messageID) api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply("Could not retrieve your profile information!");
      }

      let matchID = null;
      let selectedMatch = null;
      let vipCandidate = null;

      if (isBasePair) {
        if (event.mentions && Object.keys(event.mentions).length > 0) {
          matchID = Object.keys(event.mentions)[0];
        } else if (event.type === "message_reply" && event.messageReply && event.messageReply.senderID) {
          matchID = event.messageReply.senderID;
        }

        if (matchID) {
          selectedMatch = users.find(u => (u.id || u.userFbId || u.userId) == matchID);
          if (!selectedMatch) {
            selectedMatch = {
              id: matchID,
              name: event.mentions?.[matchID]?.replace("@", "") || "Partner"
            };
          }
        } else {
          const rawGender = myData.gender ? String(myData.gender).toUpperCase() : "";
          let matchCandidates = [];

          if (rawGender === "MALE") {
            matchCandidates = users.filter(
              u => String(u.gender).toUpperCase() === "FEMALE" && (u.id || u.userFbId || u.userId) != senderID
            );
          } else if (rawGender === "FEMALE") {
            matchCandidates = users.filter(
              u => String(u.gender).toUpperCase() === "MALE" && (u.id || u.userFbId || u.userId) != senderID
            );
          } else {
            matchCandidates = users.filter(
              u => (u.id || u.userFbId || u.userId) != senderID
            );
          }

          if (!matchCandidates.length) {
            matchCandidates = users.filter(
              u => (u.id || u.userFbId || u.userId) != senderID
            );
          }

          if (!matchCandidates.length) {
            if (event.messageID) api.setMessageReaction("❌", event.messageID, () => {}, true);
            return message.reply("No match found");
          }

          vipCandidate = matchCandidates.find(u => (u.id || u.userFbId || u.userId) == vipID);

          if (vipCandidate && Math.random() < 0.4) {
            selectedMatch = vipCandidate;
          } else {
            selectedMatch = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
          }
          matchID = selectedMatch.id || selectedMatch.userFbId || selectedMatch.userId;
        }
      } else {
        const rawGender = myData.gender ? String(myData.gender).toUpperCase() : "";
        let matchCandidates = [];

        if (rawGender === "MALE") {
          matchCandidates = users.filter(
            u => String(u.gender).toUpperCase() === "FEMALE" && (u.id || u.userFbId || u.userId) != senderID
          );
        } else if (rawGender === "FEMALE") {
          matchCandidates = users.filter(
            u => String(u.gender).toUpperCase() === "MALE" && (u.id || u.userFbId || u.userId) != senderID
          );
        }

        if (!matchCandidates.length) {
          matchCandidates = users.filter(
            u => (u.id || u.userFbId || u.userId) != senderID
          );
        }

        if (!matchCandidates.length) {
          if (event.messageID) api.setMessageReaction("❌", event.messageID, () => {}, true);
          return message.reply("No suitable match found in this group!");
        }

        selectedMatch = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
        matchID = selectedMatch.id || selectedMatch.userFbId || selectedMatch.userId;
      }

      if (!matchID) {
        if (event.messageID) api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply("Could not retrieve match user ID!");
      }

      const baseUrl = await baseApiUrl();
      const apiUrl = `${baseUrl}/api/pair/mahmud?user1=${senderID}&user2=${matchID}&style=${currentStyle}`;

      const response = await axios.get(apiUrl, {
        responseType: "arraybuffer",
        timeout: 30000
      });

      fs.writeFileSync(outputPath, Buffer.from(response.data));

      if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        if (event.messageID) api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply("Failed to generate image cache properly. Please try again!");
      }

      let percentage;
      if (isBasePair && (matchID == vipID || senderID == vipID)) {
        percentage = Math.floor(Math.random() * 11) + 80;
      } else {
        percentage = Math.floor(Math.random() * 100) + 1;
      }

      const myName = myData.name || myData.fullName || "User";
      const matchName = selectedMatch.name || selectedMatch.fullName || "Partner";

      return message.reply(
        {
          body: `${myName} 🎀 ${matchName}\nLove: ${percentage}%`,
          attachment: fs.createReadStream(outputPath)
        },
        async () => {
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
          }
          if (event.messageID) {
            api.setMessageReaction("✅", event.messageID, () => {}, true);
          }
        }
      );

    } catch (err) {
      console.error("Pair command error:", err);

      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }

      if (event.messageID) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }

      return message.reply(`Attachment Error: ${err.message || "Failed to process image"}`);
    }
  }
};