use anchor_lang::prelude::*;

declare_id!("C1QaGydVJC1TjCAFESzvFdQyexFyvpNdBTnKqWXN2arJ");

#[program]
pub mod sovereign_governance {
    use super::*;

    pub fn create_proposal(ctx: Context<CreateProposal>, title: String, ipfs_cid: String, execution_payload: Vec<u8>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        proposal.creator = ctx.accounts.creator.key();
        proposal.title = title;
        proposal.ipfs_cid = ipfs_cid;
        proposal.yes_votes_weight = 0;
        proposal.no_votes_weight = 0;
        // set end time to 7 days from now roughly for simulation
        proposal.end_time = Clock::get()?.unix_timestamp + (7 * 24 * 60 * 60);
        proposal.executed = false;
        proposal.execution_payload = execution_payload;
        
        msg!("ProposalCreated: {}", proposal.title);
        Ok(())
    }

    pub fn cast_vote(ctx: Context<CastVote>, support: bool) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        // Mocking reputation weight to 1 for MVP
        let voter_weight: u64 = 1;

        if support {
            proposal.yes_votes_weight = proposal.yes_votes_weight.checked_add(voter_weight).unwrap();
        } else {
            proposal.no_votes_weight = proposal.no_votes_weight.checked_add(voter_weight).unwrap();
        }

        msg!("VoteCast: support={}", support);
        Ok(())
    }

    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        require!(!proposal.executed, ErrorCode::AlreadyExecuted);
        require!(Clock::get()?.unix_timestamp > proposal.end_time, ErrorCode::VotingNotEnded);
        
        if proposal.yes_votes_weight > proposal.no_votes_weight {
            // Autonomous Execution Payload execution goes here via CPI
            proposal.executed = true;
            msg!("ProposalExecuted: {}", proposal.title);
        } else {
            msg!("ProposalFailed: {}", proposal.title);
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(init, payer = creator, space = 8 + 32 + 256 + 256 + 8 + 8 + 8 + 1 + 1024)]
    pub proposal: Account<'info, Proposal>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    pub voter: Signer<'info>,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    pub executor: Signer<'info>,
}

#[account]
pub struct Proposal {
    pub creator: Pubkey,
    pub title: String,
    pub ipfs_cid: String,
    pub yes_votes_weight: u64,
    pub no_votes_weight: u64,
    pub end_time: i64,
    pub executed: bool,
    pub execution_payload: Vec<u8>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("This proposal has already been executed.")]
    AlreadyExecuted,
    #[msg("Voting period has not ended yet.")]
    VotingNotEnded,
}
