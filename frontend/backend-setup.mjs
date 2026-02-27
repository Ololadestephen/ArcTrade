import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import fs from "fs";

async function main() {
    try {
        console.log("Starting script...");
        const secret = JSON.parse(fs.readFileSync(process.env.HOME + "/.config/solana/id.json"));
        const keypair = Keypair.fromSecretKey(new Uint8Array(secret));
        const wallet = new Wallet(keypair);

        const connection = new Connection("https://api.devnet.solana.com", "confirmed");
        const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });

        const idl = JSON.parse(fs.readFileSync("./app/utils/idl.json", "utf8"));
        const PROGRAM_ID = new PublicKey("e6oyALFfDbVMy4gp3xVr5hRXo5VyCSw23gxk9M3YALM");
        const modifiedIdl = { ...idl, address: PROGRAM_ID.toBase58() };
        const program = new Program(modifiedIdl, provider);

        const [computationConfigPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("computation-config")],
            PROGRAM_ID
        );
        console.log("Config PDA:", computationConfigPDA.toBase58());

        console.log("Sending initializeComputationConfig...");
        const tx2 = await program.methods.initializeComputationConfig([])
            .accounts({
                payer: wallet.publicKey,
                admin: wallet.publicKey,
                computationConfig: computationConfigPDA,
                clusterAccount: new PublicKey("11111111111111111111111111111111"),
                arciumProgram: new PublicKey("2oBXGf1AM2MK5kVk5jhJvv9xguHRFfgmPV5GKSmfVhWu"),
                systemProgram: new PublicKey("11111111111111111111111111111111")
            }).rpc();
        console.log("Config Init SUCCESS:", tx2);
    } catch (e) {
        console.error("Script failed:", e);
    }
}

main();
