/**
 * CHIMERA v4 - Login Page
 * Copyright 2026 Ascot Wealth Management
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { Eye, EyeOff, Lock, User } from 'lucide-react'

function Login() {
  const { login, loading, error, setError } = useApp()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    
    if (!username || !password) {
      setError('Please enter both username and password')
      return
    }
    
    await login(username, password)
  }

  return (
    <div className="app">
      <div className="image-bg"></div>
      <div className="login-overlay"></div>
      
      <div className="login-screen">
        <motion.div 
          className="glass-panel login-panel"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="logo-section">
            <h1 className="app-title">CHIMERA v4</h1>
            <p className="app-subtitle">Multi-Agent AI Racing Platform</p>
          </div>
          
          <div className="separator"></div>
          
          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <div style={{ position: 'relative' }}>
                <User 
                  size={18} 
                  style={{ 
                    position: 'absolute', 
                    left: '14px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#00D4FF',
                    opacity: 0.6
                  }} 
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                  autoComplete="username"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock 
                  size={18} 
                  style={{ 
                    position: 'absolute', 
                    left: '14px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#00D4FF',
                    opacity: 0.6
                  }} 
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#00D4FF',
                    opacity: 0.6,
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <motion.button
              type="submit"
              className="button-primary"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Authenticating...' : 'Access Platform'}
            </motion.button>
          </form>
          
          <p className="copyright">
            © 2026 Ascot Wealth Management. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
