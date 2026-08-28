const axios = require('axios');

module.exports = {
  config: {
    name: 'imgbb',
    aliases: ['ib', 'upload'],
    prefix: false,
    author: 'Bokkor x69',
    countDown: 5,
    role: 0,
    description: 'Upload media to ImgBB directly via API',
    category: 'tools'
  },

  onStart: async function ({ message, event, api }) {
    if (
      event.type !== 'message_reply' ||
      !event.messageReply?.attachments?.length
    ) {
      return message.reply('⚠️ Please reply to an image.');
    }

    try {
      if (api && typeof api.setMessageReaction === 'function') {
        api.setMessageReaction("⏳", event.messageID, () => {}, true);
      }

      const mediaUrl = event.messageReply.attachments[0].url;
      const apiEndpoint = `https://azadx69x.is-a.dev/api/imgbb?url=${encodeURIComponent(mediaUrl)}`;

      const res = await axios.get(apiEndpoint, { timeout: 30000 });
      const resData = res.data;

      let fileLink = '';
      if (resData?.success && resData?.result?.url) {
        fileLink = resData.result.url;
      } else if (resData?.url) {
        fileLink = resData.url;
      } else if (typeof resData === 'string' && resData.startsWith('http')) {
        fileLink = resData.trim();
      }

      if (!fileLink || !fileLink.startsWith('http')) {
        if (api && typeof api.setMessageReaction === 'function') {
          api.setMessageReaction("❌", event.messageID, () => {}, true);
        }
        return message.reply(`❌ Upload failed. Raw API Response: ${JSON.stringify(resData)}`);
      }

      const replyText = `
━━━━━━━━━━━━━ IMGBB UPLOADER ━━━━━━━━━

❍ Display URL: \n\n ${fileLink}

`;

      let attachmentStream = null;
      if (fileLink && global.utils?.getStreamFromURL) {
        try {
          attachmentStream = await global.utils.getStreamFromURL(fileLink);
        } catch (err) {
          console.error("Image preview stream loading failed:", err.message);
        }
      }

      await message.reply({
        body: replyText,
        ...(attachmentStream && { attachment: attachmentStream })
      });

      if (api && typeof api.setMessageReaction === 'function') {
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      }

    } catch (err) {
      console.error(err);
      if (api && typeof api.setMessageReaction === 'function') {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
      return message.reply(`❌ Error while uploading image: ${err.message}`);
    }
  }
};