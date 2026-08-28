const { config } = global.GoatBot;
const { client } = global;

/*
=========================================
MONGODB GLOBAL DATA
=========================================
*/

const WL_DB_KEY = "whitelistsConfig";

let restorePromise = null;
let expiryInterval = null;


/*
=========================================
GET GLOBAL DATA
=========================================
*/

function getGlobalData() {
  return global.db?.globalData || null;
}


/*
=========================================
EXPIRY STORAGE
=========================================

{
  "UID": timestamp
}

Permanent user:
UID থাকবে না
*/

function getExpiryData() {

  if (!config.whiteListMode)
    config.whiteListMode = {};

  if (
    !config.whiteListMode.whiteListExpiry ||
    typeof config.whiteListMode.whiteListExpiry !== "object"
  ) {
    config.whiteListMode.whiteListExpiry = {};
  }

  return config.whiteListMode.whiteListExpiry;
}


/*
=========================================
PARSE EXPIRY
=========================================

1    = 1 hour
1h   = 1 hour
2h   = 2 hours
30m  = 30 minutes
2d   = 2 days
*/

function parseExpiry(input) {

  if (!input)
    return null;

  input = String(input).trim().toLowerCase();

  /*
  1 = 1 hour
  */
  if (/^\d+$/.test(input)) {

    const hours = Number(input);

    if (hours <= 0)
      return null;

    return hours * 60 * 60 * 1000;
  }

  /*
  1h / 2h
  */
  const hourMatch = input.match(/^(\d+(?:\.\d+)?)h$/);

  if (hourMatch) {

    const hours = Number(hourMatch[1]);

    if (hours <= 0)
      return null;

    return hours * 60 * 60 * 1000;
  }

  /*
  1m / 30m
  */
  const minuteMatch = input.match(/^(\d+(?:\.\d+)?)m$/);

  if (minuteMatch) {

    const minutes = Number(minuteMatch[1]);

    if (minutes <= 0)
      return null;

    return minutes * 60 * 1000;
  }

  /*
  1d / 2d
  */
  const dayMatch = input.match(/^(\d+(?:\.\d+)?)d$/);

  if (dayMatch) {

    const days = Number(dayMatch[1]);

    if (days <= 0)
      return null;

    return days * 24 * 60 * 60 * 1000;
  }

  return undefined;
}


/*
=========================================
FORMAT EXPIRY
=========================================
*/

function formatExpiry(timestamp) {

  if (!timestamp)
    return "𝐏𝐄𝐑𝐌𝐀𝐍𝐄𝐍𝐓";

  const remaining = timestamp - Date.now();

  if (remaining <= 0)
    return "𝐄𝐗𝐏𝐈𝐑𝐄𝐃";

  const seconds = Math.floor(remaining / 1000);

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0)
    return `${days}𝐝 ${hours}𝐡`;

  if (hours > 0)
    return `${hours}𝐡 ${minutes}𝐦`;

  if (minutes > 0)
    return `${minutes}𝐦`;

  return `${seconds}𝐬`;
}


/*
=========================================
SAVE CONFIG TO MONGODB
=========================================
*/

async function saveConfig() {

  try {

    const globalData = getGlobalData();

    if (!globalData) {

      console.log(
        "[WLS] MongoDB globalData is not available. Using config.json."
      );

      return false;
    }


    const expiry = getExpiryData();


    const data = {

      whiteListMode: {

        ...config.whiteListMode,

        whiteListIds:
          Array.isArray(
            config.whiteListMode?.whiteListIds
          )
            ? config.whiteListMode.whiteListIds.map(String)
            : [],

        whiteListExpiry: {
          ...expiry
        }
      },

      hideNotiMessage: {
        ...config.hideNotiMessage
      }
    };


    /*
    CREATE FIRST TIME
    */

    if (!globalData.existsSync(WL_DB_KEY)) {

      await globalData.create(
        WL_DB_KEY,
        {
          data
        }
      );

      console.log(
        "[WLS] MongoDB configuration created."
      );

      return true;
    }


    /*
    UPDATE
    */

    await globalData.set(
      WL_DB_KEY,
      {
        data
      }
    );

    return true;

  }

  catch (err) {

    console.error(
      "[WLS] MongoDB save error:",
      err.message
    );

    return false;
  }
}


/*
=========================================
REMOVE EXPIRED USERS
=========================================
*/

async function cleanupExpiredUsers() {

  try {

    const list =
      config.whiteListMode?.whiteListIds || [];

    const expiry =
      getExpiryData();

    const now = Date.now();

    let changed = false;


    for (const uid of [...list]) {

      const expireAt =
        Number(expiry[uid]);


      /*
      No expiry = permanent
      */

      if (!expireAt)
        continue;


      if (expireAt <= now) {

        const index =
          list.indexOf(uid);

        if (index !== -1) {

          list.splice(index, 1);

          delete expiry[uid];

          changed = true;

          console.log(
            `[WLS] Whitelist expired: ${uid}`
          );
        }
      }
    }


    /*
    Remove orphan expiry data
    */

    for (const uid of Object.keys(expiry)) {

      if (!list.includes(uid)) {

        delete expiry[uid];

        changed = true;
      }
    }


    if (changed) {

      await saveConfig();

      console.log(
        "[WLS] Expired whitelist data cleaned."
      );
    }

  }

  catch (err) {

    console.error(
      "[WLS] Expiry cleanup error:",
      err.message
    );
  }
}


/*
=========================================
RESTORE CONFIG FROM MONGODB
=========================================
*/

async function restoreConfig() {

  if (restorePromise)
    return restorePromise;


  restorePromise = (async () => {

    try {

      const globalData = getGlobalData();


      if (!globalData) {

        console.log(
          "[WLS] MongoDB getGlobal is not available. Using config.json."
        );

        return false;
      }


      /*
      GET SAVED DATA
      */

      const saved =
        await globalData.get(
          WL_DB_KEY
        );


      /*
      NO DATA FOUND
      */

      if (!saved) {

        console.log(
          "[WLS] No MongoDB data found. Creating backup..."
        );

        await saveConfig();

        return true;
      }


      const data =
        saved.data || {};


      /*
      RESTORE WHITE LIST
      */

      if (
        data.whiteListMode &&
        typeof data.whiteListMode === "object"
      ) {

        config.whiteListMode = {

          ...config.whiteListMode,

          ...data.whiteListMode
        };


        if (
          !Array.isArray(
            config.whiteListMode.whiteListIds
          )
        ) {

          config.whiteListMode.whiteListIds = [];
        }


        config.whiteListMode.whiteListIds =
          config.whiteListMode.whiteListIds
            .map(String);


        /*
        Restore expiry
        */

        if (
          !data.whiteListMode.whiteListExpiry ||
          typeof data.whiteListMode.whiteListExpiry !== "object"
        ) {

          config.whiteListMode.whiteListExpiry = {};
        }
        else {

          config.whiteListMode.whiteListExpiry =
            {
              ...data.whiteListMode.whiteListExpiry
            };
        }
      }


      /*
      RESTORE NOTIFICATION
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
      CLEAN EXPIRED DATA
      */

      await cleanupExpiredUsers();


      console.log(
        `[WLS] MongoDB restore successful | Users: ${
          config.whiteListMode?.whiteListIds?.length || 0
        } | Mode: ${
          config.whiteListMode?.enable
            ? "ON"
            : "OFF"
        }`
      );


      return true;

    }

    catch (err) {

      console.error(
        "[WLS] MongoDB restore error:",
        err.message
      );

      console.log(
        "[WLS] Using config.json values."
      );

      return false;
    }

  })();


  return restorePromise;
}


/*
=========================================
UID PARSER
=========================================
*/

function getUIDs(event, args) {

  const uids = new Set();


  /*
  Mentions
  */

  if (
    event.mentions &&
    Object.keys(event.mentions).length
  ) {

    for (
      const uid of Object.keys(event.mentions)
    ) {

      uids.add(
        String(uid)
      );
    }
  }


  /*
  Reply user
  */

  if (
    event.messageReply?.senderID
  ) {

    uids.add(
      String(
        event.messageReply.senderID
      )
    );
  }


  /*
  Direct UID
  */

  for (
    const arg of args
  ) {

    if (
      /^\d{5,}$/.test(arg)
    ) {

      uids.add(
        String(arg)
      );
    }
  }


  return [...uids];
}


/*
=========================================
BOX
=========================================
*/

function box(title, content) {

  return (

    `╭───────────────❍\n` +
    `│  ${title}\n` +
    `╰───────────────❍\n\n` +
    content

  );
}


/*
=========================================
GET USER NAME
=========================================
*/

async function getUserName(usersData, uid) {

  try {

    return await usersData.getName(uid);

  }

  catch {

    return "𝐔𝐧𝐤𝐧𝐨𝐰𝐧";
  }
}


/*
=========================================
COMMAND
=========================================
*/

module.exports = {

  config: {

    name: "whitelists",

    aliases: [
      "wlonly",
      "onlywlst",
      "onlywhitelist",
      "wl"
    ],

    version: "3.1.0",

    author: "NTKhang × Bokkor x69",

    countDown: 3,

    role: 0,

    description: {
      en: "𝐀𝐝𝐯𝐚𝐧𝐜𝐞𝐝 𝐖𝐡𝐢𝐭𝐞𝐥𝐢𝐬𝐭 𝐌𝐚𝐧𝐚𝐠𝐞𝐫"
    },

    category: "𝐎𝐖𝐍𝐄𝐑",

    guide: {

      en:

        "{pn} add <uid/@tag> [time]\n" +

        "{pn} remove <uid/@tag>\n" +

        "{pn} list [page]\n" +

        "{pn} mode on/off\n" +

        "{pn} mode noti on/off\n\n" +

        "𝐓𝐢𝐦𝐞: 1 = 1h | 1h = 1h | 30m = 30m | 2d = 2d | no time = permanent"
    }
  },


  /*
  =========================================
  ON LOAD
  =========================================
  */

  onLoad: async function () {

    await restoreConfig();


    /*
    Auto cleanup every 30 seconds
    */

    if (!expiryInterval) {

      expiryInterval =
        setInterval(
          cleanupExpiredUsers,
          30 * 1000
        );

      /*
      Prevent interval from keeping Node alive
      */

      if (
        expiryInterval.unref
      ) {

        expiryInterval.unref();
      }
    }
  },


  /*
  =========================================
  ON START
  =========================================
  */

  onStart: async function ({

    message,
    args,
    usersData,
    event,
    api

  }) {


    /*
    Ensure restore
    */

    await restoreConfig();


    /*
    Cleanup before command
    */

    await cleanupExpiredUsers();


    /*
    ADMIN CHECK
    */

    const admins =
      global.GoatBot.config.adminBot || [];


    if (
      !admins.includes(
        event.senderID
      )
    ) {

      return message.reply(
        "❌ 𝐘𝐨𝐮 𝐝𝐨 𝐧𝐨𝐭 𝐡𝐚𝐯𝐞 𝐩𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧 𝐭𝐨 𝐮𝐬𝐞 𝐭𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝."
      );
    }


    const action =
      (args[0] || "")
        .toLowerCase();


    /*
    =========================================
    ADD
    =========================================
    */

    if (
      ["add", "-a", "+"].includes(action)
    ) {


      const uids =
        getUIDs(
          event,
          args.slice(1)
        );


      if (!uids.length) {

        return message.reply(
          box(
            " 𝐀𝐃𝐃 𝐖𝐇𝐈𝐓𝐄𝐋𝐈𝐒𝐓",

            "⚠️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐔𝐈𝐃, 𝐦𝐞𝐧𝐭𝐢𝐨𝐧 𝐨𝐫 𝐫𝐞𝐩𝐥𝐲."
          )
        );
      }


      /*
      Time argument
      */

      let timeArg = null;


      /*
      Find first non UID argument
      */

      for (
        const arg of args.slice(1)
      ) {

        if (
          !/^\d{5,}$/.test(arg)
        ) {

          timeArg = arg;

          break;
        }
      }


      /*
      Parse time
      */

      const duration =
        parseExpiry(
          timeArg
        );


      /*
      Invalid time
      */

      if (
        timeArg &&
        duration === undefined
      ) {

        return message.reply(
          box(
            "⏱️ 𝐈𝐍𝐕𝐀𝐋𝐈𝐃 𝐄𝐗𝐏𝐈𝐑𝐘",

            "⚠️ 𝐔𝐬𝐞: 1 | 1h | 30m | 2d\n\n" +

            "𝐄𝐱𝐚𝐦𝐩𝐥𝐞:\n" +

            "├‣ wl add 123456789 1\n" +

            "├‣ wl add 123456789 1h\n" +

            "├‣ wl add 123456789 30m\n" +

            "├‣ wl add 123456789 2d\n" +

            "╰──────────────────‣"
          )
        );
      }


      const list =
        config.whiteListMode.whiteListIds;


      const expiry =
        getExpiryData();


      const added = [];
      const already = [];


      for (
        const uid of uids
      ) {


        /*
        Already exists
        */

        if (
          list.includes(uid)
        ) {

          already.push(uid);

        }

        else {

          list.push(uid);

          added.push(uid);


          /*
          Permanent
          */

          if (!duration) {

            delete expiry[uid];
          }

          /*
          Expiring
          */

          else {

            expiry[uid] =
              Date.now() + duration;
          }
        }
      }


      /*
      SAVE
      */

      await saveConfig();


      let output =

        `╭───────────────❍\n` +

        `│  ✅ 𝐖𝐇𝐈𝐓𝐄𝐋𝐈𝐒𝐓 𝐔𝐏𝐃𝐀𝐓𝐄𝐃\n` +

        `╰───────────────❍\n\n`;


      /*
      Added users
      */

      if (
        added.length
      ) {

        output +=
          `╭──✦ 𝐀𝐃𝐃𝐄𝐃: ${added.length}\n`;


        for (
          let i = 0;
          i < added.length;
          i++
        ) {

          const uid =
            added[i];


          const name =
            await getUserName(
              usersData,
              uid
            );


          output +=

            `├‣ 𝐍𝐀𝐌𝐄: ${name}\n` +

            `├‣ 𝐔𝐈𝐃: ${uid}\n` +

            `├‣ 𝐄𝐗𝐏𝐈𝐑𝐘: ${
              expiry[uid]
                ? formatExpiry(
                    expiry[uid]
                  )
                : "𝐏𝐄𝐑𝐌𝐀𝐍𝐄𝐍𝐓"
            }\n`;


          if (
            i !==
            added.length - 1
          ) {

            output +=
              `├‣\n`;
          }
        }


        output +=
          `╰──────────────────‣`;
      }


      /*
      Already
      */

      if (
        already.length
      ) {

        if (
          added.length
        ) {

          output +=
            `\n\n`;
        }


        output +=
          `╭──✦ 𝐀𝐋𝐑𝐄𝐀𝐃𝐘 𝐀𝐃𝐃𝐄𝐃: ${already.length}\n`;


        already.forEach(
          (uid, i) => {

            output +=

              `├‣ ${i + 1}. 𝐔𝐈𝐃: ${uid}\n` +

              `├‣ 𝐄𝐗𝐏𝐈𝐑𝐘: ${
                expiry[uid]
                  ? formatExpiry(
                      expiry[uid]
                    )
                  : "𝐏𝐄𝐑𝐌𝐀𝐍𝐄𝐍𝐓"
              }\n`;
          }
        );


        output +=
          `╰──────────────────‣`;
      }


      return message.reply(
        output
      );
    }


    /*
    =========================================
    REMOVE
    =========================================
    */

    if (
      ["remove", "rm", "-r", "-"].includes(action)
    ) {


      const uids =
        getUIDs(
          event,
          args.slice(1)
        );


      if (!uids.length) {

        return message.reply(
          box(
            "➖ 𝐑𝐄𝐌𝐎𝐕𝐄 𝐖𝐇𝐈𝐓𝐄𝐋𝐈𝐒𝐓",

            "⚠️ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐔𝐈𝐃, 𝐦𝐞𝐧𝐭𝐢𝐨𝐧 𝐨𝐫 𝐫𝐞𝐩𝐥𝐲."
          )
        );
      }


      const list =
        config.whiteListMode.whiteListIds;


      const expiry =
        getExpiryData();


      const removed = [];
      const notFound = [];


      for (
        const uid of uids
      ) {


        const index =
          list.indexOf(uid);


        if (
          index !== -1
        ) {

          list.splice(
            index,
            1
          );


          delete expiry[uid];


          removed.push(uid);

        }

        else {

          notFound.push(uid);
        }
      }


      await saveConfig();


      let output =

        `╭───────────────❍\n` +

        `│   𝐖𝐇𝐈𝐓𝐄𝐋𝐈𝐒𝐓 𝐔𝐏𝐃𝐀𝐓𝐄𝐃\n` +

        `╰───────────────❍\n\n`;


      if (
        removed.length
      ) {

        output +=
          `╭──✦ 𝐑𝐄𝐌𝐎𝐕𝐄𝐃: ${removed.length}\n`;


        removed.forEach(
          (uid, i) => {

            output +=
              `├‣ ${i + 1}. 𝐔𝐈𝐃: ${uid}\n`;
          }
        );


        output +=
          `╰──────────────────‣`;
      }


      if (
        notFound.length
      ) {

        if (
          removed.length
        ) {

          output +=
            `\n\n`;
        }


        output +=
          `╭──✦ 𝐍𝐎𝐓 𝐅𝐎𝐔𝐍𝐃: ${notFound.length}\n`;


        notFound.forEach(
          (uid, i) => {

            output +=
              `├‣ ${i + 1}. 𝐔𝐈𝐃: ${uid}\n`;
          }
        );


        output +=
          `╰──────────────────‣`;
      }


      return message.reply(
        output
      );
    }


    /*
    =========================================
    LIST
    =========================================
    */

    if (
      ["list", "-l", "show"].includes(action)
    ) {


      const list =
        config.whiteListMode.whiteListIds || [];


      if (!list.length) {

        return message.reply(
          box(
            "📋 𝐖𝐇𝐈𝐓𝐄𝐋𝐈𝐒𝐓",

            "⚠️ 𝐍𝐨 𝐮𝐬𝐞𝐫 𝐢𝐬 𝐜𝐮𝐫𝐫𝐞𝐧𝐭𝐥𝐲 𝐰𝐡𝐢𝐭𝐞𝐥𝐢𝐬𝐭𝐞𝐝."
          )
        );
      }


      const expiry =
        getExpiryData();


      const perPage = 5;


      let page =
        parseInt(
          args[1]
        );


      if (
        isNaN(page) ||
        page < 1
      ) {

        page = 1;
      }


      const total =
        list.length;


      const totalPages =
        Math.ceil(
          total / perPage
        );


      if (
        page > totalPages
      ) {

        return message.reply(
          box(
            "📋 𝐖𝐇𝐈𝐓𝐄𝐋𝐈𝐒𝐓",

            `⚠️ 𝐏𝐚𝐠𝐞 ${page} 𝐝𝐨𝐞𝐬 𝐧𝐨𝐭 𝐞𝐱𝐢𝐬𝐭.\n\n` +

            `├‣ 𝐓𝐨𝐭𝐚𝐥 𝐔𝐬𝐞𝐫𝐬: ${total}\n` +

            `├‣ 𝐓𝐨𝐭𝐚𝐥 𝐏𝐚𝐠𝐞𝐬: ${totalPages}\n` +

            `╰──────────────────‣`
          )
        );
      }


      const start =
        (page - 1) *
        perPage;


      const currentUsers =
        list.slice(
          start,
          start + perPage
        );


      const users =
        await Promise.all(

          currentUsers.map(

            async uid => ({

              uid,

              name:
                await getUserName(
                  usersData,
                  uid
                )

            })

          )

        );


      let output =
        `╭──✦ 𝐖𝐇𝐈𝐓𝐄𝐋𝐈𝐒𝐓\n`;


      users.forEach(
        (user, index) => {

          output +=

            `├‣ 𝐍𝐀𝐌𝐄: ${user.name}\n` +

            `├‣ 𝐔𝐈𝐃: ${user.uid}\n` +

            `├‣ 𝐄𝐗𝐏𝐈𝐑𝐘: ${
              expiry[user.uid]
                ? formatExpiry(
                    expiry[user.uid]
                  )
                : "𝐏𝐄𝐑𝐌𝐀𝐍𝐄𝐍𝐓"
            }\n`;


          if (
            index !==
            users.length - 1
          ) {

            output +=
              `├‣\n`;
          }
        }
      );


      output +=

        `├‣ 𝐓𝐎𝐓𝐀𝐋: ${total}\n` +

        `├‣ 𝐏𝐀𝐆𝐄: ${page}/${totalPages}\n` +

        `╰──────────────────‣`;


      return message.reply(
        output
      );
    }


    /*
    =========================================
    MODE
    =========================================
    */

    if (
      ["mode", "m", "-m"].includes(action)
    ) {


      const sub =
        (args[1] || "")
          .toLowerCase();


      /*
      Notification
      */

      if (
        sub === "noti"
      ) {

        const value =
          (args[2] || "")
            .toLowerCase();


        if (
          !["on", "off"].includes(value)
        ) {

          return message.reply(
            box(
              "🔔 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍",

              "⚠️ 𝐔𝐬𝐚𝐠𝐞: 𝐰𝐥 𝐦𝐨𝐝𝐞 𝐧𝐨𝐭𝐢 𝐨𝐧/𝐨𝐟𝐟"
            )
          );
        }


        const enabled =
          value === "on";


        config.hideNotiMessage
          .whiteListMode =
          !enabled;


        await saveConfig();


        return message.reply(
          box(
            "🔔 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍",

            enabled

              ? "✅ 𝐖𝐡𝐢𝐭𝐞𝐥𝐢𝐬𝐭 𝐧𝐨𝐭𝐢𝐟𝐢𝐜𝐚𝐭𝐢𝐨𝐧 𝐭𝐮𝐫𝐧𝐞𝐝 𝐎𝐍."

              : "❌ 𝐖𝐡𝐢𝐭𝐞𝐥𝐢𝐬𝐭 𝐧𝐨𝐭𝐢𝐟𝐢𝐜𝐚𝐭𝐢𝐨𝐧 𝐭𝐮𝐫𝐧𝐞𝐝 𝐎𝐅𝐅."
          )
        );
      }


      /*
      Whitelist mode
      */

      if (
        !["on", "off"].includes(sub)
      ) {

        return message.reply(
          box(
            " 𝐖𝐇𝐈𝐓𝐄𝐋𝐈𝐒𝐓 𝐌𝐎𝐃𝐄",

            "⚠️ 𝐔𝐬𝐚𝐠𝐞: 𝐰𝐥 𝐦𝐨𝐝𝐞 𝐨𝐧/𝐨𝐟𝐟"
          )
        );
      }


      const enabled =
        sub === "on";


      config.whiteListMode.enable =
        enabled;


      await saveConfig();


      return message.reply(
        box(
          " 𝐖𝐇𝐈𝐓𝐄𝐋𝐈𝐒𝐓 𝐌𝐎𝐃𝐄",

          enabled

            ? "✅ 𝐎𝐧𝐥𝐲 𝐰𝐡𝐢𝐭𝐞𝐥𝐢𝐬𝐭𝐞𝐝 𝐮𝐬𝐞𝐫𝐬 𝐜𝐚𝐧 𝐧𝐨𝐰 𝐮𝐬𝐞 𝐭𝐡𝐞 𝐛𝐨𝐭."

            : "❎ 𝐖𝐡𝐢𝐭𝐞𝐥𝐢𝐬𝐭 𝐨𝐧𝐥𝐲 𝐦𝐨𝐝𝐞 𝐡𝐚𝐬 𝐛𝐞𝐞𝐧 𝐭𝐮𝐫𝐧𝐞𝐝 𝐎𝐅𝐅."
        )
      );
    }


    /*
    =========================================
    HELP
    =========================================
    */

    return message.reply(

      `╭────────────────────❍\n` +

      `│        ⚡ 𝐖𝐇𝐈𝐓𝐄𝐋𝐈𝐒𝐓 𝐌𝐀𝐍𝐀𝐆𝐄𝐑\n` +

      `╰────────────────────❍\n\n` +

      `╭─❍ 𝐀𝐃𝐃\n` +

      `│  𝐰𝐥 𝐚𝐝𝐝 <𝐔𝐈𝐃>\n` +

      `│  𝐰𝐥 𝐚𝐝𝐝 <𝐔𝐈𝐃> 𝟏\n` +

      `│  𝐰𝐥 𝐚𝐝𝐝 <𝐔𝐈𝐃> 𝟏𝐡\n` +

      `│  𝐰𝐥 𝐚𝐝𝐝 <𝐔𝐈𝐃> 𝟑𝟎𝐦\n` +

      `│  𝐰𝐥 𝐚𝐝𝐝 <𝐔𝐈𝐃> 𝟐𝐝\n` +

      `│  𝐰𝐥 𝐚𝐝𝐝 @𝐮𝐬𝐞𝐫 𝟏𝐡\n` +

      `│  𝐰𝐥 𝐚𝐝𝐝 @𝐮𝐬𝐞𝐫\n` +

      `╰──────────────\n\n` +

      `╭─❍ 𝐑𝐄𝐌𝐎𝐕𝐄\n` +

      `│  𝐰𝐥 𝐫𝐦 <𝐔𝐈𝐃>\n` +

      `│  𝐰𝐥 𝐫𝐦 @𝐮𝐬𝐞𝐫\n` +

      `╰──────────────\n\n` +

      `╭─❍ 𝐋𝐈𝐒𝐓\n` +

      `│  𝐰𝐥 𝐥𝐢𝐬𝐭\n` +

      `│  𝐰𝐥 𝐥𝐢𝐬𝐭 𝟐\n` +

      `╰──────────────\n\n` +

      `╭─❍ 𝐌𝐎𝐃𝐄\n` +

      `│  𝐰𝐥 𝐦𝐨𝐝𝐞 𝐨𝐧\n` +

      `│  𝐰𝐥 𝐦𝐨𝐝𝐞 𝐨𝐟𝐟\n` +

      `│  𝐰𝐥 𝐦𝐨𝐝𝐞 𝐧𝐨𝐭𝐢 𝐨𝐧\n` +

      `│  𝐰𝐥 𝐦𝐨𝐝𝐞 𝐧𝐨𝐭𝐢 𝐨𝐟𝐟\n` +

      `╰──────────────`

    );
  }
};