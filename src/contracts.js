const { ethers } = require("ethers");
const config = require("./config");

let provider;
let endpointContract;
let clearinghouseContract;

/**
 * Initialize the ethers provider and contract instances.
 */
function init() {
    provider = new ethers.JsonRpcProvider(config.rpcUrl);
    endpointContract = new ethers.Contract(
        config.endpointAddress,
        config.endpointAbi,
        provider
    );
    clearinghouseContract = new ethers.Contract(
        config.clearinghouseAddress,
        config.clearinghouseAbi,
        provider
    );
}

/**
 * Get the USDT0 (quote) token address from the Clearinghouse.
 */
async function getQuoteToken() {
    if (!clearinghouseContract) init();
    const quoteAddress = await clearinghouseContract.getQuote();
    return new ethers.Contract(quoteAddress, config.erc20Abi, provider);
}

/**
 * Get the vault TVL — USDT0 balance held by the Clearinghouse contract.
 */
async function getVaultTvl() {
    const quoteToken = await getQuoteToken();
    const decimals = await quoteToken.decimals();
    const symbol = await quoteToken.symbol();

    // Balance held by the Clearinghouse (main vault)
    const clearinghouseBalance = await quoteToken.balanceOf(config.clearinghouseAddress);
    // Balance held by the Endpoint
    const endpointBalance = await quoteToken.balanceOf(config.endpointAddress);

    const totalBalance = clearinghouseBalance + endpointBalance;

    return {
        clearinghouseBalance: ethers.formatUnits(clearinghouseBalance, decimals),
        endpointBalance: ethers.formatUnits(endpointBalance, decimals),
        totalBalance: ethers.formatUnits(totalBalance, decimals),
        symbol,
        decimals: Number(decimals),
    };
}

/**
 * Get NLP pool information from the Endpoint contract.
 */
async function getNlpPools() {
    if (!endpointContract) init();
    try {
        const pools = await endpointContract.getNlpPools();
        return pools.map((pool) => ({
            poolId: Number(pool.poolId),
            subaccount: pool.subaccount,
            owner: pool.owner,
            balanceWeightX18: ethers.formatUnits(pool.balanceWeightX18, 18),
        }));
    } catch (err) {
        console.error("Error fetching NLP pools:", err.message);
        return [];
    }
}

/**
 * Get the insurance fund balance.
 */
async function getInsurance() {
    if (!clearinghouseContract) init();
    try {
        const insurance = await clearinghouseContract.getInsurance();
        return ethers.formatUnits(insurance, 18);
    } catch (err) {
        console.error("Error fetching insurance:", err.message);
        return "0";
    }
}

/**
 * Fetch all vault data in one call.
 */
async function getVaultData() {
    if (!provider) init();

    const [tvl, pools, insurance, blockNumber] = await Promise.all([
        getVaultTvl(),
        getNlpPools(),
        getInsurance(),
        provider.getBlockNumber(),
    ]);

    return {
        timestamp: new Date().toISOString(),
        blockNumber,
        tvl,
        pools,
        insurance,
    };
}

module.exports = { init, getVaultData, getVaultTvl, getNlpPools, getInsurance };
