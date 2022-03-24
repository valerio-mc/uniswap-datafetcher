const { ethers, BigNumber } = require("ethers");
const secrets = require('./secrets.json');
const IUniswapV3Pool = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
const dfd = require("danfojs-node")

const provider = new ethers.providers.JsonRpcProvider(secrets.urlPolygon);
const wallet = new ethers.Wallet(secrets.keeper);
const signer = wallet.connect(provider);

// Polygon - wETH/USDC pool address
const poolAddress = "0x45dda9cb7c25131df268515131f647d726f50608";

async function main(){
    console.log("### Starting Uniswap-DataFetcher ###");
    let blockNumber = await provider.getBlockNumber();
    let poolInterface = new ethers.utils.Interface(IUniswapV3Pool.abi);
    let halfdays = 1;
    let windowSize = 20000;
    let rawDataFrame = [];
    let header = ["blockNumber", "USDC", "wETH", "tick"]

    for(let step = halfdays; step > 0; step--){
        console.log("Current block: ", blockNumber);
        console.log("fromBlock: ", blockNumber - (step*windowSize));
        console.log("toBlock: ", blockNumber - (step-1)*windowSize);

        let filter = {
            address: poolAddress,
            // 20'000 blocks is roughly equivalent to 11h and gives approximately 5k events and is 
            fromBlock: blockNumber - (step*windowSize),
            toBlock: blockNumber - (step-1)*windowSize,
            topic: "Swap(address, address, int256, int256, uint160, uint128, int24)"
        }

        const logs = await provider.getLogs(filter);

        for(i in logs){
            let swap = poolInterface.parseLog(logs[i]);
            if(swap.args.tick != undefined){
                rawDataFrame.push([logs[i].blockNumber, 
                    parseFloat(ethers.utils.formatEther(swap.args.amount0.mul(10**12))), 
                    parseFloat(ethers.utils.formatEther(swap.args.amount1)), 
                    swap.args.tick]);
            }
        }
    }

    let df = new dfd.DataFrame(rawDataFrame, {columns: header})
    df.toCSV({ filePath: "wETH_USDC_pool.csv"});
    console.log(df.shape);
}

main();
