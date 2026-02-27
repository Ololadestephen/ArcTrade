const anchor = require("@coral-xyz/anchor");
const { PublicKey, SystemProgram } = require("@solana/web3.js");
const { readFileSync } = require("fs");
const crypto = require("crypto");

// Note: Ensure ANCHOR_WALLET and ANCHOR_PROVIDER_URL are set when running this script
// e.g. ANCHOR_WALLET=~/.config/solana/id.json ANCHOR_PROVIDER_URL=https://api.devnet.solana.com node crank.js

async function main() {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const PROGRAM_ID = new PublicKey("e6oyALFfDbVMy4gp3xVr5hRXo5VyCSw23gxk9M3YALM");
    const ARCIUM_PROGRAM_ID = new PublicKey("2oBXGf1AM2MK5kVk5jhJvv9xguHRFfgmPV5GKSmfVhWu");

    console.log("🔍 Looking for Open Orders...");

    const allOrdersRaw = await provider.connection.getProgramAccounts(PROGRAM_ID, {
        filters: [
            { dataSize: 2102 } // Exact size of OrderAccount
        ]
    });

    const allOrders = allOrdersRaw.map(accountInfo => {
        const data = accountInfo.account.data;
        const vecLen = data.readUInt32LE(48);
        const statusOffset = 48 + 4 + vecLen;
        const status = data[statusOffset];

        console.log(`Order ${accountInfo.pubkey.toString()} has status: ${status}`);

        return {
            pubkey: accountInfo.pubkey,
            status: status
        };
    }).filter(o => o.status === 1);

    if (allOrders.length < 2) {
        console.log(`❌ Not enough orders to match. Found ${allOrders.length}. Please create at least 2 orders on the UI.`);
        return;
    }

    console.log(`✅ Found ${allOrders.length} active orders.`);

    // Just pick the first two open orders for the demo crank
    const makerOrder = allOrders[0].pubkey;
    const takerOrder = allOrders[1].pubkey;

    console.log(`🤝 Attempting to match Order ${makerOrder.toString()} with Order ${takerOrder.toString()}`);

    // Generate dummy matching payload using native node crypto to avoid @arcium-hq/client dependency issues outside the web
    const plaintext = Buffer.alloc(320); // 10 field elements (2 PrivateOrders) * 32 bytes
    const randKey = crypto.randomBytes(32);
    const iv = Buffer.alloc(16); // aes-256-ctr needs 16 bytes for nodejs (using first 8 as nonce essentially)

    const cipher = crypto.createCipheriv("aes-256-ctr", randKey, iv);
    let ciphertext = cipher.update(plaintext);
    ciphertext = Buffer.concat([ciphertext, cipher.final()]);

    const encryptedMatchBlob = ciphertext;

    // Derive necessary PDAs
    const MARKET_SEED = Buffer.from("market");
    const [market] = PublicKey.findProgramAddressSync(
        [MARKET_SEED, new PublicKey("So11111111111111111111111111111111111111112").toBuffer()],
        PROGRAM_ID
    );

    // The order maker is stored at byte 16 of the account data (Discriminator 8 + OrderId 8)
    const makerOrderAccountRaw = allOrdersRaw.find(o => o.pubkey.equals(makerOrder));
    const makerPubkey = new PublicKey(makerOrderAccountRaw.account.data.slice(16, 48));

    const [userPosition] = PublicKey.findProgramAddressSync(
        [Buffer.from("user-position"), makerPubkey.toBuffer()],
        PROGRAM_ID
    );

    const [computationConfig] = PublicKey.findProgramAddressSync(
        [Buffer.from("computation-config")],
        PROGRAM_ID
    );

    const [arciumSignerPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("arcium-signer")],
        ARCIUM_PROGRAM_ID
    );

    // Mock Arcium node accounts
    const MOCK_ACCOUNT = new PublicKey("11111111111111111111111111111111");

    try {
        console.log("🚀 Sending match_orders transaction to Solana...");

        // Sighash discriminator for "global:match_orders"
        const sighash = crypto.createHash('sha256').update('global:match_orders').digest().slice(0, 8);

        // Borsh serialize arguments: encrypted_match_blob (Vec<u8>)
        const blobLength = Buffer.alloc(4);
        blobLength.writeUInt32LE(encryptedMatchBlob.length);
        const ixData = Buffer.concat([sighash, blobLength, encryptedMatchBlob]);

        const ix = new anchor.web3.TransactionInstruction({
            programId: PROGRAM_ID,
            keys: [
                { pubkey: provider.wallet.publicKey, isSigner: true, isWritable: true },
                { pubkey: userPosition, isSigner: false, isWritable: true },
                { pubkey: makerPubkey, isSigner: false, isWritable: false }, // The owner of the position
                { pubkey: market, isSigner: false, isWritable: true },
                { pubkey: computationConfig, isSigner: false, isWritable: true },
                { pubkey: arciumSignerPda, isSigner: false, isWritable: false },
                { pubkey: MOCK_ACCOUNT, isSigner: false, isWritable: false },
                { pubkey: MOCK_ACCOUNT, isSigner: false, isWritable: false },
                { pubkey: MOCK_ACCOUNT, isSigner: false, isWritable: false },
                { pubkey: MOCK_ACCOUNT, isSigner: false, isWritable: false },
                { pubkey: MOCK_ACCOUNT, isSigner: false, isWritable: false },
                { pubkey: MOCK_ACCOUNT, isSigner: false, isWritable: false },
                { pubkey: MOCK_ACCOUNT, isSigner: false, isWritable: false },
                { pubkey: anchor.web3.SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
                { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                { pubkey: ARCIUM_PROGRAM_ID, isSigner: false, isWritable: false }
            ],
            data: ixData
        });

        const tx = new anchor.web3.Transaction().add(ix);
        const sig = await provider.sendAndConfirm(tx, []);

        console.log(`🎉 Success! Match transaction confirmed: ${sig}`);
        console.log("⚡ The Arcium MPC network will now compute the match! Note: The Settlement callback won't run locally unless we also manually trigger handle_callback.");
    } catch (err) {
        console.error("❌ Failed to match orders:", err);
    }
}

main();
