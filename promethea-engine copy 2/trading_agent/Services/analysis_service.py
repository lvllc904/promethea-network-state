import numpy as np
from sqlalchemy.orm import Session
from .database import PortfolioHistoryDB, TradeDB

class AnalysisService:
    """
    Analyzes trade outcomes to determine if they are "significant" or "unexpected"
    based on historical performance. This helps filter for the most valuable
    patterns to save.
    """
    def __init__(self, db_session: Session, history_lookback: int = 50, significance_threshold: float = 1.5):
        """
        Args:
            db_session: The SQLAlchemy session.
            history_lookback: The number of recent portfolio history points to use for establishing a baseline.
            significance_threshold: The number of standard deviations from the mean change to be considered significant.
        """
        self.db = db_session
        self.history_lookback = history_lookback
        self.significance_threshold = significance_threshold

    def analyze_outcome(self, agent_action: str) -> tuple[str, float] | None:
        """
        Analyzes the most recent market/portfolio change to see if it's an outlier.
        This now handles all actions: BUY, SELL, and HOLD.

        Args:
            agent_action: The action the agent just took ('BUY', 'SELL', 'HOLD').

        Returns:
            A tuple of (outcome_type, surprise_score) if significant, otherwise None.
            e.g., ('significant_profit', 2.1) or ('unexpected_loss', -1.8)
            or ('missed_opportunity', 2.5) for a HOLD during a rally.
        """
        # 1. Fetch the last `history_lookback` + 1 portfolio values.
        # We use portfolio history as a proxy for market movement between agent decisions.
        # A more advanced version could query raw price ticks for higher resolution.
        history_points = (
            self.db.query(PortfolioHistoryDB.value)
            .order_by(PortfolioHistoryDB.timestamp.desc())\
            .limit(self.history_lookback + 1)\
            .all()
        )

        if len(history_points) < 3: # Need at least 2 changes to calculate std dev
            return None

        # The values are returned as tuples, e.g., [(10050.0,), (10025.0,)]
        values = [p[0] for p in history_points]
        
        # 2. Calculate the series of changes (PnL between steps)
        # Note: `values` are in descending time order, so we reverse to get chronological order for diff
        changes = np.diff(values[::-1])

        if len(changes) < 2:
            return None

        most_recent_change = changes[-1]
        historical_changes = changes[:-1]

        # 3. Establish the "normal" baseline
        mean_change = np.mean(historical_changes)
        std_dev_change = np.std(historical_changes)

        if std_dev_change == 0: # Avoid division by zero if all historical changes were identical
            return None

        # 4. Calculate the "surprise score" (Z-score)
        surprise_score = (most_recent_change - mean_change) / std_dev_change

        if abs(surprise_score) > self.significance_threshold:
            # The interpretation of the surprise depends on the agent's action
            if agent_action in ["BUY", "SELL"]:
                # For a trade, a positive surprise is profit, negative is loss.
                outcome_type = "significant_profit" if surprise_score > 0 else "unexpected_loss"
                return (outcome_type, surprise_score)
            elif agent_action == "HOLD":
                # For a hold, a large move in either direction is a significant event.
                if surprise_score > 0: return ("missed_opportunity", surprise_score)
                else: return ("loss_avoided", surprise_score)

        return None
