const TelegramBot = require("node-telegram-bot-api");
const config = require("./config");

let bot;

/**
 * Initialize the Telegram bot (polling disabled — we only send messages).
 */
function init() {
    bot = new TelegramBot(config.telegramBotToken, { polling: false });
    console.log("✅ Telegram bot initialized");
}

/**
 * Send a text message to the configured chat.
 */
async function sendMessage(text) {
    if (!bot) init();
    try {
        await bot.sendMessage(config.telegramChatId, text, {
            parse_mode: "HTML",
            disable_web_page_preview: true,
        });
        console.log("📨 Telegram message sent");
    } catch (err) {
        console.error("❌ Failed to send Telegram message:", err.message);
    }
}

/**
 * Send the startup notification showing current pool state.
 */
async function sendStartupNotification(data) {
    const lines = [
        `🚀 <b>Nado Pool Cap Monitor Started</b>`,
        ``,
        `👁 Watching <b>Pool #${data.targetPool.poolId}</b> for cap increases`,
        `├ Current weight: <code>${data.targetPool.balanceWeightX18}</code>`,
        `├ Owner: <code>${data.targetPool.owner.slice(0, 10)}…</code>`,
        `└ Total pools: <code>${data.totalPools}</code>`,
        ``,
        `⛓ Block: <code>${data.blockNumber}</code>`,
        `🕐 ${data.timestamp}`,
    ];

    await sendMessage(lines.join("\n"));
}

/**
 * Send a notification when the pool cap increases.
 */
async function sendCapIncreaseNotification(capChange, data) {
    const lines = [
        `🚨🚨🚨 <b>POOL CAP INCREASED!</b> 🚨🚨🚨`,
        ``,
        `💰 <b>Pool #${capChange.poolId} deposits may be available!</b>`,
        ``,
        `⚖️ Weight: <code>${capChange.oldWeight}</code> → <code>${capChange.newWeight}</code>`,
        ``,
        `🔗 <a href="https://app.nado.xyz/vault">Open Nado Vault →</a>`,
        ``,
        `⛓ Block: <code>${data.blockNumber}</code>`,
        `🕐 ${data.timestamp}`,
    ];

    await sendMessage(lines.join("\n"));
}

module.exports = {
    init,
    sendMessage,
    sendStartupNotification,
    sendCapIncreaseNotification,
};
