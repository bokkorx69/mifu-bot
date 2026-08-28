"use strict";

const path = require("path");

const {
    colors
} = require("../../func/colors.js");

const {
    log,
    createOraDots,
    getText
} = global.utils;


/* ============================================================
 * DATABASE INITIALIZATION
 * ========================================================== */

module.exports = async function (api, createLine) {

    /* ========================================================
     * LOAD DATABASE
     * ====================================================== */

    console.log("");

    global.utils.banner.section(
        "DATABASE",
        {
            accent: "#86efac",
            subtitle:
                "Loading thread, user and dashboard data"
        }
    );

    const controllerPath = path.join(
        __dirname,
        "..",
        "..",
        "database",
        "controller",
        "index.js"
    );

    const controller =
        await require(controllerPath)(api);

    const {
        threadModel,
        userModel,
        dashBoardModel,
        globalModel,
        threadsData,
        usersData,
        dashBoardData,
        globalData,
        sequelize,
        bankData,
        staiHistoryData
    } = controller;


    /* ========================================================
     * DATABASE LOAD STATUS
     * ====================================================== */

    const allThreadData =
        global.db?.allThreadData || [];

    const allUserData =
        global.db?.allUserData || [];

    const validThreadCount =
        allThreadData.filter(
            thread =>
                thread?.threadID != null &&
                thread.threadID
                    .toString()
                    .length > 15
        ).length;

    log.info(
        "DATABASE",
        getText(
            "loadData",
            "loadThreadDataSuccess",
            validThreadCount
        )
    );

    log.info(
        "DATABASE",
        getText(
            "loadData",
            "loadUserDataSuccess",
            allUserData.length
        )
    );


    /* ========================================================
     * AUTO SYNC
     * ====================================================== */

    const autoSyncEnabled =
        api &&
        global.GoatBot?.config?.database
            ?.autoSyncWhenStart === true;

    if (autoSyncEnabled) {

        console.log("");

        global.utils.banner.section(
            "AUTO SYNC",
            {
                accent: "#c4b5fd",
                subtitle:
                    "Refreshing thread data from Facebook"
            }
        );

        const spin =
            createOraDots(
                getText(
                    "loadData",
                    "refreshingThreadData"
                )
            );

        try {

            /* ------------------------------------------------
             * Reduce FCA logging during sync
             * ---------------------------------------------- */

            api.setOptions({
                logLevel: "silent"
            });

            spin._start();


            /* ------------------------------------------------
             * Prepare thread data
             * ---------------------------------------------- */

            const threadDataWillSet = [];

            const localThreadData = [
                ...allThreadData
            ];


            /* ------------------------------------------------
             * Get Facebook thread list
             * ---------------------------------------------- */

            const allThreadInfo =
                await api.getThreadList(
                    9999999,
                    null,
                    "INBOX"
                );


            /* ------------------------------------------------
             * Sync every thread
             * ---------------------------------------------- */

            for (
                const threadInfo
                of allThreadInfo
            ) {

                if (!threadInfo?.threadID) {
                    continue;
                }


                /* --------------------------------------------
                 * New group thread
                 * ---------------------------------------- */

                const existingIndex =
                    localThreadData.findIndex(
                        thread =>
                            thread.threadID ===
                            threadInfo.threadID
                    );

                const isNewGroup =
                    threadInfo.isGroup &&
                    existingIndex === -1;


                if (isNewGroup) {

                    const created =
                        await threadsData.create(
                            threadInfo.threadID,
                            threadInfo
                        );

                    threadDataWillSet.push(
                        created
                    );

                }

                /* --------------------------------------------
                 * Existing thread
                 * ---------------------------------------- */

                else {

                    const refreshed =
                        await threadsData.refreshInfo(
                            threadInfo.threadID,
                            threadInfo
                        );

                    if (existingIndex !== -1) {
                        localThreadData.splice(
                            existingIndex,
                            1
                        );
                    }

                    threadDataWillSet.push(
                        refreshed
                    );
                }


                /* --------------------------------------------
                 * Mark first message received
                 * ---------------------------------------- */

                if (
                    !global.db.receivedTheFirstMessage
                ) {
                    global.db.receivedTheFirstMessage = {};
                }

                global.db.receivedTheFirstMessage[
                    threadInfo.threadID
                ] = true;
            }


            /* =================================================
             * THREADS WHERE BOT IS NO LONGER PRESENT
             * =============================================== */

            const allThreadDataDontHaveBot =
                localThreadData.filter(
                    thread =>
                        !allThreadInfo.some(
                            thread1 =>
                                thread.threadID ===
                                thread1.threadID
                        )
                );


            /* ------------------------------------------------
             * Current bot ID
             * ---------------------------------------------- */

            const botID =
                api.getCurrentUserID();


            /* ------------------------------------------------
             * Mark bot as removed from old groups
             * ---------------------------------------------- */

            for (
                const thread
                of allThreadDataDontHaveBot
            ) {

                if (
                    !Array.isArray(
                        thread.members
                    )
                ) {
                    continue;
                }

                const findMe =
                    thread.members.find(
                        member =>
                            member.userID == botID
                    );

                if (findMe) {

                    findMe.inGroup = false;

                    await threadsData.set(
                        thread.threadID,
                        {
                            members:
                                thread.members
                        }
                    );
                }
            }


            /* =================================================
             * UPDATE GLOBAL THREAD DATABASE
             * =============================================== */

            global.db.allThreadData = [
                ...threadDataWillSet,
                ...allThreadDataDontHaveBot
            ];


            /* ------------------------------------------------
             * Stop spinner
             * ---------------------------------------------- */

            spin._stop();


            /* ------------------------------------------------
             * Sync success
             * ---------------------------------------------- */

            log.info(
                "DATABASE",
                getText(
                    "loadData",
                    "refreshThreadDataSuccess",
                    global.db.allThreadData.length
                )
            );

        }

        catch (err) {

            /* ------------------------------------------------
             * Always stop spinner on error
             * ---------------------------------------------- */

            spin._stop();

            log.error(
                "DATABASE",
                getText(
                    "loadData",
                    "refreshThreadDataError"
                ),
                err
            );
        }

        finally {

            /* ------------------------------------------------
             * Restore original FCA log level
             * ---------------------------------------------- */

            api.setOptions({
                logLevel:
                    global.GoatBot.config
                        .optionsFca
                        .logLevel
            });
        }
    }


    /* ========================================================
     * STAI HISTORY DATA
     * ====================================================== */

    global.staiHistoryData = null;

    if (staiHistoryData) {
        global.staiHistoryData =
            staiHistoryData;
    }


    /* ========================================================
     * RETURN DATABASE CONTROLLER
     * ====================================================== */

    return {

        /* Models */
        threadModel:
            threadModel || null,

        userModel:
            userModel || null,

        dashBoardModel:
            dashBoardModel || null,

        globalModel:
            globalModel || null,


        /* Data managers */
        threadsData,
        usersData,
        dashBoardData,
        globalData,


        /* Database */
        sequelize,


        /* Custom data */
        bankData,
        staiHistoryData
    };
};