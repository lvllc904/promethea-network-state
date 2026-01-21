import asyncio
import optuna
import numpy as np
import torch

from Services.agent import RLAgent
from Services.data_service import DataService
from Services.trading_env import TradingEnv
from Services.pattern_recognition_service import PatternRecognitionService
from Services.database import SessionLocal

async def objective(trial: optuna.Trial) -> float:
    """
    The objective function for Optuna to optimize.
    It runs a full backtesting episode with a given set of hyperparameters
    and returns the final portfolio value.
    """
    print(f"\n--- Starting Trial {trial.number} ---")
    
    # --- 1. Define Hyperparameter Search Space ---
    # Optuna will suggest values from these ranges for each trial.
    params = {
        'learning_rate': trial.suggest_float('learning_rate', 1e-5, 1e-2, log=True),
        'gamma': trial.suggest_float('gamma', 0.9, 0.999),
        'epsilon_decay': trial.suggest_float('epsilon_decay', 0.99, 0.999),
        'wisdom_factor': trial.suggest_float('wisdom_factor', 0.05, 0.5),
    }

    # --- 2. Data Preparation (run once per trial) ---
    data_service = DataService()
    # Using a shorter period for tuning to speed up trials.
    # 365 days of hourly data is a lot. Let's use 90 days.
    df = await data_service.get_historical_data_for_backtesting(asset_id="bitcoin", days=90)

    # --- 3. Environment and Agent Initialization ---
    env = TradingEnv(df)
    state_dim = env.observation_space.shape[0]
    action_dim = env.action_space.n
    
    # Pass the suggested hyperparameters to the agent
    agent = RLAgent(state_dim, action_dim, **params)
    
    db = SessionLocal()
    pattern_service = PatternRecognitionService(db_session=db)

    batch_size = 32
    # For tuning, we often run just one or a few episodes per trial.
    num_episodes = 1 

    final_portfolio_value = 0.0

    # --- 4. Training/Backtesting Loop ---
    for e in range(num_episodes):
        state, _ = env.reset()
        state = np.reshape(state, [1, state_dim])
        done = False

        while not done:
            market_state_dict = env.get_current_market_state_as_dict()
            action = agent.select_hybrid_action(
                state, pattern_service, market_state_dict
            )

            next_state, reward, terminated, truncated, info = env.step(action)
            done = terminated or truncated
            
            next_state = np.reshape(next_state, [1, state_dim])
            agent.remember(state, action, reward, next_state, done)
            state = next_state

            if len(agent.memory) > batch_size:
                agent.replay(batch_size)

        final_portfolio_value = info.get('portfolio_value', 0)
        trial.report(final_portfolio_value, e)

        # Handle pruning based on intermediate results
        if trial.should_prune():
            db.close()
            raise optuna.exceptions.TrialPruned()

    db.close()
    print(f"--- Trial {trial.number} Finished. Final Portfolio Value: ${final_portfolio_value:,.2f} ---")
    return final_portfolio_value


async def main():
    """
    Main function to set up and run the Optuna study.
    """
    # We want to MAXIMIZE the final portfolio value.
    study = optuna.create_study(direction='maximize', study_name='piml_rl_agent_tuning')
    
    # n_trials is the number of different hyperparameter combinations to test.
    study.optimize(lambda trial: asyncio.run(objective(trial)), n_trials=100)

    pruned_trials = study.get_trials(deepcopy=False, states=[optuna.trial.TrialState.PRUNED])
    complete_trials = study.get_trials(deepcopy=False, states=[optuna.trial.TrialState.COMPLETE])

    print("\n--- Hyperparameter Tuning Complete ---")
    print(f"Study name: {study.study_name}")
    print(f"Number of finished trials: {len(study.trials)}")
    print(f"Number of pruned trials: {len(pruned_trials)}")
    print(f"Number of complete trials: {len(complete_trials)}")

    print("\n--- Best Trial ---")
    trial = study.best_trial
    print(f"  Value (Final Portfolio): ${trial.value:,.2f}")
    print("  Best Parameters: ")
    for key, value in trial.params.items():
        print(f"    {key}: {value}")

if __name__ == "__main__":
    asyncio.run(main())