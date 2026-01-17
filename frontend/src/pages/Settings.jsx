/**
 * CHIMERA v4 - Settings Page
 * Copyright 2026 Ascot Wealth Management
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon, Database, Key, Server,
  Save, RefreshCw, CheckCircle, AlertCircle, Info
} from 'lucide-react'
import api from '../services/api'
import { useApp } from '../context/AppContext'

function Settings() {
  const { addNotification } = useApp()
  const [bigQuerySchema, setBigQuerySchema] = useState(null)
  const [dataSources, setDataSources] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const [schema, sources] = await Promise.all([
        api.getBigQuerySchema().catch(() => null),
        api.getDataSources().catch(() => null)
      ])
      setBigQuerySchema(schema)
      setDataSources(sources)
    } catch (err) {
      console.error('Failed to load settings:', err)
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
          <h2 className="panel-title">System Settings</h2>

          {/* API Configuration */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '12px', color: '#9D4EDD', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
              API Configuration
            </h3>
            <div className="preset-values">
              <div className="preset-item">
                <span className="preset-label">Backend URL</span>
                <span className="preset-value" style={{ fontSize: '10px' }}>
                  {import.meta.env.VITE_API_BASE_URL || 'localhost:8080'}
                </span>
              </div>
              <div className="preset-item">
                <span className="preset-label">API Version</span>
                <span className="preset-value">v1</span>
              </div>
              <div className="preset-item">
                <span className="preset-label">App Version</span>
                <span className="preset-value">4.0.0</span>
              </div>
            </div>
          </div>

          {/* Data Sources Status */}
          {dataSources && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '12px', color: '#9D4EDD', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                Data Sources (Framework)
              </h3>
              <div style={{
                padding: '16px',
                background: 'rgba(255, 193, 7, 0.1)',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                borderRadius: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Info size={16} style={{ color: '#ffc107' }} />
                  <span style={{ color: '#ffc107', fontSize: '12px', fontWeight: '600' }}>
                    Framework Ready
                  </span>
                </div>
                <p style={{ color: '#888', fontSize: '11px', lineHeight: '1.6' }}>
                  Data ingestion endpoints are configured. Connect external data sources 
                  (Betfair, Racing API, etc.) to enable live data feeds.
                </p>
              </div>

              {dataSources.available_source_types && (
                <div style={{ marginTop: '12px' }}>
                  {dataSources.available_source_types.map((source, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'rgba(0, 212, 255, 0.02)',
                      borderRadius: '6px',
                      marginBottom: '6px',
                      fontSize: '12px'
                    }}>
                      <span style={{ color: '#e0e0e0' }}>{source.type}</span>
                      <span style={{ color: '#888' }}>{source.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Model Settings */}
          <div>
            <h3 style={{ fontSize: '12px', color: '#9D4EDD', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
              ML Model Configuration
            </h3>
            <div className="preset-values">
              <div className="preset-item">
                <span className="preset-label">SMOTE k-neighbors</span>
                <span className="preset-value">5</span>
              </div>
              <div className="preset-item">
                <span className="preset-label">RF Estimators</span>
                <span className="preset-value">100</span>
              </div>
              <div className="preset-item">
                <span className="preset-label">CV Folds</span>
                <span className="preset-value">5</span>
              </div>
              <div className="preset-item">
                <span className="preset-label">Train/Test Split</span>
                <span className="preset-value">70/30</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Column - BigQuery Schema */}
      <div className="results-panel">
        <motion.div 
          className="glass-panel"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="panel-title">BigQuery Schema</h2>

          {bigQuerySchema ? (
            <>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ color: '#888', fontSize: '12px' }}>
                  Dataset: <span style={{ color: '#00D4FF' }}>{bigQuerySchema.dataset}</span>
                </p>
              </div>

              {Object.entries(bigQuerySchema.tables || {}).map(([tableName, table]) => (
                <div key={tableName} style={{
                  marginBottom: '16px',
                  padding: '16px',
                  background: 'rgba(0, 212, 255, 0.02)',
                  border: '1px solid rgba(0, 212, 255, 0.1)',
                  borderRadius: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Database size={16} style={{ color: '#9D4EDD' }} />
                    <h4 style={{ color: '#9D4EDD', fontSize: '13px', fontWeight: '600' }}>
                      {tableName}
                    </h4>
                  </div>
                  <p style={{ color: '#888', fontSize: '11px', marginBottom: '12px' }}>
                    {table.description}
                  </p>
                  
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {table.columns?.slice(0, 10).map((col, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '6px 0',
                        borderBottom: '1px solid rgba(0, 212, 255, 0.05)',
                        fontSize: '11px'
                      }}>
                        <span style={{ color: '#e0e0e0' }}>{col.name}</span>
                        <span style={{ color: '#00D4FF' }}>{col.type}</span>
                      </div>
                    ))}
                    {table.columns?.length > 10 && (
                      <p style={{ color: '#888', fontSize: '10px', marginTop: '8px', textAlign: 'center' }}>
                        +{table.columns.length - 10} more columns
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              <Database size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>Loading schema...</p>
            </div>
          )}

          {/* Paper Reference */}
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'rgba(157, 78, 221, 0.1)',
            border: '1px solid rgba(157, 78, 221, 0.2)',
            borderRadius: '10px'
          }}>
            <h4 style={{ color: '#9D4EDD', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
              📄 Research Paper Schema
            </h4>
            <p style={{ color: '#888', fontSize: '11px', lineHeight: '1.6' }}>
              The training_data table follows the 23-attribute schema from the paper 
              "Predicting Outcomes of Horse Racing using Machine Learning" - including 
              horse_seq, age, weight, draw, shoe, sex, jockey_id, trainer_id, and more.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Settings
