/**
 * CHIMERA v4 - Analysis Page
 * Copyright 2026 Ascot Wealth Management
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, Upload, FileText, TrendingUp,
  PieChart, Activity, Loader, CheckCircle
} from 'lucide-react'
import api from '../services/api'
import { useApp } from '../context/AppContext'

function Analysis() {
  const { addNotification } = useApp()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [analysisType, setAnalysisType] = useState('eda')
  const [results, setResults] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile)
      setResults(null)
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      addNotification({ type: 'error', message: 'Please upload a file first' })
      return
    }

    setLoading(true)
    try {
      const result = await api.uploadAnalysisFile(file, analysisType)
      setResults(result)
      addNotification({ type: 'success', message: 'Analysis completed!' })
    } catch (err) {
      addNotification({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main-container">
      {/* Left Column - Controls */}
      <div className="control-panel">
        <motion.div 
          className="glass-panel"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="panel-title">Data Analysis</h2>

          {/* File Upload */}
          <div
            onClick={() => document.getElementById('analysis-file').click()}
            style={{
              border: '2px dashed rgba(0, 212, 255, 0.3)',
              borderRadius: '12px',
              padding: '40px 20px',
              textAlign: 'center',
              marginBottom: '24px',
              background: file ? 'rgba(74, 222, 128, 0.05)' : 'rgba(0, 212, 255, 0.02)',
              cursor: 'pointer'
            }}
          >
            <input
              id="analysis-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {file ? (
              <>
                <CheckCircle size={40} style={{ color: '#4ade80', marginBottom: '12px' }} />
                <p style={{ color: '#4ade80', fontWeight: '600' }}>{file.name}</p>
                <p style={{ color: '#888', fontSize: '12px' }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <Upload size={40} style={{ color: '#00D4FF', marginBottom: '12px' }} />
                <p style={{ color: '#e0e0e0' }}>Upload CSV for analysis</p>
              </>
            )}
          </div>

          {/* Analysis Type */}
          <div className="form-group">
            <label className="form-label">Analysis Type</label>
            <select
              className="tier-select"
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
            >
              <option value="eda">Exploratory Data Analysis</option>
              <option value="feature_analysis">Feature Analysis</option>
              <option value="correlation">Correlation Analysis</option>
            </select>
          </div>

          {/* Analysis Types Description */}
          <div className="preset-values" style={{ marginTop: '20px' }}>
            <div className="preset-item">
              <span className="preset-label">EDA</span>
              <span className="preset-value">Statistics & distributions</span>
            </div>
            <div className="preset-item">
              <span className="preset-label">Features</span>
              <span className="preset-value">Key factor analysis</span>
            </div>
            <div className="preset-item">
              <span className="preset-label">Correlation</span>
              <span className="preset-value">Feature relationships</span>
            </div>
          </div>

          <motion.button
            className="button-primary"
            onClick={handleAnalyze}
            disabled={!file || loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ marginTop: '20px' }}
          >
            {loading ? (
              <><Loader size={18} className="spin" style={{ marginRight: '8px' }} />Analyzing...</>
            ) : (
              <><BarChart3 size={18} style={{ marginRight: '8px' }} />Run Analysis</>
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
          <h2 className="panel-title">Analysis Results</h2>

          {results ? (
            <>
              {/* Overview Stats */}
              <div className="results-grid" style={{ marginBottom: '20px' }}>
                <div className="result-card">
                  <FileText size={24} style={{ color: '#00D4FF', marginBottom: '8px' }} />
                  <div className="result-value">{results.rows?.toLocaleString() || results.analysis?.total_rows?.toLocaleString()}</div>
                  <div className="result-label">Total Rows</div>
                </div>
                <div className="result-card">
                  <Activity size={24} style={{ color: '#9D4EDD', marginBottom: '8px' }} />
                  <div className="result-value">{results.columns || results.analysis?.total_columns}</div>
                  <div className="result-label">Columns</div>
                </div>
              </div>

              {/* Analysis Details */}
              {results.analysis && (
                <div style={{
                  padding: '16px',
                  background: 'rgba(0, 212, 255, 0.02)',
                  border: '1px solid rgba(0, 212, 255, 0.1)',
                  borderRadius: '10px'
                }}>
                  <h3 style={{ 
                    fontSize: '13px', 
                    color: '#9D4EDD', 
                    marginBottom: '16px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {analysisType === 'eda' && 'Statistics'}
                    {analysisType === 'feature_analysis' && 'Feature Insights'}
                    {analysisType === 'correlation' && 'Correlations'}
                  </h3>

                  {/* EDA Statistics */}
                  {results.analysis.statistics && (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {Object.entries(results.analysis.statistics).map(([col, stats]) => (
                        <div key={col} style={{
                          padding: '12px',
                          background: 'rgba(0, 212, 255, 0.05)',
                          borderRadius: '8px',
                          marginBottom: '8px'
                        }}>
                          <p style={{ color: '#00D4FF', fontWeight: '600', marginBottom: '8px' }}>{col}</p>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '11px' }}>
                            <div><span style={{ color: '#888' }}>Mean:</span> <span style={{ color: '#e0e0e0' }}>{stats.mean?.toFixed(2)}</span></div>
                            <div><span style={{ color: '#888' }}>Std:</span> <span style={{ color: '#e0e0e0' }}>{stats.std?.toFixed(2)}</span></div>
                            <div><span style={{ color: '#888' }}>Min:</span> <span style={{ color: '#e0e0e0' }}>{stats.min?.toFixed(2)}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Feature Analysis */}
                  {results.analysis.top_jockeys && (
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Top Jockeys by Wins</p>
                      {Object.entries(results.analysis.top_jockeys).slice(0, 5).map(([id, wins]) => (
                        <div key={id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px' }}>
                          <span style={{ color: '#e0e0e0' }}>Jockey {id}</span>
                          <span style={{ color: '#4ade80' }}>{wins} wins</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Correlation */}
                  {results.analysis.top_target_correlations && (
                    <div>
                      <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Target Correlations</p>
                      {Object.entries(results.analysis.top_target_correlations).map(([feature, corr]) => (
                        <div key={feature} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px' }}>
                          <span style={{ color: '#e0e0e0' }}>{feature}</span>
                          <span style={{ color: corr > 0.3 ? '#4ade80' : '#00D4FF' }}>{corr.toFixed(3)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Target Distribution */}
                  {results.analysis.target_distribution && (
                    <div style={{ marginTop: '16px' }}>
                      <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>Target Distribution</p>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1, padding: '12px', background: 'rgba(255, 107, 107, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
                          <p style={{ color: '#FF6B6B', fontSize: '18px', fontWeight: '700' }}>{results.analysis.target_distribution[0]?.toLocaleString()}</p>
                          <p style={{ color: '#888', fontSize: '11px' }}>Non-Winners</p>
                        </div>
                        <div style={{ flex: 1, padding: '12px', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '8px', textAlign: 'center' }}>
                          <p style={{ color: '#4ade80', fontSize: '18px', fontWeight: '700' }}>{results.analysis.target_distribution[1]?.toLocaleString()}</p>
                          <p style={{ color: '#888', fontSize: '11px' }}>Winners</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
              <PieChart size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>Upload data and run analysis</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Analysis
