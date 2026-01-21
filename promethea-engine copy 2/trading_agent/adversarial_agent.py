import numpy as np
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv
from stable_baselines3.common.env_checker import check_env
import os

class AdversarialAgent:
    """
    An agent that learns to create adverse market conditions for the main
    trading agent. It uses a reinforcement learning model (PPO) to decide
    on actions that will negatively impact the main agent's performance.

    This fulfills Step 6.2 of the roadmap.
    """
    def __init__(self, model_path: str | None = None):
        """
        Initializes the AdversarialAgent.

        Args:
            model_path: Path to a pre-trained PPO model. If None, a new
                        model will need to be trained.
        """
        self.model = None
        self.model_path = model_path
        if model_path and os.path.exists(model_path):
            try:
                self.model = PPO.load(model_path)
                print(f"--- AdversarialAgent: Loaded pre-trained model from {model_path} ---")
            except Exception as e:
                print(f"--- AdversarialAgent: Failed to load model: {e}. Starting fresh. ---")
        else:
            print("--- AdversarialAgent: Initialized without a pre-trained model. ---")

    def train(self, env, total_timesteps: int = 10000, save_path: str = "adversarial_model"):
        """
        Trains the adversarial agent using PPO.
        """
        print(f"--- AdversarialAgent: Starting training for {total_timesteps} timesteps... ---")
        
        # Check environment sanity
        check_env(env)
        
        # Wrap in DummyVecEnv for SB3
        vec_env = DummyVecEnv([lambda: env])

        if self.model is None:
            self.model = PPO("MlpPolicy", vec_env, verbose=1)
        else:
            self.model.set_env(vec_env)

        self.model.learn(total_timesteps=total_timesteps)
        
        print(f"--- AdversarialAgent: Training complete. Saving to {save_path} ---")
        self.model.save(save_path)
        self.model_path = save_path

    def get_action(self, observation: np.ndarray) -> tuple:
        """
        Uses the PPO model to determine the best action to take based on the
        current market observation (Unified State Vector).

        Args:
            observation: The current Unified State Vector.

        Returns:
            A tuple representing the chosen action. For example:
            ('market_order', {'side': 'sell', 'quantity': 100})
            ('post_narrative', {'topic': 'bubble', 'sentiment': 'negative'})
            
            For the current simplified environment, it returns a price shock value.
        """
        if self.model:
            action, _ = self.model.predict(observation, deterministic=True)
            # The action from the model is a numpy array (e.g., [0.5])
            # We need to convert it to a format the environment expects or the system uses.
            # In the current AdversarialEnv, the action is just the shock value.
            return float(action[0])

        # Placeholder for random action if no model is loaded
        return np.random.uniform(-1.0, 1.0)