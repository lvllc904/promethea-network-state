use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("56P8oqmRwhBvMXJouWVyh6oQoCjH3jRxcFhskNWU5jRj");

#[program]
pub mod sovereign_treasury {
    use super::*;

    pub fn deposit_revenue(ctx: Context<DepositRevenue>, amount_usdc: u64) -> Result<()> {
        let reserve_split = (amount_usdc * 30) / 100; // 30% Plowback Rule
        let community_split = (amount_usdc * 10) / 100; // 10% Citizen Tithe
        let restoration_split = (amount_usdc * 5) / 100; // 5% Planetary Healing
        
        let cpi_accounts = Transfer {
            from: ctx.accounts.depositor_usdc_account.to_account_info(),
            to: ctx.accounts.treasury_usdc_vault.to_account_info(),
            authority: ctx.accounts.depositor.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount_usdc)?;

        msg!("RevenueDeposited: {}", amount_usdc);
        Ok(())
    }

    pub fn mint_labor_uvt(ctx: Context<MintLaborUVT>, amount_uvt: u64, proof_hash: [u8; 32]) -> Result<()> {
        msg!("LaborCompensated: {} UVT for proof {:?}", amount_uvt, proof_hash);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct DepositRevenue<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,
    
    #[account(mut)]
    pub depositor_usdc_account: Account<'info, TokenAccount>,
    
    pub usdc_mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub treasury_usdc_vault: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct MintLaborUVT<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub receiver_uvt_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub uvt_mint: Account<'info, Mint>,
    
    pub token_program: Program<'info, Token>,
}
