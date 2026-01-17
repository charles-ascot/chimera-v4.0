/**
 * CHIMERA v4 - API Service
 * Copyright 2026 Ascot Wealth Management
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_PREFIX = '/api/v1'

const client = axios.create({
  baseURL: `${BASE_URL}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000 // 60 seconds for long operations
})

// Request interceptor
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('chimera_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || error.message
    console.error('API Error:', message)
    return Promise.reject(new Error(message))
  }
)

const api = {
  // Health & Status
  getHealth: () => client.get('/health'),
  getHealthStatus: () => client.get('/health/system'),
  getReadiness: () => client.get('/health/ready'),
  
  // Models
  getModels: () => client.get('/models'),
  getModelInfo: (modelName) => client.get(`/models/${modelName}/info`),
  getFeatureImportance: (modelName = 'random_forest') => 
    client.get(`/models/${modelName}/feature-importance`),
  compareModels: () => client.get('/models/comparison'),
  
  // Training
  trainModels: (data, config = {}) => client.post('/training/train', { data, config }),
  uploadTrainingFile: (file, applySmote = true) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('apply_smote', applySmote)
    return client.post('/training/train/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getTrainingStatus: () => client.get('/training/status'),
  
  // Predictions
  predictRace: (raceData) => client.post('/predictions/race', raceData),
  batchPredict: (data, modelName = 'random_forest') => 
    client.post('/predictions/batch', { data, model_name: modelName }),
  getAvailablePredictionModels: () => client.get('/predictions/models'),
  
  // Analysis
  runEDA: (data) => client.post('/analysis/eda', { data, analysis_type: 'eda' }),
  analyzeFeatures: (data) => client.post('/analysis/features', { data }),
  analyzeCorrelation: (data) => client.post('/analysis/correlation', { data }),
  uploadAnalysisFile: (file, analysisType = 'eda') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('analysis_type', analysisType)
    return client.post('/analysis/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  validateData: (data) => client.post('/analysis/validate', data),
  
  // Backtest
  runBacktest: (data, strategy) => client.post('/backtest/run', { data, strategy }),
  uploadBacktestFile: (file, params) => {
    const formData = new FormData()
    formData.append('file', file)
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, value)
    })
    return client.post('/backtest/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  generateBacktestReport: (results) => client.post('/backtest/report', results),
  getBacktestStrategies: () => client.get('/backtest/strategies'),
  
  // Agents
  getAgentStatus: () => client.get('/agents'),
  getAgent: (agentName) => client.get(`/agents/${agentName}`),
  executeAgentTask: (task) => client.post('/agents/task', task),
  getConductorStatus: () => client.get('/agents/conductor/status'),
  broadcastToAgents: (message) => client.post('/agents/conductor/broadcast', message),
  getSystemHealth: () => client.get('/agents/monitor/health'),
  getPerformanceMetrics: () => client.get('/agents/monitor/metrics'),
  
  // Data (Framework)
  getDataSources: () => client.get('/data/sources'),
  addDataSource: (config) => client.post('/data/sources', config),
  removeDataSource: (sourceId) => client.delete(`/data/sources/${sourceId}`),
  ingestData: (request) => client.post('/data/ingest', request),
  getBigQuerySchema: () => client.get('/data/bigquery/schema'),
  
  // Upload data file
  uploadDataFile: (file, dataType = 'training') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('data_type', dataType)
    return client.post('/data/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export default api
