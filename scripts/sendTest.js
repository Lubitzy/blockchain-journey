import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

async function main() {
    const sender = await provider.getSigner(0);
    const receiverAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

    console.log("📤 Mengirim 1 ETH ke wallet yang dipantau...");

    const tx = await sender.sendTransaction({
        to: receiverAddress,
        value: ethers.parseEther("1.0")
    });

    await tx.wait();
    console.log("✅ Transaksi terkirim:", tx.hash);
}

main().catch(console.error);