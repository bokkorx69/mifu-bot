const axios = require("axios");

module.exports = {
  config: {
    name: "drive",
    aliases: ["gdrive", "gdv"],
    version: "2.1",
    author: "bokkor x69",
    countDown: 10,
    role: 0,
    description: "Upload media to Google Drive",
    category: "tools",
    guide: "{pn} (reply to image/video/file)"
  },

  onStart: async function ({ api, event, message }) {
    if (
      event.type !== "message_reply" ||
      !event.messageReply?.attachments?.length
    ) {
      return message.reply(
        " | 𝑹𝒆𝒑𝒍𝒚 𝒕𝒐 𝒂𝒏 𝑰𝒎𝒂𝒈𝒆, 𝑽𝒊𝒅𝒆𝒐 𝒐𝒓 𝑭𝒊𝒍𝒆."
      );
    }

    try {
      api.setMessageReaction(
        "⏳",
        event.messageID,
        () => {},
        true
      );

      const attachment =
        event.messageReply.attachments[0];

      const mediaUrl = attachment.url;

      if (!mediaUrl) {
        throw new Error("Attachment URL not found.");
      }

      let ext = "bin";

      if (attachment.type === "photo") {
        ext = "jpg";
      } else if (attachment.type === "video") {
        ext = "mp4";
      } else if (attachment.type === "audio") {
        ext = "mp3";
      }

      const fileName =
        `bokkor_${Date.now()}.${ext}`;

      const { data } = await axios.post(
        "https://core.apis-noob-x69.rf.gd/api/drive/upload-url",
        {
          url: mediaUrl,
          fileName
        },
        {
          headers: {
            "x-api-key": "bokkor_x_69",
            "Content-Type": "application/json"
          },
          timeout: 150000
        }
      );

      if (!data?.status || !data?.data) {
        throw new Error(
          data?.details ||
          data?.error ||
          "Drive upload failed."
        );
      }

      const fileInfo = data.data;

      await message.reply(
        `𝑯𝒆𝒓𝒆'𝒔 𝒀𝒐𝒖𝒓 𝑮𝒐𝒐𝒈𝒍𝒆 𝑫𝒓𝒊𝒗𝒆 𝑳𝒊𝒏𝒌 𝑩𝒂𝒃𝒚\n\n` +
        `𝑳𝒊𝒏𝒌: ${fileInfo.directStreamUrl}`
      );

      api.setMessageReaction(
        "✅",
        event.messageID,
        () => {},
        true
      );

    } catch (err) {
      api.setMessageReaction(
        "❌",
        event.messageID,
        () => {},
        true
      );

      const errorMsg =
        err.response?.data?.details ||
        err.response?.data?.error ||
        err.message ||
        "Unknown error";

      return message.reply(
        `❌ ${errorMsg}`
      );
    }
  }
};