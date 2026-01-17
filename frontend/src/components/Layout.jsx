/**
 * CHIMERA v4 - Layout Component
 * Copyright 2026 Ascot Wealth Management
 */

import React from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Brain, 
  Target, 
  BarChart3, 
  History, 
  Bot, 
  Settings,
  LogOut,
  Menu,
  X,
  Activity
} from 'lucide-react'
import { useApp } from '../context/AppContext'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/training', icon: Brain, label: 'Training' },
  { path: '/predictions', icon: Target, label: 'Predictions' },
  { path: '/analysis', icon: BarChart3, label: 'Analysis' },
  { path: '/backtest', icon: History, label: 'Backtest' },
  { path: '/agents', icon: Bot, label: 'AI Agents' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

function Layout() {
  const { sidebarOpen, setSidebarOpen, logout, systemStatus, modelStatus } = useApp()
  const location = useLocation()

  return (
    <div className="app">
      <div className="image-bg"></div>
      <div className="login-overlay"></div>
      
      <div className="dashboard">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <button 
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#00D4FF',
                cursor: 'pointer',
                marginRight: '16px',
                padding: '8px'
              }}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div>
              <h1 className="header-title">CHIMERA v4</h1>
              <p className="header-subtitle">Multi-Agent AI Horse Racing Prediction Platform</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* System Status Indicator */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '8px 16px',
              background: 'rgba(0, 212, 255, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(0, 212, 255, 0.2)'
            }}>
              <Activity size={16} className={systemStatus?.status === 'healthy' ? 'pulse' : ''} 
                style={{ color: systemStatus?.status === 'healthy' ? '#4ade80' : '#FF6B6B' }} />
              <span style={{ fontSize: '12px', color: '#e0e0e0' }}>
                {systemStatus?.status === 'healthy' ? 'System Online' : 'Connecting...'}
              </span>
              {modelStatus?.isTrained && (
                <span style={{ 
                  fontSize: '10px', 
                  padding: '2px 6px', 
                  background: 'rgba(74, 222, 128, 0.2)', 
                  borderRadius: '4px',
                  color: '#4ade80'
                }}>
                  Model Ready
                </span>
              )}
            </div>
            
            <button className="button-logout" onClick={logout}>
              <LogOut size={14} style={{ marginRight: '6px' }} />
              Logout
            </button>
          </div>
        </header>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <motion.nav 
            initial={false}
            animate={{ width: sidebarOpen ? 240 : 0, opacity: sidebarOpen ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'rgba(10, 15, 30, 0.6)',
              backdropFilter: 'blur(10px)',
              borderRight: '1px solid rgba(0, 212, 255, 0.2)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ padding: '20px', flex: 1 }}>
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    marginBottom: '8px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: isActive ? '#00D4FF' : '#888',
                    background: isActive ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                    border: isActive ? '1px solid rgba(0, 212, 255, 0.3)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '400'
                  })}
                >
                  <item.icon size={18} />
                  <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                </NavLink>
              ))}
            </div>
            
            {/* Sidebar Footer */}
            <div style={{ 
              padding: '16px 20px', 
              borderTop: '1px solid rgba(0, 212, 255, 0.1)',
              fontSize: '11px',
              color: '#666'
            }}>
              <div>© 2026 Ascot Wealth Management</div>
              <div style={{ marginTop: '4px' }}>Version 4.0.0</div>
            </div>
          </motion.nav>

          {/* Main Content */}
          <main className="content" style={{ flex: 1, overflow: 'auto' }}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout
