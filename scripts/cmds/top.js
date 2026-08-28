const formatBalance = function (amount) {
    if (amount < 1000) return amount + "$";
    else if (amount < 1000000) return (amount / 1000).toFixed(1) + "k$";
    else if (amount < 1000000000) return (amount / 1000000).toFixed(1) + "M$";
    else if (amount < 1000000000000) return (amount / 1000000000).toFixed(1) + "B$";
    else if (amount < 1000000000000000) return (amount / 1000000000000).toFixed(1) + "T$";
    else if (amount < 1000000000000000000) return (amount / 1000000000000000).toFixed(1) + "Q$";
    else if (amount < 1000000000000000000000) return (amount / 1000000000000000000).toFixed(1) + "A$";
    else return (amount / 1000000000000000000000000).toFixed(1) + "D$";
};

module.exports = {
  config: {
    name: "top",
    version: "2.3",
    author: "Bokkor x69",
    role: 0,
    shortDescription: {
      en: "Shows top 15 richest users or highest EXP users"
    },
    longDescription: {
      en: "Displays the top 15 richest or highest EXP users globally with fully unified stylized fonts."
    },
    category: "economy",
    guide: {
      en: "{pn} bal | {pn} exp"
    }
  },

  onStart: async function ({ api, args, event, usersData }) {
    const { senderID, threadID, messageID } = event;
    const query = args[0]?.toLowerCase();
    const isExp = query === "exp" || query === "level";

    try {
      const waitMsg = await api.sendMessage("🔄 | 𝙁𝙀𝙏𝘾𝙃𝙄𝙉𝙂 𝙇𝙀𝘼𝘿𝙀𝙍𝘽𝙊𝘼𝙍𝘿 𝘿𝘼𝙏𝘼, 𝘽𝘼𝘽𝙔...", threadID, messageID);
      const allUsers = await usersData.getAll();

      const sortedUsers = allUsers
        .filter(user => {
          const val = isExp ? (user.exp || 0) : (user.money || 0);
          return val > 0;
        })
        .sort((a, b) => {
          const valA = isExp ? (a.exp || 0) : (a.money || 0);
          const valB = isExp ? (b.exp || 0) : (b.money || 0);
          return valB - valA;
        })
        .slice(0, 15);

      if (sortedUsers.length === 0) {
        return api.editMessage("❌ | 𝙉𝙊 𝙇𝙀𝘼𝘿𝙀𝙍𝘽𝙊𝘼𝙍𝘿 𝘿𝘼𝙏𝘼 𝙁𝙊𝙐𝙉𝘿 𝙔𝙀𝙏, 𝘽𝘼𝘽𝙔!", waitMsg.messageID, threadID);
      }

      let topListText = "";
      for (let i = 0; i < sortedUsers.length; i++) {
        const user = sortedUsers[i];
        let name = "User";
        try {
          name = await usersData.getName(user.userID);
        } catch (e) {
          name = user.name || "User";
        }

        const balance = isExp ? (user.exp || 0) : (user.money || 0);
        const formattedVal = isExp ? balance.toLocaleString() : formatBalance(balance);

        let rankBadge = `${i + 1}.`;
        if (i === 0) rankBadge = "👑 1.";
        else if (i === 1) rankBadge = "🥈 2.";
        else if (i === 2) rankBadge = "🥉 3.";

        const labelText = isExp ? "📊 𝙀𝙓𝙋:" : "💰 𝘽𝘼𝙇𝘼𝙉𝘾𝙀:";
        topListText += `${rankBadge} ${name}\n   ➥ ${labelText} ${formattedVal}\n\n`;
      }

      const userIndex = allUsers
        .sort((a, b) => {
          const valA = isExp ? (a.exp || 0) : (a.money || 0);
          const valB = isExp ? (b.exp || 0) : (b.money || 0);
          return valB - valA;
        })
        .findIndex(u => u.userID === senderID);

      let userRankInfo = "";
      if (userIndex !== -1) {
        const myData = allUsers[userIndex];
        const myBalance = isExp ? (myData.exp || 0) : (myData.money || 0);
        const myFormattedVal = isExp ? myBalance.toLocaleString() : formatBalance(myBalance);
        userRankInfo = `───────────────────────\n👤 𝙔𝙊𝙐𝙍 𝙍𝘼𝙉𝙆: #${userIndex + 1} (${myFormattedVal})`;
      }

      const titleType = isExp ? "𝙂𝙇𝙊𝘽𝘼𝙇 𝙏𝙊𝙋 15 𝙀𝙓𝙋 𝙇𝙀𝘼𝘿𝙀𝙍𝘽𝙊𝘼𝙍𝘿" : "𝙂𝙇𝙊𝘽𝘼𝙇 𝙏𝙊𝙋 15 𝙍𝙄𝘾𝙃𝙀𝙎𝙏 𝙐𝙎𝙀𝙍𝙎";
      const finalMsg = `🏆 | ${titleType}\n` +
                       `───────────────────────\n\n` +
                       `${topListText}` +
                       `${userRankInfo}`;

      return api.editMessage(finalMsg, waitMsg.messageID, threadID);
    } catch (e) {
      return api.sendMessage("❌ | 𝙀𝙍𝙍𝙊𝙍 𝙁𝙀𝙏𝘾𝙃𝙄𝙉𝙂 𝙏𝙃𝙀 𝙇𝙀𝘼𝘿𝙀𝙍𝘽𝙊𝘼𝙍𝘿, 𝘽𝘼𝘽𝙔!", threadID, messageID);
    }
  }
};