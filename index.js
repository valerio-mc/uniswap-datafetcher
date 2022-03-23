const { ethers, BigNumber } = require("ethers");
const secrets = require('./secrets.json');
const IUniswapV3Pool = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");

const provider = new ethers.providers.JsonRpcProvider(secrets.urlPolygon);
const wallet = new ethers.Wallet(secrets.keeper);
const signer = wallet.connect(provider);

// Polygon - wETH/USDC pool address
const poolAddress = "0x45dda9cb7c25131df268515131f647d726f50608";

async function main(){
    console.log("### Starting Uniswap-DataFetcher ###");
    blockNumber = await provider.getBlockNumber();
    poolInterface = new ethers.utils.Interface(IUniswapV3Pool.abi);

    let filter = {
        address: poolAddress,
        // 20'000 blocks gives approximately 5k events
        fromBlock: blockNumber-100,
        toBlock: 'latest',
        topic: "Swap(address, address, int256, int256, uint160, uint128, int24)"
    }

    const logs = await provider.getLogs(filter);

    /* for(i in logs){
        

        console.log(logs.length, " ", tx);
    }*/


    let out = poolInterface.parseLog(logs[0]);
    console.log(out.args.liquidity.toNumber());

}

main();
