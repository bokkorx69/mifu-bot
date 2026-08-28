const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "accept",
    aliases: ['acp'],
    version: "3.0",
    author: "Bokkor x69",
    countDown: 5,
    role: 0,
    shortDescription: "accept users friend requests",
    longDescription: "accept users friend requests automatically, view friend list count or filter requests",
    category: "Utility",
  },

  onReply: async function ({ message, Reply, event, api, commandName }) {
    const { author, listRequest } = Reply;
    if (author !== event.senderID) return;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);
    const args = event.body.replace(/ +/g, " ").trim().toLowerCase().split(" ");

    let friendlyName = "";
    let docId = "";

    if (args[0] === "add") {
      friendlyName = "FriendingCometFriendRequestConfirmMutation";
      docId = "3147613905362928";
    } else if (args[0] === "del") {
      friendlyName = "FriendingCometFriendRequestDeleteMutation";
      docId = "4108254489275063";
    } else {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply("⚠️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐬𝐞𝐥𝐞𝐜𝐭: <𝐚𝐝𝐝 | 𝐝𝐞𝐥> <𝐭𝐚𝐫𝐠𝐞𝐭 𝐧𝐮𝐦𝐛𝐞𝐫(𝐬) | 𝐚𝐥𝐥>");
    }

    let targetIDs = args.slice(1);

    if (args[1] === "all") {
      targetIDs = [];
      const lengthList = listRequest.length;
      for (let i = 1; i <= lengthList; i++) targetIDs.push(i);
    }

    const success = [];
    const failed = [];

    for (const stt of targetIDs) {
      const index = parseInt(stt) - 1;
      const u = listRequest[index];

      if (!u) {
        failed.push(`❌ 𝐂𝐚𝐧'𝐭 𝐟𝐢𝐧𝐝 𝐮𝐬𝐞𝐫 𝐚𝐭 𝐩𝐨𝐬𝐢𝐭𝐢𝐨𝐧 ${stt}`);
        continue;
      }

      const form = {
        av: api.getCurrentUserID(),
        fb_api_req_friendly_name: friendlyName,
        fb_api_caller_class: "RelayModern",
        doc_id: docId,
        variables: JSON.stringify({
          input: {
            friend_requester_id: u.node.id,
            source: "friends_tab",
            actor_id: api.getCurrentUserID(),
            client_mutation_id: Math.round(Math.random() * 19).toString()
          },
          scale: 3,
          refresh_num: 0
        })
      };

      try {
        const res = await api.httpPost("https://www.facebook.com/api/graphql/", form);
        const parsedRes = JSON.parse(res);

        if (parsedRes.errors) {
          failed.push(`❌ ${u.node.name}`);
        } else {
          success.push(`🎀 ${u.node.name}`);
        }
      } catch (e) {
        failed.push(`❌ ${u.node.name}`);
      }
    }

    api.setMessageReaction("✅", event.messageID, () => {}, true);
    return message.reply(
      `✅ 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐞𝐝 ${success.length} 𝐫𝐞𝐪𝐮𝐞𝐬𝐭(𝐬):\n${success.join("\n")}${failed.length > 0 ? `\n\n❌ 𝐅𝐚𝐢𝐥𝐞𝐝 (${failed.length}):\n${failed.join("\n")}` : ""}`
    );
  },

  onStart: async function ({ event, api, commandName, message, args }) {
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    let userName = "𝐔𝐬𝐞𝐫";
    try {
      const userInfo = await api.getUserInfo(event.senderID);
      if (userInfo[event.senderID]) {
        userName = userInfo[event.senderID].name;
      }
    } catch (err) {}

    const subCmd = args.join(" ").toLowerCase();

    if (subCmd === "list" || subCmd === "frnd list" || subCmd === "friend list" || subCmd === "friendlist") {
      try {
        const friendsList = await api.getFriendsList();
        const totalFriends = friendsList ? friendsList.length : 0;

        api.setMessageReaction("✅", event.messageID, () => {}, true);
        return message.reply(
          `👤 𝐇𝐞𝐥𝐥𝐨 ${userName}!\n` +
          `📊 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐀𝐜𝐜𝐨𝐮𝐧𝐭 𝐒𝐭𝐚𝐭𝐬:\n\n` +
          `👥 𝐓𝐨𝐭𝐚𝐥 𝐅𝐫𝐢𝐞𝐧𝐝𝐬: ${totalFriends}\n` +
          `📝 𝐓𝐨 𝐦𝐚𝐧𝐚𝐠𝐞 𝐩𝐞𝐧𝐝𝐢𝐧𝐠 𝐫𝐞𝐪𝐮𝐞𝐬𝐭𝐬, 𝐮𝐬𝐞: 𝐚𝐜𝐩`
        );
      } catch (err) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply(`👤 𝐇𝐞𝐥𝐥𝐨 ${userName}!\n❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐟𝐞𝐭𝐜𝐡 𝐟𝐫𝐢𝐞𝐧𝐝 𝐥𝐢𝐬𝐭.`);
      }
    }

    const form = {
      av: api.getCurrentUserID(),
      fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
      fb_api_caller_class: "RelayModern",
      doc_id: "4499164963466303",
      variables: JSON.stringify({ input: { scale: 3 } })
    };

    try {
      const response = await api.httpPost("https://www.facebook.com/api/graphql/", form);
      const data = JSON.parse(response);

      let listRequest = data?.data?.viewer?.friending_possibilities?.edges || [];

      if (args[0] === "my") {
        const myRequest = listRequest.find(u => u.node.id === event.senderID);

        if (!myRequest) {
          api.setMessageReaction("❌", event.messageID, () => {}, true);
          return message.reply(`👤 𝐇𝐞𝐥𝐥𝐨 ${userName}!\n❌ 𝐍𝐨 𝐩𝐞𝐧𝐝𝐢𝐧𝐠 𝐟𝐫𝐢𝐞𝐧𝐝 𝐫𝐞𝐪𝐮𝐞𝐬𝐭 𝐟𝐨𝐮𝐧𝐝 𝐟𝐨𝐫 𝐲𝐨𝐮𝐫 𝐚𝐜𝐜𝐨𝐮𝐧𝐭.`);
        }

        const acceptForm = {
          av: api.getCurrentUserID(),
          fb_api_req_friendly_name: "FriendingCometFriendRequestConfirmMutation",
          fb_api_caller_class: "RelayModern",
          doc_id: "3147613905362928",
          variables: JSON.stringify({
            input: {
              friend_requester_id: event.senderID,
              source: "friends_tab",
              actor_id: api.getCurrentUserID(),
              client_mutation_id: Math.round(Math.random() * 19).toString()
            },
            scale: 3,
            refresh_num: 0
          })
        };

        const res = await api.httpPost("https://www.facebook.com/api/graphql/", acceptForm);
        const parsedRes = JSON.parse(res);

        if (parsedRes.errors) {
          api.setMessageReaction("❌", event.messageID, () => {}, true);
          return message.reply(`❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐚𝐜𝐜𝐞𝐩𝐭 𝐟𝐫𝐢𝐞𝐧𝐝 𝐫𝐞𝐪𝐮𝐞𝐬𝐭 𝐟𝐨𝐫 ${userName}.`);
        } else {
          api.setMessageReaction("✅", event.messageID, () => {}, true);
          return message.reply(`🎉 𝐇𝐞𝐥𝐥𝐨 ${userName}!\n✅ 𝐘𝐨𝐮𝐫 𝐟𝐫𝐢𝐞𝐧𝐝 𝐫𝐞𝐪𝐮𝐞𝐬𝐭 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐚𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐜𝐚𝐥𝐥𝐲 𝐚𝐜𝐜𝐞𝐩𝐭𝐞𝐝!`);
        }
      }

      if (listRequest.length === 0) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply("❌ 𝐍𝐨 𝐩𝐞𝐧𝐝𝐢𝐧𝐠 𝐟𝐫𝐢𝐞𝐧𝐝 𝐫𝐞𝐪𝐮𝐞𝐬𝐭𝐬 𝐟𝐨𝐮𝐧𝐝!");
      }

      if (args[0]) {
        const searchQuery = args.join(" ").toLowerCase();
        listRequest = listRequest.filter(u => u.node.name.toLowerCase().includes(searchQuery));

        if (listRequest.length === 0) {
          api.setMessageReaction("❌", event.messageID, () => {}, true);
          return message.reply(`❌ 𝐍𝐨 𝐫𝐞𝐪𝐮𝐞𝐬𝐭𝐬 𝐟𝐨𝐮𝐧𝐝 𝐦𝐚𝐭𝐜𝐡𝐢𝐧𝐠: "${args.join(" ")}"`);
        }
      }

      let msg = `👤 𝐑𝐞𝐪𝐮𝐞𝐬𝐭𝐞𝐝 𝐛𝐲: ${userName}\n📌 𝐓𝐨𝐭𝐚𝐥 𝐏𝐞𝐧𝐝𝐢𝐧𝐠 𝐑𝐞𝐪𝐮𝐞𝐬𝐭𝐬: ${listRequest.length}\n`;
      let i = 0;
      for (const user of listRequest) {
        i++;
        msg += `\n${i}. 🎀 𝐍𝐚𝐦𝐞: ${user.node.name}`
          + `\n🔹 𝐈𝐃: ${user.node.id}`
          + `\n🔗 𝐔𝐑🇱: ${user.node.url.replace("www.facebook", "fb")}`
          + `\n⏳ 𝐓𝐢𝐦𝐞: ${moment(user.time * 1000).tz("Asia/Dhaka").format("DD/MM/YYYY HH:mm:ss")}\n`;
      }

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      return message.reply(
        `${msg}\n📝 𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐭𝐡𝐢𝐬 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐰𝐢𝐭𝐡: <𝐚𝐝𝐝 | 𝐝𝐞𝐥> <𝐭𝐚𝐫𝐠𝐞𝐭 𝐧𝐮𝐦𝐛𝐞𝐫(𝐬) | 𝐚𝐥𝐥>`,
        (e, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            listRequest,
            author: event.senderID,
          });
        }
      );
    } catch (error) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply("❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐟𝐞𝐭𝐜𝐡 𝐟𝐫𝐢𝐞𝐧𝐝 𝐫𝐞𝐪𝐮𝐞𝐬𝐭𝐬.");
    }
  },
};