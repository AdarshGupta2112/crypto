// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleDEX is ReentrancyGuard {
    address public tokenA;
    address public tokenB;
    uint256 public constant RATE = 1; // 1:1 exchange rate for simplicity

    event Swap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    constructor(address _tokenA, address _tokenB) {
        require(_tokenA != address(0), "Invalid token A address");
        require(_tokenB != address(0), "Invalid token B address");
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    function addLiquidity(uint256 amountA, uint256 amountB) external nonReentrant {
        require(amountA > 0 && amountB > 0, "Invalid amounts");
        
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountB);
    }

    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external nonReentrant returns (uint256 amountOut) {
        require(
            (tokenIn == tokenA && tokenOut == tokenB) ||
            (tokenIn == tokenB && tokenOut == tokenA),
            "Invalid token pair"
        );
        require(amountIn > 0, "Invalid amount");

        amountOut = amountIn * RATE;
        
        require(
            IERC20(tokenOut).balanceOf(address(this)) >= amountOut,
            "Insufficient liquidity"
        );

        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenOut).transfer(msg.sender, amountOut);

        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
        
        return amountOut;
    }
} 