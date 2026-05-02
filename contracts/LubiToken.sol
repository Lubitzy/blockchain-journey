// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LubiToken is ERC20, Ownable {
    // Maksimal supply: 10 juta LUBI — tidak bisa dilewati
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10 ** 18;

    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    constructor() ERC20("LubiToken", "LUBI") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    // Mint dengan cap — tidak bisa melebihi MAX_SUPPLY
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Melebihi max supply!");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    // Siapa saja bisa burn token MEREKA SENDIRI
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }
}