// This file centralizes the feature manifest so the UI can understand the state vector.
// It MUST be kept in sync with `trading_agent/config.py`.

// The full manifest is now an object of arrays, corresponding to the vectors
// constructed in `data_service.py`.
export const getFeatureManifest = () => {
  const manifest = {
    technical: [ // 12 features
      'price', 'price_change_1', 'volatility_20', 'RSI_14', 
      'MACD_12_26_9', 'MACDh_12_26_9', 'MACDs_12_26_9', 
      'SMA_7', 'SMA_20', 'BBL_20_2.0', 'BBM_20_2.0', 'BBU_20_2.0'
    ],
    economic: [ // 5 features
      'FED_FUNDS_RATE', 'CPI', 'GDP', 'UNEMPLOYMENT', 'VIX'
    ],
    psychology: [ // 5 features
      'news_sentiment_pos', 'news_sentiment_neg', 'news_sentiment_neu',
      'gtrends_accel', 'put_call_ratio'
    ],
    entanglement: [ // 1 feature
      'corr_ethereum'
    ],
    chaos: [ // 1 feature
      'corr_instability'
    ],
    reflexivity: [ // 12 features
      'd_hodl', 'd_diamond', 'd_moon', 'd_gamma', 'd_short',
      'd_fed', 'd_inflation', 'd_rates', 'd_yolo', 'd_tendies',
      'cot_crowdedness', 'model_correlation'
    ],
    portfolio: [ // 5 features
      'total_value', 'unrealized_pnl', 'port_volatility', 
      'sharpe_ratio', 'asset_quantity'
    ],
    liquidity: [ // 2 features
      'bid_ask_spread', 'placeholder_liq'
    ]
  };

  // This function will be useful for slicing the vector in the UI
  manifest.getOffset = (vectorName) => {
    const order = ['technical', 'economic', 'psychology', 'entanglement', 'chaos', 'reflexivity', 'portfolio', 'liquidity'];
    let offset = 0;
    for (const name of order) {
      if (name === vectorName) return offset;
      offset += manifest[name].length;
    }
    return -1; // Should not happen
  };

  return manifest;
};