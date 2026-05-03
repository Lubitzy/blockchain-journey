import { ethers } from "ethers";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import * as dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const artifactPath = join(__dirname, "../artifacts/contracts/LubiToken.sol/LubiToken.json");
const artifact = JSON.parse(readFileSync(artifactPath, "utf-8"));

async function main() {
    // Connect ke Sepolia via Alchemy
    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("🌐 Network: Sepolia Testnet");
    console.log("👛 Deploying dari:", wallet.address);

    // Cek balance
    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

    if (balance === 0n) {
        console.log("❌ Balance kosong! Minta ETH dari faucet dulu.");
        return;
    }

    console.log("\n⏳ Deploying LubiToken ke Sepolia...");

    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    const token = await factory.deploy();

    console.log("⏳ Menunggu konfirmasi blockchain...");
    await token.waitForDeployment();

    const address = await token.getAddress();
    console.log("✅ LubiToken deployed ke:", address);
    console.log("\n🔍 Lihat di Etherscan:");
    console.log(`https://sepolia.etherscan.io/address/${address}`);
    console.log("\n🪙 Token details:");
    console.log("Name  :", await token.name());
    console.log("Symbol:", await token.symbol());
    console.log("Supply:", ethers.formatEther(await token.totalSupply()), "LUBI");
}

main().catch(console.error);