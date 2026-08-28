const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const mongoose = require("mongoose");

const { Schema, model } = mongoose;

/* =========================================================
   VIP DATABASE
========================================================= */

const vipSchema = new Schema({
  uid: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ""
  },
  expiry: {
    type: Number,
    default: 0
  }
});

const VIP =
  mongoose.models.VIP ||
  model("VIP", vipSchema);


/* =========================================================
   BOKKOR X69 FONT
========================================================= */

function toQuizFont(text) {
  const map = {
    A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",I:"𝐈",J:"𝐉",K:"𝐊",L:"𝐋",M:"𝐌",
    N:"𝐍",O:"𝐎",P:"𝐏",Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",Y:"𝐘",Z:"𝐙",

    a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",f:"𝐟",g:"𝐠",h:"𝐡",i:"𝐢",j:"𝐣",k:"𝐤",l:"𝐥",m:"𝐦",
    n:"𝐧",o:"𝐨",p:"𝐩",q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",u:"𝐮",v:"𝐯",w:"𝐰",x:"𝐱",y:"𝐲",z:"𝐳",

    "0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒",
    "5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗",

    " ":" ",
    ".":".",
    ",":",",
    "!":"!",
    "?":"?",
    ":":":",
    "-":"-",
    "_":"_",
    "/":"/",
    "'":"' ",
    "\n":"\n",
    "(": "(",
    ")": ")"
  };

  return text
    .split("")
    .map(char => map[char] || char)
    .join("");
}


/* =========================================================
   CONFIG
========================================================= */

const API_ENDPOINT =
  "https://api.noobx.gt.tc/api/bingSearch";


/* =========================================================
   HELPERS
========================================================= */

const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms));


function safeDelete(file) {
  try {
    if (file && fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  } catch {}
}


/* =========================================================
   ERROR IMAGE
========================================================= */

function createErrorImage(prompt, index) {

  const canvas =
    createCanvas(1024, 1024);

  const ctx =
    canvas.getContext("2d");

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(
    0,
    0,
    1024,
    1024
  );

  ctx.fillStyle = "#ef4444";
  ctx.font =
    'bold 46px "Segoe UI", Arial';

  ctx.textAlign = "center";

  ctx.fillText(
    `Image 0${index} Unavailable`,
    512,
    450
  );

  ctx.fillStyle = "#94a3b8";

  ctx.font =
    '30px "Segoe UI", Arial';

  const shortPrompt =
    prompt.length > 40
      ? prompt.substring(0, 40) + "..."
      : prompt;

  ctx.fillText(
    `Search: "${shortPrompt}"`,
    512,
    530
  );

  ctx.fillStyle = "#38bdf8";

  ctx.font =
    'bold 30px "Segoe UI", Arial';

  ctx.fillText(
    "Bokkor x69",
    512,
    600
  );

  return canvas.toBuffer("image/png");
}


/* =========================================================
   DOWNLOAD IMAGE
========================================================= */

async function downloadSingleImage(
  url,
  tempDir,
  index,
  prompt,
  retries = 3
) {

  const tempFilePath =
    path.join(
      tempDir,
      `bokkor_x69_bing_${Date.now()}_${index}.png`
    );


  for (
    let attempt = 1;
    attempt <= retries;
    attempt++
  ) {

    try {

      const response =
        await axios.get(url, {
          responseType: "arraybuffer",
          timeout: 30000,
          maxContentLength: 20 * 1024 * 1024,
          maxBodyLength: 20 * 1024 * 1024,

          headers: {
            "User-Agent":
              "Mozilla/5.0"
          }
        });


      if (
        response.status === 200 &&
        response.data &&
        response.data.length > 3000
      ) {

        await fs.writeFile(
          tempFilePath,
          response.data
        );

        return tempFilePath;
      }

    } catch (error) {

      if (attempt < retries) {
        await sleep(
          1000 * attempt
        );
      }
    }
  }


  /* Emergency image */

  const errorBuffer =
    createErrorImage(
      prompt,
      index
    );

  await fs.writeFile(
    tempFilePath,
    errorBuffer
  );

  return tempFilePath;
}


/* =========================================================
   BING IMAGE API
========================================================= */

async function fetchBingImages(query) {

  try {

    const response =
      await axios.get(
        API_ENDPOINT,
        {
          params: {
            query,
            limit: 5
          },

          timeout: 30000,

          headers: {
            "User-Agent":
              "Mozilla/5.0"
          }
        }
      );


    const data =
      response.data;


    if (
      data?.status !== "success"
    ) {
      throw new Error(
        "Bing API returned unsuccessful response."
      );
    }


    const images =
      data?.response?.imgUrl;


    if (
      !Array.isArray(images) ||
      images.length === 0
    ) {
      throw new Error(
        "No images found for this search."
      );
    }


    return [
      ...new Set(
        images
          .filter(
            url =>
              typeof url === "string" &&
              /^https?:\/\//i.test(url)
          )
      )
    ].slice(0, 5);

  } catch (error) {

    if (
      error.response?.status
    ) {
      throw new Error(
        `Bing API error ${error.response.status}`
      );
    }

    throw new Error(
      error.message ||
      "Failed to fetch Bing images."
    );
  }
}


/* =========================================================
   GRID BUILDER
========================================================= */

async function createGridImage(
  imagePaths,
  outputPath
) {

  const validPaths =
    imagePaths.slice(0, 4);


  const images = [];


  for (
    const file of validPaths
  ) {

    try {

      const image =
        await loadImage(file);

      images.push(image);

    } catch {

      images.push(
        await loadImage(
          createErrorImage(
            "Image unavailable",
            images.length + 1
          )
        )
      );
    }
  }


  if (!images.length) {
    throw new Error(
      "Unable to create image grid."
    );
  }


  const imgWidth =
    1024;

  const imgHeight =
    1024;

  const padding =
    22;

  const footerHeight =
    100;


  const canvasWidth =
    (imgWidth * 2) +
    (padding * 3);

  const canvasHeight =
    (imgHeight * 2) +
    (padding * 3) +
    footerHeight;


  const canvas =
    createCanvas(
      canvasWidth,
      canvasHeight
    );

  const ctx =
    canvas.getContext("2d");


  /* Background */

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      canvasHeight
    );

  gradient.addColorStop(
    0,
    "#020617"
  );

  gradient.addColorStop(
    0.5,
    "#0f172a"
  );

  gradient.addColorStop(
    1,
    "#111827"
  );

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    0,
    canvasWidth,
    canvasHeight
  );


  const positions = [
    {
      x: padding,
      y: padding
    },

    {
      x: imgWidth + padding * 2,
      y: padding
    },

    {
      x: padding,
      y: imgHeight + padding * 2
    },

    {
      x: imgWidth + padding * 2,
      y: imgHeight + padding * 2
    }
  ];


  for (
    let i = 0;
    i < images.length &&
    i < 4;
    i++
  ) {

    const {
      x,
      y
    } = positions[i];


    /* Shadow */

    ctx.shadowColor =
      "rgba(0,0,0,0.65)";

    ctx.shadowBlur =
      20;


    ctx.drawImage(
      images[i],
      x,
      y,
      imgWidth,
      imgHeight
    );


    ctx.shadowBlur = 0;


    /* Number circle */

    ctx.fillStyle =
      "rgba(15,23,42,0.90)";

    ctx.beginPath();

    ctx.arc(
      x + 64,
      y + 64,
      45,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.strokeStyle =
      "rgba(255,255,255,0.25)";

    ctx.lineWidth = 3;

    ctx.stroke();


    ctx.fillStyle =
      "#38bdf8";

    ctx.font =
      'bold 34px "Segoe UI", Arial';

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";


    ctx.fillText(
      `0${i + 1}`,
      x + 64,
      y + 64
    );
  }


  /* Footer */

  ctx.fillStyle =
    "#94a3b8";

  ctx.font =
    'bold 32px "Segoe UI", Arial';

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "middle";


  ctx.fillText(
    "⚡ BING IMAGE SEARCH • BOKKOR X69",
    canvasWidth / 2,
    canvasHeight - 45
  );


  const buffer =
    canvas.toBuffer("image/png");


  await fs.writeFile(
    outputPath,
    buffer
  );


  return outputPath;
}


/* =========================================================
   COMMAND
========================================================= */

module.exports = {

  config: {

    name: "bing",

    aliases: [
      "bingimg",
      "bimg",
      "images"
    ],

    version: "1.0.0",

    author: "Bokkor x69",

    countDown: 5,

    role: 0,

    longDescription:
      toQuizFont(
        "Bing Image Search with VIP access"
      ),

    category:
      toQuizFont("VIP"),

    guide: {

      en:
        toQuizFont(
          "{pn} <search>\n" +
          "Example: {pn} cute cat\n" +
          "Reply 1-4 for single image\n" +
          "Reply all for all images"
        )
    }
  },


/* =========================================================
   ON START
========================================================= */

  onStart: async function ({
    message,
    args,
    event,
    commandName
  }) {

    const senderID =
      String(event.senderID);

    const prompt =
      args.join(" ").trim();


    if (!prompt) {

      return message.reply(
        toQuizFont(
          "⚠️ Please provide an image search query.\n\n" +
          "Example: bing cute cat"
        )
      );
    }


    /* Cache */

    const cacheDir =
      path.join(
        __dirname,
        "cache"
      );

    await fs.ensureDir(
      cacheDir
    );


    /* VIP */

    try {

      const activeVIP =
        await VIP.findOne({
          uid: senderID,
          expiry: {
            $gt: Date.now()
          }
        });


      if (!activeVIP) {

        return message.reply(
          toQuizFont(
            "❌ This command is only available for VIP users.\n\n" +
            "💎 Please get VIP access first."
          )
        );
      }

    } catch (error) {

      return message.reply(
        toQuizFont(
          "❌ Database error. Please try again later."
        )
      );
    }


    let tempPaths = [];

    let gridPath = "";


    try {

      message.reaction(
        "⏳",
        event.messageID
      );


      /* Search Bing */

      const imageUrls =
        await fetchBingImages(
          prompt
        );


      if (!imageUrls.length) {
        throw new Error(
          "No images were found."
        );
      }


      /* Download */

      for (
        let i = 0;
        i < imageUrls.length;
        i++
      ) {

        const file =
          await downloadSingleImage(
            imageUrls[i],
            cacheDir,
            i + 1,
            prompt,
            2
          );


        tempPaths.push(
          file
        );


        await sleep(400);
      }


      /* Grid */

      gridPath =
        path.join(
          cacheDir,
          `bokkor_x69_bing_${Date.now()}.png`
        );


      await createGridImage(
        tempPaths,
        gridPath
      );


      /* Reply */

      message.reply(
        {

          body:
            toQuizFont(
              `╭───────────────❍
│ 𝐁𝐈𝐍𝐆 𝐈𝐌𝐀𝐆𝐄 𝐒𝐄𝐀𝐑𝐂𝐇
╰───────────────❍

𝐑𝐄𝐏𝐋𝐘 𝐖𝐈𝐓𝐇:
➜ 𝟏 / 𝟐 / 𝟑 / 𝟒
➜ 𝐀𝐋𝐋

⚡ 𝐁𝐎𝐊𝐊𝐎𝐑 𝐗𝟔𝟗`
            ),

          attachment:
            fs.createReadStream(
              gridPath
            )
        },

        (err, info) => {

          if (!err && info) {

            global.GoatBot.onReply.set(
              info.messageID,
              {

                commandName,

                messageID:
                  info.messageID,

                author:
                  senderID,

                imageUrls,

                prompt
              }
            );
          }


          setTimeout(
            () => {

              safeDelete(
                gridPath
              );

              tempPaths.forEach(
                safeDelete
              );

            },
            30000
          );
        }
      );


      message.reaction(
        "✅",
        event.messageID
      );


    } catch (error) {

      message.reaction(
        "❌",
        event.messageID
      );


      safeDelete(
        gridPath
      );

      tempPaths.forEach(
        safeDelete
      );


      return message.reply(
        toQuizFont(
          `❌ 𝐁𝐈𝐍𝐆 𝐒𝐄𝐀𝐑𝐂𝐇 𝐅𝐀𝐈𝐋𝐄𝐃

𝐑𝐄𝐀𝐒𝐎𝐍: ${
            error.message ||
            "Unknown error"
          }

⚡ 𝐁𝐎𝐊𝐊𝐎𝐑 𝐗𝟔𝟗`
        )
      );
    }
  },


/* =========================================================
   ON REPLY
========================================================= */

  onReply: async function ({
    message,
    event,
    Reply
  }) {

    const {
      imageUrls,
      author,
      prompt
    } = Reply;


    if (
      String(event.senderID) !==
      String(author)
    ) {
      return;
    }


    const userReply =
      String(
        event.body || ""
      )
        .trim()
        .toLowerCase();


    const cacheDir =
      path.join(
        __dirname,
        "cache"
      );


    await fs.ensureDir(
      cacheDir
    );


    const createdFiles = [];


    try {

      message.reaction(
        "⏳",
        event.messageID
      );


      /* =========================================
         ALL IMAGES
      ========================================= */

      if (
        userReply === "all"
      ) {

        const downloaded = [];


        for (
          let i = 0;
          i < imageUrls.length;
          i++
        ) {

          const file =
            await downloadSingleImage(
              imageUrls[i],
              cacheDir,
              `all_${i + 1}`,
              prompt,
              2
            );


          downloaded.push(
            file
          );

          await sleep(350);
        }


        createdFiles.push(
          ...downloaded
        );


        await message.reply({

          body:
            toQuizFont(
              `╭───────────────❍
│ 𝐀𝐋𝐋 𝐈𝐌𝐀𝐆𝐄𝐒
╰───────────────❍

🖼️ 𝐈𝐌𝐀𝐆𝐄𝐒: ${downloaded.length}

⚡ 𝐁𝐎𝐊𝐊𝐎𝐑 𝐗𝟔𝟗`
            ),

          attachment:
            downloaded.map(
              file =>
                fs.createReadStream(
                  file
                )
            )
        });


      } else {

        /* =========================================
           SINGLE IMAGE
        ========================================= */

        const selection =
          Number(userReply);


        if (
          !Number.isInteger(
            selection
          ) ||
          selection < 1 ||
          selection > 4
        ) {

          return message.reply(
            toQuizFont(
              "⚠️ Reply with 𝟏, 𝟐, 𝟑, 𝟒 or 𝐚𝐥𝐥."
            )
          );
        }


        if (
          !imageUrls[
            selection - 1
          ]
        ) {

          return message.reply(
            toQuizFont(
              "❌ That image is not available."
            )
          );
        }


        const file =
          await downloadSingleImage(
            imageUrls[
              selection - 1
            ],
            cacheDir,
            `single_${selection}`,
            prompt,
            3
          );


        createdFiles.push(
          file
        );


        await message.reply({

          body:
            toQuizFont(
              `╭───────────────❍
│ 𝐈𝐌𝐀𝐆𝐄 𝟎${selection}
╰───────────────❍
`
            ),

          attachment:
            fs.createReadStream(
              file
            )
        });
      }


      message.reaction(
        "🎀",
        event.messageID
      );


      global.GoatBot.onReply.delete(
        Reply.messageID
      );


    } catch (error) {

      message.reaction(
        "❌",
        event.messageID
      );


      return message.reply(
        toQuizFont(
          `❌ 𝐈𝐌𝐀𝐆𝐄 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐅𝐀𝐈𝐋𝐄𝐃

𝐑𝐄𝐀𝐒𝐎𝐍: ${
            error.message ||
            "Unknown error"
          }

⚡ 𝐁𝐎𝐊𝐊𝐎𝐑 𝐗𝟔𝟗`
        )
      );


    } finally {

      setTimeout(
        () => {

          createdFiles.forEach(
            safeDelete
          );

        },
        30000
      );
    }
  }
};