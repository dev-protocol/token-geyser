pragma solidity 0.5.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";

contract MockDev is ERC20, ERC20Detailed {
    constructor(uint256 _totalSupply) public ERC20Detailed("Dev", "DEV", 18) {
        _mint(msg.sender, _totalSupply);
    }
}
