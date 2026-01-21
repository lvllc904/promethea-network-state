#/Users/officeone/promethea-engine/trading_agent/Services/agent.py

import math
import logging
import torch
import torch.nn as nn
import numpy as np
from pathlib import Path

ACTION_SPACE = ['buy', 'sell', 'hold']

class MCTSNode:
    """
    A node in the Monte Carlo Search Tree. Each node represents a state and
    stores statistics about the actions taken from that state.
    """
    def __init__(self, state, parent=None):
        self.state = state  # This will now be a PyTorch tensor
        self.parent = parent
        self.children = []
        self.visit_count = 0
        self.total_value = 0.0  # Q-value in reinforcement learning terms

    @property
    def is_fully_expanded(self):
        return len(self.children) > 0 # In our case, we expand all actions at once

    def get_average_value(self):
        return self.total_value / self.visit_count if self.visit_count > 0 else 0

class GenerativeWorldModel(nn.Module):
    """
    The PyTorch implementation of our Generative World Model.
    """
    def __init__(self, state_dim: int, action_dim: int, embed_dim: int, num_heads: int, ff_dim: int, dropout_rate: float=0.1):
        super().__init__()
        self.state_dim = state_dim
        self.action_dim = action_dim
        
        # Define the layers
        self.embedding_layer = nn.Linear(state_dim + action_dim, embed_dim)
        self.activation = nn.ReLU()
        self.attention = nn.MultiheadAttention(embed_dim=embed_dim, num_heads=num_heads, batch_first=True)
        self.feed_forward = nn.Sequential(
            nn.Linear(embed_dim, ff_dim),
            nn.ReLU(),
            nn.Linear(ff_dim, embed_dim),
        )
        self.dropout = nn.Dropout(dropout_rate)
        self.layer_norm1 = nn.LayerNorm(embed_dim)
        self.layer_norm2 = nn.LayerNorm(embed_dim)
        self.output_layer = nn.Linear(embed_dim, state_dim * 2)

        # Weight Initialization
        for layer in self.modules():
            if isinstance(layer, nn.Linear):
                nn.init.kaiming_normal_(layer.weight, nonlinearity='relu')

    def forward(self, state: torch.Tensor, action: torch.Tensor) -> torch.Tensor:
        # PyTorch forward pass
        x = torch.cat([state, action], dim=-1)
        x = self.activation(self.embedding_layer(x))
        
        # Reshape for attention layer (batch, sequence, features)
        x_seq = x.unsqueeze(1)
        
        attention_output, _ = self.attention(x_seq, x_seq, x_seq)
        x = self.layer_norm1(x_seq + attention_output)
        ff_output = self.feed_forward(x)
        x = self.dropout(ff_output)
        x = self.layer_norm2(x + x)
        
        x = x.squeeze(1)
        predicted_params = self.output_layer(x)
        return predicted_params

class GenerativeAgent:
    """
    The main trading agent that uses the World Model and MCTS.
    This is the "brain" of the Promethea system.
    """
    def __init__(self, config: dict):
        """
        Initializes the agent and loads the pre-trained World Model.

        Args:
            config (dict): A dictionary containing model hyperparameters and file paths.
        """
        logging.info("--- Initializing Promethea Generative Agent (PyTorch) ---")
        self.config = config
        self.actions = ACTION_SPACE
        self.num_actions = len(self.actions)
        self.weights_loaded = False
        
        # Use GPU if available (especially for Apple Silicon 'mps')
        if torch.backends.mps.is_available():
            self.device = torch.device("mps")
            logging.info("PyTorch: Using Apple Metal (MPS) for GPU acceleration.")
        elif torch.cuda.is_available():
            self.device = torch.device("cuda")
            logging.info("PyTorch: Using NVIDIA CUDA for GPU acceleration.")
        else:
            self.device = torch.device("cpu")
            logging.info("PyTorch: No GPU detected. Using CPU.")

        # Build the World Model architecture and move it to the selected device
        self.world_model = GenerativeWorldModel(
            state_dim=config['state_dim'],
            action_dim=self.num_actions,
            embed_dim=config['embed_dim'],
            num_heads=config['num_heads'],
            ff_dim=config['ff_dim']
        ).to(self.device)

        # Now, we load the brain we trained.
        self.load_weights()

    def load_weights(self):
        """Loads the trained weights from the specified file path."""
        weights_path_str = self.config['weights_path']
        weights_path = Path(weights_path_str)

        try:
            if weights_path.is_file():
                self.world_model.load_state_dict(torch.load(weights_path_str, map_location=self.device))
                self.world_model.eval()  # Set the model to evaluation mode
                self.weights_loaded = True
                logging.info(f"Successfully loaded PyTorch model weights from: {weights_path_str}")
            else:
                raise FileNotFoundError(f"Model weights file not found at '{weights_path_str}'. This is expected if the model has not been trained yet.")
        except Exception as e:
            self.weights_loaded = False
            logging.warning(f"Could not load model weights from {weights_path_str}. Agent will use random weights.")
            logging.error(f"Weight loading error: {e}")

    def choose_action(self, current_state: np.ndarray) -> str:
        """
        Chooses the best action by running the MCTS algorithm.

        Args:
            current_state: The current state of the environment as a NumPy array.

        Returns:
            The best action ('buy', 'sell', or 'hold') found by the search.
        """
        if not self.weights_loaded:
            logging.warning("Model weights were not loaded. Using default 'hold' action.")
            return 'hold'

        logging.info("--- Starting MCTS Planning (PyTorch) ---")
        
        # Convert numpy state to a PyTorch tensor and move to the correct device
        state_tensor = torch.from_numpy(current_state).float().unsqueeze(0).to(self.device)
        
        root = MCTSNode(state=state_tensor)
        num_simulations = self.config.get('mcts_simulations', 100)

        self._expand(root)

        for i in range(num_simulations):
            if (i + 1) % 25 == 0:
                logging.info(f"  - MCTS Simulation {i+1}/{num_simulations}...")

            for child in root.children:
                simulation_value = self._simulate(child)
                self._backpropagate(child, simulation_value)

        if not root.children:
            logging.warning("MCTS: Root node has no children after simulations. Defaulting to HOLD.")
            return "hold"
            
        best_child = max(root.children, key=lambda c: c.visit_count)
        best_action_index = root.children.index(best_child)
        
        logging.info(f"--- MCTS Planning Complete. Best action: {self.actions[best_action_index]} ---")
        return self.actions[best_action_index]

    def _ucb1(self, node: MCTSNode) -> float:
        """Calculates the Upper Confidence Bound 1 (UCB1) score for a node."""
        if node.visit_count == 0:
            return float('inf')
        
        exploration_factor = self.config.get('mcts_exploration_factor', 1.41)
        
        return (node.get_average_value() + 
                exploration_factor * math.sqrt(math.log(node.parent.visit_count) / (node.visit_count + 1e-6)))

    def _select(self, node: MCTSNode) -> MCTSNode:
        """Traverses the tree from the given node to find a leaf node to expand."""
        while node.is_fully_expanded:
            node = max(node.children, key=self._ucb1)
        return node

    def _expand(self, node: MCTSNode):
        """Creates child nodes for all possible actions from the given node."""
        for action_index in range(self.num_actions):
            action_one_hot = nn.functional.one_hot(torch.tensor([action_index]), num_classes=self.num_actions).float().to(self.device)
            
            with torch.no_grad(): # We don't need to track gradients during planning
                predicted_params = self.world_model(node.state, action_one_hot)
            
            next_state_mean, next_state_log_std = torch.chunk(predicted_params, 2, dim=-1)
            next_state_std = torch.exp(next_state_log_std)
            next_state = torch.normal(next_state_mean, next_state_std)
            
            child_node = MCTSNode(state=next_state, parent=node)
            node.children.append(child_node)

    def _simulate(self, node: MCTSNode) -> float:
        """
        Estimates the value of a state by predicting the outcome of a 'hold' action.
        """
        hold_action = nn.functional.one_hot(torch.tensor([2]), num_classes=self.num_actions).float().to(self.device)
        
        with torch.no_grad():
            predicted_params = self.world_model(node.state, hold_action)
            
        next_state_mean, _ = torch.chunk(predicted_params, 2, dim=-1)

        feature_manifest = self.config.get('feature_manifest', [])
        try:
            price_index = feature_manifest.index('price') # Use the actual price feature for reward simulation
            current_price_feature = node.state[0, price_index].item()
            predicted_price_feature = next_state_mean[0, price_index].item()
            value = predicted_price_feature - current_price_feature
        except (ValueError, IndexError) as e:
            logging.critical(f"Could not find 'price' in feature manifest for simulation. Error: {e}")
            return 0
        return value

    def _backpropagate(self, node: MCTSNode, value: float):
        """Updates the visit counts and total values of nodes up the tree."""
        while node is not None:
            node.visit_count += 1
            node.total_value += value
            node = node.parent

# This block allows us to test the agent directly if we run this file.
if __name__ == '__main__':
    # For direct testing, import the master configuration
    from ..config import get_settings
    settings = get_settings()

    # Set logging level
    logging_level = settings.agent_config.get('logging_level', 'INFO').upper()
    logging.basicConfig(level=logging.getLevelName(logging_level))


    # Create an instance of the agent
    agent = GenerativeAgent(config=settings.agent_config)

    # Create a mock state vector to test the choose_action method
    # The PyTorch agent expects a NumPy array, not a TensorFlow tensor.
    mock_current_state = np.zeros((settings.agent_config['state_dim'],))

    # Get a decision
    decision = agent.choose_action(mock_current_state)
    print(f"\n[TEST DECISION]: The agent chose to **{decision}**.")
