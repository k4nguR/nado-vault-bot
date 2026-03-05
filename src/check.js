/**
 * One-time check script — fetch and print current pool data without starting the loop.
 * Usage: node src/check.js
 */
const contracts = require("./contracts");
const config = require("./config");

async function main() {
    console.log(`🔍 Fetching pool #${config.targetPoolId} data...\n`);
    const data = await contracts.getPoolData();
    console.log(JSON.stringify(data, null, 2));
}

main().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
});
