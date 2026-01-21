import os
import praw
import time
import numpy as np
from promethea.utils import load_project_env

class DiscourseProvider:
    """
    Scrapes and analyzes financial forums (Reddit) to calculate the
    Strategy Discourse Metric (D_t) as defined in the roadmap.

    This metric quantifies the prevalence of specific trading strategy keywords,
    providing a view into the current market narrative.
    """

    def __init__(self, subreddits: list[str] | None = None):
        """
        Initializes the provider, setting up the Reddit API connection and
        defining the strategy keywords to track.
        """
        load_project_env()
        
        self.reddit = praw.Reddit(
            client_id=os.getenv("REDDIT_CLIENT_ID"),
            client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
            user_agent=os.getenv("REDDIT_USER_AGENT"),
        )

        self.subreddits = subreddits if subreddits else ['wallstreetbets', 'stocks', 'investing']
        
        # Keywords representing different market narratives/strategies
        self.strategy_keywords = [
            "hodl", "diamond hands", "to the moon", # Momentum/Retail Conviction
            "gamma squeeze", "short squeeze",      # Technical/Structural Plays
            "fed", "inflation", "interest rates",  # Macro-economic Focus
            "yolo", "tendies",                     # High-Risk/Gambling
        ]
        
        # Decay factor for exponential weighting (lambda in the formula)
        # A value of 0.1 means the weight decreases by 10% for each day older.
        self.decay_factor = 0.1

        self._cache = None
        self._cache_ttl = 600  # 10 minutes

    def get_strategy_discourse_vector(self) -> list[float]:
        """
        Fetches recent posts from specified subreddits and calculates the
        exponentially-decayed frequency of strategy keywords.

        The score for each keyword is a weighted sum of its mentions, where
        more recent mentions are weighted more heavily.

        Returns:
            A list of floats representing the normalized, decayed frequency
            for each keyword in self.strategy_keywords.
        """
        # Check cache first
        current_time = time.time()
        if self._cache:
            cached_data, timestamp = self._cache
            if current_time - timestamp < self._cache_ttl:
                return cached_data

        try:
            # 1. Initialize scores vector and set constants
            scores = np.zeros(len(self.strategy_keywords))
            current_time = time.time()
            submission_limit = 50  # Fetch 50 'hot' posts per subreddit

            # 2. Iterate through each subreddit
            for subreddit_name in self.subreddits:
                subreddit = self.reddit.subreddit(subreddit_name)
                # 3. Fetch top N 'hot' submissions
                for submission in subreddit.hot(limit=submission_limit):
                    # 4. Calculate age in days
                    age_days = (current_time - submission.created_utc) / 86400
                    
                    # 5. Calculate decay weight
                    weight = np.exp(-self.decay_factor * age_days)
                    
                    # 6. Combine title and selftext for searching
                    content = (submission.title + " " + submission.selftext).lower()
                    
                    # 7. Search for each keyword and add weighted score
                    for i, keyword in enumerate(self.strategy_keywords):
                        if keyword.lower() in content:
                            scores[i] += weight
            
            # 8. Normalize the final scores vector to create a distribution
            total_score = np.sum(scores)
            normalized_scores = scores / total_score if total_score > 0 else scores

            # 9. Return the normalized vector as a list
            d_t_vector = normalized_scores.tolist()

            # Store result in cache
            self._cache = (d_t_vector, current_time)

            return d_t_vector

        except Exception as e:
            print(f"An error occurred during Reddit discourse analysis: {e}")
            # On failure, return the last known good value, or a default vector.
            if self._cache:
                return self._cache[0]
            return [0.0] * len(self.strategy_keywords)