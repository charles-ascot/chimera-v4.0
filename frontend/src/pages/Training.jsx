/**
 * CHIMERA v4 - Training Page
 * Copyright 2026 Ascot Wealth Management
 */

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Upload, Brain, Play, CheckCircle, AlertCircle,
  FileText, Settings, BarChart2, Loader
} from 'lucide-react'
import api from '../services/api'
import { useApp } from '../context/AppContext'

function Training() {
  const { addNotification, fetchSystemStatus } = useApp()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [trainingStatus, setTrainingStatus] = useState(null)
  const [results, setResults] = useState(null)
  const [config, setConfig] = useState({
    applySmote: true,
    testSize: 0.3,
    crossValidationFolds: 5
  })

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile)
      setResults(null)
    } else {
      addNotification({ type: 'error', message: 'Please select a CSV file' })
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile)
      setResults(null)
    }
  }, [])

  const handleTrain = async () => {
    if (!file) {
      addNotification({ type: 'error', message: 'Please upload a training file first' })
      return
    }

    setLoading(true)
    setTrainingStatus('uploading')

    try {
      setTrainingStatus('training')
      const result = await api.uploadTrainingFile(file, config.applySmote)
      
      setResults(result)
      setTrainingStatus('complete')
      addNotification({ type: 'success', message: 'Model training completed successfully!' })
      fetchSystemStatus()
    } catch (err) {
      setTrainingStatus('error')
      addNotification({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main-container">
      {/* Left Column - Upload & Config */}
      <div className="control-panel">
        <motion.div 
          className="glass-panel"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="panel-title">Model Training</h2>
          
          {/* File Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            style={{
              border: '2px dashed rgba(0, 212, 255, 0.3)',
              borderRadius: '12px',
              padding: '40px 20px',
              textAlign: 'center',
              marginBottom: '24px',
              background: file ? 'rgba(74, 222, 128, 0.05)' : 'rgba(0, 212, 255, 0.02)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            
            {file ? (
              <>
                <CheckCircle size={40} style={{ color: '#4ade80', marginBottom: '12px' }} />
                <p style={{ color: '#4ade80', fontWeight: '600', marginBottom: '4px' }}>
                  {file.name}
                </p>
                <p style={{ color: '#888', fontSize: '12px' }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <Upload size={40} style={{ color: '#00D4FF', marginBottom: '12px' }} />
                <p style={{ color: '#e0e0e0', marginBottom: '4px' }}>
                  Drop CSV file here or click to upload
                </p>
                <p style={{ color: '#888', fontSize: '12px' }}>
                  Training data with horse racing features
                </p>
              </>
            )}
          </div>

          {/* Training Configuration */}
          <h3 style={{ 
            fontSize: '13px', 
            color: '#9D4EDD', 
            marginBottom: '16px',
            fontWeight: '600',
            textTransform: 'uppercase'
          }}>
            Training Configuration
          </h3>

          <div className="preset-values">
            <div className="preset-item">
              <span className="preset-label">Apply SMOTE</span>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={config.applySmote}
                  onChange={(e) => setConfig({ ...config, applySmote: e.target.checked })}
                  style={{ marginRight: '8px' }}
                />
                <span className="preset-value">
                  {config.applySmote ? 'Yes (Recommended)' : 'No'}
                </span>
              </label>
            </div>
            <div className="preset-item">
              <span className="preset-label">Test Split</span>
              <span className="preset-value">30%</span>
            </div>
            <div className="preset-item">
              <span className="preset-label">Cross-Validation</span>
              <span className="preset-value">5-Fold</span>
            </div>
            <div className="preset-item">
              <span className="preset-label">Algorithms</span>
              <span className="preset-value">RF, LR, k-NN, NB</span>
            </div>
          </div>

          {/* Train Button */}
          <motion.button
            className="button-primary"
            onClick={handleTrain}
            disabled={!file || loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ marginTop: '16px' }}
          >
            {loading ? (
              <>
                <Loader size={18} className="spin" style={{ marginRight: '8px' }} />
                Training Models...
              </>
            ) : (
              <>
                <Brain size={18} style={{ marginRight: '8px' }} />
                Train Models
              </>
            )}
          </motion.button>

          {/* Training Status */}
          {trainingStatus && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              borderRadius: '8px',
              background: trainingStatus === 'complete' 
                ? 'rgba(74, 222, 128, 0.1)' 
                : trainingStatus === 'error'
                ? 'rgba(255, 107, 107, 0.1)'
                : 'rgba(0, 212, 255, 0.1)',
              border: `1px solid ${
                trainingStatus === 'complete' ? 'rgba(74, 222, 128, 0.3)' 
                : trainingStatus === 'error' ? 'rgba(255, 107, 107, 0.3)'
                : 'rgba(0, 212, 255, 0.3)'
              }`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {trainingStatus === 'complete' && <CheckCircle size={16} style={{ color: '#4ade80' }} />}
                {trainingStatus === 'error' && <AlertCircle size={16} style={{ color: '#FF6B6B' }} />}
                {(trainingStatus === 'uploading' || trainingStatus === 'training') && 
                  <Loader size={16} className="spin" style={{ color: '#00D4FF' }} />}
                <span style={{ 
                  color: trainingStatus === 'complete' ? '#4ade80' 
                    : trainingStatus === 'error' ? '#FF6B6B' : '#00D4FF',
                  fontSize: '13px',
                  fontWeight: '600'
                }}>
                  {trainingStatus === 'uploading' && 'Uploading data...'}
                  {trainingStatus === 'training' && 'Training models...'}
                  {trainingStatus === 'complete' && 'Training complete!'}
                  {trainingStatus === 'error' && 'Training failed'}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Right Column - Results */}
      <div className="results-panel">
        <motion.div 
          className="glass-panel"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="panel-title">Training Results</h2>

          {results ? (
            <>
              {/* Best Model */}
              <div style={{
                padding: '20px',
                background: 'rgba(74, 222, 128, 0.1)',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                borderRadius: '12px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>
                  Best Performing Model
                </p>
                <h3 style={{ 
                  color: '#4ade80', 
                  fontSize: '24px',
                  fontFamily: 'Lexend, sans-serif',
                  fontWeight: '700'
                }}>
                  {results.best_model?.replace('_', ' ').toUpperCase()}
                </h3>
                <p style={{ color: '#4ade80', fontSize: '16px', marginTop: '4px' }}>
                  ROC-AUC: {(results.best_score * 100).toFixed(1)}%
                </p>
              </div>

              {/* Model Comparison */}
              <h3 style={{ 
                fontSize: '13px', 
                color: '#9D4EDD', 
                marginBottom: '16px',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                All Models
              </h3>

              {results.results && Object.entries(results.results).map(([name, metrics]) => (
                <div key={name} style={{
                  padding: '16px',
                  background: name === results.best_model 
                    ? 'rgba(74, 222, 128, 0.05)' 
                    : 'rgba(0, 212, 255, 0.02)',
                  border: `1px solid ${name === results.best_model 
                    ? 'rgba(74, 222, 128, 0.3)' 
                    : 'rgba(0, 212, 255, 0.1)'}`,
                  borderRadius: '10px',
                  marginBottom: '12px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <span style={{ 
                      color: '#e0e0e0', 
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      {name.replace('_', ' ')}
                    </span>
                    {name === results.best_model && (
                      <span style={{
                        padding: '2px 8px',
                        background: 'rgba(74, 222, 128, 0.2)',
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: '#4ade80',
                        fontWeight: '600'
                      }}>
                        BEST
                      </span>
                    )}
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '12px',
                    fontSize: '12px'
                  }}>
                    <div>
                      <p style={{ color: '#888', marginBottom: '2px' }}>Accuracy</p>
                      <p style={{ color: '#00D4FF', fontWeight: '600' }}>
                        {(metrics.accuracy * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p style={{ color: '#888', marginBottom: '2px' }}>F1 Score</p>
                      <p style={{ color: '#00D4FF', fontWeight: '600' }}>
                        {(metrics.f1_score * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p style={{ color: '#888', marginBottom: '2px' }}>ROC-AUC</p>
                      <p style={{ color: '#4ade80', fontWeight: '600' }}>
                        {metrics.roc_auc ? `${(metrics.roc_auc * 100).toFixed(1)}%` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: '#888', marginBottom: '2px' }}>CV Mean</p>
                      <p style={{ color: '#9D4EDD', fontWeight: '600' }}>
                        {(metrics.cv_mean * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: '#888'
            }}>
              <BarChart2 size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ marginBottom: '8px' }}>No training results yet</p>
              <p style={{ fontSize: '12px' }}>
                Upload a CSV file and train models to see results
              </p>
            </div>
          )}

          {/* Methodology Reference */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(157, 78, 221, 0.1)',
            border: '1px solid rgba(157, 78, 221, 0.2)',
            borderRadius: '10px'
          }}>
            <h4 style={{ 
              color: '#9D4EDD', 
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              📊 Paper Methodology
            </h4>
            <p style={{ color: '#888', fontSize: '11px', lineHeight: '1.6' }}>
              SMOTE technique achieves 99.56% class balance. Random Forest with 5-fold 
              cross-validation achieves 97.6% ROC-AUC on horse racing data with 23 features.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Training
