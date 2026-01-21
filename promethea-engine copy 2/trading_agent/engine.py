import asyncio
import pandas as pd
import logging
from sqlalchemy.orm import Session
from .Services.agent import GenerativeAgent
from .Services.data_service import DataService
from .Services.analysis_service import AnalysisService
# MODIFICATION: Import all necessary services for the full cycle.
from .Services.scanner_service import ScannerService
from .Services.data_providers import AlpacaProvider
from .Services.portfolio_manager import PortfolioManager
from .Services.pattern_recognition_service import PatternRecognitionService
from .config import get_settings


class TradingEngine:
    """
    The central orchestrator of the Promethea trading system.
    This class contains the main "heartbeat" loop that drives the agent.
    """
    def __init__(self, db_session: Session):
        logging.info("--- Initializing Trading Engine ---")
        self.settings = get_settings()
        self.db_session = db_session
        
        # Initialize all the core services the engine will orchestrate
        # Initialize all the core services the engine will orchestrate
        is_paper = self.settings.trading_mode.lower() == "paper"
        logging.info(f"--- Market Provider Mode: {'PAPER' if is_paper else 'LIVE'} ---")
        self.market_provider = AlpacaProvider(paper_trading=is_paper)
        self.agent = GenerativeAgent(config=self.settings.agent_config)
        self.analysis_service = AnalysisService(db_session=self.db_session)
        self.scanner_service = ScannerService(db_session=self.db_session, market_provider=self.market_provider)
        # MODIFICATION: Instantiate the new services for acting and learning.
        self.portfolio_manager = PortfolioManager(db_session=self.db_session, trading_client=self.market_provider.trading_client)
        self.pattern_service = PatternRecognitionService(db_session=self.db_session)
        
        self.is_running = False

    async def start(self):
        """Starts the main trading loop as a continuous background task."""
        self.is_running = True
        logging.info("✅ Trading Engine started. Beginning operational loop...")
        while self.is_running:
            try:
                await self.run_cycle()
            except Exception as e:
                logging.error(f"--- ERROR in operational loop: {e} ---", exc_info=True)
                # In a real system, you'd have more robust error handling and notifications here.
                await asyncio.sleep(self.settings.error_retry_delay) # Wait before retrying

    def stop(self):
        """Stops the trading loop gracefully."""
        logging.info("--- Stopping Trading Engine ---")
        self.is_running = False

    async def run_cycle(self):
        """
        Executes a single "observe -> decide -> analyze -> learn" cycle.
        This is the core heartbeat of the agent.
        """
        logging.info("\n" + "="*50)
        logging.info(f"[{pd.Timestamp.utcnow()}] Running new agent cycle...")

        # 1. SCAN: The "attention mechanism" identifies which asset to focus on.
        target_asset_id = await self.scanner_service.find_most_volatile_asset()
        if not target_asset_id: # The scanner service already logs its own errors/warnings
            logging.warning("Scanner returned no asset. Skipping cycle.")
            await asyncio.sleep(self.settings.cycle_interval)
            return

        # 2. OBSERVE: Get the current, normalized state of the market for the chosen asset.
        # 2. OBSERVE: Get the current, normalized state of the market for the chosen asset.
        data_service = DataService(asset_id=target_asset_id, market_provider=self.market_provider)
        result = await data_service.get_unified_state_vector()
        
        if isinstance(result, Exception) or result is None:
            logging.warning(f"DataService failed to provide a state vector: {result}. Skipping cycle.")
            await asyncio.sleep(self.settings.cycle_interval)
            return

        # Unpack the tuple (vector, failures)
        current_state, failures = result
        if failures:
            logging.warning(f"DataService reported soft failures: {failures}")
        
        if current_state is None:
             logging.warning("State vector is None after unpacking. Skipping cycle.")
             await asyncio.sleep(self.settings.cycle_interval)
             return
        
        # 3. DECIDE: The agent uses its brain to choose an action.
        action = self.agent.choose_action(current_state)
        logging.info(f"🤖 Agent has decided to: **{action}**")

        # 4. ACT: The Portfolio Manager executes the agent's decision as a paper trade.
        self.portfolio_manager.execute_trade(
            asset_symbol=target_asset_id,
            action=action,
            trade_amount_usd=self.settings.trade_amount_usd
        )

        # 5. ANALYZE: The "critic" determines if the outcome was surprising.
        # First, we record the new portfolio value to create a history point.
        self.portfolio_manager.record_portfolio_history()
        # We pass the action the agent *just took* to the analysis service.
        analysis_result = self.analysis_service.analyze_outcome(agent_action=action)

        # 6. LEARN: If the outcome was significant, we add it to our local experience log.
        if analysis_result:
            outcome, surprise_score = analysis_result
            # The PatternRecognitionService saves the significant event.
            self.pattern_service.save_pattern(
                state_vector=data_service.get_last_unnormalized_vector_as_dict(),
                outcome=outcome,
                surprise_score=surprise_score # Pass the score to the service
            )
        else:
            logging.info("Outcome was within normal parameters. No significant memory recorded.")
        
        logging.info(f"⏳ Cycle complete. Waiting for {self.settings.cycle_interval} seconds...")
        await asyncio.sleep(self.settings.cycle_interval)
