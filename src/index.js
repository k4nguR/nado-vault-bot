const monitor = require("./monitor");

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  🏦 Nado Vault Cap Monitor Bot");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

// Graceful shutdown
process.on("SIGINT", () => {
    console.log("\n👋 Shutting down...");
    process.exit(0);
});
process.on("SIGTERM", () => {
    console.log("\n👋 Shutting down...");
    process.exit(0);
});

// Start
monitor.start().catch((err) => {
    console.error("💥 Fatal error:", err);
    process.exit(1);
});
