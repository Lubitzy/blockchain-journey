// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LubiAirdrop is Ownable {
    // Token yang akan di-airdrop
    IERC20 public token;
    
    // Merkle Root — sidik jari seluruh daftar whitelist
    bytes32 public merkleRoot;
    
    // Jumlah token per claim
    uint256 public claimAmount;
    
    // Track siapa yang sudah claim — tidak boleh claim dua kali!
    mapping(address => bool) public hasClaimed;
    
    // Status airdrop
    bool public isActive;

    // Events
    event AirdropClaimed(address indexed claimant, uint256 amount);
    event AirdropStatusChanged(bool isActive);
    event MerkleRootUpdated(bytes32 newRoot);

    constructor(
        address _token,
        bytes32 _merkleRoot,
        uint256 _claimAmount
    ) Ownable(msg.sender) {
        token = IERC20(_token);
        merkleRoot = _merkleRoot;
        claimAmount = _claimAmount;
        isActive = true;
    }

    // Claim airdrop dengan Merkle Proof
    function claim(bytes32[] calldata merkleProof) external {
        require(isActive, "Airdrop is not active!");
        require(!hasClaimed[msg.sender], "Already claimed!");
        
        // Verifikasi bahwa wallet ini ada di whitelist
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender))));
        require(
            MerkleProof.verify(merkleProof, merkleRoot, leaf),
            "Invalid proof! You are not whitelisted."
        );

        // Mark sebagai sudah claim
        hasClaimed[msg.sender] = true;
        
        // Transfer token ke claimant
        require(
            token.transfer(msg.sender, claimAmount),
            "Token transfer failed!"
        );

        emit AirdropClaimed(msg.sender, claimAmount);
    }

    // Owner bisa pause/resume airdrop
    function setActive(bool _isActive) external onlyOwner {
        isActive = _isActive;
        emit AirdropStatusChanged(_isActive);
    }

    // Owner bisa update merkle root
    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
        emit MerkleRootUpdated(_merkleRoot);
    }

    // Cek sisa token di contract airdrop
    function remainingTokens() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    // Owner bisa tarik sisa token setelah airdrop selesai
    function withdrawRemainingTokens() external onlyOwner {
        uint256 remaining = token.balanceOf(address(this));
        require(remaining > 0, "No tokens to withdraw!");
        require(token.transfer(owner(), remaining), "Transfer failed!");
    }
}