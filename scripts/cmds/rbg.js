const axios = require("axios");
const dip = "https://rubish-apihub.onrender.com/rubish";
const apiKey = "rubish69";

module.exports.config = {
  name: "rbg",
  version: "1.1",
  role: 2,
  author: "Dipto",
  description: { en: "Remove Background from Image" },
  category: "Image Editing",
  guide: "{pn} [image URL] or reply to an image",
  countDown: 15,
};

module.exports.onStart = async ({ message, event, args, api }) => {
  try {
    let imageUrl;

    // যদি মেসেজে টেক্সট URL থাকে
    if (args[0]) {
      imageUrl = args[0];
    } 
    // যদি ইউজার কোনো ইমেজে রিপ্লাই দেয়
    else if (event.messageReply && event.messageReply.attachments.length > 0) {
      const attachment = event.messageReply.attachments[0];
      if (attachment.type === "photo") {
        imageUrl = attachment.url;
      }
    }

    if (!imageUrl) return message.reply("Please provide an image URL or reply to an image!");

    const waitingMsg = await message.reply("Removing background... ⏳");
    api.setMessageReaction("⌛", event.messageID, (err) => {}, true);

    // ইমেজ স্ট্রিম আকারে নেওয়া
    const response = await axios.get(
      `${dip}/removebg?imageUrl=${encodeURIComponent(imageUrl)}&apikey=${apiKey}`,
      { responseType: "stream" }
    );

    api.setMessageReaction("✅", event.messageID, (err) => {}, true);
    message.unsend(waitingMsg.messageID);

    await message.reply({
      body: `Here's your image with background removed!`, 
      attachment: response.data, // ইমেজ স্ট্রিম পাঠানো হচ্ছে
    });

  } catch (e) {
    console.log(e);
    message.reply("Error: " + e.message);
  }
};