import { ethers } from "ethers";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import * as dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const artifactPath = join(__dirname, "../artifacts/contracts/SimpleNFT.sol/SimpleNFT.json");
const artifact = JSON.parse(readFileSync(artifactPath, "utf-8"));

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log("🌐 Network: Sepolia Testnet");
    console.log("👛 Deploying dari:", wallet.address);

    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

    console.log("\n⏳ Deploying SimpleNFT ke Sepolia...");

    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    const nft = await factory.deploy();

    console.log("⏳ Menunggu konfirmasi blockchain...");
    await nft.waitForDeployment();

    const address = await nft.getAddress();
    console.log("✅ SimpleNFT deployed ke:", address);
    console.log("\n🔍 Lihat di Etherscan:");
    console.log(`https://sepolia.etherscan.io/address/${address}`);

    // Mint NFT pertama dengan metadata IPFS
    console.log("\n🎨 Minting NFT #0 dengan metadata IPFS...");
    const mintTx = await nft.mint(
        wallet.address,
        "ipfs://QmXYMyuvNTioSySMxxGFdsfh4ZSMN5VCM8d7VttYFyxgo4",
        { value: ethers.parseEther("0.01") }
    );

    console.log("⏳ Menunggu konfirmasi mint...");
    await mintTx.wait();

    console.log("✅ NFT #0 berhasil di-mint!");
    console.log("👤 Owner:", await nft.ownerOf(0));
    console.log("🔗 tokenURI:", await nft.tokenURI(0));
    console.log("\n🖼️  Lihat NFT di OpenSea Testnet:");
    console.log(`https://testnets.opensea.io/assets/sepolia/${address}/0`);
}

main().catch(console.error);