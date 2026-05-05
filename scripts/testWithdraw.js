import { ethers } from "ethers";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const artifactPath = join(__dirname, "../artifacts/contracts/SimpleNFT.sol/SimpleNFT.json");
const artifact = JSON.parse(readFileSync(artifactPath, "utf-8"));

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const owner = await provider.getSigner(0);
    const user1 = await provider.getSigner(1);

    // Deploy
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, owner);
    const nft = await factory.deploy();
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    console.log("✅ Deployed ke:", nftAddress);

    // Mint 1 NFT
    const mintTx = await nft.connect(user1).mint(
        await user1.getAddress(),
        "https://test.com/1",
        { value: ethers.parseEther("0.01") }
    );
    await mintTx.wait();

    // Cek balance contract
    const contractBal = await provider.getBalance(nftAddress);
    console.log("💰 Contract balance:", ethers.formatEther(contractBal), "ETH");

    // Cek owner contract
    const contractOwner = await nft.owner();
    console.log("👑 Contract owner:", contractOwner);
    console.log("👑 Signer owner :", await owner.getAddress());
    console.log("✅ Match?", contractOwner.toLowerCase() === (await owner.getAddress()).toLowerCase());

    // Withdraw
    console.log("\n💸 Withdrawing...");
    try {
        const tx = await nft.connect(owner).withdraw();
        const receipt = await tx.wait();
        console.log("Status:", receipt.status);
        console.log("Gas used:", receipt.gasUsed.toString());

        // Cek balance setelah
        const contractBalAfter = await provider.getBalance(nftAddress);
        console.log("💰 Contract balance after:", ethers.formatEther(contractBalAfter), "ETH");
    } catch (err) {
        console.error("❌ Withdraw error:", err.message);
    }
}

main().catch(console.error);