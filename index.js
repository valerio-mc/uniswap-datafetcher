const { ethers, BigNumber } = require("ethers");
const secrets = require('./secrets.json');
const IUniswapV3Pool = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json")

const provider = new ethers.providers.JsonRpcProvider(secrets.urlPolygon);
const wallet = new ethers.Wallet(secrets.keeper);
const signer = wallet.connect(provider);

// Polygon - wETH/USDC pool address
const poolAddress = "0x45dda9cb7c25131df268515131f647d726f50608";
// Loading pool's smart contract
const PoolContract = new ethers.Contract(poolAddress, IUniswapV3Pool.abi, signer);

async function main(){
    console.log("### Starting Uniswap-DataFetcher ###");

    PoolContract.on("Swap", (sender, recipient, amount0, amount1, sqrtPriceX96, liquidity, tick) => {
        let swapPrice = new BigNumber.from(2).pow(192).mul(new BigNumber.from(10).pow(30)).div(sqrtPriceX96.pow(2));
        swapPrice = ethers.utils.formatEther(swapPrice).toString();
        console.log("A Swap occured @ price: ", swapPrice);
        console.log("Amount token 0", ethers.utils.formatEther(amount0.mul(10**12)));
        console.log("Amount token 1", ethers.utils.formatEther(amount1));
    });
    

}

main();
