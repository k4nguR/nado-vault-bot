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
 * Uses MarkdownV2 for rich formatting.
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
 * Format a number with commas and 2 decimal places.
 */
function fmt(numStr) {
    const n = parseFloat(numStr);
    return n.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/**
 * Send the startup notification with current vault status.
 */
async function sendStartupNotification(data) {
    const lines = [
        `🚀 <b>Nado Vault Monitor Started</b>`,
        ``,
        `📊 <b>Current Vault Status</b>`,
        `├ Total TVL: <code>${fmt(data.tvl.totalBalance)} ${data.tvl.symbol}</code>`,
        `├ Clearinghouse: <code>${fmt(data.tvl.clearinghouseBalance)} ${data.tvl.symbol}</code>`,
        `├ Endpoint: <code>${fmt(data.tvl.endpointBalance)} ${data.tvl.symbol}</code>`,
        `├ Insurance: <code>${fmt(data.insurance)}</code>`,
        `└ NLP Pools: <code>${data.pools.length}</code>`,
    ];

    if (data.pools.length > 0) {
        lines.push(``);
        lines.push(`🏦 <b>NLP Pools</b>`);
        data.pools.forEach((pool, i) => {
            const prefix = i === data.pools.length - 1 ? "└" : "├";
            lines.push(
                `${prefix} Pool #${pool.poolId}: weight <code>${pool.balanceWeightX18}</code> | owner <code>${pool.owner.slice(0, 8)}…</code>`
            );
        });
    }

    lines.push(``);
    lines.push(`⛓ Block: <code>${data.blockNumber}</code>`);
    lines.push(`🕐 ${data.timestamp}`);

    await sendMessage(lines.join("\n"));
}

/**
 * Send a change notification.
 */
async function sendChangeNotification(changes, newData) {
    const lines = [
        `🔔 <b>Nado Vault Change Detected!</b>`,
        ``,
    ];

    for (const change of changes) {
        lines.push(`${change}`);
    }

    lines.push(``);
    lines.push(`📊 <b>Updated Status</b>`);
    lines.push(`├ Total TVL: <code>${fmt(newData.tvl.totalBalance)} ${newData.tvl.symbol}</code>`);
    lines.push(`├ Clearinghouse: <code>${fmt(newData.tvl.clearinghouseBalance)} ${newData.tvl.symbol}</code>`);
    lines.push(`├ Endpoint: <code>${fmt(newData.tvl.endpointBalance)} ${newData.tvl.symbol}</code>`);
    lines.push(`└ NLP Pools: <code>${newData.pools.length}</code>`);
    lines.push(``);
    lines.push(`⛓ Block: <code>${newData.blockNumber}</code>`);
    lines.push(`🕐 ${newData.timestamp}`);

    await sendMessage(lines.join("\n"));
}

module.exports = {
    init,
    sendMessage,
    sendStartupNotification,
    sendChangeNotification,
    fmt,
};
