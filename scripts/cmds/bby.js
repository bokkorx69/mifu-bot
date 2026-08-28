const axios = require('axios');

// 🔗 Correct Base URL based on your backend mounting
const BASE_API_URL = "https://core.apis-noob-x69.rf.gd/api/bby";

// 🔤 Custom Unicode Bold Font Converter (matches backend toCustomFont)
function fontStyle(text) {
  if (!text) return "";
  const fontMap = {
    'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
    'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
    '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
  };
  return String(text).split('').map(char => fontMap[char] || char).join('');
}

// 🎯 Safe API Response Extractor matching your JSON structure
function extractApiReply(resData) {
  try {
    if (resData?.data?.text) {
      return resData.data.text;
    }
    if (typeof resData?.data === 'string') return resData.data;
    if (resData?.text) return resData.text;
    if (resData?.reply) return resData.reply;
  } catch (e) {}
  
  return "আমি এটা এখনো শিখিনি! 'bby teach' দিয়ে আমাকে শিখিয়ে দাও 🥺";
}

module.exports.config = {
  name: "bby",
  aliases: ["baby", "babu", "apa", "janu", "bot"],
  version: "12.0.0",
  author: "Bokkor x69",
  countDown: 0,
  role: 0,
  description: "All-in-One Advanced BBY SimSimi, Auto-Trainer & Quiz Bot System",
  category: "chat",
  guide: {
    en: "{pn} [your message]\n" +
        "{pn} teach [Message] - [Reply]\n" +
        "{pn} msg [Message]\n" +
        "{pn} edit [Message] - [NewReply]\n" +
        "{pn} remove [Message]\n" +
        "{pn} rm [Message] - [index]\n" +
        "{pn} list [page]\n" +
        "{pn} top\n" +
        "{pn} stats\n" +
        "{pn} random\n" +
        "{pn} autoteach on / off / status"
  }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
  const dipto = args.join(" ").trim();
  const lowerMsg = dipto.toLowerCase();
  const uid = event.senderID;

  try {
    if (!args[0]) {
      const ran = [
        "Hmm bol", 
        "Ki kobi ko somoy nai🥱", 
        "আপনার কি চরিত্রে সমস্যা যে এতো বার আমাকে বট বলে ডাকতেছেন🧐", 
        "🙂বট বট না বলে সিরিয়াস রিলেশন করতে চাইলে bokkor এর ইনবক্স যাও", 
        "🙂Bot bot koros kn?",
        "bokkor tomake bhalobashe"
      ];
      return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);
    }

    const subCmd = args[0].toLowerCase();

    // 1️⃣ Auto-Trainer Control (/api/bby/autotrainer/control & status)
    if (subCmd === "autoteach" || subCmd === "autotrainer") {
      const action = args[1]?.toLowerCase();

      if (action === "on" || action === "start") {
        const res = await axios.post(`${BASE_API_URL}/autotrainer/control`, { action: "start" });
        return api.sendMessage(`✅ Auto Trainer Started\n💬 ${res.data.message || "Activated"}`, event.threadID, event.messageID);
      } 
      if (action === "off" || action === "stop") {
        const res = await axios.post(`${BASE_API_URL}/autotrainer/control`, { action: "stop" });
        return api.sendMessage(`🛑 Auto Trainer Stopped\n💬 ${res.data.message || "Deactivated"}`, event.threadID, event.messageID);
      } 
      if (action === "status" || action === "info") {
        const res = await axios.get(`${BASE_API_URL}/autotrainer/status`);
        const data = res.data;
        const statusText = data.isRunning ? "🟢 Running" : "🔴 Stopped";
        return api.sendMessage(
          `━━━━━━╮ 𝐀𝐮𝐭𝐨 𝐓𝐫𝐚𝐢𝐧𝐞𝐫 𝐒𝐭𝐚𝐭𝐬 ╭━━━━━━\n\n` +
          `📌 Status: ${statusText}\n` +
          `📊 Added: ${data.count || 0}\n` +
          `⏭️ Skipped: ${data.skipped || 0}\n` +
          `❌ Errors: ${data.errors || 0}`,
          event.threadID,
          event.messageID
        );
      }
      return api.sendMessage("❌ Use: bby autoteach [on / off / status]", event.threadID, event.messageID);
    }

    // 2️⃣ Leaderboard (/api/bby/leaderboard) with Facebook Name Fetching
    if (subCmd === "top" || subCmd === "leaderboard") {
      const res = await axios.get(`${BASE_API_URL}/leaderboard`);
      const data = res.data;

      if (!data.topTeachers || data.topTeachers.length === 0) {
        return api.sendMessage("❌ 𝗡𝗼 𝗹𝗲𝗮𝗱𝗲𝗿𝗯𝗼𝗮𝗿𝗱 𝗱𝗮𝘁𝗮 𝗮𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲.", event.threadID, event.messageID);
      }

      let msg = "━━━━━━╮ 𝐓𝐨𝐩 𝟏𝟎 𝐓𝐞𝐚𝐜𝐡𝐞𝐫𝘀 ╭━━━━━━\n\n";

      for (const t of data.topTeachers) {
        let teacherName = "Facebook User";
        try {
          const info = await new Promise((resolve, reject) => {
            api.getUserInfo(String(t.teacherID), (err, dataInfo) => {
              if (err) return reject(err);
              resolve(dataInfo);
            });
          });
          teacherName = info[t.teacherID]?.name || t.teacherName || `User (${t.teacherID})`;
        } catch (e) {
          teacherName = t.teacherName || `User (${t.teacherID})`;
        }

        msg += `🏅 ${fontStyle("Rank")} ${t.rank}: ${teacherName}\n`;
        msg += ` └ 💬 ${fontStyle("Total Answers")}: ${t.totalAnswersGiven} | ❓ ${fontStyle("Questions")}: ${t.questionsCreated}\n\n`;
      }

      msg += `👤 ${fontStyle("Author")}: ${data.author || "Bokkor Ahmed"}`;
      return api.sendMessage(msg, event.threadID, event.messageID);
    }

    // 3️⃣ Database Stats (/api/bby/stats)
    if (subCmd === "list" || subCmd === "stats") {
      const res = await axios.get(`${BASE_API_URL}/stats`);
      const data = res.data;
      const msg = `━━━━━━╮ 𝐃𝐚𝐭𝐚𝐛𝐚𝐬𝐞 𝐒𝐭𝐚𝐭𝐬 ╭━━━━━━\n\n❓ ${fontStyle("Total Questions")}: ${data.totalQuestions}\n💬 ${fontStyle("Total Answers")}: ${data.totalAnswers}\n\n👤 ${fontStyle("Author")}: ${data.author || "Bokkor Ahmed"}`;
      return api.sendMessage(msg, event.threadID, event.messageID);
    }

    // 4️⃣ Random Question (/api/bby?bbyx=random)
    if (subCmd === "random") {
      const res = await axios.get(`${BASE_API_URL}?bbyx=random&lang=bn`);
      const data = res.data;
      if (!data || !data.question) return api.sendMessage("❌ 𝗡𝗼 𝗾𝘂𝗲𝘀𝘁𝗶𝗼𝗻 𝗳𝗼𝘂𝗻𝗱.", event.threadID, event.messageID);
      
      return api.sendMessage(
        `🎀 ${fontStyle("Your Question Baby")} 🎀\n\n${data.question}\n\n👉 ${fontStyle("Reply to this message with your answer.")}`,
        event.threadID,
        (error, info) => {
          if (error) return;
          if (global.GoatBot && global.GoatBot.onReply) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              type: "save",
              author: uid,
              question: data.question
            });
          }
        },
        event.messageID
      );
    }

    // 5️⃣ Get Msg Replies: bby msg [Question]
   if (subCmd === 'msg') {
    const query = lowerMsg.replace(/^msg\s*/i, "").trim();
    if (!query) return api.sendMessage('❌ Please provide a message! Example: bby msg hi', event.threadID, event.messageID);

    try {
        const res = await axios.get(`${BASE_API_URL}?msg=${encodeURIComponent(query)}`);
        
        const responseData = res.data?.data;

        if (!responseData || !responseData.replies || (Array.isArray(responseData.replies) && responseData.replies.length === 0)) {
            return api.sendMessage(`⚠️ ${fontStyle("Sorry, I haven't learned this yet!")}`, event.threadID, event.messageID);
        }

        // সব রিপ্লাইগুলো একটি লিস্ট আকারে সাজানো (প্রতিটি নতুন লাইনে)
        const repliesList = Array.isArray(responseData.replies) 
            ? responseData.replies.map((r, index) => `${index + 1}. ${fontStyle(r)}`).join("\n") 
            : fontStyle(responseData.replies);

        const mainText = fontStyle(responseData.text || query);

        return api.sendMessage(
            `💬 Matched: ${mainText}\n\nReplies:\n${repliesList}`,
            event.threadID,
            event.messageID
        );
    } catch (err) {
        return api.sendMessage(`❌ API Error: ${err.message}`, event.threadID, event.messageID);
    }
}

    // 6️⃣ Remove Entire Question (/api/bby?remove=...)
    if (subCmd === 'remove') {
      const fina = lowerMsg.replace(/^remove\s*/i, "").trim();
      const res = await axios.get(`${BASE_API_URL}?remove=${encodeURIComponent(fina)}`);
      return api.sendMessage(`✅ ${fontStyle("Operation Result")}: ${res.data.message || "Done"}`, event.threadID, event.messageID);
    }

    // 7️⃣ Remove Index (/api/bby?rm=...&index=...)
    if (subCmd === 'rm' && lowerMsg.includes('-')) {
      const [fi, f] = lowerMsg.replace(/^rm\s*/i, "").split(' - ').map(s => s.trim());
      const res = await axios.get(`${BASE_API_URL}?rm=${encodeURIComponent(fi)}&index=${f}`);
      const data = res.data;
      if (data.status === "ok") {
        const repliesList = data.data?.replies ? data.data.replies.join(", ") : "none";
        return api.sendMessage(`✅ ${fontStyle("Removed Index")} ${f}\n💬 ${fontStyle("Msg")}: ${data.data?.text || fi}\n💬 ${fontStyle("Remaining Replies")}: ${repliesList}`, event.threadID, event.messageID);
      }
      return api.sendMessage(`⚠️ ${data.message || "Failed to remove index"}`, event.threadID, event.messageID);
    }

    // 8️⃣ Edit Reply (/api/bby?edit=...&replace=...)
    if (subCmd === 'edit') {
      const [oldMsg, newMsg] = lowerMsg.replace(/^edit\s*/i, "").split(' - ').map(s => s.trim());
      if (!oldMsg || !newMsg) return api.sendMessage('❌ Invalid format! Use: bby edit [Old] - [NewReply]', event.threadID, event.messageID);
      
      const res = await axios.get(`${BASE_API_URL}?edit=${encodeURIComponent(oldMsg)}&replace=${encodeURIComponent(newMsg)}`);
      const data = res.data;
      if (data.status === "ok") {
        const repliesList = data.data?.replies ? data.data.replies.join(", ") : newMsg;
        return api.sendMessage(`✅ ${fontStyle("Edited!")}\n💬 ${fontStyle("Msg")}: ${data.data?.text || oldMsg}\n💬 ${fontStyle("New Reply")}: ${repliesList}`, event.threadID, event.messageID);
      }
      return api.sendMessage(`⚠️ ${data.message || "Edit failed!"}`, event.threadID, event.messageID);
    }

    // 9️⃣ List Teaches (/api/bby?list=all)
    if (subCmd === 'list2') {
      const page = parseInt(args[1]) || 1;
      const res = await axios.get(`${BASE_API_URL}?list=all&page=${page}&limit=10`);
      const data = res.data;
      
      if (!data || !data.data) return api.sendMessage("❌ Failed to fetch list.", event.threadID, event.messageID);

      let msg = `🎀 ${fontStyle("Baby Total Teachs")}: ${data.total}\n📄 ${fontStyle("Page")}: ${data.page}/${data.totalPages}\n━━━━━━━━━━━━━━━━━━\n\n`;
      data.data.forEach((item, idx) => {
        msg += `${idx + 1}. ❓ ${item.text}\n   💬 ${item.replies.join(" | ")}\n\n`;
      });
      return api.sendMessage(msg, event.threadID, event.messageID);
    }

    // 🔟 Teach Command (/api/bby?teach=...&reply=...)
    if (subCmd === 'teach') {
      if (!lowerMsg.includes('-')) return api.sendMessage('❌ Invalid format! Use: bby teach [Question] - [Reply]', event.threadID, event.messageID);
      
      const [comd, command] = lowerMsg.split(' - ').map(s => s.trim());
      const final = comd.replace(/^teach\s*/i, "").trim();

      if (!final || !command) return api.sendMessage('❌ Both Question and Reply are required!', event.threadID, event.messageID);

      let senderName = "User";
      try { senderName = await usersData.getName(uid) || "User"; } catch (e) {}

      const res = await axios.get(`${BASE_API_URL}?teach=${encodeURIComponent(final)}&reply=${encodeURIComponent(command)}&senderID=${uid}&senderName=${encodeURIComponent(senderName)}`);
      const data = res.data;

      if (data.status === "exists" || data.duplicate) {
        return api.sendMessage(`⚠️ ${data.message || "Already exists!"}`, event.threadID, event.messageID);
      }

      return api.sendMessage(
        `✅ ${fontStyle("Replies Added")}\n` +
        `💬 ${fontStyle("Replies")} "${command}" ${fontStyle("added to")} "${final}"\n` +
        `👤 ${fontStyle("Teacher")}: ${senderName}\n` +
        `📊 ${fontStyle("Total Teachs")}: ${data.total || 1}`,
        event.threadID,
        event.messageID
      );
    }

    // 1️⃣1️⃣ Default Teach Reply Endpoint (/api/bby/teachreply?msg=...)
    const res = await axios.get(`${BASE_API_URL}/teachreply?msg=${encodeURIComponent(dipto)}&senderID=${uid}`);
    const finalText = extractApiReply(res.data);
    
    return api.sendMessage(finalText, event.threadID, (error, info) => {
      if (error) return;
      if (global.GoatBot && global.GoatBot.onReply) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: uid
        });
      }
    }, event.messageID);

  } catch (e) {
    return api.sendMessage(`❌ Error: ${e.message}`, event.threadID, event.messageID);
  }
};

// 📩 Reply Handler
module.exports.onReply = async ({ api, event, Reply, usersData }) => {
  try {
    const senderID = event.senderID;
    const answer = event.body?.trim() || "";

    if (Reply.type === "save") {
      let senderName = "User";
      try { senderName = await usersData.getName(senderID) || "User"; } catch (e) {}

      const saveRes = await axios.get(
        `${BASE_API_URL}?bbyx=save&msg=${encodeURIComponent(Reply.question)}&reply=${encodeURIComponent(answer)}&senderID=${senderID}&senderName=${encodeURIComponent(senderName)}`
      );
      const saveData = saveRes.data;

      const nextRes = await axios.get(`${BASE_API_URL}?bbyx=random&lang=bn`);
      const nextData = nextRes.data;

      let fullText = "";
      if (saveData.status === "error" || saveData.duplicate || saveData.status === "exists") {
        fullText = `⚠️ ${saveData.message}`;
      } else {
        fullText = `✅ ${fontStyle(saveData.message || "Saved successfully!")}\n💬 ${fontStyle("Reply")}: "${answer}"\n👤 ${fontStyle("Teacher")}: ${senderName}\n📊 ${fontStyle("Total Answers")}: ${saveData.total || 1}`;
      }

      if (nextData && nextData.question) {
        fullText += `\n\n━━━━━━╮ 𝐍𝐞𝐱𝐭 𝐐𝐮𝐞𝐬𝐭𝐢𝐨𝐧 ╭━━━━━━\n\n${nextData.question}\n\n👉 ${fontStyle("Reply to this message with your answer.")}`;
      }

      return api.sendMessage(fullText, event.threadID, (error, info) => {
        if (error) return;
        if (nextData && nextData.question && global.GoatBot && global.GoatBot.onReply) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "bby",
            type: "save",
            author: senderID,
            question: nextData.question
          });
        }
      }, event.messageID);
    }

    // Normal Reply via teachreply endpoint
    const res = await axios.get(`${BASE_API_URL}/teachreply?msg=${encodeURIComponent(answer)}&senderID=${senderID}`);
    const text = extractApiReply(res.data);
    
    api.sendMessage(text, event.threadID, (error, info) => {
      if (error) return;
      if (global.GoatBot && global.GoatBot.onReply) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "bby",
          type: "reply",
          messageID: info.messageID,
          author: senderID
        });
      }
    }, event.messageID);

  } catch (err) {
    api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
  }
};

// 🤖 Chat Listener Event
module.exports.onChat = async ({ api, event }) => {
  try {
    const body = event.body ? event.body.toLowerCase() : "";
    if (["bby", "baby", "babu", "bot", "apa", "janu"].some(w => body.startsWith(w))) {
      const arr = body.replace(/^\S+\s*/, "").trim();
      if (!arr) {
        const replies = [
          "babu khuda lagse🥺", "Hop beda😾,Boss বল boss😼", "আমাকে ডাকলে ,আমি কিন্তূ কিস করে দেবো😘", "🐒🐒🐒",
          "bye", "naw message daw m.me/ewr.bokkor", "mb ney bye", "meww", "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
          "𝗜 𝗹𝗼𝘃𝗲 𝘆𝗼𝘂__😘😘", "𝗜 𝗵𝗮𝘁𝗲 𝘆𝗼𝘂__😏😏", "গোসল করে আসো যাও😑😩", "অ্যাসলামওয়ালিকুম", "কেমন আসো",
          "বলেন sir__😌", "বলেন ম্যাডাম__😌", "আমি অন্যের জিনিসের সাথে কথা বলি না__😏ওকে", "🙂🙂🙂",
          "𝗕𝗯𝘆 𝗯𝗼𝗹𝗹𝗮 𝗽𝗮𝗽 𝗵𝗼𝗶𝗯𝗼,,😒😒", "𝗧𝗮𝗿𝗽𝗼𝗿 𝗯𝗼𝗹𝗼_🙂", "𝗕𝗲𝘀𝗵𝗶 𝗱𝗮𝗸𝗹𝗲 𝗮𝗺𝗺𝘂 𝗯𝗼𝗸𝗮 𝗱𝗲𝗯𝗮 𝘁__🥺",
          "𝗕𝗯𝘆 না জানু, বল 😌", "বেশি bby Bbby করলে leave নিবো কিন্তু 😒😒", "__বেশি বেবি বললে কামুর দিমু 🤭🤭", 
          "𝙏𝙪𝙢𝙖𝙧 𝙜𝙛 𝙣𝙖𝙞, 𝙩𝙖𝙮 𝙖𝙢𝙠 𝙙𝙖𝙠𝙨𝙤? 😂😂😂", "bolo baby😒", "তোর কথা তোর বাড়ি কেউ শুনে না ,তো আমি কোনো শুনবো ?🤔😂",
          "আমি তো অন্ধ কিছু দেখি না🐸 😎", "আম গাছে আম নাই ঢিল কেন মারো, তোমার সাথে প্রেম নাই বেবি কেন ডাকো 😒🫣",
          "𝗕𝗯𝘆 না বলে 𝗕𝗼𝘄 বলো 😘", "দূরে যা, তোর কোনো কাজ নাই, শুধু 𝗯𝗯𝘆 𝗯𝗯𝘆 করিস 😉😋🤣"
        ];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, (error, info) => {
          if (error) return;
          if (global.GoatBot && global.GoatBot.onReply) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "bby",
              type: "reply",
              messageID: info.messageID,
              author: event.senderID
            });
          }
        }, event.messageID);
      }
      
      const res = await axios.get(`${BASE_API_URL}/teachreply?msg=${encodeURIComponent(arr)}&senderID=${event.senderID}`);
      const finalText = extractApiReply(res.data);
      
      api.sendMessage(finalText, event.threadID, (error, info) => {
        if (error) return;
        if (global.GoatBot && global.GoatBot.onReply) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "bby",
            type: "reply",
            messageID: info.messageID,
            author: event.senderID
          });
        }
      }, event.messageID);
    }
  } catch (err) {
    // Silent catch for chat background listener
  } 
};