"use strict";

const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");

const API =
  "https://core.apis-noob-x69.rf.gd/api/alldl?url=";

const STREAM_API =
  "https://core.apis-noob-x69.rf.gd/api/alldl/stream?url=";

const TIKTOK_STREAM_API =
  "https://core.apis-noob-x69.rf.gd/api/alldl2?url=";


/* =========================================================
   PLATFORM
========================================================= */

function getPlatform(url) {
  const u = url.toLowerCase();

  if (
    u.includes("youtube.com") ||
    u.includes("youtu.be")
  )
    return "𝐘𝐨𝐮𝐓𝐮𝐛𝐞";

  if (
    u.includes("facebook.com") ||
    u.includes("fb.watch")
  )
    return "𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤";

  if (
    u.includes("instagram.com") ||
    u.includes("instagr.am")
  )
    return "𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦";

  if (u.includes("tiktok.com"))
    return "𝐓𝐢𝐤𝐓𝐨𝐤";

  if (u.includes("spotify.com"))
    return "𝐒𝐩𝐨𝐭𝐢𝐟𝐲";

  if (
    u.includes("twitter.com") ||
    u.includes("x.com")
  )
    return "𝐓𝐰𝐢𝐭𝐭𝐞𝐫";

  if (
    u.includes("pinterest.com") ||
    u.includes("pin.it")
  )
    return "𝐏𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭";

  if (u.includes("terabox.com"))
    return "𝐓𝐞𝐫𝐚𝐁𝐨𝐱";

  if (u.includes("soundcloud.com"))
    return "𝐒𝐨𝐮𝐧𝐝𝐂𝐥𝐨𝐮𝐝";

  if (u.includes("capcut.com"))
    return "𝐂𝐚𝐩𝐂𝐮𝐭";

  if (
    u.includes("likee.com") ||
    u.includes("likee.video")
  )
    return "𝐋𝐢𝐤𝐞𝐞";

  return "𝐌𝐞𝐝𝐢𝐚";
}


/* =========================================================
   TIKTOK CHECK
========================================================= */

function isTikTok(url) {
  const u = String(url || "").toLowerCase();

  return (
    u.includes("tiktok.com") ||
    u.includes("vm.tiktok.com") ||
    u.includes("vt.tiktok.com")
  );
}


/* =========================================================
   DOWNLOAD STREAM TO TEMP FILE
========================================================= */

async function saveStreamToFile(
  stream,
  tempFile
) {
  await new Promise((resolve, reject) => {
    const writer =
      fs.createWriteStream(tempFile);

    let finished = false;

    const cleanupListeners = () => {
      stream.removeListener(
        "error",
        onStreamError
      );

      writer.removeListener(
        "error",
        onWriterError
      );

      writer.removeListener(
        "finish",
        onFinish
      );
    };

    const onStreamError = (error) => {
      if (finished) return;

      finished = true;

      cleanupListeners();

      try {
        writer.destroy();
      } catch (_) {}

      reject(error);
    };

    const onWriterError = (error) => {
      if (finished) return;

      finished = true;

      cleanupListeners();

      try {
        stream.destroy();
      } catch (_) {}

      reject(error);
    };

    const onFinish = () => {
      if (finished) return;

      finished = true;

      cleanupListeners();

      resolve();
    };

    stream.on(
      "error",
      onStreamError
    );

    writer.on(
      "error",
      onWriterError
    );

    writer.on(
      "finish",
      onFinish
    );

    stream.pipe(writer);
  });
}


/* =========================================================
   REMOVE TEMP FILE
========================================================= */

function removeTempFile(file) {
  if (!file) return;

  try {
    if (fs.existsSync(file)) {
      fs.unlink(
        file,
        () => {}
      );
    }
  } catch (_) {}
}


/* =========================================================
   CONFIG
========================================================= */

module.exports = {

  config: {

    name: "alldl",

    aliases: [
      "dl",
      "download"
    ],

    version: "4.3.0",

    author: "Bokkor x69",

    countDown: 2,

    role: 0,

    shortDescription: {
      en:
        "𝐅𝐚𝐬𝐭 𝐚𝐥𝐥 𝐦𝐞𝐝𝐢𝐚 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫"
    },

    category: "𝐌𝐄𝐃𝐈𝐀",

    guide: {
      en:
        "{pn} [video_link]"
    }

  },


  /* =======================================================
     START
  ======================================================= */

  onStart: async function ({
    api,
    args,
    event,
    message
  }) {

    const url =
      event.messageReply?.body?.trim() ||
      args.join(" ").trim();


    /* =====================================================
       URL CHECK
    ===================================================== */

    if (!url) {

      return message.reply(
        "❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐯𝐢𝐝𝐞𝐨 𝐥𝐢𝐧𝐤."
      );

    }


    if (
      !/^https?:\/\/.+/i.test(url)
    ) {

      return message.reply(
        "❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐔𝐑𝐋."
      );

    }


    const platform =
      getPlatform(url);

    const tiktok =
      isTikTok(url);


    let tempFile = null;


    try {

      /* =================================================
         REACTION
      ================================================= */

      api.setMessageReaction(
        "⏳",
        event.messageID,
        () => {},
        true
      );


      /* =================================================
         TEMP FILE
      ================================================= */

      tempFile = path.join(
        os.tmpdir(),
        `bokkor_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}.mp4`
      );


      /* =================================================
         TIKTOK
         
         /api/alldl2

         IMPORTANT:
         alldl2 DIRECT VIDEO STREAM.
         NO JSON.
      ================================================= */

      if (tiktok) {

        const streamURL =
          TIKTOK_STREAM_API +
          encodeURIComponent(url);


        const videoStream =
          await axios.get(
            streamURL,
            {
              responseType:
                "stream",

              timeout: 0,

              maxRedirects: 10,

              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",

                "Accept":
                  "video/mp4,video/*,*/*"
              }
            }
          );


        if (
          !videoStream.data
        ) {

          throw new Error(
            "Empty TikTok video stream"
          );

        }


        /* =============================================
           SAVE DIRECT STREAM
        ============================================= */

        await saveStreamToFile(
          videoStream.data,
          tempFile
        );

      }


      /* =================================================
         OTHER PLATFORMS

         /api/alldl

         JSON -> VIDEO URL
      ================================================= */

      else {

        /* =============================================
           STEP 1: GET VIDEO URL
        ============================================= */

        const response =
          await axios.get(
            API +
              encodeURIComponent(url),
            {
              timeout: 120000,

              maxRedirects: 5,

              headers: {
                "User-Agent":
                  "Mozilla/5.0",

                "Accept":
                  "application/json, text/plain, */*"
              }
            }
          );


        const videoURL =
          response.data?.response;


        if (!videoURL) {

          throw new Error(
            response.data?.error ||
            "Video URL not found"
          );

        }


        /* =============================================
           STEP 2: STREAM API
        ============================================= */

        const streamURL =
          STREAM_API +
          encodeURIComponent(
            videoURL
          );


        const videoStream =
          await axios.get(
            streamURL,
            {
              responseType:
                "stream",

              timeout: 0,

              maxRedirects: 10,

              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",

                "Accept":
                  "video/mp4,video/*,*/*"
              }
            }
          );


        if (
          !videoStream.data
        ) {

          throw new Error(
            "Empty video stream"
          );

        }


        /* =============================================
           SAVE STREAM
        ============================================= */

        await saveStreamToFile(
          videoStream.data,
          tempFile
        );

      }


      /* =================================================
         FILE CHECK
      ================================================= */

      if (
        !fs.existsSync(
          tempFile
        )
      ) {

        throw new Error(
          "Video file was not created"
        );

      }


      const fileStats =
        fs.statSync(
          tempFile
        );


      if (
        fileStats.size <= 0
      ) {

        throw new Error(
          "Downloaded video file is empty"
        );

      }


      /* =================================================
         SUCCESS REACTION
      ================================================= */

      api.setMessageReaction(
        "✅",
        event.messageID,
        () => {},
        true
      );


      /* =================================================
         SEND MP4
      ================================================= */

      return api.sendMessage(
        {

          body:
            "𝐇𝐞𝐫𝐞 𝐘𝐨𝐮𝐫 𝐕𝐢𝐝𝐞𝐨 𝐁𝐚𝐛𝐲 >𝟑 🎀\n\n" +
            `𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦: ${platform}`,

          attachment:
            fs.createReadStream(
              tempFile
            )

        },

        event.threadID,

        () => {

          /* =========================================
             AUTO DELETE TEMP/CACHE FILE
          ========================================= */

          removeTempFile(
            tempFile
          );

          tempFile = null;

        },

        event.messageID
      );

    }


    /* =====================================================
       ERROR
    ===================================================== */

    catch (error) {

      /* ===============================================
         NO CONSOLE OUTPUT
      =============================================== */

      if (
        tempFile
      ) {

        removeTempFile(
          tempFile
        );

        tempFile = null;

      }


      /* ===============================================
         ERROR REACTION
      =============================================== */

      api.setMessageReaction(
        "❌",
        event.messageID,
        () => {},
        true
      );


      return message.reply(
        "❌ 𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐭𝐡𝐢𝐬 𝐯𝐢𝐝𝐞𝐨."
      );

    }

  }

};