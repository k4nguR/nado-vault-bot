const { ethers } = require("ethers");
const config = require("./config");

let provider;
let endpointContract;

/**
 * Initialize the ethers provider and Endpoint contract.
 */
function init() {
    provider = new ethers.JsonRpcProvider(config.rpcUrl);
    endpointContract = new ethers.Contract(
        config.endpointAddress,
        config.endpointAbi,
        provider
    );
}

/**
 * Fetch NLP pool data from the Endpoint contract.
 * Returns only the target pool's data plus metadata.
 */
async function getPoolData() {
    if (!provider) init();

    const [pools, blockNumber] = await Promise.all([
        endpointContract.getNlpPools(),
        provider.getBlockNumber(),
    ]);

    const allPools = pools.map((pool) => ({
        poolId: Number(pool.poolId),
        subaccount: pool.subaccount,
        owner: pool.owner,
        balanceWeightX18: ethers.formatUnits(pool.balanceWeightX18, 18),
    }));

    const targetPool = allPools.find((p) => p.poolId === config.targetPoolId);
    if (!targetPool) {
        throw new Error(`Target pool #${config.targetPoolId} not found`);
    }

    return {
        timestamp: new Date().toISOString(),
        blockNumber,
        targetPool,
        totalPools: allPools.length,
    };
}

module.exports = { init, getPoolData };
