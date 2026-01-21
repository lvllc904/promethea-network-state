import feedparser
import polars as pl
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

class RSSNewsProvider:
    """
    Fetches news from RSS feeds and analyzes their sentiment to produce
    a sentiment distribution vector (delta_t) as defined in the roadmap.

    This provider is designed to be used within the agent's data gathering
    process.
    """

    def __init__(self, rss_urls: list[str]):
        """
        Initializes the provider with a list of RSS feed URLs.

        Args:
            rss_urls: A list of strings, where each string is a URL to an RSS feed.
        """
        if not rss_urls:
            raise ValueError("The list of RSS feed URLs cannot be empty.")
        self.rss_urls = rss_urls
        self.analyzer = SentimentIntensityAnalyzer()

    def get_sentiment_distribution(self, asset_symbol: str) -> list[float]:
        """
        Fetches news for a given asset, analyzes sentiment, and returns the
        normalized distribution of positive, negative, and neutral articles.

        Args:
            asset_symbol: The stock symbol to search for in news articles (e.g., 'AAPL').

        Returns:
            A 3-element list of floats representing the normalized distribution
            of [positive, negative, neutral] sentiment. Returns [0.0, 0.0, 0.0]
            if no relevant articles are found.
        """
        sentiment_counts = {'pos': 0, 'neg': 0, 'neu': 0}
        total_articles = 0

        for url in self.rss_urls:
            feed = feedparser.parse(url)
            for entry in feed.entries:
                # Check if the asset symbol is mentioned in the title or summary
                title = entry.get('title', '')
                summary = entry.get('summary', '')

                if asset_symbol.lower() in title.lower() or asset_symbol.lower() in summary.lower():
                    # Use the title for sentiment analysis as it's more concise
                    vs = self.analyzer.polarity_scores(title)
                    total_articles += 1

                    # Classify sentiment based on the compound score
                    # These thresholds are standard for VADER
                    if vs['compound'] >= 0.05:
                        sentiment_counts['pos'] += 1
                    elif vs['compound'] <= -0.05:
                        sentiment_counts['neg'] += 1
                    else:
                        sentiment_counts['neu'] += 1

        if total_articles == 0:
            # Avoid division by zero if no articles are found
            return [0.0, 0.0, 0.0]

        # Normalize the counts to get the distribution vector
        pos_dist = sentiment_counts['pos'] / total_articles
        neg_dist = sentiment_counts['neg'] / total_articles
        neu_dist = sentiment_counts['neu'] / total_articles

        # The vector delta_t as per the roadmap
        delta_t = [pos_dist, neg_dist, neu_dist]

        return delta_t