import { ethers } from "ethers";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load artifacts
const tokenArtifact = JSON.parse(readFileSync(join(__dirname, "../artifacts/contracts/LubiToken.sol/LubiToken.json"), "utf-8"));
const airdropArtifact = JSON.parse(readFileSync(join(__dirname, "../artifacts/contracts/LubiAirdrop.sol/LubiAirdrop.json"), "utf-8"));

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const owner = await provider.getSigner(0);
    const user1 = await provider.getSigner(1);
    const user2 = await provider.getSigner(2);
    const user3 = await provider.getSigner(3);
    const user4 = await provider.getSigner(4); // tidak ada di whitelist

    console.log("👑 Owner :", await owner.getAddress());
    console.log("👤 User1 :", await user1.getAddress());
    console.log("👤 User2 :", await user2.getAddress());
    console.log("👤 User3 :", await user3.getAddress());
    console.log("❌ User4 :", await user4.getAddress(), "(not whitelisted)");

    // ═══════════════════════════════════════
    // STEP 1: Build Merkle Tree dari whitelist
    // ═══════════════════════════════════════
    console.log("\n🌳 Building Merkle Tree...");

    const whitelist = [
        [await user1.getAddress()],
        [await user2.getAddress()],
        [await user3.getAddress()],
    ];

    const tree = StandardMerkleTree.of(whitelist, ["address"]);
    const merkleRoot = tree.root;

    console.log("✅ Merkle Root:", merkleRoot);
    console.log("👥 Whitelisted wallets:", whitelist.length);

    // ═══════════════════════════════════════
    // STEP 2: Deploy LubiToken
    // ═══════════════════════════════════════
    console.log("\n🪙 Deploying LubiToken...");
    const tokenFactory = new ethers.ContractFactory(tokenArtifact.abi, tokenArtifact.bytecode, owner);
    const token = await tokenFactory.deploy();
    await token.waitForDeployment();
    console.log("✅ LubiToken deployed ke:", await token.getAddress());

    // ═══════════════════════════════════════
    // STEP 3: Deploy LubiAirdrop contract
    // ═══════════════════════════════════════
    console.log("\n🎁 Deploying LubiAirdrop...");
    const claimAmount = ethers.parseEther("100"); // 100 LUBI per claim

    const airdropFactory = new ethers.ContractFactory(airdropArtifact.abi, airdropArtifact.bytecode, owner);
    const airdrop = await airdropFactory.deploy(
        await token.getAddress(),
        merkleRoot,
        claimAmount
    );
    await airdrop.waitForDeployment();
    console.log("✅ LubiAirdrop deployed ke:", await airdrop.getAddress());

    // ═══════════════════════════════════════
    // STEP 4: Fund airdrop contract dengan token
    // ═══════════════════════════════════════
    console.log("\n💰 Funding airdrop contract dengan 10,000 LUBI...");
    const fundTx = await token.connect(owner).transfer(
        await airdrop.getAddress(),
        ethers.parseEther("10000")
    );
    await fundTx.wait();

    const remaining = await airdrop.remainingTokens();
    console.log("✅ Token di airdrop contract:", ethers.formatEther(remaining), "LUBI");

    // ═══════════════════════════════════════
    // STEP 5: Claim airdrop untuk setiap wallet
    // ═══════════════════════════════════════
    console.log("\n🤖 Bot mulai claim airdrop untuk semua whitelisted wallet...");

    const signers = {
        [await user1.getAddress()]: user1,
        [await user2.getAddress()]: user2,
        [await user3.getAddress()]: user3,
    };

    for (const [i, v] of tree.entries()) {
        const address = v[0];
        const proof = tree.getProof(i);
        const signer = signers[address];

        if (!signer) continue;

        console.log(`\n📋 Claiming untuk: ${address}`);
        console.log("🔑 Proof:", proof.slice(0, 1), "...");

        const balanceBefore = await token.balanceOf(address);

        const claimTx = await airdrop.connect(signer).claim(proof);
        await claimTx.wait();

        const balanceAfter = await token.balanceOf(address);
        console.log("✅ Claim berhasil!");
        console.log("💰 Balance sebelum:", ethers.formatEther(balanceBefore), "LUBI");
        console.log("💰 Balance setelah:", ethers.formatEther(balanceAfter), "LUBI");
    }

    // ═══════════════════════════════════════
    // STEP 6: Test wallet yang TIDAK whitelisted
    // ═══════════════════════════════════════
    console.log("\n❌ Test User4 claim (tidak whitelisted)...");
    try {
        const fakeProof = [];
        await airdrop.connect(user4).claim(fakeProof);
    } catch (err) {
        console.log("✅ Berhasil ditolak:", err.message.includes("Invalid proof") ? "Invalid proof! You are not whitelisted." : err.message);
    }

    // ═══════════════════════════════════════
    // STEP 7: Test double claim
    // ═══════════════════════════════════════
    console.log("\n❌ Test User1 claim dua kali...");
    try {
        const proof = tree.getProof(0);
        await airdrop.connect(user1).claim(proof);
    } catch (err) {
        console.log("✅ Berhasil ditolak:", err.message.includes("Already claimed") ? "Already claimed!" : err.message);
    }

    // Summary
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 AIRDROP SUMMARY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Total whitelisted :", whitelist.length, "wallets");
    console.log("Claim per wallet  :", ethers.formatEther(claimAmount), "LUBI");
    console.log("Total distributed :", ethers.formatEther(claimAmount * BigInt(whitelist.length)), "LUBI");
    console.log("Sisa di contract  :", ethers.formatEther(await airdrop.remainingTokens()), "LUBI");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch(console.error);