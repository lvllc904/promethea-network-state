from sqlalchemy.orm import Session
from alpaca.trading.client import TradingClient
import logging
from alpaca.trading.requests import MarketOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce

from .database import TradeDB, PortfolioHistoryDB

class PortfolioManager:
    """
    Handles the execution of trades via the brokerage API and records all
    portfolio state changes to the database. This service is the "hands"
    of the trading agent.
    """
    def __init__(self, db_session: Session, trading_client: TradingClient):
        self.db = db_session
        self.trading_client = trading_client
        logging.info("PortfolioManager initialized.")

    def get_current_portfolio_value(self) -> float:
        """
        Retrieves the current total portfolio value (cash + equity) from the Alpaca API.
        """
        try:
            account = self.trading_client.get_account()
            return float(account.portfolio_value)
        except Exception as e:
            logging.error(f"Could not get portfolio value from Alpaca: {e}")
            # Fallback to the last recorded value in the database
            last_record = self.db.query(PortfolioHistoryDB).order_by(PortfolioHistoryDB.timestamp.desc()).first()
            return last_record.value if last_record else 100000.0 # Default initial balance

    def record_portfolio_history(self):
        """
        Records the current portfolio value to the history table. This is called
        at the end of each cycle to create the data for the performance chart.
        """
        current_value = self.get_current_portfolio_value()
        new_history_point = PortfolioHistoryDB(value=current_value)
        self.db.add(new_history_point)
        self.db.commit()
        logging.info(f"Portfolio history recorded. Current Value: ${current_value:,.2f}")

    def execute_trade(self, asset_symbol: str, action: str, trade_amount_usd: float = 100.0):
        """
        Executes a paper trade via the Alpaca API and records it in the database.

        Args:
            asset_symbol: The symbol of the asset to trade (e.g., 'BTC/USD').
            action: The action to take ('buy' or 'sell').
            trade_amount_usd: The notional value of the trade in USD.
        """
        if action.lower() not in ['buy', 'sell']:
            logging.info(f"Action '{action}' is not a tradable action. No trade executed.")
            return

        # Simple mapping for common assets if not provided in symbol format
        symbol_map = {
            "bitcoin": "BTC/USD",
            "ethereum": "ETH/USD"
        }
        mapped_symbol = symbol_map.get(asset_symbol.lower(), asset_symbol)

        logging.info(f"--- Executing paper trade: {action.upper()} ${trade_amount_usd} of {mapped_symbol} ---")
        try:
            market_order_data = MarketOrderRequest(
                symbol=mapped_symbol,
                notional=trade_amount_usd,
                side=OrderSide.BUY if action.lower() == 'buy' else OrderSide.SELL,
                time_in_force=TimeInForce.GTC # Good 'Til Canceled
            )
            
            order = self.trading_client.submit_order(order_data=market_order_data)
            
            logging.info(f"✅ Paper trade submitted successfully. Order ID: {order.id}")

            # Record the trade in our local database for analysis
            new_trade = TradeDB(
                asset_id=asset_symbol,
                trade_type=action.upper(),
                quantity=float(order.qty) if order.qty else 0.0,
                price=float(order.filled_avg_price) if order.filled_avg_price else 0.0,
                notes=f"Alpaca Order ID: {order.id}"
            )
            self.db.add(new_trade)
            self.db.commit()

        except Exception as e:
            logging.error(f"--- ERROR executing trade for {asset_symbol}: {e} ---")