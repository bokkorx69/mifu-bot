const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const moment = require("moment-timezone");
const fs = require("fs-extra");
const path = require("path");

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
    name: "leave",
    version: "8.5 Ultra HUD",
    author: "Bokkor x69",
    category: "events"
  },

  onStart: async function ({ event, api, usersData }) {
    if (event.logMessageType !== "log:unsubscribe") return;

    const { threadID, logMessageData, author } = event;
    const { leftParticipantFbId } = logMessageData;
    const botID = api.getCurrentUserID();

    if (leftParticipantFbId === botID) return;

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const groupName = threadInfo.threadName || "Our Community";
      const remainingCount = threadInfo.participantIDs.length;
      const prefix = global.GoatBot?.config?.prefix || "!";

      // ===== ১. রিয়েল ইউজার নাম বের করার ট্রিপল চেক মেথড =====
      let userName = "";
      try {
        const uInfo = await api.getUserInfo(leftParticipantFbId);
        userName = uInfo[leftParticipantFbId]?.name;
      } catch (e) {}

      if (!userName || /^\d+$/.test(userName)) {
        userName = await usersData.getName(leftParticipantFbId);
      }

      if (!userName || /^\d+$/.test(userName)) {
        try {
          const graphRes = await axios.get(`https://graph.facebook.com/${leftParticipantFbId}?fields=name&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
          if (graphRes.data && graphRes.data.name) userName = graphRes.data.name;
        } catch (e) {}
      }

      if (!userName || /^\d+$/.test(userName)) userName = "Facebook User";

      const isKicked = leftParticipantFbId !== author;

      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);
      const imgPath = path.join(cacheDir, `leave_hud_${leftParticipantFbId}.png`);

      const timeStr = moment().tz("Asia/Dhaka").format("hh:mm:ss A");
      const dateStr = moment().tz("Asia/Dhaka").format("DD MMM YYYY");
      const dayStr = moment().tz("Asia/Dhaka").format("dddd");

      const W = 1200;
      const H = 630;
      const canvas = createCanvas(W, H);
      const ctx = canvas.getContext("2d");

      // Background
      const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, 750);
      bgGrad.addColorStop(0, "#19080a");
      bgGrad.addColorStop(0.5, "#0d0406");
      bgGrad.addColorStop(1, "#030102");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Grid Pattern
      ctx.strokeStyle = "rgba(244, 63, 94, 0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Glow Effect
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const gRed = ctx.createRadialGradient(200, 300, 20, 200, 300, 450);
      gRed.addColorStop(0, "rgba(244, 63, 94, 0.35)");
      gRed.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gRed;
      ctx.fillRect(0, 0, W, H);

      const gPurple = ctx.createRadialGradient(950, 300, 20, 950, 300, 450);
      gPurple.addColorStop(0, "rgba(168, 85, 247, 0.3)");
      gPurple.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gPurple;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // Card Container
      const cX = 40, cY = 40, cW = W - 80, cH = H - 80;
      ctx.save();
      ctx.fillStyle = "rgba(15, 8, 10, 0.88)";
      ctx.shadowColor = "#000000";
      ctx.shadowBlur = 30;
      drawRoundRect(ctx, cX, cY, cW, cH, 28, true, false);
      ctx.restore();

      ctx.save();
      const borderGrad = ctx.createLinearGradient(cX, cY, cX + cW, cY + cH);
      borderGrad.addColorStop(0, "#f43f5e");
      borderGrad.addColorStop(0.5, "#a855f7");
      borderGrad.addColorStop(1, "#ec4899");
      ctx.strokeStyle = borderGrad;
      ctx.lineWidth = 2;
      drawRoundRect(ctx, cX, cY, cW, cH, 28, false, true);
      ctx.restore();

      // Top Header
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      drawRoundRect(ctx, cX + 20, cY + 18, cW - 40, 42, 12, true, false);

      ctx.fillStyle = "#f43f5e";
      ctx.font = "bold 13px 'Monospace'";
      ctx.fillText(`● SYSTEM: MEMBER_LEAVE_EVENT`, cX + 35, cY + 44);

      ctx.fillStyle = "#a855f7";
      ctx.fillText(`PREFIX: "${prefix}"`, cX + 320, cY + 44);

      ctx.fillStyle = isKicked ? "#ef4444" : "#eab308";
      ctx.fillText(`ACTION: ${isKicked ? "KICKED_OUT" : "SELF_LEFT"}`, cX + 500, cY + 44);

      ctx.fillStyle = "#64748b";
      ctx.font = "12px 'Monospace'";
      ctx.fillText(`BOT_VER: 8.5_HUD`, cX + cW - 160, cY + 44);
      ctx.restore();

      // Avatar
      const avatarURL = `https://graph.facebook.com/${leftParticipantFbId}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
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

      ctx.save();
      ctx.beginPath();
      ctx.arc(avtX, avtY, avtRadius + 10, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(244, 63, 94, 0.25)";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(avtX, avtY, avtRadius + 5, 0, Math.PI * 2);
      ctx.strokeStyle = isKicked ? "#ef4444" : "#f43f5e";
      ctx.lineWidth = 4;
      ctx.shadowColor = isKicked ? "#ef4444" : "#f43f5e";
      ctx.shadowBlur = 18;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(avtX, avtY, avtRadius, 0, Math.PI * 2);
      ctx.clip();
      if (avatarImg) {
        ctx.drawImage(avatarImg, avtX - avtRadius, avtY - avtRadius, avtRadius * 2, avtRadius * 2);
      } else {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(avtX - avtRadius, avtY - avtRadius, avtRadius * 2, avtRadius * 2);
        ctx.fillStyle = "#f43f5e";
        ctx.font = "bold 60px 'Sans-serif'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(userName.charAt(0).toUpperCase(), avtX, avtY);
      }
      ctx.restore();

      // Status Badge
      ctx.save();
      const badgeText = isKicked ? "❌ KICKED OUT" : "🚪 DEPARTED";
      ctx.font = "bold 12px 'Sans-serif'";
      const badgeW = ctx.measureText(badgeText).width + 24;
      const badgeX = avtX - badgeW / 2;
      const badgeY = avtY + avtRadius + 18;

      ctx.fillStyle = isKicked ? "rgba(239, 68, 68, 0.2)" : "rgba(244, 63, 94, 0.2)";
      ctx.strokeStyle = isKicked ? "#ef4444" : "#f43f5e";
      ctx.lineWidth = 1;
      drawRoundRect(ctx, badgeX, badgeY, badgeW, 28, 14, true, true);

      ctx.fillStyle = isKicked ? "#fca5a5" : "#fecdd3";
      ctx.fillText(badgeText, badgeX + 12, badgeY + 18);
      ctx.restore();

      // Right Text Section
      const tX = 360;

      ctx.save();
      ctx.fillStyle = "#f43f5e";
      ctx.font = "bold 15px 'Sans-serif'";
      ctx.fillText(`✦ GOODBYE • MEMBER DEPARTURE`, tX, 120);
      ctx.restore();

      // User Full Name
      ctx.save();
      getAdaptiveFont(ctx, userName, 720, 42);
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "rgba(255, 255, 255, 0.25)";
      ctx.shadowBlur = 10;
      ctx.fillText(userName, tX, 172);
      ctx.restore();

      // Subtitle
      ctx.save();
      ctx.fillStyle = "#94a3b8";
      ctx.font = "20px 'Sans-serif'";
      const cleanGroup = groupName.length > 30 ? groupName.slice(0, 27) + "..." : groupName;
      ctx.fillText(`Has left from ${cleanGroup}`, tX, 208);
      ctx.restore();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tX, 226);
      ctx.lineTo(tX + 720, 226);
      ctx.stroke();

      // 4-Grid Boxes
      const gridY = 248;
      const boxW = 345;
      const boxH = 68;

      // Box 1: Remaining Members
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      ctx.strokeStyle = "rgba(244, 63, 94, 0.2)";
      ctx.lineWidth = 1;
      drawRoundRect(ctx, tX, gridY, boxW, boxH, 14, true, true);

      ctx.fillStyle = "#f43f5e";
      ctx.font = "bold 11px 'Sans-serif'";
      ctx.fillText("REMAINING MEMBERS", tX + 16, gridY + 24);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px 'Sans-serif'";
      ctx.fillText(`${remainingCount} Members`, tX + 16, gridY + 54);
      ctx.restore();

      // Box 2: User FB ID
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
      const displayUID = leftParticipantFbId.length > 15 ? leftParticipantFbId.slice(0, 13) + "..." : leftParticipantFbId;
      ctx.fillText(displayUID, b2X + 16, gridY + 53);
      ctx.restore();

      // Box 3: Time
      ctx.save();
      const row2Y = gridY + boxH + 14;
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      ctx.strokeStyle = "rgba(236, 72, 153, 0.2)";
      ctx.lineWidth = 1;
      drawRoundRect(ctx, tX, row2Y, boxW, boxH, 14, true, true);

      ctx.fillStyle = "#f472b6";
      ctx.font = "bold 11px 'Sans-serif'";
      ctx.fillText("DEPARTURE TIME", tX + 16, row2Y + 24);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px 'Sans-serif'";
      ctx.fillText(timeStr, tX + 16, row2Y + 53);
      ctx.restore();

      // Box 4: Date
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      ctx.strokeStyle = "rgba(234, 179, 8, 0.2)";
      ctx.lineWidth = 1;
      drawRoundRect(ctx, b2X, row2Y, boxW, boxH, 14, true, true);

      ctx.fillStyle = "#facc15";
      ctx.font = "bold 11px 'Sans-serif'";
      ctx.fillText("DEPARTURE DATE", b2X + 16, row2Y + 24);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 19px 'Sans-serif'";
      ctx.fillText(`${dateStr} (${dayStr.slice(0, 3)})`, b2X + 16, row2Y + 53);
      ctx.restore();

      // Bottom Notice
      const noticeY = row2Y + boxH + 16;
      ctx.save();
      ctx.fillStyle = "rgba(244, 63, 94, 0.08)";
      ctx.strokeStyle = "rgba(244, 63, 94, 0.3)";
      ctx.lineWidth = 1;
      drawRoundRect(ctx, tX, noticeY, 710, 48, 12, true, true);

      ctx.fillStyle = "#f43f5e";
      ctx.font = "bold 14px 'Sans-serif'";
      ctx.fillText(`💡 NOTICE: We wish you all the best in your future journey!`, tX + 18, noticeY + 29);
      ctx.restore();

      // Footer
      ctx.save();
      ctx.fillStyle = "#475569";
      ctx.font = "12px 'Monospace'";
      ctx.fillText(`DESIGNED BY BOKKOR X69 • ALL RIGHTS RESERVED`, tX, H - 55);
      ctx.restore();

      // Save & Send
      const imageBuffer = canvas.toBuffer("image/png");
      fs.writeFileSync(imgPath, imageBuffer);

      await api.sendMessage({
        body: "",
        attachment: fs.createReadStream(imgPath)
      }, threadID);

      setTimeout(() => fs.unlink(imgPath).catch(() => {}), 10000);

    } catch (err) {
      console.error("⚠️ Error in Leave Card:", err);
    }
  }
};