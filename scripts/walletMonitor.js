import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const WATCHED_WALLET = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

let lastBlock = null;

console.log("🤖 Wallet Monitor Bot aktif!");
console.log("👁️  Memantau wallet:", WATCHED_WALLET);
console.log("⏳ Menunggu transaksi...\n");

async function checkNewBlocks() {
    try {
        const currentBlock = await provider.getBlockNumber();

        // Inisialisasi pertama kali
        if (lastBlock === null) {
            lastBlock = currentBlock;
            console.log("📦 Starting dari block:", lastBlock);
            return;
        }

        // Tidak ada block baru
        if (currentBlock <= lastBlock) return;

        console.log(`🔍 Cek block ${lastBlock + 1} sampai ${currentBlock}`);

        for (let i = lastBlock + 1; i <= currentBlock; i++) {
            const block = await provider.getBlock(i, true);

            if (!block || !block.transactions || block.transactions.length === 0) {
                continue;
            }

            for (const txHash of block.transactions) {
                // Fetch detail transaksi lengkap
                const tx = await provider.getTransaction(txHash);
                if (!tx) continue;

                const isIncoming = tx.to?.toLowerCase() === WATCHED_WALLET.toLowerCase();
                const isOutgoing = tx.from?.toLowerCase() === WATCHED_WALLET.toLowerCase();

                if (isIncoming) {
                    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                    console.log("📥 TRANSAKSI MASUK TERDETEKSI!");
                    console.log("📦 Block    :", i);
                    console.log("🔑 Dari     :", tx.from);
                    console.log("💰 Jumlah   :", ethers.formatEther(tx.value), "ETH");
                    console.log("🔗 Tx Hash  :", tx.hash);
                    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
                }

                if (isOutgoing) {
                    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                    console.log("📤 TRANSAKSI KELUAR TERDETEKSI!");
                    console.log("📦 Block    :", i);
                    console.log("🎯 Ke       :", tx.to);
                    console.log("💰 Jumlah   :", ethers.formatEther(tx.value), "ETH");
                    console.log("🔗 Tx Hash  :", tx.hash);
                    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
                }
            }
        }

        lastBlock = currentBlock;

    } catch (err) {
        console.error("❌ Error:", err.message);
    }
}

// Cek setiap 2 detik
setInterval(checkNewBlocks, 2000);