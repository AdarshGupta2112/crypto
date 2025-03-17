const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Deploy TokenA
  const TokenA = await hre.ethers.getContractFactory("TokenA");
  const tokenA = await TokenA.deploy(hre.ethers.utils.parseEther("1000000"));
  await tokenA.deployed();
  console.log("TokenA deployed to:", tokenA.address);

  // Deploy TokenB
  const TokenB = await hre.ethers.getContractFactory("TokenB");
  const tokenB = await TokenB.deploy(hre.ethers.utils.parseEther("1000000"));
  await tokenB.deployed();
  console.log("TokenB deployed to:", tokenB.address);

  // Deploy SimpleDEX
  const SimpleDEX = await hre.ethers.getContractFactory("SimpleDEX");
  const dex = await SimpleDEX.deploy(tokenA.address, tokenB.address);
  await dex.deployed();
  console.log("SimpleDEX deployed to:", dex.address);

  // Save the addresses
  const addresses = {
    tokenA: tokenA.address,
    tokenB: tokenB.address,
    dex: dex.address
  };

  fs.writeFileSync(
    path.join(__dirname, "../deployed-addresses.json"),
    JSON.stringify(addresses, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 