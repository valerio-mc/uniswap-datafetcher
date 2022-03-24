const { ethers, BigNumber } = require("ethers");
const secrets = require('./secrets.json');
const IUniswapV3Pool = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
const dfd = require("danfojs-node");
const cliProgress = require('cli-progress');


const provider = new ethers.providers.JsonRpcProvider(secrets.urlPolygon);
const wallet = new ethers.Wallet(secrets.keeper);
const signer = wallet.connect(provider);

// Polygon - wETH/USDC pool address
const poolAddress = "0x45dda9cb7c25131df268515131f647d726f50608";

async function main(){
    console.log("### Starting Uniswap-DataFetcher ###");
    let blockNumber = await provider.getBlockNumber();
    let poolInterface = new ethers.utils.Interface(IUniswapV3Pool.abi);
    let qdays = 120; // aka quarter of a day --> 120 qdays equal to 30 days
    let windowSize = 10000;
    let rawDataFrame = [];
    let header = ["blockNumber", "USDC", "wETH", "tick"];

    // create a new progress bar instance and use shades_classic theme
    const pbar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    // start the progress bar with a total value equal to n° of halfdays and start value equal to 0
    pbar.start(qdays, 0);
    for(let step = qdays; step > 0; step--){
        let filter = {
            address: poolAddress,
            // 10'000 blocks is roughly equivalent to 5.5h and gives approximately 2.5k events 
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
        // update the current value in your application..
        pbar.update(1*(qdays - step));
    }

    // stop the progress bar
    pbar.stop();

    let df = new dfd.DataFrame(rawDataFrame, {columns: header})
    df.toCSV({ filePath: "wETH_USDC_pool.csv"});
    console.log(df.shape);
}

main();
