"use strict";

/*
╔══════════════════════════════════════════════════════════════╗
║                    ♡︎ BOKKOR ♡︎                              ║
║              ANSI + TRUECOLOR SYSTEM                        ║
╚══════════════════════════════════════════════════════════════╝
*/

const HEX_RE = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

const ESC = "\x1b[";
const RESET = "\x1b[0m";

// ─────────────────────────────────────────────────────────────
// HEX UTILITIES
// ─────────────────────────────────────────────────────────────

const isHexColor = (color) =>
    typeof color === "string" && HEX_RE.test(color);

const expandHex = (hex) => {
    if (hex.length === 4) {
        return (
            "#" +
            hex[1] + hex[1] +
            hex[2] + hex[2] +
            hex[3] + hex[3]
        );
    }

    return hex;
};

const hexToRgb = (hex) => {
    const h = expandHex(hex);

    return [
        parseInt(h.slice(1, 3), 16),
        parseInt(h.slice(3, 5), 16),
        parseInt(h.slice(5, 7), 16)
    ];
};

// ─────────────────────────────────────────────────────────────
// ANSI WRAPPER
// ─────────────────────────────────────────────────────────────

const wrap = (open, close = 0) => (text) =>
    `${ESC}${open}m${text}${ESC}${close}m`;

// ─────────────────────────────────────────────────────────────
// ANSI SGR COLORS
// ─────────────────────────────────────────────────────────────

const SGR = {

    // ── Text Styles ──────────────────────────────────────────

    bold:          [1, 22],
    dim:           [2, 22],
    italic:        [3, 23],
    underline:     [4, 24],
    inverse:       [7, 27],
    hidden:        [8, 28],
    strikethrough: [9, 29],

    // ── Normal Colors ────────────────────────────────────────

    black:   [30, 39],
    red:     [31, 39],
    green:   [32, 39],
    yellow:  [33, 39],
    blue:    [34, 39],
    magenta: [35, 39],
    cyan:    [36, 39],
    white:   [37, 39],

    gray:    [90, 39],
    grey:    [90, 39],

    default: [39, 39],
    reset:   [0, 0],

    // ── Bright Colors ────────────────────────────────────────

    blackBright:   [90, 39],
    redBright:     [91, 39],
    greenBright:   [92, 39],
    yellowBright:  [93, 39],
    blueBright:    [94, 39],
    magentaBright: [95, 39],
    cyanBright:    [96, 39],
    whiteBright:   [97, 39],

    // ── Background Colors ────────────────────────────────────

    bgBlack:   [40, 49],
    bgRed:     [41, 49],
    bgGreen:   [42, 49],
    bgYellow:  [43, 49],
    bgBlue:    [44, 49],
    bgMagenta: [45, 49],
    bgCyan:    [46, 49],
    bgWhite:   [47, 49],

    bgGray:    [100, 49],
    bgGrey:    [100, 49],

    // ── Bright Backgrounds ───────────────────────────────────

    bgBlackBright:   [100, 49],
    bgRedBright:     [101, 49],
    bgGreenBright:   [102, 49],
    bgYellowBright:  [103, 49],
    bgBlueBright:    [104, 49],
    bgMagentaBright: [105, 49],
    bgCyanBright:    [106, 49],
    bgWhiteBright:   [107, 49]
};

// ─────────────────────────────────────────────────────────────
// TRUECOLOR
// ─────────────────────────────────────────────────────────────

const buildHex = (color, text) => {

    if (!isHexColor(color)) {
        return String(text ?? color);
    }

    const [r, g, b] = hexToRgb(color);

    return (
        `${ESC}38;2;${r};${g};${b}m` +
        `${text}` +
        RESET
    );
};

const buildBgHex = (color, text) => {

    if (!isHexColor(color)) {
        return String(text ?? color);
    }

    const [r, g, b] = hexToRgb(color);

    return (
        `${ESC}48;2;${r};${g};${b}m` +
        `${text}` +
        RESET
    );
};

// ─────────────────────────────────────────────────────────────
// COLOR FUNCTIONS
// ─────────────────────────────────────────────────────────────

const colorFunctions = {};

for (const [name, [open, close]] of Object.entries(SGR)) {
    colorFunctions[name] = wrap(open, close);
}

// ─────────────────────────────────────────────────────────────
// HEX FOREGROUND
// ─────────────────────────────────────────────────────────────

colorFunctions.hex = function hex(color, text) {

    // hex("Hello", "#ff00ff")
    if (isHexColor(text)) {
        [color, text] = [text, color];
    }

    // hex("#ff00ff", "Hello")
    if (text != null) {
        return buildHex(color, text);
    }

    // hex("Hello")("#ff00ff")
    if (!isHexColor(color)) {

        const cached = color;

        return (c) => buildHex(c, cached);
    }

    // hex("#ff00ff")("Hello")
    return (t) => buildHex(color, t);
};

// ─────────────────────────────────────────────────────────────
// HEX BACKGROUND
// ─────────────────────────────────────────────────────────────

colorFunctions.bgHex = function bgHex(color, text) {

    // bgHex("Hello", "#111111")
    if (isHexColor(text)) {
        [color, text] = [text, color];
    }

    // bgHex("#111111", "Hello")
    if (text != null) {
        return buildBgHex(color, text);
    }

    // bgHex("Hello")("#111111")
    if (!isHexColor(color)) {

        const cached = color;

        return (c) => buildBgHex(c, cached);
    }

    // bgHex("#111111")("Hello")
    return (t) => buildBgHex(color, t);
};

// ─────────────────────────────────────────────────────────────
// MAIN COLORS OBJECT
// ─────────────────────────────────────────────────────────────

const colors = {};

colors.bold = colorFunctions.bold;

for (const key of Object.keys(colorFunctions)) {

    const fn = colorFunctions[key];

    colors[key] = fn;

    if (key === "bold") {
        continue;
    }

    /*
     * colors.red.bold("ERROR")
     * colors.bold.red("ERROR")
     */

    colors[key].bold = (text, color) =>
        colorFunctions.bold(fn(text, color));

    colors.bold[key] = (text, color) =>
        colorFunctions.bold(fn(text, color));
}

// ─────────────────────────────────────────────────────────────
// ♡︎ BOKKOR BRAND COLORS
// ─────────────────────────────────────────────────────────────

colors.bokkor = (text) =>
    colors.hex("#ff4fd8")(`♡︎ ${text} ♡︎`);

colors.brand = colors.bokkor;

colors.title = (text) =>
    colors.bold(
        colors.hex("#ff4fd8")(`♡︎ ${text} ♡︎`)
    );

colors.heading = (text) =>
    colors.bold(
        colors.hex("#00eaff")(`♡︎ ${text} ♡︎`)
    );

// ─────────────────────────────────────────────────────────────
// STATUS COLORS
// ─────────────────────────────────────────────────────────────

colors.success = (text) =>
    colors.greenBright(`♡︎ ${text} ♡︎`);

colors.ok = colors.success;

colors.error = (text) =>
    colors.redBright(`♡︎ ${text} ♡︎`);

colors.fail = colors.error;

colors.warning = (text) =>
    colors.yellowBright(`♡︎ ${text} ♡︎`);

colors.warn = colors.warning;

colors.info = (text) =>
    colors.cyanBright(`♡︎ ${text} ♡︎`);

colors.debug = (text) =>
    colors.magentaBright(`♡︎ ${text} ♡︎`);

colors.muted = (text) =>
    colors.gray(`♡︎ ${text} ♡︎`);

// ─────────────────────────────────────────────────────────────
// SPECIAL BOKKOR LOG STYLES
// ─────────────────────────────────────────────────────────────

colors.login = (text) =>
    colors.bold(
        colors.hex("#7c4dff")(`♡︎ LOGIN │ ${text} ♡︎`)
    );

colors.api = (text) =>
    colors.bold(
        colors.hex("#00e5ff")(`♡︎ API │ ${text} ♡︎`)
    );

colors.database = (text) =>
    colors.bold(
        colors.hex("#00ff9d")(`♡︎ DATABASE │ ${text} ♡︎`)
    );

colors.command = (text) =>
    colors.bold(
        colors.hex("#ffcc00")(`♡︎ COMMAND │ ${text} ♡︎`)
    );

colors.loading = (text) =>
    colors.bold(
        colors.hex("#ff66c4")(`♡︎ LOADING │ ${text} ♡︎`)
    );

// ─────────────────────────────────────────────────────────────
// BOKKOR HEADER
// ─────────────────────────────────────────────────────────────

colors.header = () => {

    const line = colors.hex("#ff4fd8")(
        "♡︎────────────────────────────────────────♡︎"
    );

    const title = colors.bold(
        colors.hex("#ff4fd8")("♡︎ BOKKOR ♡︎")
    );

    return `${line}\n${title}\n${line}`;
};

// ─────────────────────────────────────────────────────────────
// BOKKOR BOX
// ─────────────────────────────────────────────────────────────

colors.box = (text) => {

    const line = colors.hex("#ff4fd8")(
        "♡︎────────────────────────────────────────♡︎"
    );

    const body = colors.white(text);

    return `${line}\n${body}\n${line}`;
};

// ─────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────

module.exports = {
    isHexColor,
    expandHex,
    hexToRgb,
    colors
};