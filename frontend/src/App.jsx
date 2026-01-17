/**
 * CHIMERA v4 - Main Application Component
 * Copyright 2026 Ascot Wealth Management
 */

import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

// Pages
import IntroScreen from './pages/IntroScreen'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Training from './pages/Training'
import Predictions from './pages/Predictions'
import Analysis from './pages/Analysis'
import Backtest from './pages/Backtest'
import Agents from './pages/Agents'
import Settings from './pages/Settings'

// Context
import { AppProvider, useApp } from './context/AppContext'

// Components
import Layout from './components/Layout'

function AppContent() {
  const { isAuthenticated, showIntro, setShowIntro } = useApp()
  const [introComplete, setIntroComplete] = useState(false)

  useEffect(() => {
    // Check if intro has been shown before in this session
    const hasSeenIntro = sessionStorage.getItem('chimera_intro_seen')
    if (hasSeenIntro) {
      setIntroComplete(true)
      setShowIntro(false)
    }
  }, [setShowIntro])

  const handleIntroComplete = () => {
    sessionStorage.setItem('chimera_intro_seen', 'true')
    setIntroComplete(true)
    setShowIntro(false)
  }

  // Show intro video on first load
  if (showIntro && !introComplete) {
    return <IntroScreen onComplete={handleIntroComplete} />
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } />
        
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        } />
        
        {/* Protected Routes */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
          } />
          <Route path="/training" element={
            isAuthenticated ? <Training /> : <Navigate to="/login" replace />
          } />
          <Route path="/predictions" element={
            isAuthenticated ? <Predictions /> : <Navigate to="/login" replace />
          } />
          <Route path="/analysis" element={
            isAuthenticated ? <Analysis /> : <Navigate to="/login" replace />
          } />
          <Route path="/backtest" element={
            isAuthenticated ? <Backtest /> : <Navigate to="/login" replace />
          } />
          <Route path="/agents" element={
            isAuthenticated ? <Agents /> : <Navigate to="/login" replace />
          } />
          <Route path="/settings" element={
            isAuthenticated ? <Settings /> : <Navigate to="/login" replace />
          } />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  )
}

export default App
