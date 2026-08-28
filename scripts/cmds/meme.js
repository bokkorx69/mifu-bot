const axios = require("axios");

module.exports = {

  config: {

    name: "meme",

    aliases: [],

    version: "1.5",

    author: "Bokkor",

    countDown: 3,

    role: 0,

    shortDescription: {
      en: "Add or get random meme"
    },

    category: "fun",

    guide: {
      en: "!meme - random meme\n!meme add (reply imgs or URLs) - add meme(s)\n!meme list - show total memes"
    }

  },

  onStart: async function({ event, message, args }) {

    // Main domain API
    const baseUrl =
      "https://core.apis-noob-x69.rf.gd/api/meme";


    // ----------------------------------------------------
    // ১. মিম যোগ করার কমান্ড (!meme add)
    // ----------------------------------------------------

    if (args[0]?.toLowerCase() === "add") {

      let urlsToAdd = [];


      // রিপ্লাই করা মেসেজ থেকে ইমেজের লিংক সংগ্রহ
      if (
        event.messageReply &&
        event.messageReply.attachments &&
        event.messageReply.attachments.length
      ) {

        for (
          const att of event.messageReply.attachments
        ) {

          if (
            [
              "photo",
              "image",
              "animated_image"
            ].includes(att.type)
          ) {

            if (att.url) {
              urlsToAdd.push(att.url);
            }

          }

        }

      }


      // সরাসরি command-এ দেওয়া URL সংগ্রহ
      if (args.length > 1) {

        for (
          let i = 1;
          i < args.length;
          i++
        ) {

          if (
            /^https?:\/\//i.test(args[i])
          ) {

            urlsToAdd.push(args[i]);

          }

        }

      }


      // কোনো URL পাওয়া যায়নি
      if (urlsToAdd.length === 0) {

        return message.reply(
          "⚠️ Please reply to images or provide valid URLs to add memes."
        );

      }


      // Duplicate URL remove
      urlsToAdd = [
        ...new Set(urlsToAdd)
      ];


      try {

        // একসাথে সব URL POST করা
        const res = await axios.post(
          `${baseUrl}/add`,
          {
            urls: urlsToAdd
          },
          {
            timeout: 120000,
            headers: {
              "Content-Type":
                "application/json"
            }
          }
        );


        const {
          addedCount = 0,
          duplicateCount = 0,
          failedCount = 0
        } = res.data || {};


        return message.reply(

          `✅ Added ${addedCount} meme(s) successfully!\n` +

          `⚠️ Duplicate: ${duplicateCount}\n` +

          `❌ Failed: ${failedCount}`

        );


      } catch (err) {

        console.error(
          "❌ Meme Add API Error:",
          err.response?.data ||
          err.message
        );


        const errorMsg =
          err.response?.data?.error ||
          err.response?.data?.details ||
          "Server error! Could not add memes.";


        return message.reply(
          `❌ ${errorMsg}`
        );

      }


    // ----------------------------------------------------
    // ২. মোট মিম সংখ্যা দেখার কমান্ড (!meme list)
    // ----------------------------------------------------

    } else if (
      args[0]?.toLowerCase() === "list"
    ) {

      try {

        const res = await axios.get(
          `${baseUrl}/list`,
          {
            timeout: 30000
          }
        );


        const total =
          res.data?.total || 0;


        return message.reply(
          `📊 Total memes available: ${total}`
        );


      } catch (err) {

        console.error(
          "❌ Meme List API Error:",
          err.response?.data ||
          err.message
        );


        return message.reply(
          "❌ Couldn't fetch meme list."
        );

      }


    // ----------------------------------------------------
    // ৩. র‍্যান্ডম মিম পাওয়ার মূল কমান্ড (!meme)
    // ----------------------------------------------------

    } else {

      try {

        const res = await axios.get(
          baseUrl,
          {
            timeout: 30000
          }
        );


        const memeUrl =
          res.data?.meme?.url;


        if (!memeUrl) {

          return message.reply(
            "❌ No memes found in the database!"
          );

        }


        // Google Drive থেকে image stream
        const imageStream =
          await axios.get(
            memeUrl,
            {
              responseType: "stream",
              timeout: 30000,
              headers: {
                "User-Agent":
                  "Mozilla/5.0"
              }
            }
          );


        return message.reply({

          body:
            "🤣 Here's a random meme for you!",

          attachment:
            imageStream.data

        });


      } catch (err) {

        console.error(
          "❌ Meme Fetch Error:",
          err.response?.data ||
          err.message
        );


        return message.reply(
          "❌ Couldn't load meme right now."
        );

      }

    }

  }

};