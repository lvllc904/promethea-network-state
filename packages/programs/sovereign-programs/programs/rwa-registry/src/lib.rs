use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("6XDR861T35AyTrzeKK5ZR8iqiq6qL57iQBPLF6KeF6nc");

#[program]
pub mod rwa_registry {
    use super::*;

    pub fn register_asset(ctx: Context<RegisterAsset>, node_type: u8, location_hash: String, acquisition_cost_usdc: u64, legal_entity_wrapper: String, ucc_filing_hash: String, cer_control_signature: String) -> Result<()> {
        let physical_node = &mut ctx.accounts.physical_node;
        physical_node.node_type = node_type;
        physical_node.location_hash = location_hash.clone();
        physical_node.acquisition_cost_usdc = acquisition_cost_usdc;
        physical_node.fractional_mint = ctx.accounts.fractional_mint.key();
        physical_node.legal_entity_wrapper = legal_entity_wrapper;
        physical_node.ucc_filing_hash = ucc_filing_hash;
        physical_node.cer_control_signature = cer_control_signature;

        msg!("NodeAcquired: {:?} at {}", node_type, location_hash);
        Ok(())
    }

    pub fn distribute_node_yield(ctx: Context<DistributeYield>, amount_usdc: u64) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.engine_usdc_account.to_account_info(),
            to: ctx.accounts.node_yield_vault.to_account_info(),
            authority: ctx.accounts.engine_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount_usdc)?;

        msg!("YieldDistributed: {} USDC for Node {:?}", amount_usdc, ctx.accounts.physical_node.key());
        Ok(())
    }
}

#[derive(Accounts)]
pub struct RegisterAsset<'info> {
    #[account(init, payer = authority, space = 8 + 1 + 64 + 8 + 32 + 256 + 128 + 256)]
    pub physical_node: Account<'info, PhysicalNode>,
    #[account(mut)]
    pub authority: Signer<'info>, // Often PDA of Governance
    pub fractional_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DistributeYield<'info> {
    pub physical_node: Account<'info, PhysicalNode>,
    #[account(mut)]
    pub engine_authority: Signer<'info>,
    #[account(mut)]
    pub engine_usdc_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub node_yield_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct PhysicalNode {
    pub node_type: u8, // 1: Land, 2: Manufacturing, 3: Compute Server
    pub location_hash: String,
    pub acquisition_cost_usdc: u64,
    pub fractional_mint: Pubkey,
    pub legal_entity_wrapper: String, // IPFS CID to LLC wrapper docs
    pub ucc_filing_hash: String, // UCC-1 state filing registration hash/document IPFS link
    pub cer_control_signature: String, // UCC Article 12 Controllable Electronic Record signature
}
