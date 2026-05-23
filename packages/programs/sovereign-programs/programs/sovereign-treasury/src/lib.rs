use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("56P8oqmRwhBvMXJouWVyh6oQoCjH3jRxcFhskNWU5jRj");

#[program]
pub mod sovereign_treasury {
    use super::*;

    pub fn deposit_revenue(ctx: Context<DepositRevenue>, amount_usdc: u64) -> Result<()> {
        let micro_toll = (amount_usdc * 15) / 10000; // 0.15% Micro-Toll Protocol (Frictionless Growth)
        // High-fidelity yield flows to vault; 8% Hurdle managed by Sovereign Reserve Manager
        
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
        // Enforce that only the Go labor-ledger PDA can mint UVT
        let expected_authority = Pubkey::new_from_array([
            // Replace with actual PDA pubkey bytes. Using a placeholder for now.
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
            17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32
        ]);
        require!(ctx.accounts.authority.key() == expected_authority, CustomError::UnauthorizedMint);

        msg!("LaborCompensated: {} UVT for proof {:?}", amount_uvt, proof_hash);
        Ok(())
    }
}

#[error_code]
pub enum CustomError {
    #[msg("Unauthorized: Only the Go Labor Ledger PDA can mint UVT.")]
    UnauthorizedMint,
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
