// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SimpleBank {
    // MAPPING: seperti object JS, tapi disimpan di blockchain
    // address => uint256 artinya: "setiap wallet punya saldo"
    mapping(address => uint256) private balances;
    
    // Pemilik contract (kamu)
    address public owner;

    // EVENTS: pemberitahuan ke dunia luar saat sesuatu terjadi
    // Script Node.js bisa listen event ini!
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    // MODIFIER: seperti middleware Express.js
    // Fungsi yang pakai modifier ini hanya bisa dipanggil oleh owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Bukan owner!");
        _;
    }

    // Constructor: jalan sekali saat deploy
    constructor() {
        owner = msg.sender; // yang deploy = owner
    }

    // Deposit ETH ke bank
    // "payable" artinya fungsi ini bisa menerima ETH
    function deposit() public payable {
        require(msg.value > 0, "Harus deposit lebih dari 0");
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    // Tarik ETH dari bank
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Saldo tidak cukup");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawn(msg.sender, amount);
    }

    // Cek saldo sendiri
    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }

    // Cek saldo siapapun - hanya owner yang bisa
    function getBalanceOf(address user) public view onlyOwner returns (uint256) {
        return balances[user];
    }
}