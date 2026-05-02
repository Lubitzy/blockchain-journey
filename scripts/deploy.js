import { ethers } from "ethers";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Baca hasil compile dari Hardhat
const artifactPath = join(__dirname, "../artifacts/contracts/HelloWorld.sol/HelloWorld.json");
const artifact = JSON.parse(readFileSync(artifactPath, "utf-8"));

async function main() {
    // Koneksi ke local Hardhat network
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // Ambil signer pertama (akun test gratis dari Hardhat)
    const signer = await provider.getSigner(0);

    console.log("Deploying dari address:", await signer.getAddress());

    // Deploy contract
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("✅ Contract deployed ke:", address);

    // Baca message awal
    const message = await contract.getMessage();
    console.log("📖 Message awal:", message);

    // Ubah message
    console.log("✏️  Mengubah message...");
    const tx = await contract.setMessage("Saya adalah blockchain developer!");
    await tx.wait();

    // Baca message baru
    const newMessage = await contract.getMessage();
    console.log("📖 Message baru:", newMessage);
}

main().catch(console.error);