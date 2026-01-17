/**
 * CHIMERA v4 - Dashboard Page
 * Copyright 2026 Ascot Wealth Management
 */

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Brain, Target, BarChart3, History, Bot, Activity,
  TrendingUp, Award, Zap, AlertCircle, CheckCircle,
  Clock, Database, Cpu
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import api from '../services/api'

function StatCard({ icon: Icon, title, value, subtitle, color = '#00D4FF', trend }) {
  return (
    <motion.div
      className="result-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, borderColor: color }}
    >
      <div className="result-icon">
        <Icon size={28} style={{ color }} />
      </div>
      <div className="result-value" style={{ color }}>
        {value}
      </div>
      <div className="result-label">{title}</div>
      {subtitle && (
        <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
          {subtitle}
        </div>
      )}
      {trend && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
          marginTop: '8px',
          fontSize: '11px',
          color: trend > 0 ? '#4ade80' : '#FF6B6B'
        }}>
          <TrendingUp size={12} style={{ transform: trend < 0 ? 'rotate(180deg)' : 'none' }} />
          {Math.abs(trend)}% vs last period
        </div>
      )}
    </motion.div>
  )
}

function AgentStatusCard({ agent }) {
  const statusColor = {
    ready: '#4ade80',
    busy: '#ffc107',
    error: '#FF6B6B',
    offline: '#666'
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      background: 'rgba(0, 212, 255, 0.05)',
      borderRadius: '8px',
      marginBottom: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: statusColor[agent.status] || '#666',
          boxShadow: `0 0 8px ${statusColor[agent.status] || '#666'}`
        }} />
        <span style={{ color: '#e0e0e0', fontSize: '13px' }}>{agent.name}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#888' }}>
        <span>Tasks: {agent.tasks_completed}</span>
        <span style={{ 
          padding: '2px 8px', 
          background: 'rgba(0, 212, 255, 0.1)',
          borderRadius: '4px',
          color: statusColor[agent.status]
        }}>
          {agent.status}
        </span>
      </div>
    </div>
  )
}

function QuickActionCard({ icon: Icon, title, description, to, color }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <motion.div
        whileHover={{ scale: 1.02, borderColor: color }}
        style={{
          padding: '20px',
          background: 'rgba(10, 15, 30, 0.4)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: '12px',
          cursor: 'pointer'
        }}
      >
        <Icon size={24} style={{ color, marginBottom: '12px' }} />
        <h4 style={{ 
          color: '#e0e0e0', 
          fontSize: '14px', 
          fontWeight: '600',
          marginBottom: '4px' 
        }}>
          {title}
        </h4>
        <p style={{ color: '#888', fontSize: '12px', margin: 0 }}>{description}</p>
      </motion.div>
    </Link>
  )
}

function Dashboard() {
  const { systemStatus, agents, modelStatus, fetchSystemStatus } = useApp()
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [metricsData] = await Promise.all([
        api.getPerformanceMetrics().catch(() => null),
        fetchSystemStatus()
      ])
      setMetrics(metricsData)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main-container">
      {/* Left Column */}
      <div className="control-panel">
        <motion.div 
          className="glass-panel"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="panel-title">System Overview</h2>
          
          {/* Stats Grid */}
          <div className="results-grid" style={{ marginBottom: '24px' }}>
            <StatCard 
              icon={Brain}
              title="Model Status"
              value={modelStatus?.isTrained ? 'Trained' : 'Untrained'}
              subtitle={modelStatus?.version ? `v${modelStatus.version}` : 'No model loaded'}
              color={modelStatus?.isTrained ? '#4ade80' : '#ffc107'}
            />
            <StatCard 
              icon={Bot}
              title="Active Agents"
              value={agents?.filter(a => a.status === 'ready').length || 0}
              subtitle={`of ${agents?.length || 0} total`}
              color="#9D4EDD"
            />
            <StatCard 
              icon={Cpu}
              title="System Health"
              value={systemStatus?.status === 'healthy' ? '100%' : 'N/A'}
              subtitle="All systems operational"
              color="#00D4FF"
            />
            <StatCard 
              icon={Database}
              title="Data Status"
              value="Ready"
              subtitle="Framework initialized"
              color="#00D4FF"
            />
          </div>
          
          {/* Quick Actions */}
          <h3 style={{ 
            fontSize: '13px', 
            color: '#9D4EDD', 
            marginBottom: '16px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Quick Actions
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '12px' 
          }}>
            <QuickActionCard 
              icon={Brain}
              title="Train Model"
              description="Upload data and train ML models"
              to="/training"
              color="#00D4FF"
            />
            <QuickActionCard 
              icon={Target}
              title="Make Predictions"
              description="Predict race outcomes"
              to="/predictions"
              color="#4ade80"
            />
            <QuickActionCard 
              icon={BarChart3}
              title="Analyze Data"
              description="Run exploratory analysis"
              to="/analysis"
              color="#9D4EDD"
            />
            <QuickActionCard 
              icon={History}
              title="Run Backtest"
              description="Test strategies on historical data"
              to="/backtest"
              color="#ffc107"
            />
          </div>
        </motion.div>
      </div>
      
      {/* Right Column */}
      <div className="results-panel">
        <motion.div 
          className="glass-panel"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="panel-title">AI Agents Status</h2>
          
          <div style={{ marginBottom: '24px' }}>
            {agents && agents.length > 0 ? (
              agents.map((agent, index) => (
                <AgentStatusCard key={index} agent={agent} />
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '30px',
                color: '#888'
              }}>
                <Activity size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p>Connecting to agents...</p>
              </div>
            )}
          </div>
          
          {/* Model Performance Summary */}
          {metrics?.model_metrics && Object.keys(metrics.model_metrics).length > 0 && (
            <>
              <h3 style={{ 
                fontSize: '13px', 
                color: '#9D4EDD', 
                marginBottom: '16px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Model Performance
              </h3>
              
              <div style={{ 
                background: 'rgba(0, 212, 255, 0.05)',
                borderRadius: '10px',
                padding: '16px'
              }}>
                {Object.entries(metrics.model_metrics).map(([name, modelMetrics]) => (
                  <div key={name} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(0, 212, 255, 0.1)'
                  }}>
                    <span style={{ color: '#e0e0e0', fontSize: '13px' }}>{name}</span>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                      <span style={{ color: '#4ade80' }}>
                        Acc: {(modelMetrics.accuracy * 100).toFixed(1)}%
                      </span>
                      {modelMetrics.roc_auc && (
                        <span style={{ color: '#00D4FF' }}>
                          AUC: {(modelMetrics.roc_auc * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {/* Paper Methodology Reference */}
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
              marginBottom: '8px',
              textTransform: 'uppercase'
            }}>
              ML Methodology
            </h4>
            <p style={{ color: '#888', fontSize: '12px', margin: 0, lineHeight: '1.6' }}>
              Based on research achieving <span style={{ color: '#4ade80' }}>97.6% ROC-AUC</span> using 
              Random Forest with SMOTE oversampling. Features 23 attributes including jockey, trainer, 
              draw position, body weight, and track conditions.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
