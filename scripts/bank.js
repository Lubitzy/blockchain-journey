import { ethers } from "ethers";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const artifactPath = join(__dirname, "../artifacts/contracts/SimpleBank.sol/SimpleBank.json");
const artifact = JSON.parse(readFileSync(artifactPath, "utf-8"));

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Ambil 2 akun test — owner dan user biasa
    const owner = await provider.getSigner(0);
    const user = await provider.getSigner(1);

    console.log("👑 Owner:", await owner.getAddress());
    console.log("👤 User :", await user.getAddress());

    // Deploy contract
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, owner);
    const bank = await factory.deploy();
    await bank.waitForDeployment();
    console.log("\n✅ SimpleBank deployed ke:", await bank.getAddress());

    // LISTEN EVENT secara realtime
    // Ini fondasi bot kamu nanti!
    bank.on("Deposited", (user, amount) => {
        console.log(`\n🔔 EVENT: ${user} deposit ${ethers.formatEther(amount)} ETH`);
    });

    const contractBalance = await provider.getBalance(await bank.getAddress());
    console.log("💰 ETH di dalam contract:", ethers.formatEther(contractBalance), "ETH");

    bank.on("Withdrawn", (user, amount) => {
        console.log(`\n🔔 EVENT: ${user} withdraw ${ethers.formatEther(amount)} ETH`);
    });

    // User deposit 1 ETH
    console.log("\n💰 User melakukan deposit 1 ETH...");
    const depositTx = await bank.connect(user).deposit({
        value: ethers.parseEther("1.0")
    });
    await depositTx.wait();

    // Cek saldo user
    const balance = await bank.connect(user).getBalance();
    console.log("💳 Saldo user:", ethers.formatEther(balance), "ETH");

    // Owner cek saldo user (pakai onlyOwner function)
    const balanceOf = await bank.connect(owner).getBalanceOf(await user.getAddress());
    console.log("🔍 Owner cek saldo user:", ethers.formatEther(balanceOf), "ETH");

    // User withdraw 0.5 ETH
    console.log("\n💸 User melakukan withdraw 0.5 ETH...");
    const withdrawTx = await bank.connect(user).withdraw(ethers.parseEther("0.5"));
    await withdrawTx.wait();

    // Cek saldo akhir
    const finalBalance = await bank.connect(user).getBalance();
    console.log("💳 Saldo akhir user:", ethers.formatEther(finalBalance), "ETH");

    // Tunggu sebentar biar event sempat masuk
    await new Promise(resolve => setTimeout(resolve, 2000));
    process.exit(0);
}

main().catch(console.error);