const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleDEX", function () {
  let TokenA, TokenB, SimpleDEX;
  let tokenA, tokenB, dex;
  let owner, user;
  const INITIAL_SUPPLY = ethers.utils.parseEther("1000000");

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    TokenA = await ethers.getContractFactory("TokenA");
    TokenB = await ethers.getContractFactory("TokenB");
    SimpleDEX = await ethers.getContractFactory("SimpleDEX");

    tokenA = await TokenA.deploy(INITIAL_SUPPLY);
    tokenB = await TokenB.deploy(INITIAL_SUPPLY);
    dex = await SimpleDEX.deploy(tokenA.address, tokenB.address);

    // Add initial liquidity
    const liquidityAmount = ethers.utils.parseEther("1000");
    await tokenA.approve(dex.address, liquidityAmount);
    await tokenB.approve(dex.address, liquidityAmount);
    await dex.addLiquidity(liquidityAmount, liquidityAmount);
  });

  describe("Deployment", function () {
    it("Should set the right token addresses", async function () {
      expect(await dex.tokenA()).to.equal(tokenA.address);
      expect(await dex.tokenB()).to.equal(tokenB.address);
    });
  });

  describe("Swapping", function () {
    it("Should swap TokenA for TokenB", async function () {
      const swapAmount = ethers.utils.parseEther("100");
      
      // Transfer some TokenA to user
      await tokenA.transfer(user.address, swapAmount);
      
      // User approves DEX to spend TokenA
      await tokenA.connect(user).approve(dex.address, swapAmount);
      
      // Check balances before swap
      const beforeA = await tokenA.balanceOf(user.address);
      const beforeB = await tokenB.balanceOf(user.address);
      
      // Perform swap
      await dex.connect(user).swap(tokenA.address, tokenB.address, swapAmount);
      
      // Check balances after swap
      const afterA = await tokenA.balanceOf(user.address);
      const afterB = await tokenB.balanceOf(user.address);
      
      expect(beforeA.sub(afterA)).to.equal(swapAmount);
      expect(afterB.sub(beforeB)).to.equal(swapAmount);
    });
  });
}); 