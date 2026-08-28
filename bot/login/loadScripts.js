"use strict";

const {
    readdirSync,
    readFileSync,
    writeFileSync,
    existsSync
} = require("fs-extra");

const path = require("path");
const { exec: childExec } = require("child_process");

const exec = (cmd, options = {}) =>
    new Promise((resolve, reject) => {
        childExec(
            cmd,
            {
                ...options,
                windowsHide: true,
                maxBuffer: 10 * 1024 * 1024
            },
            (err, stdout, stderr) => {
                if (err) {
                    err.stdout = stdout;
                    err.stderr = stderr;
                    return reject(err);
                }

                resolve(stdout);
            }
        );
    });

const {
    log,
    loading,
    getText,
    colors,
    removeHomeDir
} = global.utils;

const { GoatBot } = global;
const { configCommands } = GoatBot;

/* ============================================================
 * PACKAGE DETECTION
 * ========================================================== */

const regExpCheckPackage =
    /require\s*\(\s*[`'"]([^`'"]+)[`'"]\s*\)/g;

const packageAlready = new Set();

const spinner = [
    "⠋",
    "⠙",
    "⠹",
    "⠸",
    "⠼",
    "⠴",
    "⠦",
    "⠧",
    "⠇",
    "⠏"
];

let spinnerCount = 0;

/* ============================================================
 * PACKAGE ALIASES
 *
 * Old package -> New package
 * ========================================================== */

const packageAliasMap = {
    gifencoder: "gifencoderv2",
    "discord-image-generation": "discord-image-generation-v2"
};

/* ============================================================
 * HELPERS
 * ========================================================== */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isValidPackageName(name) {
    if (!name || typeof name !== "string") return false;

    return /^(@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(name);
}

function escapeRegExp(string) {
    return String(string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getPackageName(requirePath) {
    if (!requirePath || typeof requirePath !== "string") {
        return null;
    }

    if (
        requirePath.startsWith("/") ||
        requirePath.startsWith("./") ||
        requirePath.startsWith("../") ||
        requirePath.startsWith("node:")
    ) {
        return null;
    }

    if (requirePath.startsWith("@")) {
        return requirePath
            .split("/")
            .slice(0, 2)
            .join("/");
    }

    return requirePath.split("/")[0];
}

function getNodeModulesPath(packageName) {
    return path.join(
        process.cwd(),
        "node_modules",
        ...packageName.split("/")
    );
}

function isPackageInstalled(packageName) {
    try {
        return existsSync(getNodeModulesPath(packageName));
    } catch {
        return false;
    }
}

function updateCachedScript(folder, fileName, content) {
    if (
        global.temp &&
        global.temp.contentScripts &&
        global.temp.contentScripts[folder]
    ) {
        global.temp.contentScripts[folder][fileName] = content;
    }
}

function clearLoadingLine() {
    try {
        process.stderr.write("\r\x1b[K");
    } catch {}
}

/* ============================================================
 * PACKAGE INSTALLER
 * ========================================================== */

async function installPackage(packageName, text, fileName) {
    if (!isValidPackageName(packageName)) {
        throw new Error(
            `Invalid package name "${packageName}"`
        );
    }

    if (isPackageInstalled(packageName)) {
        return;
    }

    if (packageAlready.has(packageName)) {
        return;
    }

    packageAlready.add(packageName);

    const wait = setInterval(() => {
        loading.info(
            "PACKAGE",
            `${spinner[spinnerCount % spinner.length]} Installing ` +
            `${colors.yellow(packageName)} for ${text} ` +
            `${colors.yellow(fileName)}`
        );

        spinnerCount++;
    }, 80);

    try {
        await exec(
            `npm install ${packageName} --${
                fileName.endsWith(".dev.js")
                    ? "no-save"
                    : "save"
            }`,
            {
                cwd: process.cwd()
            }
        );

        clearInterval(wait);
        clearLoadingLine();

        log.success(
            "PACKAGE",
            `Installed ${colors.green(packageName)}`
        );
    } catch (error) {
        clearInterval(wait);
        clearLoadingLine();

        packageAlready.delete(packageName);

        log.err(
            "PACKAGE",
            `Failed to install ${colors.red(packageName)}`
        );

        if (error.stderr) {
            console.error(error.stderr);
        }

        throw new Error(
            `Can't install package ${packageName}`
        );
    }
}

/* ============================================================
 * PACKAGE MIGRATION
 * ========================================================== */

async function migratePackage(
    filePath,
    fileName,
    oldName,
    newName,
    folder
) {
    if (!isValidPackageName(oldName)) {
        return;
    }

    if (!isValidPackageName(newName)) {
        throw new Error(
            `Invalid replacement package "${newName}"`
        );
    }

    /* --------------------------------------------------------
     * 1. Rewrite require/import
     * ------------------------------------------------------ */

    try {
        const original = readFileSync(
            filePath,
            "utf8"
        );

        const packageRegex = new RegExp(
            `(['"\`])${escapeRegExp(oldName)}` +
            `(/[^'"\`]*)?\\1`,
            "g"
        );

        const rewritten = original.replace(
            packageRegex,
            (_match, quote, sub = "") => {
                return `${quote}${newName}${sub}${quote}`;
            }
        );

        if (rewritten !== original) {
            writeFileSync(
                filePath,
                rewritten,
                "utf8"
            );

            updateCachedScript(
                folder,
                fileName,
                rewritten
            );

            log.warn(
                "PACKAGE UPDATE",
                `${colors.yellow(fileName)} → ` +
                `rewrote ${colors.red(oldName)} ` +
                `to ${colors.green(newName)}`
            );
        }
    } catch (error) {
        log.err(
            "PACKAGE UPDATE",
            `Failed to rewrite ${fileName}: ${error.message}`
        );

        throw error;
    }

    /* --------------------------------------------------------
     * 2. Install replacement
     * ------------------------------------------------------ */

    await installPackage(
        newName,
        "replacement package",
        fileName
    );

    /* --------------------------------------------------------
     * 3. Remove deprecated package
     * ------------------------------------------------------ */

    if (isPackageInstalled(oldName)) {
        try {
            await exec(
                `npm uninstall ${oldName}`,
                {
                    cwd: process.cwd()
                }
            );

            log.success(
                "PACKAGE",
                `Removed deprecated ${colors.red(oldName)}`
            );
        } catch (error) {
            log.warn(
                "PACKAGE",
                `Could not uninstall ${oldName}: ${error.message}`
            );
        }
    }
}

/* ============================================================
 * EXTRACT PACKAGES
 * ========================================================== */

function extractPackages(content) {
    if (!content || typeof content !== "string") {
        return [];
    }

    const packages = [];
    let match;

    regExpCheckPackage.lastIndex = 0;

    while (
        (match = regExpCheckPackage.exec(content))
    ) {
        const packageName = getPackageName(match[1]);

        if (
            packageName &&
            !packages.includes(packageName)
        ) {
            packages.push(packageName);
        }
    }

    regExpCheckPackage.lastIndex = 0;

    return packages;
}

/* ============================================================
 * VALIDATE COMMAND
 * ========================================================== */

function validateCommand(
    command,
    text,
    fileName
) {
    if (!command) {
        throw new Error(
            `Failed to load ${text}`
        );
    }

    const configCommand = command.config;

    if (!configCommand) {
        throw new Error(
            `config of ${text} undefined`
        );
    }

    if (!configCommand.category) {
        throw new Error(
            `category of ${text} undefined`
        );
    }

    if (!configCommand.name) {
        throw new Error(
            `name of ${text} undefined`
        );
    }

    if (
        !command.onStart &&
        !command.ST
    ) {
        throw new Error(
            `onStart or ST function of ${text} is required`
        );
    }

    if (
        command.onStart &&
        typeof command.onStart !== "function"
    ) {
        throw new Error(
            `onStart of ${text} must be a function`
        );
    }

    if (
        command.ST &&
        typeof command.ST !== "function"
    ) {
        throw new Error(
            `ST of ${text} must be a function`
        );
    }

    return configCommand;
}

/* ============================================================
 * ALIAS HANDLER
 * ========================================================== */

function registerAliases(
    configCommand,
    commandName,
    text,
    pathCommand
) {
    const aliases = configCommand.aliases;

    if (!aliases) {
        return [];
    }

    if (!Array.isArray(aliases)) {
        throw new Error(
            'The value of "config.aliases" must be array!'
        );
    }

    const validAliases = [];

    for (const alias of aliases) {
        if (
            typeof alias !== "string" ||
            !alias.trim()
        ) {
            throw new Error(
                `Invalid alias in ${text} "${commandName}"`
            );
        }

        if (
            aliases.filter(
                item => item === alias
            ).length > 1
        ) {
            throw new Error(
                `alias "${alias}" duplicate in ${text} ` +
                `"${commandName}" with file ` +
                `"${removeHomeDir(pathCommand)}"`
            );
        }

        if (
            GoatBot.aliases.has(alias)
        ) {
            throw new Error(
                `alias "${alias}" already exists in ${text} ` +
                `"${GoatBot.aliases.get(alias)}" with file ` +
                `"${removeHomeDir(
                    GoatBot.commands.get(
                        GoatBot.aliases.get(alias)
                    )?.location || ""
                )}"`
            );
        }

        validAliases.push(alias);
    }

    for (const alias of validAliases) {
        GoatBot.aliases.set(
            alias,
            commandName
        );
    }

    return validAliases;
}

/* ============================================================
 * ENV GLOBAL
 * ========================================================== */

function processEnvGlobal(
    envGlobal,
    configCommand,
    pathCommand
) {
    if (!envGlobal) {
        return;
    }

    if (
        typeof envGlobal !== "object" ||
        Array.isArray(envGlobal)
    ) {
        throw new Error(
            'the value of "envGlobal" must be object'
        );
    }

    for (const key of Object.keys(envGlobal)) {
        const defaultValue =
            envGlobal[key];

        if (
            configCommands.envGlobal[key] === undefined
        ) {
            configCommands.envGlobal[key] =
                defaultValue;
        } else {
            try {
                const currentContent =
                    readFileSync(
                        pathCommand,
                        "utf8"
                    );

                const updated =
                    currentContent.replace(
                        String(defaultValue),
                        String(
                            configCommands.envGlobal[key]
                        )
                    );

                if (updated !== currentContent) {
                    writeFileSync(
                        pathCommand,
                        updated,
                        "utf8"
                    );
                }
            } catch (error) {
                log.warn(
                    "ENV GLOBAL",
                    `Could not update ${key}: ${error.message}`
                );
            }
        }
    }
}

/* ============================================================
 * ENV CONFIG
 * ========================================================== */

function processEnvConfig(
    envConfig,
    commandName,
    typeEnvCommand,
    pathCommand
) {
    if (!envConfig) {
        return;
    }

    if (
        typeof envConfig !== "object" ||
        Array.isArray(envConfig)
    ) {
        throw new Error(
            'the value of "envConfig" must be object'
        );
    }

    if (
        !configCommands[typeEnvCommand]
    ) {
        configCommands[typeEnvCommand] = {};
    }

    if (
        !configCommands[typeEnvCommand][commandName]
    ) {
        configCommands[typeEnvCommand][commandName] = {};
    }

    for (
        const [key, value]
        of Object.entries(envConfig)
    ) {
        if (
            configCommands[typeEnvCommand][commandName][key] ===
            undefined
        ) {
            configCommands[typeEnvCommand][commandName][key] =
                value;
        } else {
            try {
                const currentContent =
                    readFileSync(
                        pathCommand,
                        "utf8"
                    );

                const updated =
                    currentContent.replace(
                        String(value),
                        String(
                            configCommands[typeEnvCommand][commandName][key]
                        )
                    );

                if (updated !== currentContent) {
                    writeFileSync(
                        pathCommand,
                        updated,
                        "utf8"
                    );
                }
            } catch (error) {
                log.warn(
                    "ENV CONFIG",
                    `Could not update ${key}: ${error.message}`
                );
            }
        }
    }
}

/* ============================================================
 * REGISTER HOOKS
 * ========================================================== */

function registerHooks(
    command,
    commandName
) {
    const {
        onFirstChat,
        onChat,
        onEvent,
        onAnyEvent
    } = command;

    if (onChat) {
        if (
            !Array.isArray(
                GoatBot.onChat
            )
        ) {
            GoatBot.onChat = [];
        }

        if (
            !GoatBot.onChat.includes(
                commandName
            )
        ) {
            GoatBot.onChat.push(
                commandName
            );
        }
    }

    if (onFirstChat) {
        if (
            !Array.isArray(
                GoatBot.onFirstChat
            )
        ) {
            GoatBot.onFirstChat = [];
        }

        if (
            !GoatBot.onFirstChat.some(
                item =>
                    item.commandName ===
                    commandName
            )
        ) {
            GoatBot.onFirstChat.push({
                commandName,
                threadIDsChattedFirstTime: []
            });
        }
    }

    if (onEvent) {
        if (
            !Array.isArray(
                GoatBot.onEvent
            )
        ) {
            GoatBot.onEvent = [];
        }

        if (
            !GoatBot.onEvent.includes(
                commandName
            )
        ) {
            GoatBot.onEvent.push(
                commandName
            );
        }
    }

    if (onAnyEvent) {
        if (
            !Array.isArray(
                GoatBot.onAnyEvent
            )
        ) {
            GoatBot.onAnyEvent = [];
        }

        if (
            !GoatBot.onAnyEvent.includes(
                commandName
            )
        ) {
            GoatBot.onAnyEvent.push(
                commandName
            );
        }
    }
}

/* ============================================================
 * MAIN LOADER
 * ========================================================== */

module.exports = async function (
    api,
    threadModel,
    userModel,
    dashBoardModel,
    globalModel,
    threadsData,
    usersData,
    dashBoardData,
    globalData,
    createLine
) {

    /* ========================================================
     * LOAD CUSTOM ALIASES
     * ====================================================== */

    const aliasesData =
        await globalData.get(
            "setalias",
            "data",
            []
        );

    if (Array.isArray(aliasesData)) {
        for (const data of aliasesData) {
            const {
                aliases,
                commandName
            } = data || {};

            if (!Array.isArray(aliases)) {
                continue;
            }

            for (const alias of aliases) {
                if (
                    GoatBot.aliases.has(alias)
                ) {
                    throw new Error(
                        `Alias "${alias}" already exists in command "${commandName}"`
                    );
                }

                GoatBot.aliases.set(
                    alias,
                    commandName
                );
            }
        }
    }

    /* ========================================================
     * COMMANDS + EVENTS
     * ====================================================== */

    const folders = [
        "cmds",
        "events"
    ];

    for (
        const folderModules
        of folders
    ) {

        const isCommandFolder =
            folderModules === "cmds";

        const headline =
            isCommandFolder
                ? "LOAD COMMANDS"
                : "LOAD EVENTS";

        console.log("");

        global.utils.banner.section(
            headline,
            {
                accent: "#7dd3fc",
                subtitle:
                    isCommandFolder
                        ? "Discovering and registering bot commands"
                        : "Discovering and registering event handlers"
            }
        );

        const text =
            isCommandFolder
                ? "command"
                : "event command";

        const typeEnvCommand =
            isCommandFolder
                ? "envCommands"
                : "envEvents";

        const setMap =
            isCommandFolder
                ? "commands"
                : "eventCommands";

        const unloadKey =
            isCommandFolder
                ? "commandUnload"
                : "commandEventUnload";

        const fullPathModules =
            path.normalize(
                path.join(
                    process.cwd(),
                    "scripts",
                    folderModules
                )
            );

        if (
            !existsSync(
                fullPathModules
            )
        ) {
            log.warn(
                "LOADER",
                `Folder not found: ${removeHomeDir(fullPathModules)}`
            );
            continue;
        }

        const unloadList =
            configCommands[
                unloadKey
            ] || [];

        const Files =
            readdirSync(
                fullPathModules
            )
                .filter(file =>
                    file.endsWith(".js") &&
                    !file.endsWith("eg.js") &&
                    !/(dev)\.js$/i.test(file) &&
                    !unloadList.includes(file)
                );

        const commandError = [];
        let commandLoadSuccess = 0;

        /* ====================================================
         * FILE LOOP
         * ================================================== */

        for (
            const file of Files
        ) {

            const pathCommand =
                path.normalize(
                    path.join(
                        fullPathModules,
                        file
                    )
                );

            try {

                /* ============================================
                 * READ FILE
                 * ======================================== */

                let contentFile =
                    readFileSync(
                        pathCommand,
                        "utf8"
                    );

                /* ============================================
                 * CHECK PACKAGES
                 * ======================================== */

                const packages =
                    extractPackages(
                        contentFile
                    );

                for (
                    let packageName
                    of packages
                ) {

                    /* ========================================
                     * PACKAGE ALIAS MIGRATION
                     * ==================================== */

                    if (
                        packageAliasMap[
                            packageName
                        ]
                    ) {

                        const newName =
                            packageAliasMap[
                                packageName
                            ];

                        await migratePackage(
                            pathCommand,
                            file,
                            packageName,
                            newName,
                            folderModules
                        );

                        contentFile =
                            readFileSync(
                                pathCommand,
                                "utf8"
                            );

                        packageName =
                            newName;
                    }

                    /* ========================================
                     * INSTALL PACKAGE
                     * ==================================== */

                    if (
                        !packageAlready.has(
                            packageName
                        )
                    ) {

                        if (
                            !isPackageInstalled(
                                packageName
                            )
                        ) {
                            await installPackage(
                                packageName,
                                text,
                                file
                            );
                        } else {
                            packageAlready.add(
                                packageName
                            );
                        }
                    }
                }

                /* ============================================
                 * CACHE CONTENT
                 * ======================================== */

                if (
                    !global.temp
                ) {
                    global.temp = {};
                }

                if (
                    !global.temp.contentScripts
                ) {
                    global.temp.contentScripts = {};
                }

                if (
                    !global.temp.contentScripts[
                        folderModules
                    ]
                ) {
                    global.temp.contentScripts[
                        folderModules
                    ] = {};
                }

                global.temp.contentScripts[
                    folderModules
                ][file] = contentFile;

                /* ============================================
                 * LOAD COMMAND
                 * ======================================== */

                delete require.cache[
                    require.resolve(
                        pathCommand
                    )
                ];

                const command =
                    require(pathCommand);

                command.location =
                    pathCommand;

                /* ============================================
                 * VALIDATE
                 * ======================================== */

                const configCommand =
                    validateCommand(
                        command,
                        text,
                        file
                    );

                const commandName =
                    configCommand.name;

                /* ============================================
                 * DUPLICATE COMMAND
                 * ======================================== */

                if (
                    GoatBot[
                        setMap
                    ].has(
                        commandName
                    )
                ) {
                    throw new Error(
                        `${text} "${commandName}" already exists with file ` +
                        `"${removeHomeDir(
                            GoatBot[
                                setMap
                            ].get(
                                commandName
                            ).location || ""
                        )}"`
                    );
                }

                /* ============================================
                 * CONFIG
                 * ======================================== */

                const {
                    envGlobal,
                    envConfig
                } = configCommand;

                /* ============================================
                 * ALIASES
                 * ======================================== */

                const validAliases =
                    registerAliases(
                        configCommand,
                        commandName,
                        text,
                        pathCommand
                    );

                /* ============================================
                 * ENV GLOBAL
                 * ======================================== */

                processEnvGlobal(
                    envGlobal,
                    configCommand,
                    pathCommand
                );

                /* ============================================
                 * ENV CONFIG
                 * ======================================== */

                processEnvConfig(
                    envConfig,
                    commandName,
                    typeEnvCommand,
                    pathCommand
                );

                /* ============================================
                 * ON LOAD
                 * ======================================== */

                if (
                    command.onLoad
                ) {

                    if (
                        typeof command.onLoad !==
                        "function"
                    ) {
                        throw new Error(
                            'The value of "onLoad" must be function'
                        );
                    }

                    await command.onLoad({
                        api,
                        threadModel,
                        userModel,
                        dashBoardModel,
                        globalModel,
                        threadsData,
                        usersData,
                        dashBoardData,
                        globalData
                    });
                }

                /* ============================================
                 * ST VALIDATION
                 * ======================================== */

                if (
                    command.ST &&
                    typeof command.ST !==
                    "function"
                ) {
                    throw new Error(
                        'The value of "ST" must be function'
                    );
                }

                /* ============================================
                 * REGISTER HOOKS
                 * ======================================== */

                registerHooks(
                    command,
                    commandName
                );

                /* ============================================
                 * REGISTER COMMAND
                 * ======================================== */

                GoatBot[
                    setMap
                ].set(
                    commandName.toLowerCase(),
                    command
                );

                commandLoadSuccess++;

                /* ============================================
                 * FILE PATH REGISTRY
                 * ======================================== */

                const filesPathKey =
                    isCommandFolder
                        ? "commandFilesPath"
                        : "eventCommandsFilesPath";

                if (
                    !Array.isArray(
                        GoatBot[
                            filesPathKey
                        ]
                    )
                ) {
                    GoatBot[
                        filesPathKey
                    ] = [];
                }

                GoatBot[
                    filesPathKey
                ].push({
                    filePath:
                        path.normalize(
                            pathCommand
                        ),
                    commandName: [
                        commandName,
                        ...validAliases
                    ]
                });

            } catch (error) {

                commandError.push({
                    name: file,
                    error
                });

            }

            /* ================================================
             * LOADING STATUS
             * ============================================== */

            loading.info(
                "LOADED",
                `${colors.green(
                    commandLoadSuccess
                )}${
                    commandError.length
                        ? `, ${colors.red(
                            commandError.length
                        )}`
                        : ""
                }`
            );
        }

        console.log("\r");

        /* ====================================================
         * ERROR REPORT
         * ================================================== */

        if (
            commandError.length > 0
        ) {

            log.err(
                "LOADED",
                getText(
                    "loadScripts",
                    "loadScriptsError",
                    colors.yellow(text)
                )
            );

            for (
                const item
                of commandError
            ) {

                console.log(
                    ` ${colors.red(
                        "✖ " + item.name
                    )}: ${
                        item.error?.message ||
                        "Unknown error"
                    }\n`,
                    item.error
                );
            }

        } else {

            log.success(
                "LOADED",
                `${colors.green(
                    commandLoadSuccess
                )} ${text}${
                    commandLoadSuccess !== 1
                        ? "s"
                        : ""
                } loaded successfully`
            );
        }
    }

    /* ========================================================
     * FINAL SUMMARY
     * ====================================================== */

    try {
        const commandCount =
            GoatBot.commands?.size || 0;

        const eventCount =
            GoatBot.eventCommands?.size || 0;

        log.success(
            "LOADER",
            `Commands: ${colors.green(commandCount)} | ` +
            `Events: ${colors.green(eventCount)} | ` +
            `Packages: ${colors.green(packageAlready.size)}`
        );
    } catch {}
};