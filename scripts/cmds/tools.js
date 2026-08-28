const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const API_ENDPOINT = "https://api.noobx.gt.tc/api/tools";
const TYPES = [
    "upscale", "undress", "removebg", "changebg", 
    "blurbg", "edit", "draw", "art", 
    "upscale_2", "logo", "undresspro", "gta", "expend", "naked"
];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function toFont(text) {
    const map = { A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",I:"𝐈",J:"𝐉",K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",Y:"𝐘",Z:"𝐙", a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",f:"𝐟",g:"𝐠",h:"𝐡",i:"𝐢",j:"𝐣",k:"𝐤",l:"𝐥",m:"𝐦", n:"𝐧",o:"𝐨",p:"𝐩",q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",u:"𝐮",v:"𝐯",w:"𝐰",x:"𝐱",y:"𝐲",z:"𝐳", "0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒", "5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗", " ":" ",".":".",",":",","!":"!","?":"?",":":":","-":"-","_":"_","/":"/","'":"'","(":"(",")":")","\n":"\n" };
    return String(text).split("").map(char => map[char] || char).join("");
}

function parseArgs(args) {
    const typeIndex = args.indexOf("--type");
    let type = "upscale";
    let promptArgs = [...args];

    if (typeIndex !== -1 && args[typeIndex + 1]) {
        const requestedType = args[typeIndex + 1].toLowerCase();
        if (TYPES.includes(requestedType)) {
            type = requestedType;
        }
        promptArgs.splice(typeIndex, 2);
    }
    return { prompt: promptArgs.join(" ").trim(), type };
}

async function downloadImage(url, cacheDir, retries = 3) {
    const filePath = path.join(cacheDir, `bokkor_x69_${Date.now()}.jpg`);
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios.get(url, { responseType: "arraybuffer", timeout: 60000 });
            if (response.status === 200 && response.data?.length > 5000) {
                await fs.writeFile(filePath, response.data);
                return filePath;
            }
        } catch {
            if (attempt < retries) await sleep(1500 * attempt);
        }
    }
    throw new Error("Failed to download processed image.");
}

module.exports = {
    config: {
        name: "tools",
        version: "1.0.0",
        author: "Bokkor x69",
        countDown: 5,
        role: 0,
        description: { en: toFont("Image processing tools like upscale, undress, removebg etc.") },
        category: "AI",
        guide: { en: toFont("{pn} [reply to image] --type <type> [prompt]\n{pn} types") }
    },
    onStart: async function ({ message, args, event }) {
        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);

        if (args[0]?.toLowerCase() === "list" || args[0]?.toLowerCase() === "types") {
            return message.reply(`${toFont("AVAILABLE TYPES:")}\n${TYPES.map((t, i) => `${i + 1}. ${toFont(t)}`).join("\n")}\n\n${toFont("Default type: upscale")}`);
        }

        const imageUrl = event.messageReply?.attachments?.[0]?.url || event.attachments?.[0]?.url;
        if (!imageUrl) {
            return message.reply(toFont("Please reply to an image or attach an image with the command!"));
        }

        const { prompt, type } = parseArgs(args);
        const messageID = event.messageID;

        const loading = await message.reply(toFont(`⏳ PROCESSING WITH TYPE: ${type}...`));
        message.reaction("⏳", messageID);

        let imagePath = "";
        try {
            const res = await axios.get(API_ENDPOINT, {
                params: {
                    url: imageUrl,
                    type: type,
                    prompt: prompt
                },
                timeout: 180000
            });

            if (res.data?.status !== "success" || !res.data.response) {
                throw new Error(typeof res.data?.response === "string" ? res.data.response : "Tool processing failed.");
            }

            imagePath = await downloadImage(res.data.response, cacheDir);

            if (loading) await message.unsend(loading.messageID);

            await message.reply({
                body: toFont(`HERE YOUR ${type.toUpperCase()} IMAGE BABY`),
                attachment: fs.createReadStream(imagePath)
            });

            message.reaction("✅", messageID);
        } catch (error) {
            if (loading) try { await message.unsend(loading.messageID); } catch {}
            message.reaction("❌", messageID);
            return message.reply(toFont("Error: " + (error.message || "Unknown error")));
        } finally {
            setTimeout(async () => {
                try {
                    if (imagePath && await fs.pathExists(imagePath)) {
                        await fs.unlink(imagePath);
                    }
                } catch {}
            }, 30000);
        }
    }
};