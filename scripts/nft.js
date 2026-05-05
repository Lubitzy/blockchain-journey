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
    const user2 = await provider.getSigner(2);

    console.log("👑 Owner:", await owner.getAddress());
    console.log("👤 User1:", await user1.getAddress());
    console.log("👤 User2:", await user2.getAddress());

    // Deploy SimpleNFT
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, owner);
    const nft = await factory.deploy();
    await nft.waitForDeployment();
    console.log("\n✅ SimpleNFT deployed ke:", await nft.getAddress());

    // Info collection
    console.log("\n🎨 NFT Collection Info:");
    console.log("Name      :", await nft.name());
    console.log("Symbol    :", await nft.symbol());
    console.log("Max Supply:", await nft.MAX_SUPPLY());
    console.log("Mint Price:", ethers.formatEther(await nft.mintPrice()), "ETH");

    // Mint NFT #0 untuk user1
    // Mint NFT #0 dengan metadata IPFS sungguhan!
    console.log("\n🎨 Minting NFT #0 dengan metadata IPFS...");
    const mint0 = await nft.connect(user1).mint(
        await user1.getAddress(),
        "ipfs://QmXYMyuvNTioSySMxxGFdsfh4ZSMN5VCM8d7VttYFyxgo4",
        { value: ethers.parseEther("0.01") }
    );
    await mint0.wait();
    console.log("✅ NFT #0 berhasil di-mint!");
    console.log("👤 Owner NFT #0:", await nft.ownerOf(0));
    console.log("🔗 tokenURI    :", await nft.tokenURI(0));

    // Mint NFT #1 untuk user2
    console.log("\n🎨 Minting NFT #1 untuk User2...");
    const mint1 = await nft.connect(user2).mint(
        await user2.getAddress(),
        "https://metadata.example.com/nft/1",
        { value: ethers.parseEther("0.01") }
    );
    await mint1.wait();
    console.log("✅ NFT #1 berhasil di-mint!");
    console.log("👤 Owner NFT #1:", await nft.ownerOf(1));
    console.log("🔗 Metadata    :", await nft.tokenURI(1));

    // Total supply sekarang
    console.log("\n📊 Total NFT minted:", await nft.totalSupply());

    // Cek saldo ETH di contract dari hasil mint
    const contractBalance = await provider.getBalance(await nft.getAddress());
    console.log("💰 ETH di contract:", ethers.formatEther(contractBalance), "ETH");

    // Owner withdraw hasil mint
    // Owner withdraw hasil mint
    console.log("\n💸 Owner withdraw ETH dari contract...");
    const ownerBalanceBefore = await provider.getBalance(await owner.getAddress());
    console.log("💰 Balance owner sebelum:", ethers.formatEther(ownerBalanceBefore), "ETH");

    const withdrawTx = await nft.connect(owner).withdraw();
    const receipt = await withdrawTx.wait();
    console.log("✅ Withdraw tx status:", receipt.status === 1 ? "SUCCESS" : "FAILED");

    const contractBalanceAfter = await provider.getBalance(await nft.getAddress());
    const ownerBalanceAfter = await provider.getBalance(await owner.getAddress());
    console.log("💰 ETH di contract setelah withdraw:", ethers.formatEther(contractBalanceAfter), "ETH");
    console.log("💰 Balance owner setelah:", ethers.formatEther(ownerBalanceAfter), "ETH");

    // Transfer NFT #0 dari user1 ke user2
    console.log("\n🔄 User1 transfer NFT #0 ke User2...");
    const transferTx = await nft.connect(user1).transferFrom(
        await user1.getAddress(),
        await user2.getAddress(),
        0
    );
    await transferTx.wait();

    console.log("✅ Transfer berhasil!");
    console.log("👤 Owner NFT #0 sekarang:", await nft.ownerOf(0));
    console.log("👤 Owner NFT #1 sekarang:", await nft.ownerOf(1));

    // Coba update mint price - hanya owner bisa
    console.log("\n💲 Update mint price ke 0.02 ETH...");
    const priceTx = await nft.connect(owner).setMintPrice(ethers.parseEther("0.02"));
    await priceTx.wait();
    console.log("✅ Mint price baru:", ethers.formatEther(await nft.mintPrice()), "ETH");
}

main().catch(console.error);