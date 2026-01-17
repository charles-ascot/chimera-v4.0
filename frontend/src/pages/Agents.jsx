/**
 * CHIMERA v4 - AI Agents Page
 * Copyright 2026 Ascot Wealth Management
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Bot, Activity, Cpu, Clock, CheckCircle, AlertCircle,
  RefreshCw, Play, Settings, Zap, Brain
} from 'lucide-react'
import api from '../services/api'
import { useApp } from '../context/AppContext'

const agentIcons = {
  DataAgent: Cpu,
  ModelAgent: Brain,
  AnalysisAgent: Activity,
  BacktestAgent: Clock,
  MonitorAgent: Settings
}

const agentDescriptions = {
  DataAgent: 'Handles data ingestion, validation, and preprocessing',
  ModelAgent: 'Manages ML model training and predictions',
  AnalysisAgent: 'Performs exploratory data analysis and insights',
  BacktestAgent: 'Runs historical backtesting simulations',
  MonitorAgent: 'System health and performance monitoring'
}

function Agents() {
  const { agents, fetchSystemStatus, addNotification } = useApp()
  const [conductorStatus, setConductorStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState(null)

  useEffect(() => {
    loadConductorStatus()
  }, [])

  const loadConductorStatus = async () => {
    try {
      const status = await api.getConductorStatus()
      setConductorStatus(status)
    } catch (err) {
      console.error('Failed to load conductor status:', err)
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    await fetchSystemStatus()
    await loadConductorStatus()
    setLoading(false)
    addNotification({ type: 'success', message: 'Agent status refreshed' })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return '#4ade80'
      case 'busy': return '#ffc107'
      case 'error': return '#FF6B6B'
      default: return '#666'
    }
  }

  return (
    <div className="main-container">
      {/* Left Column - Conductor */}
      <div className="control-panel">
        <motion.div 
          className="glass-panel"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="panel-title" style={{ marginBottom: 0 }}>AI Conductor</h2>
            <motion.button
              onClick={handleRefresh}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#00D4FF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px'
              }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              Refresh
            </motion.button>
          </div>

          {/* Conductor Status Card */}
          <div style={{
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.1) 0%, rgba(0, 212, 255, 0.05) 100%)',
            border: '1px solid rgba(157, 78, 221, 0.3)',
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <Bot size={48} style={{ color: '#9D4EDD', marginBottom: '12px' }} />
            <h3 style={{ color: '#e0e0e0', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
              Master Conductor
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: conductorStatus?.conductor_status === 'ready' ? '#4ade80' : '#ffc107',
                boxShadow: `0 0 10px ${conductorStatus?.conductor_status === 'ready' ? '#4ade80' : '#ffc107'}`
              }} />
              <span style={{ color: conductorStatus?.conductor_status === 'ready' ? '#4ade80' : '#ffc107', fontWeight: '600' }}>
                {conductorStatus?.conductor_status?.toUpperCase() || 'CONNECTING'}
              </span>
            </div>
            <p style={{ color: '#888', fontSize: '12px' }}>
              Orchestrates all specialized AI agents
            </p>
          </div>

          {/* Conductor Stats */}
          <div className="preset-values">
            <div className="preset-item">
              <span className="preset-label">Uptime</span>
              <span className="preset-value">
                {conductorStatus?.uptime_seconds 
                  ? `${Math.floor(conductorStatus.uptime_seconds / 60)}m` 
                  : 'N/A'}
              </span>
            </div>
            <div className="preset-item">
              <span className="preset-label">Tasks Completed</span>
              <span className="preset-value" style={{ color: '#4ade80' }}>
                {conductorStatus?.tasks_completed || 0}
              </span>
            </div>
            <div className="preset-item">
              <span className="preset-label">Tasks Failed</span>
              <span className="preset-value" style={{ color: '#FF6B6B' }}>
                {conductorStatus?.tasks_failed || 0}
              </span>
            </div>
            <div className="preset-item">
              <span className="preset-label">Model Status</span>
              <span className="preset-value">
                {conductorStatus?.model_trained ? 'Trained' : 'Untrained'}
              </span>
            </div>
          </div>

          {/* Architecture Info */}
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'rgba(0, 212, 255, 0.05)',
            border: '1px solid rgba(0, 212, 255, 0.1)',
            borderRadius: '10px'
          }}>
            <h4 style={{ color: '#00D4FF', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
              Multi-Agent Architecture
            </h4>
            <p style={{ color: '#888', fontSize: '11px', lineHeight: '1.6' }}>
              The Conductor orchestrates specialized agents for data processing, model training, 
              analysis, backtesting, and monitoring. Each agent operates independently but 
              communicates through the Conductor for coordinated operations.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Column - Agents Grid */}
      <div className="results-panel">
        <motion.div 
          className="glass-panel"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="panel-title">Specialized Agents</h2>

          <div style={{ display: 'grid', gap: '12px' }}>
            {agents && agents.length > 0 ? agents.map((agent, index) => {
              const IconComponent = agentIcons[agent.name] || Bot
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedAgent(selectedAgent === agent.name ? null : agent.name)}
                  style={{
                    padding: '16px',
                    background: selectedAgent === agent.name 
                      ? 'rgba(157, 78, 221, 0.1)' 
                      : 'rgba(0, 212, 255, 0.02)',
                    border: `1px solid ${selectedAgent === agent.name 
                      ? 'rgba(157, 78, 221, 0.3)' 
                      : 'rgba(0, 212, 255, 0.1)'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: `${getStatusColor(agent.status)}15`,
                      border: `1px solid ${getStatusColor(agent.status)}30`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconComponent size={24} style={{ color: getStatusColor(agent.status) }} />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ color: '#e0e0e0', fontSize: '14px', fontWeight: '600' }}>
                          {agent.name}
                        </h4>
                        <span style={{
                          padding: '2px 8px',
                          background: `${getStatusColor(agent.status)}20`,
                          borderRadius: '4px',
                          fontSize: '10px',
                          color: getStatusColor(agent.status),
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {agent.status}
                        </span>
                      </div>
                      <p style={{ color: '#888', fontSize: '11px' }}>
                        {agentDescriptions[agent.name] || 'Specialized agent'}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#4ade80', fontSize: '14px', fontWeight: '600' }}>
                        {agent.tasks_completed}
                      </p>
                      <p style={{ color: '#888', fontSize: '10px' }}>tasks</p>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedAgent === agent.name && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid rgba(0, 212, 255, 0.1)'
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '12px' }}>
                        <div>
                          <p style={{ color: '#888', marginBottom: '2px' }}>Current Task</p>
                          <p style={{ color: '#e0e0e0' }}>{agent.current_task || 'None'}</p>
                        </div>
                        <div>
                          <p style={{ color: '#888', marginBottom: '2px' }}>Tasks Failed</p>
                          <p style={{ color: '#FF6B6B' }}>{agent.tasks_failed}</p>
                        </div>
                        <div>
                          <p style={{ color: '#888', marginBottom: '2px' }}>Last Active</p>
                          <p style={{ color: '#e0e0e0' }}>
                            {agent.last_active 
                              ? new Date(agent.last_active).toLocaleTimeString() 
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            }) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                <Bot size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>Connecting to agents...</p>
              </div>
            )}
          </div>

          {/* Agent Communication */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(157, 78, 221, 0.1)',
            border: '1px solid rgba(157, 78, 221, 0.2)',
            borderRadius: '10px'
          }}>
            <h4 style={{ color: '#9D4EDD', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
              🤖 Agent Communication Protocol
            </h4>
            <p style={{ color: '#888', fontSize: '11px', lineHeight: '1.6' }}>
              Agents communicate via task routing through the Conductor. Commands flow down, 
              results flow up. The Conductor handles prioritization, error recovery, and 
              inter-agent coordination.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Agents
