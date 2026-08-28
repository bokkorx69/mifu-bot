const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "fluxpro",
    version: "1.0",
    author: "Bokkor x69",
    countDown: 15,
    role: 0,
    description: "Flux Pro Image Generator",
    category: "image gen",
    guide: "{pn} <prompt> --ratio <1:1|9:16|16:9>"
  },

  onStart: async function ({ api, event, args, message }) {
    const input = args.join(" ");

    if (!input)
      return message.reply(" | 𝑷𝒍𝒆𝒂𝒔𝒆 𝑬𝒏𝒕𝒆𝒓 𝑨 𝑷𝒓𝒐𝒎𝒑𝒕.");

    const [prompt, ratio = "1:1"] = input.includes("--ratio")
      ? input.split("--ratio").map(i => i.trim())
      : [input, "1:1"];

    const dir = path.join(__dirname, "cache");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `flux_${Date.now()}.png`);

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const res = await axios({
        url: `https://mahmud-all-apis.onrender.com/api/fluxpro?prompt=${encodeURIComponent(prompt)}&ratio=${encodeURIComponent(ratio)}`,
        method: "GET",
        responseType: "arraybuffer",
        timeout: 120000
      });

      fs.writeFileSync(filePath, Buffer.from(res.data));

      await message.reply({
        body: "  𝑯𝒆𝒓𝒆'𝒔 𝒀𝒐𝒖𝒓 𝑭𝒍𝒖𝒙 𝑷𝒓𝒐 𝑰𝒎𝒂𝒈𝒆 𝑩𝒂𝒃𝒚 ",
        attachment: fs.createReadStream(filePath)
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply(`❀ | 𝑬𝒓𝒓𝒐𝒓: ${err.message}`);
    } finally {
      if (fs.existsSync(filePath))
        fs.unlinkSync(filePath);
    }
  }
};