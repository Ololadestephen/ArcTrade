use anchor_lang::prelude::*;
use solana_program::hash::{hash, hashv};

use crate::errors::PrivateTradingError;
use crate::state::ComputationConfigAccount;

pub fn require_encrypted_accounts(
    arcium_signer_pda: &AccountInfo<'_>,
    mxe_account: &AccountInfo<'_>,
    mempool_account: &AccountInfo<'_>,
    execution_pool_account: &AccountInfo<'_>,
    computation_account: &AccountInfo<'_>,
    computation_definition_account: &AccountInfo<'_>,
    cluster_account: &AccountInfo<'_>,
    fee_pool_account: &AccountInfo<'_>,
    arcium_program: &AccountInfo<'_>,
    config: &Account<'_, ComputationConfigAccount>,
) -> Result<()> {
    require!(mxe_account.owner != &Pubkey::default(), PrivateTradingError::InvalidAccount);
    require!(mempool_account.owner != &Pubkey::default(), PrivateTradingError::InvalidAccount);
    require!(execution_pool_account.owner != &Pubkey::default(), PrivateTradingError::InvalidAccount);
    require!(computation_account.owner != &Pubkey::default(), PrivateTradingError::InvalidAccount);
    require!(
        computation_definition_account.owner != &Pubkey::default(),
        PrivateTradingError::InvalidAccount
    );
    require!(fee_pool_account.owner != &Pubkey::default(), PrivateTradingError::InvalidAccount);
    require_keys_eq!(
        cluster_account.key(),
        config.cluster_account,
        PrivateTradingError::InvalidCallbackSignature
    );
    require_keys_eq!(
        arcium_program.key(),
        config.arcium_program,
        PrivateTradingError::InvalidAccount
    );
    Ok(())
}

pub fn compute_deterministic_id(
    owner: &Pubkey,
    nonce: u64,
    instruction_type: u8,
    ciphertext: &[u8],
) -> [u8; 32] {
    let ciphertext_hash = hash(ciphertext).to_bytes();
    hashv(&[
        owner.as_ref(),
        &nonce.to_le_bytes(),
        &[instruction_type],
        &ciphertext_hash,
    ])
    .to_bytes()
}

pub fn bounded_blob(blob: Vec<u8>, max_len: usize) -> Result<Vec<u8>> {
    require!(!blob.is_empty(), PrivateTradingError::InvalidEncryption);
    require!(blob.len() <= max_len, PrivateTradingError::InvalidEncryption);
    Ok(blob)
}
