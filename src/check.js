/**
 * One-time check script — fetch and print current vault data without starting the loop.
 * Usage: node src/check.js
 */
const contracts = require("./contracts");

async function main() {
    console.log("🔍 Fetching current Nado vault data...\n");
    const data = await contracts.getVaultData();
    console.log(JSON.stringify(data, null, 2));
}

main().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
});
