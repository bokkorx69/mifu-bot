"use strict";

const { colors } = require("../func/colors.js");

// ╭────────────────────────────────────────────────────────────╮
// │                    ♡︎ BOKKOR ♡︎                           │
// │                  CONSOLE UI SYSTEM                        │
// ╰────────────────────────────────────────────────────────────╯

// ─────────────────────────────────────────────────────────────
// ACCENT COLORS
// ─────────────────────────────────────────────────────────────

const ACCENTS = {

    primary:   "#7dd3fc",
    secondary: "#c4b5fd",

    success:   "#86efac",
    warn:      "#fcd34d",
    danger:    "#fca5a5",

    info:      "#67e8f9",
    pink:      "#f9a8d4",
    purple:    "#d8b4fe",
    orange:    "#fdba74",

    muted:     "#64748b",
    white:     "#f8fafc",

    border:    "#334155",
    text:      "#e2e8f0"

};

// ─────────────────────────────────────────────────────────────
// SYMBOLS
// ─────────────────────────────────────────────────────────────

const SYMBOLS = {

    brand: "♡︎ BOKKOR ♡︎",

    bullet: "•",
    diamond: "◆",
    star: "★",

    success: "✔",
    warning: "▲",
    error: "✖",
    info: "ℹ",

    left: "│",
    right: "│",

    topLeft: "╭",
    topRight: "╮",
    bottomLeft: "╰",
    bottomRight: "╯",

    horizontal: "─",
    doubleHorizontal: "═",

    separatorLeft: "├",
    separatorRight: "┤"

};

// ─────────────────────────────────────────────────────────────
// ANSI HANDLING
// ─────────────────────────────────────────────────────────────

const ANSI_RE =
    /[\u001B\u009B][[\]()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d/#&.:=?%@~_]+)*)?\u0007)|(?:(?:\d{1,4}(?:[;:]\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g;

function stripAnsi(value) {

    return String(value ?? "")
        .replace(ANSI_RE, "");
}

function visualLen(value) {

    return Array.from(
        stripAnsi(value)
    ).length;
}

// ─────────────────────────────────────────────────────────────
// WIDTH
// ─────────────────────────────────────────────────────────────

function getWidth(
    value,
    min = 40,
    max = 96
) {

    const width =
        Number(value) || 64;

    return Math.min(
        Math.max(width, min),
        max
    );
}

// ─────────────────────────────────────────────────────────────
// PADDING
// ─────────────────────────────────────────────────────────────

function pad(
    text,
    width,
    align = "left"
) {

    text = String(text ?? "");

    const len =
        visualLen(text);

    if (len >= width) {
        return text;
    }

    const spaces =
        width - len;

    if (align === "right") {

        return (
            " ".repeat(spaces) +
            text
        );
    }

    if (align === "center") {

        const left =
            Math.floor(spaces / 2);

        const right =
            spaces - left;

        return (
            " ".repeat(left) +
            text +
            " ".repeat(right)
        );
    }

    return (
        text +
        " ".repeat(spaces)
    );
}

// ─────────────────────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────────────────────

function hex(color, text) {

    return colors.hex(
        color,
        String(text ?? "")
    );
}

function bold(text) {

    return colors.bold(
        String(text ?? "")
    );
}

// ─────────────────────────────────────────────────────────────
// BRAND
// ─────────────────────────────────────────────────────────────

function brand(
    accent = ACCENTS.pink
) {

    return bold(
        hex(
            accent,
            SYMBOLS.brand
        )
    );
}

// ─────────────────────────────────────────────────────────────
// BORDER
// ─────────────────────────────────────────────────────────────

function border(
    type = "single",
    accent = ACCENTS.border,
    width = 64
) {

    width = getWidth(
        width,
        20,
        120
    );

    let line;

    if (type === "double") {

        line =
            SYMBOLS.doubleHorizontal
                .repeat(width);

    } else {

        line =
            SYMBOLS.horizontal
                .repeat(width);
    }

    console.log(
        hex(accent, line)
    );
}

// ─────────────────────────────────────────────────────────────
// SECTION
// ─────────────────────────────────────────────────────────────

function section(
    title,
    opts = {}
) {

    title =
        String(title || "BOKKOR");

    const accent =
        opts.accent ||
        ACCENTS.primary;

    const subtitle =
        opts.subtitle ||
        "";

    const symbol =
        opts.symbol ||
        SYMBOLS.diamond;

    const width =
        getWidth(opts.width);

    const innerW =
        width - 2;

    const titlePart =
        `─${symbol} ${title} `;

    const remaining =
        Math.max(
            innerW -
            visualLen(titlePart) -
            1,
            0
        );

    const top =
        "╭" +
        titlePart +
        "─".repeat(remaining) +
        "╮";

    const bottom =
        "╰" +
        "─".repeat(innerW) +
        "╯";

    console.log(
        hex(accent, top)
    );

    if (subtitle) {

        const content =
            " " +
            hex(
                ACCENTS.muted,
                subtitle
            );

        console.log(
            hex(accent, "│") +
            pad(
                content,
                innerW
            ) +
            hex(accent, "│")
        );
    }

    console.log(
        hex(accent, bottom)
    );
}

// ─────────────────────────────────────────────────────────────
// BANNER
// ─────────────────────────────────────────────────────────────

function banner(
    opts = {}
) {

    const accent =
        opts.accent ||
        ACCENTS.secondary;

    const width =
        getWidth(opts.width);

    const title =
        String(
            opts.title ||
            SYMBOLS.brand
        );

    const subtitle =
        String(
            opts.subtitle ||
            ""
        );

    const lines =
        Array.isArray(opts.lines)
            ? opts.lines
            : [];

    const innerW =
        width - 2;

    const top =
        "╭" +
        "─".repeat(innerW) +
        "╮";

    const bottom =
        "╰" +
        "─".repeat(innerW) +
        "╯";

    const separator =
        "├" +
        "─".repeat(innerW) +
        "┤";

    // ── Wrapper ──────────────────────────────────────────────

    const wrap = (
        content = ""
    ) => {

        content =
            String(content);

        const available =
            innerW - 2;

        const len =
            visualLen(content);

        const right =
            Math.max(
                available - len,
                0
            );

        return (
            hex(accent, "│") +
            " " +
            content +
            " ".repeat(right) +
            " " +
            hex(accent, "│")
        );
    };

    // ── Top ──────────────────────────────────────────────────

    console.log(
        hex(accent, top)
    );

    // ── Brand / Title ────────────────────────────────────────

    console.log(
        wrap(
            pad(
                bold(
                    hex(
                        accent,
                        title
                    )
                ),
                innerW - 2,
                "center"
            )
        )
    );

    // ── Subtitle ─────────────────────────────────────────────

    if (subtitle) {

        console.log(
            wrap(
                pad(
                    hex(
                        ACCENTS.muted,
                        subtitle
                    ),
                    innerW - 2,
                    "center"
                )
            )
        );
    }

    // ── Lines ────────────────────────────────────────────────

    if (lines.length) {

        console.log(
            hex(
                accent,
                separator
            )
        );

        for (
            const line of lines
        ) {

            if (
                line === null ||
                line === undefined
            ) {

                console.log(
                    wrap("")
                );

                continue;
            }

            console.log(
                wrap(
                    String(line)
                )
            );
        }
    }

    // ── Bottom ───────────────────────────────────────────────

    console.log(
        hex(
            accent,
            bottom
        )
    );
}

// ─────────────────────────────────────────────────────────────
// STATUS
// ─────────────────────────────────────────────────────────────

function status(
    label,
    text,
    type = "info"
) {

    const config = {

        success: {
            icon: SYMBOLS.success,
            color: ACCENTS.success
        },

        ok: {
            icon: SYMBOLS.success,
            color: ACCENTS.success
        },

        warn: {
            icon: SYMBOLS.warning,
            color: ACCENTS.warn
        },

        warning: {
            icon: SYMBOLS.warning,
            color: ACCENTS.warn
        },

        danger: {
            icon: SYMBOLS.error,
            color: ACCENTS.danger
        },

        error: {
            icon: SYMBOLS.error,
            color: ACCENTS.danger
        },

        info: {
            icon: SYMBOLS.info,
            color: ACCENTS.info
        },

        muted: {
            icon: SYMBOLS.bullet,
            color: ACCENTS.muted
        },

        primary: {
            icon: SYMBOLS.diamond,
            color: ACCENTS.primary
        }

    };

    const meta =
        config[type] ||
        config.info;

    const icon =
        bold(
            hex(
                meta.color,
                meta.icon
            )
        );

    const name =
        bold(
            hex(
                meta.color,
                String(label || "STATUS")
            )
        );

    const message =
        hex(
            ACCENTS.text,
            text
        );

    console.log(
        `${icon} ${name} ${hex(ACCENTS.muted, "│")} ${message}`
    );
}

// ─────────────────────────────────────────────────────────────
// SPLASH
// ─────────────────────────────────────────────────────────────

function splash(
    opts = {}
) {

    const accent =
        opts.accent ||
        ACCENTS.pink;

    const width =
        getWidth(opts.width);

    const innerW =
        width - 2;

    const title =
        SYMBOLS.brand;

    const subtitle =
        opts.subtitle ||
        "";

    const top =
        "╭" +
        "─".repeat(innerW) +
        "╮";

    const bottom =
        "╰" +
        "─".repeat(innerW) +
        "╯";

    const titleText =
        pad(
            bold(
                hex(
                    accent,
                    title
                )
            ),
            innerW,
            "center"
        );

    console.log(
        hex(
            accent,
            top
        )
    );

    console.log(
        hex(accent, "│") +
        titleText +
        hex(accent, "│")
    );

    if (subtitle) {

        const subText =
            pad(
                hex(
                    ACCENTS.muted,
                    subtitle
                ),
                innerW,
                "center"
            );

        console.log(
            hex(accent, "│") +
            subText +
            hex(accent, "│")
        );
    }

    console.log(
        hex(
            accent,
            bottom
        )
    );
}

// ─────────────────────────────────────────────────────────────
// SIMPLE RULE
// ─────────────────────────────────────────────────────────────

function rule(
    accent = ACCENTS.muted,
    width = 64
) {

    border(
        "single",
        accent,
        width
    );
}

// ─────────────────────────────────────────────────────────────
// DOUBLE RULE
// ─────────────────────────────────────────────────────────────

function doubleRule(
    accent = ACCENTS.primary,
    width = 64
) {

    border(
        "double",
        accent,
        width
    );
}

// ─────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────

module.exports = {

    section,
    banner,

    rule,
    doubleRule,

    status,
    splash,
    brand,

    pad,
    visualLen,
    stripAnsi,

    getWidth,

    ACCENTS,
    SYMBOLS

};