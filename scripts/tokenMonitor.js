import { ethers } from "ethers";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load LubiToken artifact
const artifactPath = join(__dirname, "../artifacts/contracts/LubiToken.sol/LubiToken.json");
const artifact = JSON.parse(readFileSync(artifactPath, "utf-8"));

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const WATCHED_WALLET = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

// ERC-20 Transfer event signature
const TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");

let lastBlock = null;
let tokenAddress = null;

console.log("🤖 Token Monitor Bot aktif!");
console.log("👁️  Memantau wallet:", WATCHED_WALLET);
console.log("⏳ Menunggu transaksi...\n");

async function deployToken() {
    const owner = await provider.getSigner(0);
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, owner);
    const token = await factory.deploy();
    await token.waitForDeployment();
    tokenAddress = await token.getAddress();
    console.log("✅ LubiToken deployed ke:", tokenAddress);
    console.log("🪙 Monitoring Transfer event LUBI...\n");
    return token;
}

async function checkNewBlocks() {
    try {
        const currentBlock = await provider.getBlockNumber();

        if (lastBlock === null) {
            lastBlock = currentBlock;
            console.log("📦 Starting dari block:", lastBlock);
            return;
        }

        if (currentBlock <= lastBlock) return;

        for (let i = lastBlock + 1; i <= currentBlock; i++) {
            const block = await provider.getBlock(i, true);
            if (!block || !block.transactions || block.transactions.length === 0) continue;

            for (const txHash of block.transactions) {
                const tx = await provider.getTransaction(txHash);
                if (!tx) continue;

                // Cek ETH transfer
                const isEthIncoming = tx.to?.toLowerCase() === WATCHED_WALLET.toLowerCase();
                const isEthOutgoing = tx.from?.toLowerCase() === WATCHED_WALLET.toLowerCase();

                if (isEthIncoming && tx.value > 0n) {
                    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                    console.log("📥 ETH MASUK TERDETEKSI!");
                    console.log("📦 Block  :", i);
                    console.log("🔑 Dari   :", tx.from);
                    console.log("💰 Jumlah :", ethers.formatEther(tx.value), "ETH");
                    console.log("🔗 Hash   :", tx.hash);
                    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
                }

                if (isEthOutgoing && tx.value > 0n) {
                    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                    console.log("📤 ETH KELUAR TERDETEKSI!");
                    console.log("📦 Block  :", i);
                    console.log("🎯 Ke     :", tx.to);
                    console.log("💰 Jumlah :", ethers.formatEther(tx.value), "ETH");
                    console.log("🔗 Hash   :", tx.hash);
                    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
                }

                // Cek ERC-20 token transfer
                const receipt = await provider.getTransactionReceipt(txHash);
                if (!receipt) continue;

                for (const log of receipt.logs) {
                    // Hanya proses log dari LubiToken contract
                    if (log.address.toLowerCase() !== tokenAddress?.toLowerCase()) continue;
                    if (log.topics[0] !== TRANSFER_TOPIC) continue;

                    // Decode Transfer event
                    const from = ethers.getAddress("0x" + log.topics[1].slice(26));
                    const to = ethers.getAddress("0x" + log.topics[2].slice(26));
                    const amount = ethers.formatEther(log.data);

                    const isTokenIncoming = to.toLowerCase() === WATCHED_WALLET.toLowerCase();
                    const isTokenOutgoing = from.toLowerCase() === WATCHED_WALLET.toLowerCase();

                    if (isTokenIncoming) {
                        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                        console.log("🪙 LUBI TOKEN MASUK TERDETEKSI!");
                        console.log("📦 Block  :", i);
                        console.log("🔑 Dari   :", from);
                        console.log("💰 Jumlah :", amount, "LUBI");
                        console.log("🔗 Hash   :", txHash);
                        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
                    }

                    if (isTokenOutgoing) {
                        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                        console.log("🪙 LUBI TOKEN KELUAR TERDETEKSI!");
                        console.log("📦 Block  :", i);
                        console.log("🎯 Ke     :", to);
                        console.log("💰 Jumlah :", amount, "LUBI");
                        console.log("🔗 Hash   :", txHash);
                        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
                    }
                }
            }
        }

        lastBlock = currentBlock;

    } catch (err) {
        console.error("❌ Error:", err.message);
    }
}

async function main() {
    // Deploy LubiToken dulu
    const token = await deployToken();

    // Mulai polling
    setInterval(checkNewBlocks, 2000);

    // Kirim LUBI ke watched wallet setelah 5 detik
    setTimeout(async () => {
        console.log("📤 Mengirim 1000 LUBI ke watched wallet...");
        const owner = await provider.getSigner(0);
        const tx = await token.connect(owner).transfer(
            WATCHED_WALLET,
            ethers.parseEther("1000")
        );
        await tx.wait();
        console.log("✅ Transfer LUBI selesai!\n");
    }, 5000);

    // Kirim ETH ke watched wallet setelah 10 detik
    setTimeout(async () => {
        console.log("📤 Mengirim 0.5 ETH ke watched wallet...");
        const owner = await provider.getSigner(0);
        const tx = await owner.sendTransaction({
            to: WATCHED_WALLET,
            value: ethers.parseEther("0.5")
        });
        await tx.wait();
        console.log("✅ Transfer ETH selesai!\n");
    }, 10000);
}

main().catch(console.error);