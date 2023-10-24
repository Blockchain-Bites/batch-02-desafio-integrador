// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IUniSwapV2Router02} from "./Interfaces.sol";
import {IUniswapV2Factory} from "./Interfaces.sol";

contract LiquidityProvider {
    address routerAddress = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    IUniSwapV2Router02 router = IUniSwapV2Router02(routerAddress);

    address factoryAddress = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    IUniswapV2Factory factory = IUniswapV2Factory(factoryAddress);

    IERC20 tokenUSDCBTKN = IERC20(0xAfD52B000B5f6bB5d5C908124A25C3068a323507);
    IERC20 tokenUSDC = IERC20(0xD2DaFbF611e8a66237F2a08A97d15512003371D1);

    event LiquidityAddres(
        uint256 amountA,
        uint256 amountB,
        uint256 amountLpTokens
    );

    function addLiquidity(
        address _tokenUSDCBTKN,
        address _tokenUSDC,
        uint _amountADesired,
        uint _amountBDesired,
        uint _amountAMin,
        uint _amountBMin,
        address _to,
        uint _deadline
    ) public {
        tokenUSDCBTKN.approve(routerAddress, _amountADesired);
        tokenUSDC.approve(routerAddress, _amountBDesired);

        uint256 amountA;
        uint256 amountB;
        uint256 amountLP;
        (amountA, amountB, amountLP) = router.addLiquidity(
            _tokenUSDCBTKN,
            _tokenUSDC,
            _amountADesired,
            _amountBDesired,
            _amountAMin,
            _amountBMin,
            _to,
            _deadline
        );

        emit LiquidityAddres(amountA, amountB, amountLP);
    }

    function getPair(
        address _tokenUSDCBTKN,
        address _tokenUSDC
    ) public view returns (address) {
        return factory.getPair(_tokenUSDCBTKN, _tokenUSDC);
    }
}