from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict, Any

class AssetTokenizedEvent(BaseModel):
    asset_id: str = Field(..., description="The unique identifier for the asset (e.g., 'BTC-USD').")
    initial_price: float = Field(..., description="The price of the asset at the time of tokenization.")
    tokenization_timestamp: datetime = Field(..., description="The timestamp when the asset was tokenized.")

class GovernanceProposalEvent(BaseModel):
    proposal_id: str = Field(..., description="The unique identifier for the governance proposal.")
    proposal_type: str = Field(..., description="The type of proposal (e.g., 'risk_parameter_change').")
    details: Dict[str, Any] = Field(..., description="A dictionary containing the specific details of the proposal.")

class TradeExecutedEvent(BaseModel):
    trade_id: str = Field(..., description="The unique identifier for the trade.")
    asset_id: str = Field(..., description="The asset that was traded.")
    action: str = Field(..., description="The action taken (e.g., 'buy', 'sell', 'hold').")
    quantity: float = Field(..., description="The quantity of the asset that was traded.")
    price: float = Field(..., description="The price at which the trade was executed.")
    timestamp: datetime = Field(..., description="The timestamp of the trade execution.")

class PortfolioRebalancedEvent(BaseModel):
    portfolio_id: str = Field(..., description="The unique identifier for the portfolio.")
    new_allocations: Dict[str, float] = Field(..., description="The new allocations of assets in the portfolio.")
    timestamp: datetime = Field(..., description="The timestamp of the portfolio rebalance.")
