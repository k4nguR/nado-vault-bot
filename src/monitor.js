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
 * Compare two vault snapshots and return a list of change descriptions.
 */
function detectChanges(oldData, newData) {
    const changes = [];
    const threshold = config.changeThresholdUsd;

    // TVL change
    const oldTvl = parseFloat(oldData.tvl.totalBalance);
    const newTvl = parseFloat(newData.tvl.totalBalance);
    const tvlDiff = newTvl - oldTvl;

    if (Math.abs(tvlDiff) >= threshold) {
        const arrow = tvlDiff > 0 ? "📈" : "📉";
        const sign = tvlDiff > 0 ? "+" : "";
        changes.push(
            `${arrow} <b>TVL changed:</b> ${telegram.fmt(oldData.tvl.totalBalance)} → ${telegram.fmt(newData.tvl.totalBalance)} ${newData.tvl.symbol} (<code>${sign}${telegram.fmt(tvlDiff.toString())}</code>)`
        );
    }

    // Clearinghouse balance change
    const oldCh = parseFloat(oldData.tvl.clearinghouseBalance);
    const newCh = parseFloat(newData.tvl.clearinghouseBalance);
    const chDiff = newCh - oldCh;

    if (Math.abs(chDiff) >= threshold) {
        const arrow = chDiff > 0 ? "📈" : "📉";
        const sign = chDiff > 0 ? "+" : "";
        changes.push(
            `${arrow} <b>Clearinghouse:</b> ${telegram.fmt(oldData.tvl.clearinghouseBalance)} → ${telegram.fmt(newData.tvl.clearinghouseBalance)} (<code>${sign}${telegram.fmt(chDiff.toString())}</code>)`
        );
    }

    // Pool count change
    if (oldData.pools.length !== newData.pools.length) {
        changes.push(
            `🏦 <b>NLP Pool count changed:</b> ${oldData.pools.length} → ${newData.pools.length}`
        );
    }

    // Pool weight changes
    const oldPoolMap = {};
    oldData.pools.forEach((p) => (oldPoolMap[p.poolId] = p));

    for (const pool of newData.pools) {
        const oldPool = oldPoolMap[pool.poolId];
        if (!oldPool) {
            changes.push(
                `🆕 <b>New pool added:</b> Pool #${pool.poolId} (owner: <code>${pool.owner.slice(0, 10)}…</code>)`
            );
        } else if (oldPool.balanceWeightX18 !== pool.balanceWeightX18) {
            changes.push(
                `⚖️ <b>Pool #${pool.poolId} weight:</b> ${oldPool.balanceWeightX18} → ${pool.balanceWeightX18}`
            );
        }
    }

    // Check for removed pools
    const newPoolIds = new Set(newData.pools.map((p) => p.poolId));
    for (const pool of oldData.pools) {
        if (!newPoolIds.has(pool.poolId)) {
            changes.push(`🗑 <b>Pool removed:</b> Pool #${pool.poolId}`);
        }
    }

    // Insurance change
    const oldIns = parseFloat(oldData.insurance);
    const newIns = parseFloat(newData.insurance);
    const insDiff = newIns - oldIns;

    if (Math.abs(insDiff) >= threshold) {
        const sign = insDiff > 0 ? "+" : "";
        changes.push(
            `🛡 <b>Insurance:</b> ${telegram.fmt(oldData.insurance)} → ${telegram.fmt(newData.insurance)} (<code>${sign}${telegram.fmt(insDiff.toString())}</code>)`
        );
    }

    return changes;
}

/**
 * Run a single monitoring tick.
 */
async function tick() {
    try {
        console.log(`\n⏱ [${new Date().toISOString()}] Fetching vault data...`);
        const data = await contracts.getVaultData();

        console.log(`   TVL: ${data.tvl.totalBalance} ${data.tvl.symbol}`);
        console.log(`   Pools: ${data.pools.length}`);
        console.log(`   Insurance: ${data.insurance}`);
        console.log(`   Block: ${data.blockNumber}`);

        if (previousState) {
            const changes = detectChanges(previousState, data);
            if (changes.length > 0) {
                console.log(`🔔 ${changes.length} change(s) detected!`);
                await telegram.sendChangeNotification(changes, data);
            } else {
                console.log(`   No significant changes.`);
            }
        }

        previousState = data;
        saveState(data);
    } catch (err) {
        console.error("❌ Error during monitoring tick:", err.message);
        // Try to notify about the error
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
    console.log("🔍 Running initial vault check...\n");

    // Initial data fetch
    const data = await contracts.getVaultData();
    previousState = data;
    saveState(data);

    // Send startup notification
    await telegram.sendStartupNotification(data);

    console.log(`\n⏰ Monitoring every ${config.pollIntervalMs / 1000}s...`);
    setInterval(tick, config.pollIntervalMs);
}

module.exports = { start, tick, detectChanges };
