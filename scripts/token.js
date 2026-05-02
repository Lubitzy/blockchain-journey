import { ethers } from "ethers";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const artifactPath = join(__dirname, "../artifacts/contracts/LubiToken.sol/LubiToken.json");
const artifact = JSON.parse(readFileSync(artifactPath, "utf-8"));

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    const owner = await provider.getSigner(0);
    const user1 = await provider.getSigner(1);
    const user2 = await provider.getSigner(2);

    console.log("👑 Owner:", await owner.getAddress());
    console.log("👤 User1:", await user1.getAddress());
    console.log("👤 User2:", await user2.getAddress());

    // Deploy LubiToken
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, owner);
    const token = await factory.deploy();
    await token.waitForDeployment();
    console.log("\n✅ LubiToken deployed ke:", await token.getAddress());

    // Info token
    const name = await token.name();
    const symbol = await token.symbol();
    const totalSupply = await token.totalSupply();
    console.log(`\n🪙 Token: ${name} (${symbol})`);
    console.log(`📊 Total Supply: ${ethers.formatEther(totalSupply)} ${symbol}`);

    // Cek saldo owner
    const ownerBalance = await token.balanceOf(await owner.getAddress());
    console.log(`💰 Saldo Owner: ${ethers.formatEther(ownerBalance)} ${symbol}`);

    // Transfer ke user1
    console.log("\n📤 Transfer 1000 LUBI ke User1...");
    const transferTx = await token.connect(owner).transfer(
        await user1.getAddress(),
        ethers.parseEther("1000")
    );
    await transferTx.wait();

    // Cek saldo setelah transfer
    const user1Balance = await token.balanceOf(await user1.getAddress());
    console.log(`💳 Saldo User1: ${ethers.formatEther(user1Balance)} ${symbol}`);

    // Mint token baru — hanya owner bisa
    console.log("\n🏭 Mint 500 LUBI baru ke User2...");
    const mintTx = await token.connect(owner).mint(
        await user2.getAddress(),
        ethers.parseEther("500")
    );
    await mintTx.wait();

    const user2Balance = await token.balanceOf(await user2.getAddress());
    console.log(`💳 Saldo User2: ${ethers.formatEther(user2Balance)} ${symbol}`);

    // User1 burn token mereka
    console.log("\n🔥 User1 burn 100 LUBI...");
    const burnTx = await token.connect(user1).burn(ethers.parseEther("100"));
    await burnTx.wait();

    const user1AfterBurn = await token.balanceOf(await user1.getAddress());
    console.log(`💳 Saldo User1 setelah burn: ${ethers.formatEther(user1AfterBurn)} ${symbol}`);

    // Total supply setelah burn
    const finalSupply = await token.totalSupply();
    console.log(`\n📊 Total Supply akhir: ${ethers.formatEther(finalSupply)} ${symbol}`);
    console.log("(berkurang 100 karena di-burn)");
}

main().catch(console.error);