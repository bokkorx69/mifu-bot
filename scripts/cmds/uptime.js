const axios = require("axios");

// Main domain
const API_BASE = "https://core.apis-noob-x69.rf.gd/api/uptime";

// তোমার API_SECRET
const API_SECRET = "bokkor69";

// তোমার ADMIN_UID
const ADMIN_UID = "61558455297317";

module.exports = {
  config: {
    name: "uptime",
    aliases: ["monitor", "pinger"],
    prefix: false,
    author: "Bokkor x69",
    countDown: 2,
    role: 0,
    description: "Manage & monitor URLs using Uptime API",
    category: "Uptime API"
  },

  onStart: async function ({ message, args }) {
    const subCommand = args[0]?.toLowerCase();
    const targetUrl = args.slice(1).join(" ").trim();

    if (!subCommand) {
      return message.reply({
        body: `
━━━━━━━━━━━━━ UPTIME COMMANDS ━━━━━━━━━

❍ Add URL: uptime add <url>
❍ List All: uptime list
❍ Instant Check: uptime check <url/id>
❍ Detailed Log: uptime detail <url/id>
❍ Delete URL: uptime delete <url/id>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ LIVE MONITORING SYSTEM ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Powered by
━━━━━━━━━━━━ 𝐁ᴏᴋᴋᴏʀ x69 ━━━━━━━━━
`
      });
    }

    let waiting;

    try {
      waiting = await message.reply(
        "💫 Processing request, please wait…"
      );

      // =========================
      // ADD MONITOR
      // =========================
      if (subCommand === "add") {
        if (!targetUrl) {
          if (waiting?.messageID)
            await message.unsend(waiting.messageID);

          return message.reply(
            "⚠️ Usage: uptime add <url>"
          );
        }

        const res = await axios.get(
          `${API_BASE}/monitors/add`,
          {
            params: {
              url: targetUrl,
              secret: API_SECRET
            },
            headers: {
              "x-api-secret": API_SECRET
            },
            timeout: 30000
          }
        );

        if (waiting?.messageID)
          await message.unsend(waiting.messageID);

        const m = res.data.monitor;

        return message.reply({
          body: `
━━━━━━━━━━━━━ MONITOR ADDED ━━━━━━━━━

❍ Name: ${m.name}
❍ ID: ${m.id}
❍ URL: ${m.url}
❍ Status: ${m.lastStatus}
❍ Response Time: ${m.lastResponseTime} ms
❍ Timeout: ${m.timeout} ms
❍ Uptime: ${m.uptimePercentage}%
❍ Created At: ${new Date(m.createdAt).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ URL ADDED TO LIVE MONITORING ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Powered by
━━━━━━━━━━━━ 𝐁ᴏᴋᴋᴏʀ x69 ━━━━━━━━━
`
        });
      }

      // =========================
      // LIST
      // =========================
      if (
        subCommand === "list" ||
        subCommand === "all"
      ) {
        const res = await axios.get(
          `${API_BASE}/monitors`,
          {
            timeout: 15000
          }
        );

        if (waiting?.messageID)
          await message.unsend(waiting.messageID);

        const monitors = res.data.monitors || [];

        let text = `
━━━━━━━━━━━━━ UPTIME MONITORS ━━━━━━━━━

❍ Total Monitors: ${res.data.totalMonitors || 0}

`;

        if (!monitors.length) {
          text += "❍ No monitors found.\n";
        } else {
          monitors.forEach((m, i) => {
            text += `
${i + 1}. ${m.name}
❍ ID: ${m.id}
❍ URL: ${m.url}
❍ Status: ${
              m.lastStatus === "UP"
                ? "🟢 UP"
                : m.lastStatus === "DOWN"
                ? "🔴 DOWN"
                : "🟡 PENDING"
            }
❍ Uptime: ${m.uptimePercentage}%
❍ Response: ${m.lastResponseTime} ms

`;
          });
        }

        text += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ AUTO CHECK EVERY 1 MINUTE ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Powered by
━━━━━━━━━━━━ 𝐁ᴏᴋᴋᴏʀ x69 ━━━━━━━━━
`;

        return message.reply({
          body: text
        });
      }

      // =========================
      // CHECK
      // =========================
      if (
        subCommand === "check" ||
        subCommand === "ping"
      ) {
        if (!targetUrl) {
          if (waiting?.messageID)
            await message.unsend(waiting.messageID);

          return message.reply(
            "⚠️ Usage: uptime check <url_or_id>"
          );
        }

        const res = await axios.get(
          `${API_BASE}/monitors/check`,
          {
            params: {
              url: targetUrl
            },
            timeout: 30000
          }
        );

        if (waiting?.messageID)
          await message.unsend(waiting.messageID);

        const m = res.data.monitor;

        const statusIcon =
          m.lastStatus === "UP"
            ? "🟢 UP"
            : m.lastStatus === "DOWN"
            ? "🔴 DOWN"
            : "🟡 PENDING";

        return message.reply({
          body: `
━━━━━━━━━━━━━ INSTANT CHECK ━━━━━━━━━

❍ Name: ${m.name}
❍ ID: ${m.id}
❍ URL: ${m.url}
❍ Status: ${statusIcon}
❍ Response Time: ${m.lastResponseTime} ms
❍ Total Checks: ${m.totalChecks}
❍ Successful Checks: ${m.successfulChecks}
❍ Uptime Rate: ${m.uptimePercentage}%
❍ Last Checked: ${
            m.lastChecked
              ? new Date(m.lastChecked).toLocaleString()
              : "N/A"
          }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ REAL-TIME RESPONSE METRICS ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Powered by
━━━━━━━━━━━━ 𝐁ᴏᴋᴋᴏʀ x69 ━━━━━━━━━
`
        });
      }

      // =========================
      // DETAIL
      // =========================
      if (
        subCommand === "detail" ||
        subCommand === "info"
      ) {
        if (!targetUrl) {
          if (waiting?.messageID)
            await message.unsend(waiting.messageID);

          return message.reply(
            "⚠️ Usage: uptime detail <url_or_id>"
          );
        }

        const res = await axios.get(
          `${API_BASE}/monitors/detail`,
          {
            params: {
              url: targetUrl
            },
            timeout: 30000
          }
        );

        if (waiting?.messageID)
          await message.unsend(waiting.messageID);

        const m = res.data.monitor;
        const logs = res.data.recentLogs || [];
        const lastLog = logs[0];

        return message.reply({
          body: `
━━━━━━━━━━━━━ MONITOR DETAILS ━━━━━━━━━

❍ Name: ${m.name}
❍ ID: ${m.id}
❍ URL: ${m.url}
❍ Status: ${
            m.lastStatus === "UP"
              ? "🟢 UP"
              : m.lastStatus === "DOWN"
              ? "🔴 DOWN"
              : "🟡 PENDING"
          }
❍ Response Time: ${m.lastResponseTime} ms
❍ Total Checks: ${m.totalChecks}
❍ Successful Checks: ${m.successfulChecks}
❍ Uptime Rate: ${m.uptimePercentage}%
❍ Created At: ${
            m.createdAt
              ? new Date(m.createdAt).toLocaleString()
              : "N/A"
          }

━━━━━━━━━━━━━ LATEST LOG ━━━━━━━━━

❍ Status Code: ${
            lastLog?.statusCode ?? "N/A"
          }
❍ Response Time: ${
            lastLog?.responseTime ?? "0"
          } ms
❍ Error: ${
            lastLog?.errorReason ?? "None"
          }
❍ SSL: ${
            lastLog?.sslInfo?.daysRemaining != null
              ? `${lastLog.sslInfo.daysRemaining} Days Left`
              : "N/A / Non-HTTPS"
          }
❍ Log Time: ${
            lastLog
              ? new Date(
                  lastLog.timestamp
                ).toLocaleString()
              : "N/A"
          }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ DETAILED HISTORY & SSL METRICS ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Powered by
━━━━━━━━━━━━ 𝐁ᴏᴋᴋᴏʀ x69 ━━━━━━━━━
`
        });
      }

      // =========================
      // DELETE
      // =========================
      if (
        subCommand === "delete" ||
        subCommand === "remove"
      ) {
        if (!targetUrl) {
          if (waiting?.messageID)
            await message.unsend(waiting.messageID);

          return message.reply(
            "⚠️ Usage: uptime delete <url_or_id>"
          );
        }

        const res = await axios.get(
          `${API_BASE}/monitors/delete`,
          {
            params: {
              url: targetUrl,
              secret: API_SECRET
            },
            headers: {
              "x-api-secret": API_SECRET
            },
            timeout: 30000
          }
        );

        if (waiting?.messageID)
          await message.unsend(waiting.messageID);

        return message.reply({
          body: `
━━━━━━━━━━━━━ MONITOR REMOVED ━━━━━━━━━

❍ Deleted URL: ${res.data.deletedUrl}
❍ Deleted ID: ${res.data.deletedId}
❍ Status: Successfully Removed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ MONITORING HAS BEEN STOPPED ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Powered by
━━━━━━━━━━━━ 𝐁ᴏᴋᴋᴏʀ x69 ━━━━━━━━━
`
        });
      }

      if (waiting?.messageID)
        await message.unsend(waiting.messageID);

      return message.reply(
        "⚠️ Invalid subcommand. Use `uptime` to view usage."
      );

    } catch (err) {
      console.error(
        "[UPTIME COMMAND ERROR]",
        err.response?.data || err.message
      );

      if (waiting?.messageID) {
        try {
          await message.unsend(waiting.messageID);
        } catch {}
      }

      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.details ||
        err.message ||
        "Error connecting to Uptime API.";

      return message.reply(
        `❌ ${errorMsg}`
      );
    }
  }
};