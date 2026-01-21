import numpy as np
from typing import List, Dict, Any
from sqlalchemy.orm import Session
import logging
from sqlalchemy import text
from .database import PatternDB

class PatternRecognitionService:
    """
    A service to identify, store, and retrieve significant trading patterns.
    This service builds the "case-base" for our expert system.
    """

    def __init__(self, db_session: Session):
        """
        In a real implementation, this would initialize a connection
        to the database and pre-load normalization stats.
        """
        self.db = db_session
        # In a production system, these values would be calculated periodically
        # from the entire dataset to ensure accurate normalization.
        # For now, we use reasonable estimates.
        self.feature_stats = {
            'rsi': {'min': 0, 'max': 100},
            'macd': {'min': -5000, 'max': 5000}, # Estimated wide range
            'volatility': {'min': 0, 'max': 5}, # Annualized volatility
            'sentiment': {'min': -1, 'max': 1},
            'bid_ask_spread': {'min': 0, 'max': 0.05} # 5% spread is very high
        }
        logging.info("PatternRecognitionService initialized.")

    def save_pattern(self, state_vector: dict, outcome: str, surprise_score: float):
        """
        Saves a new pattern to the database.

        Args:
            state_vector: The market state dictionary from DataService.
            outcome: The result, e.g., "significant_profit", "loss", "stagnation".
            surprise_score: A measure of the outcome's significance (e.g., magnitude of profit/loss).
        """
        logging.info(f"--- Saving significant pattern: Outcome={outcome}, Confidence={abs(surprise_score):.2f} ---")
        new_pattern = PatternDB(outcome=outcome, confidence=abs(surprise_score))
        self.db.add(new_pattern)
        self.db.commit()
        logging.info("✅ Pattern successfully saved to database.")

    def _normalize_feature(self, value: float, feature_name: str) -> float:
        """Normalizes a single feature value to a 0-1 scale."""
        stats = self.feature_stats.get(feature_name)
        if not stats or stats['max'] == stats['min']:
            return 0.5 # Return a neutral value if stats are missing or invalid
        return (value - stats['min']) / (stats['max'] - stats['min'])

    def find_historical_precedents(self, current_state: dict, top_n: int = 5) -> List[Dict[str, Any]]:
        """
        Finds the most similar past states from the 'patterns' table using
        Euclidean distance on features normalized to a 0-1 range.
        """
        # Normalize the incoming current state for an apples-to-apples comparison.
        norm_rsi = self._normalize_feature(current_state.get("rsi", 50), 'rsi')
        norm_macd = self._normalize_feature(current_state.get("macd", 0), 'macd')
        norm_volatility = self._normalize_feature(current_state.get("volatility", 0), 'volatility')
        norm_sentiment = self._normalize_feature(current_state.get("sentiment", 0), 'sentiment')
        norm_bid_ask_spread = self._normalize_feature(current_state.get("bid_ask_spread", 0), 'bid_ask_spread')

        # The SQL query now calculates distance on normalized values.
        # We normalize the stored values inside the query itself.
        query = text("""
            SELECT *,
                (
                    POWER(((rsi - :rsi_min) / :rsi_range) - :norm_rsi, 2) +
                    POWER(((macd - :macd_min) / :macd_range) - :norm_macd, 2) +
                    POWER(((volatility - :vol_min) / :vol_range) - :norm_vol, 2) +
                    POWER(((sentiment - :sent_min) / :sent_range) - :norm_sent, 2) +
                    POWER(((bid_ask_spread - :spread_min) / :spread_range) - :norm_spread, 2)
                ) as distance
            FROM patterns
            ORDER BY distance ASC
            LIMIT :top_n
        """)
        
        results = self.db.execute(query, {
            "norm_rsi": norm_rsi, "rsi_min": self.feature_stats['rsi']['min'], "rsi_range": self.feature_stats['rsi']['max'] - self.feature_stats['rsi']['min'],
            "norm_macd": norm_macd, "macd_min": self.feature_stats['macd']['min'], "macd_range": self.feature_stats['macd']['max'] - self.feature_stats['macd']['min'],
            "norm_vol": norm_volatility, "vol_min": self.feature_stats['volatility']['min'], "vol_range": self.feature_stats['volatility']['max'] - self.feature_stats['volatility']['min'],
            "norm_sent": norm_sentiment, "sent_min": self.feature_stats['sentiment']['min'], "sent_range": self.feature_stats['sentiment']['max'] - self.feature_stats['sentiment']['min'],
            "norm_spread": norm_bid_ask_spread, "spread_min": self.feature_stats['bid_ask_spread']['min'], "spread_range": self.feature_stats['bid_ask_spread']['max'] - self.feature_stats['bid_ask_spread']['min'],
            "top_n": top_n
        }).mappings().all()

        return [dict(row) for row in results]