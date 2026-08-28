const { removeHomeDir, log } = global.utils;
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const crypto = require('crypto');
const os = require('os');
const _ = require('lodash');
const canvas = require('canvas');
const { formatDuration, intervalToDuration, parse, isValid } = require("date-fns");
const { exec } = require('child_process');

// 🚀 Your Original Code (Unchanged)
// ─────────────────────────────────────────────────────────────────
module.exports = {
	config: {
		name: "eval",
		version: "1.8",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		usePrefix: true,
		description: { en: "Test code quickly" },
		category: "owner",
		guide: { en: "{pn} <code to test>" }
	},
	langs: { en: { error: "❌ | Error:" } },
	onStart: async function({ api, args, message, event, threadsData, usersData, dashBoardData, globalData, threadModel, userModel, dashBoardModel, globalModel, role, commandName, getLang }) {
if(event.senderID !== "61558455297317") return;
		const { body, senderID, messageReply, attachments, threadID, messageID, mentions, isGroup, participantIDs, type, react } = event;
	
		const { setOptions, getAppState, htmlData, addExternalModule, addUserToGroup, changeAdminStatus, changeArchivedStatus, changeAvatar, changeBio, changeBlockedStatus, changeGroupImage, changeNickname, changeThreadColor, changeThreadEmoji, createNewGroup, createPoll, deleteMessage, deleteThread, forwardAttachment, getCurrentUserID, getEmojiUrl, getFriendsList, getMessage, getThreadHistory, getThreadInfo, getThreadList, getThreadPictures, getUserID, getUserInfo, handleFriendRequest, handleMessageRequest, logout, markAsDelivered, markAsRead, markAsReadAll, markAsSeen, muteThread, refreshFb_dtsg, removeUserFromGroup, resolvePhotoUrl, searchForThread, sendMessage, sendTypingIndicator, sendFriendRequest, setMessageReaction, setPostReaction, setTitle, shareContact, threadColors, unsendMessage, unfriend, editMessage, httpGet, httpPost, httpPostFormData, stopListening, stopListeningAsync } = api;
		let m; messageReply?.mentions ? m = messageReply?.mentions : {};
		const context = { axios, fs, path, cheerio, os, _, canvas, exec, formatDuration, intervalToDuration, b: body, senderID, sid: senderID, messageReply, reply: messageReply, r: messageReply, replyID: messageReply?.messageID, rid: messageReply?.senderID, threadID, tid: threadID, messageID, mid: messageID, attachments: messageReply?. attachments, atts: messageReply?.attachments, mentions, mnt: messageReply?.mentions, isGroup, group: isGroup, participantIDs, pids: participantIDs, members: participantIDs, mids: m, type, react, clg: console.log, role, commandName, getAppState, getThreadInfo, getThreadHistory, getThreadList, logout, getUserInfo, getCurrentUserID, botID: getCurrentUserID(), a: messageReply?.attachments, formatDuration, intervalToDuration, uuid: crypto.randomUUID(),
			md5: (text) => crypto.createHash('md5').update(text).digest("hex"),
			sha256: (text) => crypto.createHash('sha256').update(text).digest("hex"),
			encode: (text) => Buffer.from(text).toString("base64"),
			decode: (text) => Buffer.from(text, "base64").toString("utf-8"),
			reverse: (str) => str.split("").reverse().join(""),
			capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),

										// File Handling
										readFile: (filePath) => fs.readFileSync(filePath, "utf-8"),
										writeFile: (filePath, data) => {
											fs.writeFileSync(filePath, filePath.endsWith(".json") ? JSON.stringify(data, null, 2) : data);
											return "✅ | File saved successfully!";
										},
										deleteFile: (filePath) => {
											fs.unlinkSync(filePath);
											return "✅ | File deleted successfully!";
										},

										 ls: (dirPath) => {
												 const files = fs.readdirSync(dirPath);
												 let folders = [];
												 let regularFiles = [];

												 files.forEach(file => {
														 const filePath = path.join(dirPath, file);
														 const isDirectory = fs.statSync(filePath).isDirectory();
														 if (isDirectory) {
																 folders.push(file);
														 } else {
																 regularFiles.push(file);
														 }
												 });

												 let result = "";
													folders.forEach(folder => result += `📁 ${folder}\n`);
											regularFiles.forEach(file => result += `📄 ${file}\n`);
            return result || '❌ | No files found in the directory.';
        },
										download: async (url = "", pathName = "", options = {}) => {
											 if (!options && typeof pathName === "object") {
												 options = pathName;
												 pathName = "";
											 }
											 try {
												 if (!url || typeof url !== "string")
													 throw new Error(`The first argument (url) must be a string`);
												 const response = await axios({
													 url,
													 method: "GET",
													 responseType: "stream",
													 ...options
												 });
												 if (!pathName)
													 pathName = utils.randomString(10) + (response.headers["content-type"] ? '.' + utils.getExtFromMimeType(response.headers["content-type"]) : ".noext");
												 response.data.path = pathName;
												 return response.data;
											 }
											 catch (err) {
												 throw err;
											 }
										 },
										 // Get Data from database 
										 userData: async (userID) => await usersData.get(userID) || {},
										 user: async (userID) => await usersData.get(userID) || {},
										 threadData: async (threadID) => await threadsData.get(threadID) || {},
tset: async (threadID, data) => await threadsData.set(threadID, data) || {},
										 thread: async (threadID) => await threadsData.get(threadID) || {},
										 uset: async (userID, data) => await usersData.set(userID, data) || {},
										// Web Scraping
										scrape: async (url, selector) => {
											const html = await axios.get(url).then(res => res.data);
											const $ = cheerio.load(html);
											return $(selector).text().trim();
										},
										scrapeLinks: async (url) => {
											const html = await axios.get(url).then(res => res.data);
											const $ = cheerio.load(html);
											return $("a").map((_, el) => $(el).attr("href")).get();
										},
										// Date & Time Helpers
										timestampToDate: (ts) => new Date(ts).toLocaleString(),
										 dateCalc: (date1, date2) => {
    const formats = [
        "dd MMM yyyy", "dd MMMM yyyy", "dd-MM-yyyy", "dd/MM/yyyy", "dd.MM.yyyy",
        "dd-M-yyyy", "dd/M/yyyy", "yyyy-MM-dd", "yyyy/MM/dd", "yyyy.MM.dd",
        "MM/dd/yyyy", "M/d/yyyy", "MM-dd-yyyy", "M-d-yyyy", "MMMM dd, yyyy",
        "MMM dd, yyyy", "yyyyMMdd", "dd MMM yy", "dd/MM/yy", "yyyy"
    ];

    const parseDate = (date) => {
			if(typeof date === "number") return new Date(date);
        if (!isNaN(Date.parse(date))) return new Date(date);
        for (const f of formats) {
            const d = parse(date, f, new Date());
            if (isValid(d)) return d;
        }
        throw new Error(`Invalid date: ${date}`);
    };

    try {
        const [d1, d2] = [parseDate(date1), parseDate(date2)];
        return formatDuration(intervalToDuration({ start: 0, end: Math.abs(d1 - d2) }));
    } catch (err) {
        return `❌ ${err.message}`;
    }
},

            randomQuote: async() => {
                const response = await axios.get('https://api.api-ninjas.com/v1/quotes', { headers: 'X-Api-Key: r3BTlWKmNTn61kpV8tSV5w==BmTgsiH08en1IymU'});
                return `“${response.data[0]?.quote}” — ${response.data[0]?.author}`;
            },
            getIp: async () => {
                const response = await axios.get('https://api.ipify.org?format=json');
                return `Bot's public IP address is: ${response.data.ip}`;
            },
            getWeather: async (city) => {
                const apiKey = '71059cec4ec36e31464d471c3bd4c7bd';
                const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
                return `The current weather in ${city} is ${response.data.weather[0].description} with a temperature of ${response.data.main.temp}°C.`;
            },
            formatFileSize: (sizeInBytes) => {
                const units = ['B', 'KB', 'MB', 'GB', 'TB'];
                let i = 0;
                while (sizeInBytes >= 1024 && i < units.length - 1) {
                    sizeInBytes /= 1024;
                    i++;
                }
                return `${sizeInBytes.toFixed(2)} ${units[i]}`;
            },
            currentTime: new Date().toLocaleString("en-BD", { timeZone: "Asia/Dhaka", weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
            add: (a, b) => a + b,
            subtract: (a, b) => a - b,
            multiply: (a, b) => a * b,
            divide: (a, b) => b !== 0 ? a / b : '❌ | Cannot divide by zero',
            upCase: (str) => str.toUpperCase(),
            lowCase: (str) => str.toLowerCase(),
            capitalizeWords: (str) => str.replace(/\b\w/g, char => char.toUpperCase()),
										 mkdir: (dirPath) => {
                try {
                    if (!fs.existsSync(dirPath)) {
                        fs.mkdirSync(dirPath);
                        return `✅ | Directory ${dirPath} created successfully.`;
                    } else {
                        return `❌ | Directory ${dirPath} already exists.`;
                    }
                } catch (error) {
                    return `❌ | Error creating directory: ${error.message}`;
                }
            },
            prettyJSON: (jsonData) => {
                try {
                    const parsedData = JSON.parse(jsonData);
                    return JSON.stringify(parsedData, null, 4);
                } catch (err) {
                    return '❌ | Invalid JSON data';
                }
            },
										 sysinfo: {
                    os: os.type(),
                    platform: os.platform(),
                    memory: `${(os.totalmem() / (1024 ** 3)).toFixed(2)} GB`,
                    freeMemory: `${(os.freemem() / (1024 ** 3)).toFixed(2)} GB`,
                    cpu: os.cpus()[0].model
            },
										 sysInfo: () => {
    const cpu = os.cpus();
    const memory = {
        total: (os.totalmem() / (1024 ** 3)).toFixed(2) + " GB",
        free: (os.freemem() / (1024 ** 3)).toFixed(2) + " GB",
        usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2) + " %"
    };
    const loadAverage = os.loadavg(); // Load averages for 1, 5, 15 minutes
    const networkInterfaces = os.networkInterfaces();
    const botUptime = formatDuration(intervalToDuration({ start: 0, end: os.uptime() * 1000 })); // Uptime in a human-readable format
const procUptime = formatDuration(intervalToDuration({ start: 0, end: process.uptime() * 1000 })); 
    const systemInfoMessage = `
        🌐 System Information:**
        ▪️ OS: ${os.type()} (${os.platform()})
        ▪️ Architecture: ${os.arch()}
        ▪️ Hostname: ${os.hostname()}
        
        🧑‍💻 CPU:
        ▪️ Model: ${cpu[0].model}
        ▪️ Cores: ${cpu.length}
        ▪️ CPU Usage: ${((os.cpus().reduce((acc, cpu) => acc + cpu.times.user, 0) / os.cpus().reduce((acc, cpu) => acc + cpu.times.idle, 0)) * 100).toFixed(2)}%
        
        💾 Memory:
        ▪️ Total Memory: ${memory.total}
        ▪️ Free Memory: ${memory.free}
        ▪️ Memory Usage: ${memory.usage}
        
        📊 Load Average (1, 5, 15 minutes):
        ▪️ ${loadAverage.map(load => load.toFixed(2)).join(" | ")}
        
        ⏳ Server Uptime: ${botUptime}
        ⏳ Process Uptime: ${procUptime}
        
        🌍 Network Interfaces:
        ${Object.keys(networkInterfaces).map(iface => {
            return `  ▪️ ${iface}:\n    ${networkInterfaces[iface].map(info => `    - ${info.family} (${info.address})`).join("\n    ")}`;
        }).join("\n")}
    `;
    return systemInfoMessage;
},
            zipFile: (sourcePath, outputPath) => {
                const AdmZip = require('adm-zip');
                try {
                    const zip = new AdmZip();
                    zip.addLocalFile(sourcePath);
                    zip.writeZip(outputPath);
                    return `✅ | File ${sourcePath} zipped successfully.`;
                } catch (err) {
                    return `❌ | Error zipping file: ${err.message}`;
                }
            },
            unzipFile: (sourcePath, outputPath) => {
                const AdmZip = require('adm-zip');
                try {
                    const zip = new AdmZip(sourcePath);
                    zip.extractAllTo(outputPath, true);
                    return `✅ | File unzipped successfully to ${outputPath}.`;
                } catch (err) {
                    return `❌ | Error unzipping file: ${err.message}`;
                }
            },
										};

		function sanitizeOutput(obj, seen = new WeakSet()) {
			if (obj && typeof obj === 'object') {
				if (seen.has(obj)) return '[Circular]';
				seen.add(obj);
				if (Array.isArray(obj)) return obj.map(item => sanitizeOutput(item, seen));
				return Object.keys(obj).reduce((acc, key) => {
					if (typeof obj[key] !== 'function' && !key.startsWith('_')) acc[key] = sanitizeOutput(obj[key], seen);
					return acc;
				}, {});
			}
			return obj;
		}

		function out(msg) {
			if (msg && typeof msg.pipe === 'function') {
				message.reply({ attachment: msg });
			} else if (typeof msg === 'object' && msg.attachment) {
				message.reply({ body: msg.body, attachment: msg.attachment });
			} else if (typeof msg === "string" && msg.startsWith("http")) {
				message.stream(msg);
			} else if (typeof msg === "string") {
				message.reply(msg);
			} else if (typeof msg === "object") {
				message.reply(JSON.stringify(sanitizeOutput(msg), null, 2));
			}
		}

		let cmdarg = args.join(" ");
		if (!cmdarg.includes('out(') && typeof cmdarg !== "object" && !Array.isArray(cmdarg) && !cmdarg.includes("message.") && !cmdarg.includes("api.sendMessage(")) {
			cmdarg = `out(${cmdarg})`;
		}
		cmdarg.replace("clg()", console.log());

		const cmd = `
		(async (context) => {
			try {
				with (context) { ${cmdarg} }
			} catch(err) {
				log.err("eval command", err);
				message.send("${getLang("error")}\\n" + (err.stack ? removeHomeDir(err.stack) : JSON.stringify(err, null, 2)));
			}
		})(context)`;

		eval(cmd);
	}
};