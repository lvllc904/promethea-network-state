import praw
import os
from dotenv import load_dotenv
from collections import defaultdict
import re

# Load environment variables from the project's .env file
load_dotenv()

def get_strategy_discourse_vector(subreddits: list[str], keywords: list[str]) -> list[float]:
    """
    Scrapes specified Reddit subreddits for mentions of strategy keywords in
    recent hot posts and their comments.

    Args:
        subreddits: A list of subreddit names to scrape (e.g., ['wallstreetbets']).
        keywords: A list of keywords to search for (e.g., ['HODL', 'diamond hands']).

    Returns:
        A list of floats representing the mention count for each keyword in the
        same order as the input keywords. Returns a list of zeros if scraping fails.
    """
    try:
        reddit = praw.Reddit(
            client_id=os.getenv("REDDIT_CLIENT_ID"),
            client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
            user_agent=os.getenv("REDDIT_USER_AGENT"),
            username=os.getenv("REDDIT_USERNAME"),
            password=os.getenv("REDDIT_PASSWORD"),
            check_for_async=False
        )
        # Verify that authentication was successful
        if reddit.read_only:
            print("--- WARNING: PRAW started in read-only mode. Check credentials. ---")

    except Exception as e:
        print(f"--- ERROR: Failed to initialize PRAW. Check .env credentials. Error: {e} ---")
        return [0.0] * len(keywords)

    keyword_counts = defaultdict(int)
    # Use a case-insensitive regex for matching
    keyword_regex = {kw: re.compile(r'\b' + re.escape(kw) + r'\b', re.IGNORECASE) for kw in keywords}

    for subreddit_name in subreddits:
        try:
            subreddit = reddit.subreddit(subreddit_name)
            # Scrape the top 10 hot posts
            for submission in subreddit.hot(limit=10):
                # Check post title
                for keyword, pattern in keyword_regex.items():
                    if pattern.search(submission.title):
                        keyword_counts[keyword] += 1
                
                # Check post body
                if submission.selftext:
                    for keyword, pattern in keyword_regex.items():
                         if pattern.search(submission.selftext):
                            keyword_counts[keyword] += 1

                # Check comments (limit to top-level comments for performance)
                submission.comments.replace_more(limit=0)
                for comment in submission.comments.list():
                    for keyword, pattern in keyword_regex.items():
                        if pattern.search(comment.body):
                            keyword_counts[keyword] += 1
        except Exception as e:
            print(f"--- WARNING: Could not scrape subreddit '{subreddit_name}'. Error: {e} ---")
            continue

    # Return the counts in the same order as the input keywords
    return [float(keyword_counts.get(kw, 0)) for kw in keywords]
