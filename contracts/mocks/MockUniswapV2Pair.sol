pragma solidity 0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";

contract MockUniswapV2Pair is ERC20, ERC20Detailed {
    constructor(uint256 _totalSupply) public ERC20Detailed("Uniswap V2", "UNI-V2", 18) {
        _mint(msg.sender, _totalSupply);
    }
}
