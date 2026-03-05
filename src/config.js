require("dotenv").config();

const config = {
  // Telegram
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHAT_ID,

  // Ink Chain
  rpcUrl: process.env.INK_RPC_URL || "https://rpc-gel.inkonchain.com",

  // Contracts
  endpointAddress: process.env.ENDPOINT_ADDRESS || "0x05ec92D78ED421f3D3Ada77FFdE167106565974E",

  // Monitoring
  pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || "300000", 10), // 5 minutes
  targetPoolId: parseInt(process.env.TARGET_POOL_ID || "0", 10),

  // ABI – only what we need: getNlpPools from the Endpoint
  endpointAbi: [
    "function getNlpPools() view returns (tuple(uint64 poolId, bytes32 subaccount, address owner, uint128 balanceWeightX18)[])",
  ],
};

module.exports = config;
