"use strict";

const moment = require("moment-timezone");
const { colors } = require("../func/colors.js");

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────

const TZ =
    process.env.TZ ||
    global?.GoatBot?.config?.timeZone ||
    "Asia/Dhaka";

const TIME_FMT = "HH:mm:ss";

// ─────────────────────────────────────────────────────────────
// PALETTE
// ─────────────────────────────────────────────────────────────

const PALETTE = {

    info: {
        icon: "ℹ",
        color: "#38bdf8",
        label: "INFO"
    },

    success: {
        icon: "✔",
        color: "#22c55e",
        label: "SUCCESS"
    },

    warn: {
        icon: "▲",
        color: "#f59e0b",
        label: "WARNING"
    },

    error: {
        icon: "✖",
        color: "#ef4444",
        label: "ERROR"
    },

    master: {
        icon: "★",
        color: "#f97316",
        label: "MASTER"
    }

};

// ─────────────────────────────────────────────────────────────
// UI SYMBOLS
// ─────────────────────────────────────────────────────────────

const SYMBOLS = {

    brand: "♡︎ BOKKOR ♡︎",

    left: "│",
    arrow: "›",
    bullet: "•",

    top: "╭",
    bottom: "╰",
    horizontal: "─",

    success: "✔",
    error: "✖",
    warning: "▲",
    info: "ℹ",
    master: "★"

};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function timestamp() {

    return colors.hex(
        "#64748b",
        `[${moment().tz(TZ).format(TIME_FMT)}]`
    );
}

function brand() {

    return colors.bold(
        colors.hex(
            "#f9a8d4",
            SYMBOLS.brand
        )
    );
}

function cleanPrefix(prefix) {

    return String(prefix || "")
        .toUpperCase()
        .trim()
        .slice(0, 16);
}

function formatPrefix(prefix, color) {

    const value = cleanPrefix(prefix);

    return colors.bold(
        colors.hex(
            color,
            value.padEnd(16, " ")
        )
    );
}

function separator(color = "#334155") {

    return colors.hex(
        color,
        SYMBOLS.left
    );
}

function messageText(message) {

    return colors.hex(
        "#e2e8f0",
        String(message ?? "")
    );
}

// ─────────────────────────────────────────────────────────────
// MAIN LOGGER
// ─────────────────────────────────────────────────────────────

function write(level, prefix, message) {

    const meta =
        PALETTE[level] ||
        PALETTE.info;

    const time =
        timestamp();

    const brandText =
        brand();

    const icon =
        colors.bold(
            colors.hex(
                meta.color,
                meta.icon
            )
        );

    const label =
        colors.bold(
            colors.hex(
                meta.color,
                meta.label.padEnd(8, " ")
            )
        );

    const tag =
        formatPrefix(
            prefix,
            meta.color
        );

    const sep =
        separator();

    const msg =
        messageText(message);

    const line =
        `${time} ${brandText} ${icon} ${label} ${sep} ${tag} ${sep} ${msg}`;

    process.stderr.write(
        `\r\x1b[K${line}\n`
    );
}

// ─────────────────────────────────────────────────────────────
// LOGGER BUILDER
// ─────────────────────────────────────────────────────────────

function build(level, defaultPrefix) {

    return function (prefix, message) {

        if (message === undefined) {

            message = prefix;
            prefix = defaultPrefix;
        }

        write(
            level,
            prefix,
            message
        );
    };
}

// ─────────────────────────────────────────────────────────────
// SPECIAL MASTER LOGGER
// ─────────────────────────────────────────────────────────────

function master(prefix, message) {

    if (message === undefined) {

        message = prefix;
        prefix = "MASTER";
    }

    const meta =
        PALETTE.master;

    const line =
        `${timestamp()} ` +
        `${brand()} ` +
        `${colors.bold(colors.hex(meta.color, "★"))} ` +
        `${colors.bold(colors.hex(meta.color, "MASTER".padEnd(8, " ")))} ` +
        `${separator()} ` +
        `${formatPrefix(prefix, meta.color)} ` +
        `${separator()} ` +
        `${colors.bold(colors.hex("#f8fafc", String(message)))}`;

    process.stderr.write(
        `\r\x1b[K${line}\n`
    );
}

// ─────────────────────────────────────────────────────────────
// LOGGER METHODS
// ─────────────────────────────────────────────────────────────

const logError =
    build("error", "ERROR");

const logWarn =
    build("warn", "WARN");

const logInfo =
    build("info", "INFO");

const logSuccess =
    build("success", "SUCCESS");

// ─────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────

module.exports = {

    err: logError,
    error: logError,

    warn: logWarn,
    warning: logWarn,

    info: logInfo,

    succes: logSuccess,
    success: logSuccess,

    master,

    // Extra access
    write,

    PALETTE,
    SYMBOLS,
    TZ

};