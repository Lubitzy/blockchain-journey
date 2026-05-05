// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleNFT is ERC721, Ownable {
    // Counter untuk token ID — setiap NFT punya ID unik
    uint256 private _tokenIdCounter;
    
    // Max supply NFT
    uint256 public constant MAX_SUPPLY = 100;
    
    // Harga mint per NFT
    uint256 public mintPrice = 0.01 ether;
    
    // Mapping token ID ke metadata URI
    mapping(uint256 => string) private _tokenURIs;

    // Events
    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event MintPriceUpdated(uint256 newPrice);

    constructor() ERC721("SimpleNFT", "SNFT") Ownable(msg.sender) {}

    // Mint NFT baru
    function mint(address to, string memory uri) public payable {
    require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached!");
    require(msg.value >= mintPrice, "Insufficient payment!");

    uint256 tokenId = _tokenIdCounter;
    _tokenIdCounter++;

    _safeMint(to, tokenId);
    _tokenURIs[tokenId] = uri;

    emit NFTMinted(to, tokenId, uri);
}

    // Ambil metadata URI dari token ID
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_tokenIdCounter > tokenId, "Token does not exist!");
        return _tokenURIs[tokenId];
    }

    // Cek total NFT yang sudah di-mint
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    // Owner bisa update harga mint
    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }

    // Owner bisa withdraw ETH dari hasil mint
    function withdraw() public onlyOwner {
    uint256 balance = address(this).balance;
    require(balance > 0, "Nothing to withdraw!");
    
    (bool success, ) = payable(owner()).call{value: balance}("");
    require(success, "Withdraw failed!");
    }
}