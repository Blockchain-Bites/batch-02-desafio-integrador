// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IUniSwapV2Router02 {
    function addLiquidity(
        address tokenUSDCBTKN,
        address tokenUSDC,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);

    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    
    function getAmountIn(
        uint amountOut,
        uint reserveIn,
        uint reserveOut
    ) external returns (uint amountIn);
    

    // Conozco la cantidad de tokens B que quiero obtener
    // No sé cuántos tokens A voy a pagar
    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

}


interface IUniswapV2Factory {
    function getPair(
        address tokenUSDCBTKN,
        address tokenUSDC
    ) external view returns (address pair);
}

interface IUniswapV2Pair {
  function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}