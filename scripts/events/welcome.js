const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const moment = require("moment-timezone");
const fs = require("fs-extra");
const path = require("path");

// Rounded Rectangle Helper
function drawRoundRect(ctx, x, y, width, height, radius, fill = true, stroke = false) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// Auto-Font Adjuster
function getAdaptiveFont(ctx, text, maxWidth, startSize, fontStyle = "bold") {
  let size = startSize;
  ctx.font = `${fontStyle} ${size}px 'Sans-serif'`;
  while (ctx.measureText(text).width > maxWidth && size > 16) {
    size -= 2;
    ctx.font = `${fontStyle} ${size}px 'Sans-serif'`;
  }
  return size;
}

module.exports = {
  config: {
    name: "welcome",
    version: "8.0 Ultra",
    author: "Bokkor x69",
    category: "events"
  },

  onStart: async function ({ event, api }) {
    const { threadID, logMessageData } = event;
    const botID = api.getCurrentUserID();

    if (!["log:subscribe", "log:thread-member-added"].includes(event.logMessageType)) return;

    const newUsers = logMessageData.addedParticipants;
    if (!newUsers || !newUsers.length) return;

    const threadInfo = await api.getThreadInfo(threadID);
    const groupName = threadInfo.threadName || "Our Community";
    const memberCount = threadInfo.participantIDs.length;
    const prefix = global.GoatBot?.config?.prefix || "!";

    for (const user of newUsers) {
      const userId = user.userFbId || user.userId;
      const fullName = user.fullName || "New Member";

      // ===== Bot Join Handler =====
      if (userId === botID) {
        const botJoinMessage =
`╭─────────────⭑
🌊 ʜᴇʏ ᴛʜᴇʀᴇ, ᴛʜᴀɴᴋꜱ ꜰᴏʀ ᴀᴅᴅɪɴɢ ᴍᴇ ɪɴ ✨

🍭 ɪ'ᴍ ʏᴏᴜʀ ꜰʀɪᴇɴᴅʟʏ ᴀɪ ᴀꜱꜱɪꜱᴛᴀɴᴛ ʙᴏᴛ...
🛠️ ᴘʀᴇꜰɪx: ${prefix}
📖 ᴛʏᴘᴇ: ${prefix}help ᴛᴏ ꜱᴇᴇ ᴀʟʟ ᴄᴍᴅꜱ

💖 ꜱᴛᴀʏ ᴘᴏꜱɪᴛɪᴠᴇ, ꜱᴛᴀʏ ᴜᴘᴅᴀᴛᴇᴅ
— ʟᴏᴠᴇ ꜰᴏᴍ ♡︎ 𝐘𝐨𝐮𝐫 𝐌𝐢𝐟𝐮 ♡︎

👑 ᴍʏ ᴏᴡɴᴇʀ: Bokkor x69
╰─────────────⭑`;

        await api.changeNickname("Goat Bot", threadID, botID);
        return api.sendMessage(botJoinMessage, threadID);
      }

      // ===== Dense Tech HUD Canvas Card =====
      try {
        const cacheDir = path.join(__dirname, "cache");
        fs.ensureDirSync(cacheDir);
        const imgPath = path.join(cacheDir, `welcome_hud_${userId}.png`);

        // ১. সময় ও ডেট ফরম্যাটিং
        const hour = parseInt(moment().tz("Asia/Dhaka").format("HH"));
        let greeting = "GOOD DAY";
        if (hour >= 5 && hour < 12) greeting = "GOOD MORNING";
        else if (hour >= 12 && hour < 17) greeting = "GOOD AFTERNOON";
        else if (hour >= 17 && hour < 20) greeting = "GOOD EVENING";
        else greeting = "GOOD NIGHT";

        const timeStr = moment().tz("Asia/Dhaka").format("hh:mm:ss A");
        const dateStr = moment().tz("Asia/Dhaka").format("DD MMM YYYY");
        const dayStr = moment().tz("Asia/Dhaka").format("dddd");

        // ২. ক্যানভাস ডাইমেনশন (1200x630 HD)
        const W = 1200;
        const H = 630;
        const canvas = createCanvas(W, H);
        const ctx = canvas.getContext("2d");

        // ৩. Background Layer (Cosmic Deep Cyber Pattern)
        const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, 750);
        bgGrad.addColorStop(0, "#0b0f19");
        bgGrad.addColorStop(0.5, "#060911");
        bgGrad.addColorStop(1, "#020307");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // Cyber Mesh Grid
        ctx.strokeStyle = "rgba(56, 189, 248, 0.04)";
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 30) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += 30) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        // Glowing Background Orbs
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        // Neon Blue Orb (Left)
        const gBlue = ctx.createRadialGradient(200, 300, 20, 200, 300, 450);
        gBlue.addColorStop(0, "rgba(56, 189, 248, 0.35)");
        gBlue.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gBlue;
        ctx.fillRect(0, 0, W, H);

        // Neon Purple/Pink Orb (Right)
        const gPink = ctx.createRadialGradient(950, 300, 20, 950, 300, 450);
        gPink.addColorStop(0, "rgba(168, 85, 247, 0.35)");
        gPink.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gPink;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();

        // ৪. Glassmorphic Central Container Card
        const cX = 40, cY = 40, cW = W - 80, cH = H - 80;
        ctx.save();
        ctx.fillStyle = "rgba(10, 15, 26, 0.85)";
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 30;
        drawRoundRect(ctx, cX, cY, cW, cH, 28, true, false);
        ctx.restore();

        // Holographic Border Accent
        ctx.save();
        const borderGrad = ctx.createLinearGradient(cX, cY, cX + cW, cY + cH);
        borderGrad.addColorStop(0, "#38bdf8");
        borderGrad.addColorStop(0.5, "#a855f7");
        borderGrad.addColorStop(1, "#ec4899");
        ctx.strokeStyle = borderGrad;
        ctx.lineWidth = 2;
        drawRoundRect(ctx, cX, cY, cW, cH, 28, false, true);
        ctx.restore();

        // ----------------- TOP HUD HEADER -----------------
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
        drawRoundRect(ctx, cX + 20, cY + 18, cW - 40, 42, 12, true, false);

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 13px 'Monospace'";
        ctx.fillText(`● SYSTEM: MEMBER_JOIN_EVENT`, cX + 35, cY + 44);

        ctx.fillStyle = "#a855f7";
        ctx.fillText(`PREFIX: "${prefix}"`, cX + 320, cY + 44);

        ctx.fillStyle = "#10b981";
        ctx.fillText(`STATUS: VERIFIED`, cX + 500, cY + 44);

        ctx.fillStyle = "#64748b";
        ctx.font = "12px 'Monospace'";
        ctx.fillText(`BOT_VER: 8.0_HUD`, cX + cW - 160, cY + 44);
        ctx.restore();

        // ----------------- LEFT SIDE: AVATAR & ROLE -----------------
        const avatarURL = `https://graph.facebook.com/${userId}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        let avatarImg = null;
        try {
          const avtRes = await axios.get(avatarURL, { responseType: "arraybuffer" });
          avatarImg = await loadImage(Buffer.from(avtRes.data));
        } catch (e) {
          avatarImg = null;
        }

        const avtRadius = 95;
        const avtX = 210;
        const avtY = 280;

        // Multi-Layer Glowing Rings
        ctx.save();
        ctx.beginPath();
        ctx.arc(avtX, avtY, avtRadius + 10, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(avtX, avtY, avtRadius + 5, 0, Math.PI * 2);
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 4;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.restore();

        // Clip & Draw Avatar
        ctx.save();
        ctx.beginPath();
        ctx.arc(avtX, avtY, avtRadius, 0, Math.PI * 2);
        ctx.clip();
        if (avatarImg) {
          ctx.drawImage(avatarImg, avtX - avtRadius, avtY - avtRadius, avtRadius * 2, avtRadius * 2);
        } else {
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(avtX - avtRadius, avtY - avtRadius, avtRadius * 2, avtRadius * 2);
          ctx.fillStyle = "#38bdf8";
          ctx.font = "bold 60px 'Sans-serif'";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(fullName.charAt(0).toUpperCase(), avtX, avtY);
        }
        ctx.restore();

        // Role Badge Pill Below Avatar
        ctx.save();
        const roleText = "⚡ NEW MEMBER";
        ctx.font = "bold 12px 'Sans-serif'";
        const roleW = ctx.measureText(roleText).width + 24;
        const roleX = avtX - roleW / 2;
        const roleY = avtY + avtRadius + 18;

        ctx.fillStyle = "rgba(168, 85, 247, 0.2)";
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 1;
        drawRoundRect(ctx, roleX, roleY, roleW, 28, 14, true, true);

        ctx.fillStyle = "#c084fc";
        ctx.fillText(roleText, roleX + 12, roleY + 18);
        ctx.restore();

        // ----------------- RIGHT SIDE: INFORMATION MATRIX -----------------
        const tX = 360;

        // Greeting Header Line
        ctx.save();
        ctx.fillStyle = "#ec4899";
        ctx.font = "bold 15px 'Sans-serif'";
        ctx.fillText(`✦ WELCOME TO THE COMMUNITY • ${greeting}`, tX, 120);
        ctx.restore();

        // User Full Name (Adaptive Font)
        ctx.save();
        const nameSize = getAdaptiveFont(ctx, fullName, 720, 42);
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = "rgba(255, 255, 255, 0.25)";
        ctx.shadowBlur = 10;
        ctx.fillText(fullName, tX, 172);
        ctx.restore();

        // Group Subtitle
        ctx.save();
        ctx.fillStyle = "#94a3b8";
        ctx.font = "20px 'Sans-serif'";
        const cleanGroup = groupName.length > 32 ? groupName.slice(0, 29) + "..." : groupName;
        ctx.fillText(`You are now part of ${cleanGroup}`, tX, 208);
        ctx.restore();

        // Divider Accent
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tX, 226);
        ctx.lineTo(tX + 720, 226);
        ctx.stroke();

        // ----------------- 4-GRID STAT WIDGETS -----------------
        const gridY = 248;
        const boxW = 345;
        const boxH = 68;

        // Box 1: Member Count
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
        ctx.strokeStyle = "rgba(56, 189, 248, 0.2)";
        ctx.lineWidth = 1;
        drawRoundRect(ctx, tX, gridY, boxW, boxH, 14, true, true);

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 11px 'Sans-serif'";
        ctx.fillText("MEMBER NUMBER", tX + 16, gridY + 24);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px 'Sans-serif'";
        ctx.fillText(`#${memberCount}`, tX + 16, gridY + 54);
        ctx.restore();

        // Box 2: Facebook User ID
        ctx.save();
        const b2X = tX + boxW + 20;
        ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
        ctx.strokeStyle = "rgba(168, 85, 247, 0.2)";
        ctx.lineWidth = 1;
        drawRoundRect(ctx, b2X, gridY, boxW, boxH, 14, true, true);

        ctx.fillStyle = "#a855f7";
        ctx.font = "bold 11px 'Sans-serif'";
        ctx.fillText("USER FB ID", b2X + 16, gridY + 24);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px 'Sans-serif'";
        const displayUID = userId.length > 15 ? userId.slice(0, 13) + "..." : userId;
        ctx.fillText(displayUID, b2X + 16, gridY + 53);
        ctx.restore();

        // Box 3: Joined Time
        ctx.save();
        const row2Y = gridY + boxH + 14;
        ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
        ctx.strokeStyle = "rgba(236, 72, 153, 0.2)";
        ctx.lineWidth = 1;
        drawRoundRect(ctx, tX, row2Y, boxW, boxH, 14, true, true);

        ctx.fillStyle = "#f472b6";
        ctx.font = "bold 11px 'Sans-serif'";
        ctx.fillText("JOINED TIME", tX + 16, row2Y + 24);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px 'Sans-serif'";
        ctx.fillText(timeStr, tX + 16, row2Y + 53);
        ctx.restore();

        // Box 4: Joined Date & Day
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
        ctx.strokeStyle = "rgba(16, 185, 129, 0.2)";
        ctx.lineWidth = 1;
        drawRoundRect(ctx, b2X, row2Y, boxW, boxH, 14, true, true);

        ctx.fillStyle = "#34d399";
        ctx.font = "bold 11px 'Sans-serif'";
        ctx.fillText("JOINED DATE", b2X + 16, row2Y + 24);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 19px 'Sans-serif'";
        ctx.fillText(`${dateStr} (${dayStr.slice(0, 3)})`, b2X + 16, row2Y + 53);
        ctx.restore();

        // ----------------- BOTTOM NOTICE BAR -----------------
        const noticeY = row2Y + boxH + 16;
        ctx.save();
        ctx.fillStyle = "rgba(56, 189, 248, 0.08)";
        ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
        ctx.lineWidth = 1;
        drawRoundRect(ctx, tX, noticeY, 710, 48, 12, true, true);

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 14px 'Sans-serif'";
        ctx.fillText(`💡 TIP: Type "${prefix}help" to explore commands & group features!`, tX + 18, noticeY + 29);
        ctx.restore();

        // Footer Credit
        ctx.save();
        ctx.fillStyle = "#475569";
        ctx.font = "12px 'Monospace'";
        ctx.fillText(`DESIGNED BY BOKKOR X69 • ALL RIGHTS RESERVED`, tX, H - 55);
        ctx.restore();

        // ৫. Save Image & Send
        const imageBuffer = canvas.toBuffer("image/png");
        fs.writeFileSync(imgPath, imageBuffer);

        await api.sendMessage({
          body: "♡︎ 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐓𝐨 𝐘𝐨𝐮𝐫 𝐆𝐫𝐨𝐮𝐩 ♡︎", // টেক্সট ছাড়াই সম্পূর্ণ ইমেজ মেসেজ সেন্ড করবে
          attachment: fs.createReadStream(imgPath),
          mentions: [{ tag: fullName, id: userId }]
        }, threadID);

        // ১০ সেকেন্ড পর ক্যাশ থেকে ফাইল ক্লিন হবে
        setTimeout(() => fs.unlink(imgPath).catch(() => {}), 10000);

      } catch (err) {
        console.error("⚠️ Error generating Cyber HUD Welcome Card:", err);
      }
    }
  }
};