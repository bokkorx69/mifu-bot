const axios = require("axios");

const API = "https://ceddsrestapi.vercel.app/tempmail";

if (!global.tempMailSessions)
  global.tempMailSessions = {};

module.exports = {
  config: {
    name: "tempmail",
    aliases: ["tmp", "tm"],
    version: "9.1",
    author: "Bokkor x69",
    countDown: 0,
    role: 0,
    description: {
      bn: "𝙏𝙚𝙢𝙥 𝙢𝙖𝙞𝙡 𝙜𝙚𝙣𝙚𝙧𝙖𝙩𝙚 𝙤𝙧 𝙞𝙣𝙗𝙤𝙭 𝙘𝙝𝙚𝙘𝙠",
      en: "𝙂𝙚𝙣𝙚𝙧𝙖𝙩𝙚 𝙩𝙚𝙢𝙥 𝙢𝙖𝙞𝙡 𝙖𝙣𝙙 𝙘𝙝𝙚𝙘𝙠 𝙞𝙣𝙗𝙤𝙭"
    },
    category: "utility",
    guide: {
      en:
        "{pn}\n" +
        "{pn} inbox\n" +
        "{pn} inbox <email>\n" +
        "{pn} info\n" +
        "{pn} new"
    }
  },

  langs: {
    en: {
      noSession: "❌ | 𝙉𝙤 𝙖𝙘𝙩𝙞𝙫𝙚 𝙢𝙖𝙞𝙡.",
      mailNotFound: "❌ | 𝙏𝙝𝙞𝙨 𝙢𝙖𝙞𝙡 𝙬𝙖𝙨 𝙣𝙤𝙩 𝙜𝙚𝙣𝙚𝙧𝙖𝙩𝙚𝙙 𝙝𝙚𝙧𝙚.",
      error: "❌ | %1"
    }
  },

  onStart: async function ({ api, event, args, getLang }) {
    const uid = event.senderID;
    const action = (args[0] || "generate").toLowerCase();

    // Fix old / broken sessions
    if (!global.tempMailSessions[uid]) {
      global.tempMailSessions[uid] = {
        current: null,
        mails: {}
      };
    }

    const userSessions = global.tempMailSessions[uid];

    if (!userSessions.mails || typeof userSessions.mails !== "object") {
      userSessions.mails = {};
    }

    if (!("current" in userSessions)) {
      userSessions.current = null;
    }

    /*
     * GENERATE / NEW
     */
    if (["generate", "gen", "new"].includes(action)) {
      try {
        const { data } = await axios.get(`${API}/gen`, {
          timeout: 15000
        });

        if (!data?.email || !data?.token) {
          return api.sendMessage(
            getLang("error", "Invalid API response."),
            event.threadID,
            event.messageID
          );
        }

        const email = String(data.email).trim().toLowerCase();

        const session = {
          email: data.email,
          password: data.password || "N/A",
          token: data.token,
          id: data.id || "N/A",
          createdAt: Date.now()
        };

        // Save email session
        userSessions.mails[email] = session;

        // Set latest/current email
        userSessions.current = email;

        return api.sendMessage(
`╭─「 𝙏𝙀𝙈𝙋 𝙈𝘼𝙄𝙇 」─╮
│
│ 𝙀𝙢𝙖𝙞𝙡 : ${data.email}
│ 𝙋𝙖𝙨𝙨 : ${data.password || "N/A"}
│
╰──────────────╯
𝙐𝙨𝙚: 𝙩𝙚𝙢𝙥𝙢𝙖𝙞𝙡 𝙞𝙣𝙗𝙤𝙭`,
          event.threadID,
          event.messageID
        );

      } catch (e) {
        console.error("TEMPMAIL GEN:", e);

        return api.sendMessage(
          getLang(
            "error",
            e.response?.data?.message || e.message
          ),
          event.threadID,
          event.messageID
        );
      }
    }

    /*
     * INFO
     */
    if (action === "info") {
      const current = userSessions.current;
      const mail = current
        ? userSessions.mails[current]
        : null;

      if (!mail) {
        return api.sendMessage(
          getLang("noSession"),
          event.threadID,
          event.messageID
        );
      }

      return api.sendMessage(
`𝙏𝙀𝙈𝙋 𝙈𝘼𝙄𝙇

𝙀𝙢𝙖𝙞𝙡 : ${mail.email}
𝙋𝙖𝙨𝙨 : ${mail.password}
𝙄𝘿 : ${mail.id}`,
        event.threadID,
        event.messageID
      );
    }

    /*
     * INBOX
     *
     * tempmail inbox
     * = latest generated email
     *
     * tempmail inbox email@example.com
     * = specific generated email
     */
    if (["inbox", "refresh", "mail"].includes(action)) {
      let targetEmail = args
        .slice(1)
        .join(" ")
        .trim();

      let mail;

      // No email = latest/current email
      if (!targetEmail) {
        targetEmail = userSessions.current;

        if (targetEmail) {
          mail = userSessions.mails[
            targetEmail.toLowerCase()
          ];
        }
      }

      // Specific email
      else {
        targetEmail = targetEmail.toLowerCase();

        mail = userSessions.mails[targetEmail];
      }

      if (!mail) {
        return api.sendMessage(
          targetEmail
            ? getLang("mailNotFound")
            : getLang("noSession"),
          event.threadID,
          event.messageID
        );
      }

      try {
        const { data } = await axios.get(
          `${API}/inbox`,
          {
            params: {
              token: mail.token
            },
            timeout: 15000
          }
        );

        const mails = Array.isArray(data?.answer)
          ? data.answer
          : [];

        // Empty inbox
        if (!mails.length) {
          return api.sendMessage(
`𝙄𝙉𝘽𝙊𝙓

𝙀𝙢𝙖𝙞𝙡 : ${mail.email}
𝙉𝙤 𝙣𝙚𝙬 𝙢𝙖𝙞𝙡.`,
            event.threadID,
            event.messageID
          );
        }

        // Inbox output
        let msg =
`𝙄𝙉𝘽𝙊𝙓 • ${mails.length}

𝙀𝙢𝙖𝙞𝙡 : ${mail.email}

`;

        mails.slice(0, 5).forEach((m, i) => {
          msg +=
`#${i + 1} ${m.from || "Unknown"}
𝙎𝙪𝙗𝙟𝙚𝙘𝙩 : ${m.subject || "No subject"}
${m.intro || ""}

`;
        });

        return api.sendMessage(
          msg.trim(),
          event.threadID,
          event.messageID
        );

      } catch (e) {
        console.error("TEMPMAIL INBOX:", e);

        return api.sendMessage(
          getLang(
            "error",
            e.response?.data?.message || e.message
          ),
          event.threadID,
          event.messageID
        );
      }
    }

    /*
     * HELP
     */
    return api.sendMessage(
`𝙏𝙀𝙈𝙋𝙈𝘼𝙄𝙇

𝙩𝙚𝙢𝙥𝙢𝙖𝙞𝙡
𝙩𝙚𝙢𝙥𝙢𝙖𝙞𝙡 𝙞𝙣𝙗𝙤𝙭
𝙩𝙚𝙢𝙥𝙢𝙖𝙞𝙡 𝙞𝙣𝙗𝙤𝙭 <𝙚𝙢𝙖𝙞𝙡>
𝙩𝙚𝙢𝙥𝙢𝙖𝙞𝙡 𝙞𝙣𝙛𝙤
𝙩𝙚𝙢𝙥𝙢𝙖𝙞𝙡 𝙣𝙚𝙬`,
      event.threadID,
      event.messageID
    );
  }
};