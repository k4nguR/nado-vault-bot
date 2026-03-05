const fs = require("fs");
const path = require("path");
const config = require("./config");
const contracts = require("./contracts");
const telegram = require("./telegram");

const STATE_FILE = path.join(__dirname, "..", "state.json");

let previousState = null;

/**
 * Load previous state from disk (survives restarts).
 */
function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const raw = fs.readFileSync(STATE_FILE, "utf8");
            previousState = JSON.parse(raw);
            console.log("📂 Loaded previous state from disk");
        }
    } catch (err) {
        console.warn("⚠️ Could not load state file:", err.message);
    }
}

/**
 * Save current state to disk.
 */
function saveState(data) {
    try {
        fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.warn("⚠️ Could not save state file:", err.message);
    }
}

/**
 * Check if the target pool's cap (balanceWeightX18) has increased.
 * Returns a description string if it increased, null otherwise.
 */
function detectCapIncrease(oldData, newData) {
    const oldWeight = parseFloat(oldData.targetPool.balanceWeightX18);
    const newWeight = parseFloat(newData.targetPool.balanceWeightX18);

    if (newWeight > oldWeight) {
        return {
            oldWeight: oldData.targetPool.balanceWeightX18,
            newWeight: newData.targetPool.balanceWeightX18,
            poolId: newData.targetPool.poolId,
        };
    }

    return null;
}

/**
 * Run a single monitoring tick.
 */
async function tick() {
    try {
        console.log(`\n⏱ [${new Date().toISOString()}] Checking pool #${config.targetPoolId} cap...`);
        const data = await contracts.getPoolData();

        console.log(`   Pool #${data.targetPool.poolId} weight: ${data.targetPool.balanceWeightX18}`);
        console.log(`   Block: ${data.blockNumber}`);

        if (previousState) {
            const capChange = detectCapIncrease(previousState, data);
            if (capChange) {
                console.log(`🚨 CAP INCREASED! ${capChange.oldWeight} → ${capChange.newWeight}`);
                await telegram.sendCapIncreaseNotification(capChange, data);
            } else {
                console.log(`   No cap change.`);
            }
        }

        previousState = data;
        saveState(data);
    } catch (err) {
        console.error("❌ Error during monitoring tick:", err.message);
        try {
            await telegram.sendMessage(
                `⚠️ <b>Nado Monitor Error</b>\n\n<code>${err.message}</code>`
            );
        } catch (_) {
            /* silent */
        }
    }
}

/**
 * Start the monitoring loop.
 */
async function start() {
    loadState();
    console.log(`🔍 Monitoring pool #${config.targetPoolId} for cap increases...\n`);

    // Initial data fetch
    const data = await contracts.getPoolData();
    previousState = data;
    saveState(data);

    // Send startup notification
    await telegram.sendStartupNotification(data);

    console.log(`\n⏰ Checking every ${config.pollIntervalMs / 1000}s...`);
    setInterval(tick, config.pollIntervalMs);
}

module.exports = { start, tick, detectCapIncrease };
