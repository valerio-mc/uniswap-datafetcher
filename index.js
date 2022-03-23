const { ethers, BigNumber } = require("ethers");
const secrets = require('./secrets.json');
const IUniswapV3Pool = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");

const { convertArrayToCSV } = require('convert-array-to-csv');
const converter = require('convert-array-to-csv');

const provider = new ethers.providers.JsonRpcProvider(secrets.urlPolygon);
const wallet = new ethers.Wallet(secrets.keeper);
const signer = wallet.connect(provider);

// Polygon - wETH/USDC pool address
const poolAddress = "0x45dda9cb7c25131df268515131f647d726f50608";

async function main(){
    let dataFrame = [];
    console.log("### Starting Uniswap-DataFetcher ###");
    blockNumber = await provider.getBlockNumber();
    poolInterface = new ethers.utils.Interface(IUniswapV3Pool.abi);

    let filter = {
        address: poolAddress,
        // 20'000 blocks gives approximately 5k events
        fromBlock: blockNumber-50,
        toBlock: 'latest',
        topic: "Swap(address, address, int256, int256, uint160, uint128, int24)"
    }

    const logs = await provider.getLogs(filter);

    for(i in logs){
        let swap = poolInterface.parseLog(logs[i]);
        if(swap.args.tick != undefined){
            dataFrame.push([logs[i].blockNumber, swap.args.tick]);
        }
    }

    header = ["blockNumber", "tick"]
    console.log(dataFrame);
}

main();
