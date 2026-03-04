require("dotenv").config();

const config = {
  // Telegram
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHAT_ID,

  // Ink Chain
  rpcUrl: process.env.INK_RPC_URL || "https://rpc-gel.inkonchain.com",

  // Contracts
  endpointAddress: process.env.ENDPOINT_ADDRESS || "0x05ec92D78ED421f3D3Ada77FFdE167106565974E",
  clearinghouseAddress: process.env.CLEARINGHOUSE_ADDRESS || "0xD218103918C19D0A10cf35300E4CfAfbD444c5fE",

  // Monitoring
  pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || "300000", 10), // 5 minutes
  changeThresholdUsd: parseFloat(process.env.CHANGE_THRESHOLD_USD || "100"),

  // ABI fragments for the functions we need
  endpointAbi: [
    "function getNlpPools() view returns (tuple(uint64 poolId, bytes32 subaccount, address owner, uint128 balanceWeightX18)[])",
    "function clearinghouse() view returns (address)",
    "function nSubmissions() view returns (uint64)",
  ],

  clearinghouseAbi: [
    "function getQuote() view returns (address)",
    "function getInsurance() view returns (int128)",
    "function getEngineByType(uint8 engineType) view returns (address)",
  ],

  spotEngineAbi: [
    "function getBalance(uint32 productId, bytes32 subaccount) view returns (tuple(int128 amount, int128 lastCumulativeMultiplierX18))",
    "function getToken(uint32 productId) view returns (address)",
    "function getProductIds() view returns (uint32[])",
  ],

  erc20Abi: [
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
  ],
};

module.exports = config;
