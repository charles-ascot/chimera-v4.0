/**
 * CHIMERA v4 - Backtest Page
 * Copyright 2026 Ascot Wealth Management
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  History, Upload, Play, TrendingUp, TrendingDown,
  DollarSign, Target, AlertCircle, Loader, CheckCircle
} from 'lucide-react'
import api from '../services/api'
import { useApp } from '../context/AppContext'

function Backtest() {
  const { addNotification, modelStatus } = useApp()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [strategies, setStrategies] = useState([])
  const [config, setConfig] = useState({
    initial_bankroll: 100000,
    stake_per_bet: 100,
    min_probability: 0.5,
    model_name: 'random_forest'
  })

  useEffect(() => {
    loadStrategies()
  }, [])

  const loadStrategies = async () => {
    try {
      const data = await api.getBacktestStrategies()
      setStrategies(data.strategies || [])
    } catch (err) {
      console.error('Failed to load strategies:', err)
    }
  }

  const applyStrategy = (strategy) => {
    setConfig(prev => ({ ...prev, ...strategy.config }))
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile)
      setResults(null)
    }
  }

  const handleBacktest = async () => {
    if (!file) {
      addNotification({ type: 'error', message: 'Please upload historical data' })
      return
    }
    if (!modelStatus?.isTrained) {
      addNotification({ type: 'error', message: 'Model not trained' })
      return
    }

    setLoading(true)
    try {
      const result = await api.uploadBacktestFile(file, config)
      setResults(result.results || result)
      addNotification({ type: 'success', message: 'Backtest completed!' })
    } catch (err) {
      addNotification({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main-container">
      {/* Left Column - Configuration */}
      <div className="control-panel">
        <motion.div 
          className="glass-panel"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="panel-title">Backtesting</h2>

          {!modelStatus?.isTrained && (
            <div className="error-message" style={{ marginBottom: '20px' }}>
              <AlertCircle size={16} style={{ marginRight: '8px' }} />
              Train the model first before backtesting
            </div>
          )}

          {/* File Upload */}
          <div
            onClick={() => document.getElementById('backtest-file').click()}
            style={{
              border: '2px dashed rgba(0, 212, 255, 0.3)',
              borderRadius: '12px',
              padding: '30px 20px',
              textAlign: 'center',
              marginBottom: '20px',
              background: file ? 'rgba(74, 222, 128, 0.05)' : 'rgba(0, 212, 255, 0.02)',
              cursor: 'pointer'
            }}
          >
            <input
              id="backtest-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {file ? (
              <>
                <CheckCircle size={32} style={{ color: '#4ade80', marginBottom: '8px' }} />
                <p style={{ color: '#4ade80', fontWeight: '600', fontSize: '14px' }}>{file.name}</p>
              </>
            ) : (
              <>
                <Upload size={32} style={{ color: '#00D4FF', marginBottom: '8px' }} />
                <p style={{ color: '#e0e0e0', fontSize: '14px' }}>Upload historical data (CSV)</p>
              </>
            )}
          </div>

          {/* Strategy Presets */}
          <h3 style={{ fontSize: '12px', color: '#9D4EDD', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
            Strategy Presets
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '20px' }}>
            {strategies.map((s, i) => (
              <button
                key={i}
                onClick={() => applyStrategy(s)}
                style={{
                  padding: '10px',
                  background: 'rgba(0, 212, 255, 0.05)',
                  border: '1px solid rgba(0, 212, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#e0e0e0',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textAlign: 'left'
                }}
              >
                <p style={{ fontWeight: '600', marginBottom: '2px' }}>{s.name}</p>
                <p style={{ color: '#888', fontSize: '10px' }}>{s.description}</p>
              </button>
            ))}
          </div>

          {/* Configuration */}
          <h3 style={{ fontSize: '12px', color: '#9D4EDD', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
            Configuration
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label style={{ color: '#888', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Initial Bankroll (£)</label>
              <input
                type="number"
                value={config.initial_bankroll}
                onChange={(e) => setConfig({ ...config, initial_bankroll: Number(e.target.value) })}
                className="form-input"
                style={{ padding: '10px', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ color: '#888', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Stake Per Bet (£)</label>
              <input
                type="number"
                value={config.stake_per_bet}
                onChange={(e) => setConfig({ ...config, stake_per_bet: Number(e.target.value) })}
                className="form-input"
                style={{ padding: '10px', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ color: '#888', fontSize: '11px', display: 'block', marginBottom: '4px' }}>Min Probability Threshold</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={config.min_probability}
                onChange={(e) => setConfig({ ...config, min_probability: Number(e.target.value) })}
                className="form-input"
                style={{ padding: '10px', fontSize: '13px' }}
              />
            </div>
          </div>

          <motion.button
            className="button-primary"
            onClick={handleBacktest}
            disabled={!file || loading || !modelStatus?.isTrained}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ marginTop: '20px' }}
          >
            {loading ? (
              <><Loader size={18} className="spin" style={{ marginRight: '8px' }} />Running Backtest...</>
            ) : (
              <><Play size={18} style={{ marginRight: '8px' }} />Run Backtest</>
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* Right Column - Results */}
      <div className="results-panel">
        <motion.div 
          className="glass-panel"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="panel-title">Backtest Results</h2>

          {results ? (
            <>
              {/* P&L Summary */}
              <div style={{
                padding: '24px',
                background: results.profit_loss >= 0 
                  ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(0, 212, 255, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(0, 212, 255, 0.05) 100%)',
                border: `1px solid ${results.profit_loss >= 0 ? 'rgba(74, 222, 128, 0.3)' : 'rgba(255, 107, 107, 0.3)'}`,
                borderRadius: '12px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                {results.profit_loss >= 0 ? (
                  <TrendingUp size={40} style={{ color: '#4ade80', marginBottom: '12px' }} />
                ) : (
                  <TrendingDown size={40} style={{ color: '#FF6B6B', marginBottom: '12px' }} />
                )}
                <p style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>Net Profit/Loss</p>
                <h3 style={{ 
                  color: results.profit_loss >= 0 ? '#4ade80' : '#FF6B6B', 
                  fontSize: '32px',
                  fontFamily: 'Lexend, sans-serif',
                  fontWeight: '700'
                }}>
                  £{results.profit_loss?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <p style={{ color: results.roi_percent >= 0 ? '#4ade80' : '#FF6B6B', fontSize: '16px', marginTop: '4px' }}>
                  {results.roi_percent >= 0 ? '+' : ''}{results.roi_percent?.toFixed(2)}% ROI
                </p>
              </div>

              {/* Stats Grid */}
              <div className="results-grid">
                <div className="result-card">
                  <DollarSign size={24} style={{ color: '#00D4FF', marginBottom: '8px' }} />
                  <div className="result-value">£{results.final_bankroll?.toLocaleString()}</div>
                  <div className="result-label">Final Bankroll</div>
                </div>
                <div className="result-card">
                  <Target size={24} style={{ color: '#9D4EDD', marginBottom: '8px' }} />
                  <div className="result-value">{results.total_bets}</div>
                  <div className="result-label">Total Bets</div>
                </div>
                <div className="result-card">
                  <CheckCircle size={24} style={{ color: '#4ade80', marginBottom: '8px' }} />
                  <div className="result-value" style={{ color: '#4ade80' }}>{results.wins}</div>
                  <div className="result-label">Wins</div>
                </div>
                <div className="result-card">
                  <AlertCircle size={24} style={{ color: '#FF6B6B', marginBottom: '8px' }} />
                  <div className="result-value" style={{ color: '#FF6B6B' }}>{results.losses}</div>
                  <div className="result-label">Losses</div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '12px', color: '#9D4EDD', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                  Performance Metrics
                </h3>
                <div className="preset-values">
                  <div className="preset-item">
                    <span className="preset-label">Win Rate</span>
                    <span className="preset-value">{results.win_rate?.toFixed(1)}%</span>
                  </div>
                  <div className="preset-item">
                    <span className="preset-label">Max Drawdown</span>
                    <span className="preset-value" style={{ color: '#FF6B6B' }}>
                      £{Math.abs(results.max_drawdown || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="preset-item">
                    <span className="preset-label">Starting Bankroll</span>
                    <span className="preset-value">£{results.initial_bankroll?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
              <History size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>Upload data and run backtest</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Backtest
