/**
 * CHIMERA v4 - Predictions Page
 * Copyright 2026 Ascot Wealth Management
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Target, Trophy, TrendingUp, AlertCircle,
  Plus, Minus, Play, Loader, Award
} from 'lucide-react'
import api from '../services/api'
import { useApp } from '../context/AppContext'

const defaultHorse = {
  horse_seq: '',
  age: '',
  weight: '',
  body_weight: '',
  draw: '',
  sex: '',
  shoe: 'A',
  jockey_id: '',
  trainer_id: '',
  distance: '',
  track: '',
  penetrometer: '',
  season: 'regular',
  club_name: '',
  race_fav_horse: ''
}

function Predictions() {
  const { addNotification, modelStatus } = useApp()
  const [runners, setRunners] = useState([{ ...defaultHorse, horse_seq: 1 }])
  const [loading, setLoading] = useState(false)
  const [predictions, setPredictions] = useState(null)
  const [selectedModel, setSelectedModel] = useState('random_forest')

  const addRunner = () => {
    setRunners([...runners, { ...defaultHorse, horse_seq: runners.length + 1 }])
  }

  const removeRunner = (index) => {
    if (runners.length > 1) {
      const newRunners = runners.filter((_, i) => i !== index)
      setRunners(newRunners.map((r, i) => ({ ...r, horse_seq: i + 1 })))
    }
  }

  const updateRunner = (index, field, value) => {
    const newRunners = [...runners]
    newRunners[index] = { ...newRunners[index], [field]: value }
    setRunners(newRunners)
  }

  const handlePredict = async () => {
    if (!modelStatus?.isTrained) {
      addNotification({ type: 'error', message: 'Model not trained. Please train the model first.' })
      return
    }

    setLoading(true)
    try {
      const result = await api.predictRace({
        race_id: `race_${Date.now()}`,
        runners: runners,
        model_name: selectedModel
      })
      setPredictions(result)
      addNotification({ type: 'success', message: 'Predictions generated successfully!' })
    } catch (err) {
      addNotification({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'very_high': return '#4ade80'
      case 'high': return '#00D4FF'
      case 'medium': return '#ffc107'
      case 'low': return '#ff9800'
      default: return '#FF6B6B'
    }
  }

  return (
    <div className="main-container">
      {/* Left Column - Input */}
      <div className="control-panel">
        <motion.div 
          className="glass-panel"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="panel-title">Race Prediction</h2>

          {!modelStatus?.isTrained && (
            <div className="error-message" style={{ marginBottom: '20px' }}>
              <AlertCircle size={16} style={{ marginRight: '8px' }} />
              Model not trained. Please train the model first.
            </div>
          )}

          {/* Model Selection */}
          <div className="form-group">
            <label className="form-label">Prediction Model</label>
            <select
              className="tier-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              <option value="random_forest">Random Forest (Recommended)</option>
              <option value="logistic_regression">Logistic Regression</option>
              <option value="knn">k-Nearest Neighbors</option>
              <option value="naive_bayes">Naive Bayes</option>
            </select>
          </div>

          {/* Runners Input */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{ 
                fontSize: '13px', 
                color: '#9D4EDD',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                Runners ({runners.length})
              </h3>
              <button
                onClick={addRunner}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  background: 'rgba(0, 212, 255, 0.1)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '6px',
                  color: '#00D4FF',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} /> Add Runner
              </button>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {runners.map((runner, index) => (
                <div key={index} style={{
                  padding: '16px',
                  background: 'rgba(0, 212, 255, 0.02)',
                  border: '1px solid rgba(0, 212, 255, 0.1)',
                  borderRadius: '10px',
                  marginBottom: '12px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <span style={{ color: '#00D4FF', fontWeight: '600', fontSize: '13px' }}>
                      Horse #{runner.horse_seq}
                    </span>
                    {runners.length > 1 && (
                      <button
                        onClick={() => removeRunner(index)}
                        style={{
                          background: 'rgba(255, 107, 107, 0.1)',
                          border: '1px solid rgba(255, 107, 107, 0.3)',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          color: '#FF6B6B',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        <Minus size={12} />
                      </button>
                    )}
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px'
                  }}>
                    <input
                      type="number"
                      placeholder="Age"
                      value={runner.age}
                      onChange={(e) => updateRunner(index, 'age', e.target.value)}
                      className="form-input"
                      style={{ padding: '8px', fontSize: '12px' }}
                    />
                    <input
                      type="number"
                      placeholder="Draw"
                      value={runner.draw}
                      onChange={(e) => updateRunner(index, 'draw', e.target.value)}
                      className="form-input"
                      style={{ padding: '8px', fontSize: '12px' }}
                    />
                    <input
                      type="number"
                      placeholder="Body Weight"
                      value={runner.body_weight}
                      onChange={(e) => updateRunner(index, 'body_weight', e.target.value)}
                      className="form-input"
                      style={{ padding: '8px', fontSize: '12px' }}
                    />
                    <select
                      value={runner.sex}
                      onChange={(e) => updateRunner(index, 'sex', e.target.value)}
                      className="form-input"
                      style={{ padding: '8px', fontSize: '12px' }}
                    >
                      <option value="">Sex</option>
                      <option value="colt">Colt</option>
                      <option value="filly">Filly</option>
                      <option value="gelding">Gelding</option>
                      <option value="mare">Mare</option>
                    </select>
                    <select
                      value={runner.shoe}
                      onChange={(e) => updateRunner(index, 'shoe', e.target.value)}
                      className="form-input"
                      style={{ padding: '8px', fontSize: '12px' }}
                    >
                      <option value="A">Aluminium</option>
                      <option value="S">Steel</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Jockey ID"
                      value={runner.jockey_id}
                      onChange={(e) => updateRunner(index, 'jockey_id', e.target.value)}
                      className="form-input"
                      style={{ padding: '8px', fontSize: '12px' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Predict Button */}
          <motion.button
            className="button-primary"
            onClick={handlePredict}
            disabled={loading || !modelStatus?.isTrained}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ marginTop: '16px' }}
          >
            {loading ? (
              <>
                <Loader size={18} className="spin" style={{ marginRight: '8px' }} />
                Generating Predictions...
              </>
            ) : (
              <>
                <Target size={18} style={{ marginRight: '8px' }} />
                Predict Winner
              </>
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
          <h2 className="panel-title">Prediction Results</h2>

          {predictions ? (
            <>
              {/* Predicted Winner */}
              {predictions.predicted_winner && (
                <div style={{
                  padding: '24px',
                  background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(0, 212, 255, 0.05) 100%)',
                  border: '1px solid rgba(74, 222, 128, 0.3)',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  <Trophy size={40} style={{ color: '#ffc107', marginBottom: '12px' }} />
                  <p style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>
                    Predicted Winner
                  </p>
                  <h3 style={{ 
                    color: '#4ade80', 
                    fontSize: '28px',
                    fontFamily: 'Lexend, sans-serif',
                    fontWeight: '700'
                  }}>
                    Horse #{predictions.predicted_winner.horse_seq}
                  </h3>
                  <p style={{ 
                    color: '#00D4FF', 
                    fontSize: '18px', 
                    marginTop: '8px' 
                  }}>
                    {(predictions.predicted_winner.win_probability * 100).toFixed(1)}% Win Probability
                  </p>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: `${getConfidenceColor(predictions.predicted_winner.confidence)}20`,
                    border: `1px solid ${getConfidenceColor(predictions.predicted_winner.confidence)}50`,
                    borderRadius: '20px',
                    fontSize: '11px',
                    color: getConfidenceColor(predictions.predicted_winner.confidence),
                    marginTop: '12px',
                    textTransform: 'uppercase',
                    fontWeight: '600'
                  }}>
                    {predictions.predicted_winner.confidence.replace('_', ' ')} Confidence
                  </span>
                </div>
              )}

              {/* All Rankings */}
              <h3 style={{ 
                fontSize: '13px', 
                color: '#9D4EDD', 
                marginBottom: '16px',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                Full Rankings
              </h3>

              {predictions.rankings?.map((runner, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: index === 0 
                    ? 'rgba(74, 222, 128, 0.1)' 
                    : 'rgba(0, 212, 255, 0.02)',
                  border: `1px solid ${index === 0 
                    ? 'rgba(74, 222, 128, 0.3)' 
                    : 'rgba(0, 212, 255, 0.1)'}`,
                  borderRadius: '8px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: index === 0 ? '#ffc107' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'rgba(0, 212, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: index < 3 ? '#000' : '#888',
                    fontWeight: '700',
                    fontSize: '14px',
                    marginRight: '12px'
                  }}>
                    {runner.rank}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#e0e0e0', fontWeight: '600', fontSize: '14px' }}>
                      Horse #{runner.horse_seq}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#00D4FF', fontWeight: '600', fontSize: '14px' }}>
                      {(runner.win_probability * 100).toFixed(1)}%
                    </p>
                    <p style={{ 
                      color: getConfidenceColor(runner.confidence), 
                      fontSize: '10px',
                      textTransform: 'uppercase'
                    }}>
                      {runner.confidence.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              ))}

              {/* Model Info */}
              <div style={{
                marginTop: '20px',
                padding: '12px',
                background: 'rgba(157, 78, 221, 0.1)',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#888'
              }}>
                Model: {predictions.model} | Version: {predictions.model_version}
              </div>
            </>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: '#888'
            }}>
              <Target size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ marginBottom: '8px' }}>No predictions yet</p>
              <p style={{ fontSize: '12px' }}>
                Add runners and generate predictions
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Predictions
