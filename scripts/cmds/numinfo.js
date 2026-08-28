// ──────────────────────────────────────────────────────────────────────
//  Mobile Number Info Bot Command – English‑Only Output
//  (Fetches details and streams profile image)
// ──────────────────────────────────────────────────────────────────────

const axios = require('axios');

module.exports = {
  config: {
    name: 'numinfo',
    aliases: ['number', 'phone'],
    prefix: false,                 // set your bot prefix here
    author: 'Bokkor x69',
    countDown: 3,
    role: 0,
    description: 'Show mobile number information with profile image',
    category: 'Tools'
  },

  onStart: async function ({ message, args }) {
    /* 1. Validate input */
    if (args.length < 1) {
      return message.reply('⚠️ Usage: numinfo <phone_number>\nExample: numinfo 8801337****');
    }

    const number = args[0];
    if (!/^\d{10,15}$/.test(number)) {
      return message.reply('⚠️ Invalid number format. Please provide a valid phone number with country code.');
    }

    /* 2. Fetch data */
    let waiting;
    try {
      waiting = await message.reply('💫 Gathering data, please wait…');

      // 👉 API URL for number info
      const url = `https://mahmud-all-apis.onrender.com/api/numinfo?number=${number}`;
      const res = await axios.get(url);
      
      const data = res.data;
      if (!data || !data.success) {
        if (waiting) message.unsend(waiting.messageID);
        return message.reply('❌ Information not found or API error.');
      }

      /* 3. Stream the image */
      let imageStream = null;
      try {
        const imgRes = await axios.get(data.image, { responseType: 'stream' });
        imageStream = imgRes.data;
      } catch (imgErr) {
        imageStream = null; // Fallback if image link fails
      }

      if (waiting) message.unsend(waiting.messageID); // delete the waiting message

      /* 4. Build the reply text */
      const replyText = `
━━━━━━━━━━━━━ NUMBER INFO ━━━━━━━━━
📞 Number: ${data.number}
👤 Name: ${data.name}
🔗 Facebook Profile: ${data.facebook_id}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ DATA RETRIEVED SUCCESSFULLY ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Powered by
━━━━━━━━━━━━ 𝐁ᴏᴋᴋᴏʀ x69 ━━━━━━━━━
`;

      const payload = {
        body: replyText.trim()
      };

      if (imageStream) {
        payload.attachment = imageStream;
      }

      return message.reply(payload);

    } catch (err) {
      console.error(err);
      if (waiting) {
        try { message.unsend(waiting.messageID); } catch (e) {}
      }
      return message.reply('❌ Error while retrieving data, try again later.');
    }
  }
};