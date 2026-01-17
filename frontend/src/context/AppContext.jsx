/**
 * CHIMERA v4 - Application Context
 * Copyright 2026 Ascot Wealth Management
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  
  // UI state
  const [showIntro, setShowIntro] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setTheme] = useState('dark')
  
  // System state
  const [systemStatus, setSystemStatus] = useState(null)
  const [modelStatus, setModelStatus] = useState(null)
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Notifications
  const [notifications, setNotifications] = useState([])

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('chimera_token')
    if (token) {
      setIsAuthenticated(true)
      // Fetch user info
      fetchUserInfo()
    }
  }, [])

  // Fetch system status periodically
  useEffect(() => {
    if (isAuthenticated) {
      fetchSystemStatus()
      const interval = setInterval(fetchSystemStatus, 30000) // Every 30s
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const fetchUserInfo = async () => {
    // In a real app, this would fetch from backend
    setUser({ name: 'Admin', role: 'administrator' })
  }

  const fetchSystemStatus = async () => {
    try {
      const [health, agentStatus] = await Promise.all([
        api.getHealthStatus(),
        api.getAgentStatus()
      ])
      setSystemStatus(health)
      setAgents(agentStatus.agents || [])
      setModelStatus({
        isTrained: health.model_trained,
        version: health.model_version
      })
    } catch (err) {
      console.error('Failed to fetch system status:', err)
    }
  }

  const login = useCallback(async (username, password) => {
    setLoading(true)
    setError(null)
    try {
      // Simple auth for demo - in production, use proper auth
      if (username && password) {
        localStorage.setItem('chimera_token', 'demo_token')
        setIsAuthenticated(true)
        setUser({ name: username, role: 'user' })
        return true
      }
      throw new Error('Invalid credentials')
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('chimera_token')
    setIsAuthenticated(false)
    setUser(null)
    setSystemStatus(null)
  }, [])

  const addNotification = useCallback((notification) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { ...notification, id }])
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }, [])

  const value = {
    // Auth
    isAuthenticated,
    user,
    login,
    logout,
    
    // UI
    showIntro,
    setShowIntro,
    sidebarOpen,
    setSidebarOpen,
    theme,
    setTheme,
    
    // System
    systemStatus,
    modelStatus,
    agents,
    loading,
    error,
    setError,
    fetchSystemStatus,
    
    // Notifications
    notifications,
    addNotification
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export default AppContext
