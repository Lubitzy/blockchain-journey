# 🔗 Blockchain Journey

> Personal blockchain development portfolio — from Node.js backend developer to Web3 engineer.

## 👨‍💻 About

A backend developer (Node.js) transitioning into **Blockchain Development**.  
Focused on smart contract development, on-chain automation, and DeFi tooling.

Currently building real projects on Ethereum — from local development to live testnet deployments.

## 🛠️ Tech Stack

- **Smart Contract**: Solidity, OpenZeppelin
- **Development**: Hardhat v3, Ethers.js v6
- **Network**: Ethereum, Sepolia Testnet
- **Backend**: Node.js, JavaScript (ES Module)

## 📦 Projects

### 1. 🏦 SimpleBank

A decentralized banking smart contract built on Ethereum.

- Deposit & withdraw ETH
- Balance tracking per wallet using `mapping`
- Event emission on every transaction
- `onlyOwner` modifier for access control

**Concepts**: Solidity, mapping, events, modifiers, payable functions

---

### 2. 🪙 LubiToken (LUBI) — Live on Sepolia!

A custom ERC-20 token deployed to Ethereum Sepolia testnet.

- Total initial supply: 1,000,000 LUBI
- Max supply cap: 10,000,000 LUBI (inflation-resistant)
- Owner-controlled mint with supply cap enforcement
- Public burn mechanism for deflationary tokenomics
- **Live Contract**: [`0x7b99e25E48B38843B172C4599Da45F9718140a00`](https://sepolia.etherscan.io/address/0x7b99e25E48B38843B172C4599Da45F9718140a00)

**Concepts**: ERC-20 standard, OpenZeppelin, tokenomics, mint/burn

---

### 3. 🤖 Wallet Monitor Bot

A 24/7 on-chain automation bot that monitors wallet activity in real time.

- Detects incoming & outgoing ETH transfers instantly
- Block polling mechanism for reliable detection
- Easily configurable for any wallet address

**Concepts**: Ethers.js, block polling, provider, transaction monitoring

---

### 4. 🔍 Token Monitor Bot

An advanced monitoring bot that tracks both ETH and ERC-20 transfers simultaneously.

- Decodes Transfer events directly from smart contract logs
- Monitors multiple asset types in a single bot
- Transaction receipt analysis for deep on-chain visibility

**Concepts**: Event decoding, transaction receipt, Transfer topic, log parsing

---

### 5. 🎁 LubiAirdrop — Merkle Tree Airdrop System

A gas-efficient airdrop contract using Merkle Tree for whitelist verification.

- Merkle Tree whitelist — supports unlimited wallets with single root hash
- Double-claim protection per wallet
- Bot automation for multi-wallet claiming
- Owner controls: pause, resume, withdraw remaining tokens

**Concepts**: Merkle Tree, MerkleProof, gas optimization, airdrop mechanics

## 🚀 Getting Started

```bash
# Clone repository
git clone https://github.com/Lubitzy/blockchain-journey.git
cd blockchain-journey

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Fill in ALCHEMY_URL and PRIVATE_KEY in .env

# Run local blockchain
npx hardhat node

# Deploy to local network
node scripts/deploy.js

# Deploy to Sepolia testnet
node scripts/deploySepolia.js

# Run wallet monitor bot
node scripts/walletMonitor.js

# Run token monitor bot
node scripts/tokenMonitor.js
```

## 📡 Live Deployments

| Contract         | Network         | Address                                      | Explorer                                                                                                                                                                                          |
| ---------------- | --------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LubiToken (LUBI) | Sepolia Testnet | `0x7b99e25E48B38843B172C4599Da45F9718140a00` | [View on Etherscan](https://sepolia.etherscan.io/address/0x7b99e25E48B38843B172C4599Da45F9718140a00)                                                                                              |
| SimpleNFT (SNFT) | Sepolia Testnet | `0xab7A414318615e689A5c369bC256dEb34E0352e4` | [Etherscan](https://sepolia.etherscan.io/address/0xab7A414318615e689A5c369bC256dEb34E0352e4) · [OpenSea](https://testnets.opensea.io/assets/sepolia/0xab7A414318615e689A5c369bC256dEb34E0352e4/0) |

## 📈 Roadmap

- [x] Smart contract fundamentals (Solidity)
- [x] ERC-20 token development & tokenomics
- [x] On-chain automation & monitoring bots
- [x] Live deployment to Sepolia testnet
- [ ] NFT (ERC-721) development
- [ ] DeFi protocol integration (Uniswap, Aave)
- [ ] Airdrop automation bot
- [ ] Deploy to Ethereum mainnet

## 📬 Open for Work

Available for freelance blockchain projects — smart contract development, Web3 tooling, and on-chain automation.  
Feel free to reach out for collaborations or project inquiries.

---

⭐ Star this repo if you find it useful!
