const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  
  // Read deployed addresses
  const addresses = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../deployed-addresses.json"),
      "utf8"
    )
  );
  
  // Get contract instances
  const dex = await hre.ethers.getContractAt("SimpleDEX", addresses.dex);
  const tokenA = await hre.ethers.getContractAt("TokenA", addresses.tokenA);
  const tokenB = await hre.ethers.getContractAt("TokenB", addresses.tokenB);

  // Add some initial liquidity
  const liquidityAmount = hre.ethers.utils.parseEther("1000");
  console.log("Approving tokens for liquidity...");
  await tokenA.approve(dex.address, liquidityAmount);
  await tokenB.approve(dex.address, liquidityAmount);
  
  console.log("Adding liquidity...");
  await dex.addLiquidity(liquidityAmount, liquidityAmount);
  console.log("Liquidity added successfully!");

  // Perform a test swap
  const swapAmount = hre.ethers.utils.parseEther("100");
  console.log("Approving tokens for swap...");
  await tokenA.approve(dex.address, swapAmount);

  console.log("Performing swap...");
  const tx = await dex.swap(tokenA.address, tokenB.address, swapAmount);
  await tx.wait();

  console.log("Swap completed successfully!");

  // Print balances
  const tokenABalance = await tokenA.balanceOf(signer.address);
  const tokenBBalance = await tokenB.balanceOf(signer.address);
  
  console.log("Current balances:");
  console.log("TokenA:", hre.ethers.utils.formatEther(tokenABalance));
  console.log("TokenB:", hre.ethers.utils.formatEther(tokenBBalance));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 