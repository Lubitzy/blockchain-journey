import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import * as dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const JWT = process.env.PINATA_JWT;

async function uploadJSON(jsonData, name) {
    console.log(`📤 Uploading ${name} ke IPFS...`);

    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JWT}`,
        },
        body: JSON.stringify({
            pinataContent: jsonData,
            pinataMetadata: { name }
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`Pinata error: ${JSON.stringify(data)}`);
    }

    return data.IpfsHash;
}

async function main() {
    console.log("🚀 Uploading NFT metadata ke IPFS via Pinata...\n");

    const metadata = JSON.parse(
        readFileSync(join(__dirname, "../assets/nft-0.json"), "utf-8")
    );

    const hash = await uploadJSON(metadata, "Lubi Genesis #0");

    console.log("✅ Upload berhasil!");
    console.log("🔗 IPFS Hash :", hash);
    console.log("🌐 Gateway  :", `https://gateway.pinata.cloud/ipfs/${hash}`);
    console.log("📋 tokenURI :", `ipfs://${hash}`);
}

main().catch(console.error);