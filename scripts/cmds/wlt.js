const { config } = global.GoatBot;
const { client } = global;

const F = {
  title: "𝐖𝐇𝐈𝐓𝐄𝐋𝐈𝐒𝐓 𝐓𝐇𝐑𝐄𝐀𝐃",
  name: "𝐍𝐀𝐌𝐄",
  id: "𝐓𝐈𝐃",
  added: "𝐀𝐃𝐃𝐄𝐃",
  removed: "𝐑𝐄𝐌𝐎𝐕𝐄𝐃",
  already: "𝐀𝐋𝐑𝐄𝐀𝐃𝐘 𝐀𝐃𝐃𝐄𝐃",
  notFound: "𝐍𝐎𝐓 𝐅𝐎𝐔𝐍𝐃"
};

const PER_PAGE = 5;


/*
========================================
MONGODB GLOBAL DATA STORAGE
========================================
*/

const WLT_DB_KEY = "wltConfig";

let restorePromise = null;


/*
========================================
GET GLOBAL DATA CONTROLLER
========================================
*/

function getGlobalData() {
  return (
    global.db?.globalData ||
    global.GoatBot?.globalData ||
    null
  );
}


/*
========================================
SAVE WLT CONFIG TO DATABASE
========================================
*/

async function saveConfig() {
  try {
    const globalData = getGlobalData();

    if (!globalData) {
      console.error(
        "[WLT] globalData controller is not available."
      );

      return false;
    }

    const data = {
      whiteListModeThread: {
        ...config.whiteListModeThread,
        whiteListThreadIds: Array.isArray(
          config.whiteListModeThread?.whiteListThreadIds
        )
          ? config.whiteListModeThread.whiteListThreadIds.map(String)
          : []
      },

      hideNotiMessage: {
        ...config.hideNotiMessage
      }
    };


    /*
    ========================================
    CHECK IF DATABASE KEY EXISTS
    ========================================
    */

    const exists =
      globalData.existsSync(WLT_DB_KEY);


    /*
    ========================================
    CREATE FIRST TIME
    ========================================
    */

    if (!exists) {
      await globalData.create(
        WLT_DB_KEY,
        {
          data
        }
      );

      console.log(
        "[WLT] Configuration created in MongoDB."
      );

      return true;
    }


    /*
    ========================================
    UPDATE EXISTING DATA
    ========================================
    */

    await globalData.set(
      WLT_DB_KEY,
      {
        data
      }
    );

    return true;

  } catch (error) {

    console.error(
      "[WLT] MongoDB save error:",
      error.message
    );

    return false;
  }
}


/*
========================================
RESTORE WLT CONFIG FROM DATABASE
========================================
*/

async function restoreConfig() {

  /*
  Prevent multiple simultaneous restore calls.
  */

  if (restorePromise) {
    return restorePromise;
  }

  restorePromise = (async () => {

    try {

      const globalData = getGlobalData();

      if (!globalData) {

        console.log(
          "[WLT] globalData controller is not available. Using config.json."
        );

        return false;
      }


      /*
      ========================================
      GET DATABASE DATA
      ========================================
      */

      const saved =
        await globalData.get(
          WLT_DB_KEY
        );


      /*
      ========================================
      NO DATABASE DATA
      ========================================
      */

      if (!saved) {

        console.log(
          "[WLT] No saved configuration found. Creating MongoDB backup..."
        );

        await saveConfig();

        return true;
      }


      /*
      ========================================
      GET ACTUAL DATA OBJECT
      ========================================
      */

      const data =
        saved.data || {};


      /*
      ========================================
      RESTORE WHITE LIST THREAD
      ========================================
      */

      if (
        data.whiteListModeThread &&
        typeof data.whiteListModeThread === "object"
      ) {

        config.whiteListModeThread = {
          ...config.whiteListModeThread,
          ...data.whiteListModeThread
        };


        if (
          !Array.isArray(
            config.whiteListModeThread.whiteListThreadIds
          )
        ) {

          config.whiteListModeThread.whiteListThreadIds =
            [];
        }


        config.whiteListModeThread.whiteListThreadIds =
          config.whiteListModeThread.whiteListThreadIds
            .map(String);
      }


      /*
      ========================================
      RESTORE NOTIFICATION CONFIG
      ========================================
      */

      if (
        data.hideNotiMessage &&
        typeof data.hideNotiMessage === "object"
      ) {

        config.hideNotiMessage = {
          ...config.hideNotiMessage,
          ...data.hideNotiMessage
        };
      }


      /*
      ========================================
      RESTORE SUCCESS LOG
      ========================================
      */

      console.log(
        `[WLT] MongoDB restore successful | Threads: ${
          config.whiteListModeThread
            ?.whiteListThreadIds
            ?.length || 0
        } | Mode: ${
          config.whiteListModeThread?.enable
            ? "ON"
            : "OFF"
        }`
      );

      return true;

    } catch (error) {

      console.error(
        "[WLT] MongoDB restore error:",
        error.message
      );

      console.log(
        "[WLT] Using config.json values instead."
      );

      return false;

    }

  })();

  return restorePromise;
}


/*
========================================
THREAD ID GETTER
========================================
*/

function getThreadIDs(event, args) {
  const tids = new Set();

  for (const arg of args) {
    if (/^\d{5,}$/.test(arg)) {
      tids.add(arg);
    }
  }

  if (!tids.size && event.threadID) {
    tids.add(event.threadID);
  }

  return [...tids];
}


/*
========================================
BOX
========================================
*/

function box(title, content) {
  return (
    `╭────────────────────❍\n` +
    `│  ${title}\n` +
    `╰────────────────────❍\n\n` +
    content
  );
}


/*
========================================
GET THREAD NAME
========================================
*/

async function getThreadName(api, tid) {
  try {
    const info = await api.getThreadInfo(tid);

    return info?.threadName || "𝐔𝐧𝐤𝐧𝐨𝐰";

  } catch {
    return "𝐔𝐧𝐤𝐧𝐨𝐰𝐧";
  }
}


module.exports = {

  config: {
    name: "whitelistthread",

    aliases: [
      "wlt",
      "wt",
      "threadwl",
      "wlthread"
    ],

    version: "2.1.1",
    author: "NTKhang × Bokkor x69",
    countDown: 3,
    role: 2,

    description: {
      en: "𝐀𝐝𝐯𝐚𝐧𝐜𝐞𝐝 𝐖𝐡𝐢𝐭𝐞𝐥𝐢𝐬𝐭 𝐓𝐡𝐫𝐞𝐚𝐝 𝐌𝐚𝐧𝐚𝐠𝐞𝐫"
    },

    category: "𝐎𝐖𝐍𝐄𝐑",

    guide: {
      en:
        "{pn} add <TID>\n" +
        "{pn} add\n" +
        "{pn} rm <TID>\n" +
        "{pn} rm\n" +
        "{pn} list\n" +
        "{pn} list <page>\n" +
        "{pn} mode on/off\n" +
        "{pn} mode noti on/off"
    }
  },


  /*
  ========================================
  RESTORE ON COMMAND LOAD
  ========================================
  */

  onLoad: async function () {
    await restoreConfig();
  },


  /*
  ========================================
  COMMAND START
  ========================================
  */

  onStart: async function ({
    message,
    args,
    event,
    api
  }) {


    /*
    ========================================
    ENSURE DATABASE RESTORE
    ========================================
    */

    await restoreConfig();


    const owners =
      global.GoatBot.config.ownerBot || [];


    /*
    =========================
    OWNER CHECK
    =========================
    */

    if (!owners.includes(event.senderID)) {

      return message.reply(
        `╭────────────────────❍\n` +
        `│  ❌ 𝐀𝐂𝐂𝐄𝐒𝐒 𝐃𝐄𝐍𝐈𝐄𝐃\n` +
        `╰────────────────────❍\n\n` +
        `│ 𝐎𝐧𝐥𝐲 𝐁𝐨𝐭 𝐎𝐰𝐧𝐞𝐫 𝐂𝐚𝐧 𝐔𝐬𝐞 𝐓𝐡𝐢𝐬\n` +
        `╰────────────────────`
      );
    }


    const action =
      (args[0] || "").toLowerCase();


    /*
    =========================
    ADD
    =========================
    */

    if (
      ["add", "-a", "+"].includes(action)
    ) {

      const tids = getThreadIDs(
        event,
        args.slice(1)
      );

      const list =
        config.whiteListModeThread
          .whiteListThreadIds;

      const added = [];
      const already = [];


      for (const tid of tids) {

        if (list.includes(tid)) {

          already.push(tid);

        } else {

          list.push(tid);
          added.push(tid);

        }
      }


      /*
      SAVE TO MONGODB
      */

      await saveConfig();


      let output =
        `╭────────────────────❍\n` +
        `│  ✅ 𝐖𝐇𝐈𝐓𝐄𝐋𝐈𝐒𝐓 𝐔𝐏𝐃𝐀𝐓𝐄𝐃\n` +
        `╰────────────────────❍\n\n`;


      if (added.length) {

        const details =
          await Promise.all(
            added.map(
              async (tid, index) => {

                const name =
                  await getThreadName(
                    api,
                    tid
                  );

                return (
                  `╭──✦ ${index + 1}\n` +
                  `├‣ 𝐍𝐚𝐦𝐞: ${name}\n` +
                  `├‣ 𝐓𝐈𝐃: ${tid}\n` +
                  `╰──────────────────`
                );
              }
            )
          );


        output +=
          `𝐀𝐝𝐝𝐞𝐝: ${added.length}\n\n` +
          details.join("\n");
      }


      if (already.length) {

        output +=
          `\n\n❌ 𝐀𝐥𝐫𝐞𝐚𝐝𝐲 𝐖𝐡𝐢𝐭𝐞𝐥𝐢𝐬𝐭𝐞𝐝: ${already.length}\n\n`;

        output += already
          .map(
            (tid, index) =>
              `├‣ ${index + 1}. 𝐓𝐈𝐃: ${tid}`
          )
          .join("\n");
      }


      return message.reply(output);
    }


    /*
    =========================
    REMOVE
    =========================
    */

    if (
      ["remove", "rm", "-r", "-"].includes(action)
    ) {

      const tids = getThreadIDs(
        event,
        args.slice(1)
      );


      const list =
        config.whiteListModeThread
          .whiteListThreadIds;

      const removed = [];
      const notFound = [];


      for (const tid of tids) {

        const index =
          list.indexOf(tid);


        if (index !== -1) {

          list.splice(index, 1);
          removed.push(tid);

        } else {

          notFound.push(tid);

        }
      }


      /*
      SAVE TO MONGODB
      */

      await saveConfig();


      let output =
        `╭────────────────────❍\n` +
        `│  ✅ 𝐖𝐇𝐈𝐓𝐄𝐋𝐈𝐒𝐓 𝐔𝐏𝐃𝐀𝐓𝐄𝐃\n` +
        `╰────────────────────❍\n\n`;


      if (removed.length) {

        const details =
          await Promise.all(
            removed.map(
              async (tid, index) => {

                const name =
                  await getThreadName(
                    api,
                    tid
                  );

                return (
                  `╭──✦ ${index + 1}\n` +
                  `├‣ 𝐍𝐚𝐦𝐞: ${name}\n` +
                  `├‣ 𝐓𝐈𝐃: ${tid}\n` +
                  `╰──────────────────`
                );
              }
            )
          );


        output +=
          `𝐑𝐞𝐦𝐨𝐯𝐞𝐝: ${removed.length}\n\n` +
          details.join("\n");
      }


      if (notFound.length) {

        output +=
          `\n\n❌ 𝐍𝐨𝐭 𝐅𝐨𝐮𝐧ⴷ: ${notFound.length}\n\n`;

        output += notFound
          .map(
            (tid, index) =>
              `├‣ ${index + 1}. 𝐓𝐈𝐃: ${tid}`
          )
          .join("\n");
      }


      return message.reply(output);
    }


    /*
    =========================
    LIST
    =========================
    */

    if (
      ["list", "-l", "show"].includes(action)
    ) {

      const list =
        config.whiteListModeThread
          .whiteListThreadIds || [];


      if (!list.length) {

        return message.reply(
          box(
            "𝐓𝐇𝐑𝐄𝐀𝐃 𝐖𝐇𝐈𝐓𝐄𝐋𝐈𝐒𝐓",
            "❌ 𝐍𝐨 𝐓𝐡𝐫𝐞𝐚𝐝 𝐈𝐬 𝐂𝐮𝐫𝐫𝐞𝐧𝐭𝐥𝐲 𝐖𝐡𝐢𝐭𝐞𝐥𝐢𝐬𝐭𝐞𝐝."
          )
        );
      }


      const requestedPage =
        parseInt(args[1]) || 1;


      const total =
        list.length;


      const totalPages =
        Math.ceil(
          total / PER_PAGE
        );


      const page =
        Math.max(
          1,
          Math.min(
            requestedPage,
            totalPages
          )
        );


      const start =
        (page - 1) * PER_PAGE;


      const current =
        list.slice(
          start,
          start + PER_PAGE
        );


      const threads =
        await Promise.all(
          current.map(
            async tid => ({
              tid,
              name:
                await getThreadName(
                  api,
                  tid
                )
            })
          )
        );


      let output =
        `╭────────────────────❍\n` +
        `│     𝐖𝐇𝐈𝐓𝐄𝐋𝐈𝐒𝐓 𝐓𝐇𝐑𝐄𝐀𝐃\n` +
        `│     𝐓𝐨𝐭𝐚𝐥: ${total}\n` +
        `│     𝐏𝐚𝐠𝐞: ${page}/${totalPages}\n` +
        `╰────────────────────❍\n\n`;


      threads.forEach(
        (thread, index) => {

          const number =
            start + index + 1;


          output +=
            `╭──✦ ${number}\n` +
            `├‣ 𝐍𝐚𝐦𝐞: ${thread.name}\n` +
            `├‣ 𝐓𝐈𝐃: ${thread.tid}\n` +
            `╰──────────────────\n`;
        }
      );


      output +=
        `\n╭────────────────────❍\n` +
        `│ 𝐌𝐨𝐝𝐞: ` +
        `${
          config.whiteListModeThread.enable
            ? "𝐎𝐍 ✅"
            : "𝐎𝐅𝐅 ❌"
        }\n` +
        `│ 𝐍𝐨𝐭𝐢: ` +
        `${
          config.hideNotiMessage
            .whiteListModeThread
            ? "𝐎𝐅𝐅 ❌"
            : "𝐎𝐍 ✅"
        }\n` +
        `╰────────────────────❍`;


      if (totalPages > 1) {

        output +=
          `\n\n𝐔𝐬𝐞: 𝐰𝐥𝐭 𝐥𝐢𝐬𝐭 <𝐩𝐚𝐠𝐞>`;
      }


      return message.reply(output);
    }


    /*
    =========================
    MODE
    =========================
    */

    if (
      ["mode", "m", "-m"].includes(action)
    ) {

      const sub =
        (args[1] || "").toLowerCase();


      /*
      =========================
      NOTIFICATION
      =========================
      */

      if (sub === "noti") {

        const value =
          (args[2] || "").toLowerCase();


        if (
          !["on", "off"].includes(value)
        ) {

          return message.reply(
            box(
              "𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍",
              "❌ 𝐔𝐬𝐚𝐠𝐞: 𝐰𝐥𝐭 𝐦𝐨𝐝𝐞 𝐧𝐨𝐭𝐢 𝐨𝐧/𝐨𝐟𝐟"
            )
          );
        }


        const enabled =
          value === "on";


        config.hideNotiMessage
          .whiteListModeThread =
          !enabled;


        /*
        SAVE TO MONGODB
        */

        await saveConfig();


        return message.reply(
          box(
            "𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍",
            enabled
              ? "𝐍𝐨𝐭𝐢𝐟𝐢𝐜𝐚𝐭𝐢𝐨𝐧 𝐭𝐮𝐫𝐧𝐞𝐝 𝐎𝐍 ✅"
              : "𝐍𝐨𝐭𝐢𝐟𝐢𝐜𝐚𝐭𝐢𝐨𝐧 𝐭𝐮𝐫𝐧𝐞𝐝 𝐎𝐅𝐅 ❌"
          )
        );
      }


      /*
      =========================
      WHITELIST MODE
      =========================
      */

      if (
        !["on", "off"].includes(sub)
      ) {

        return message.reply(
          box(
            "𝐓𝐇𝐑𝐄𝐀𝐃 𝐌𝐎𝐃𝐄",
            "❌ 𝐔𝐬𝐚𝐠𝐞: 𝐰𝐥𝐭 𝐦𝐨𝐝𝐞 𝐨𝐧/𝐨𝐟𝐟"
          )
        );
      }


      const enabled =
        sub === "on";


      config.whiteListModeThread.enable =
        enabled;


      /*
      SAVE TO MONGODB
      */

      await saveConfig();


      return message.reply(
        box(
          "𝐓𝐇𝐑𝐄𝐀𝐃 𝐌𝐎𝐃𝐄",
          enabled
            ? "𝐎𝐧𝐥𝐲 𝐰𝐡𝐢𝐭𝐞𝐥𝐢𝐬𝐭𝐞𝐝 𝐭𝐡𝐫𝐞𝐚𝐝𝐬 𝐜𝐚𝐧 𝐮𝐬𝐞 𝐭𝐡𝐞 𝐛𝐨𝐭. ✅"
            : "𝐖𝐡𝐢𝐭𝐞𝐥𝐢𝐬𝐭 𝐭𝐡𝐫𝐞𝐚𝐝 𝐦𝐨𝐝𝐞 𝐭𝐮𝐫𝐧𝐞𝐝 𝐎𝐅𝐅. ❌"
        )
      );
    }


    /*
    =========================
    HELP
    =========================
    */

    return message.reply(
      `╭────────────────────❍\n` +
      `│       𝐓𝐇𝐑𝐄𝐀𝐃 𝐖𝐇𝐈𝐓𝐄𝐋𝐈𝐒𝐓\n` +
      `│       𝐎𝐖𝐍𝐄𝐑 𝐌𝐀𝐍𝐀𝐆𝐄Ր\n` +
      `╰────────────────────❍\n\n` +

      `╭─❍ 𝐀𝐃𝐃\n` +
      `│ 𝐰𝐥𝐭 𝐚𝐝𝐝 <𝐓𝐈𝐃>\n` +
      `│ 𝐰𝐥𝐭 𝐚𝐝𝐝\n` +
      `│ 𝐂𝐮𝐫𝐫𝐞𝐧𝐭 𝐓𝐡𝐫𝐞𝐚𝐝\n` +
      `╰──────────────\n\n` +

      `╭─❍ 𝐑𝐄𝐌𝐎𝐕𝐄\n` +
      `│ 𝐰𝐥𝐭 𝐫𝐦 <𝐓𝐈𝐃>\n` +
      `│ 𝐰𝐥𝐭 𝐫𝐦\n` +
      `│ 𝐂𝐮𝐫𝐫𝐞𝐧𝐭 𝐓𝐡𝐫𝐞𝐚𝐝\n` +
      `╰──────────────\n\n` +

      `╭─❍ 𝐋𝐈𝐒𝐓\n` +
      `│ 𝐰𝐥𝐭 𝐥𝐢𝐬𝐭\n` +
      `│ 𝐰𝐥𝐭 𝐥𝐢𝐬𝐭 𝟐\n` +
      `│ 𝐰𝐥𝐭 𝐥𝐢𝐬𝐭 𝟑\n` +
      `╰──────────────\n\n` +

      `╭─❍ 𝐌𝐎𝐃𝐄\n` +
      `│ 𝐰𝐥𝐭 𝐦𝐨𝐝𝐞 𝐨𝐧\n` +
      `│ 𝐰𝐥𝐭 𝐦𝐨𝐝𝐞 𝐨𝐟𝐟\n` +
      `│ 𝐰𝐥𝐭 𝐦𝐨𝐝𝐞 𝐧𝐨𝐭𝐢 𝐨𝐧\n` +
      `│ 𝐰𝐥𝐭 𝐦𝐨𝐝𝐞 𝐧𝐨𝐭𝐢 𝐨𝐟𝐟\n` +
      `╰──────────────`
    );
  }
};