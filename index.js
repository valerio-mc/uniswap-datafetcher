const { ethers } = require("ethers");
const secrets = require('./secrets.json');
const IUniswapV3Pool = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json")

const provider = new ethers.providers.JsonRpcProvider(secrets.urlPolygon);
const wallet = new ethers.Wallet(secrets.keeper);
const signer = wallet.connect(provider);

const poolAddress = "0x45dda9cb7c25131df268515131f647d726f50608";


async function main(){
    console.log("### Starting Uniswap-DataFetcher ###");

}

main();
