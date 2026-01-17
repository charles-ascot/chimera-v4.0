/**
 * CHIMERA v4 - Intro Screen with Video
 * Copyright 2026 Ascot Wealth Management
 */

import React, { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function IntroScreen({ onComplete }) {
  const videoRef = useRef(null)
  const [videoEnded, setVideoEnded] = useState(false)
  const [videoError, setVideoError] = useState(false)

  useEffect(() => {
    // Auto-skip after 10 seconds if video doesn't load
    const timeout = setTimeout(() => {
      if (!videoEnded) {
        onComplete()
      }
    }, 10000)

    return () => clearTimeout(timeout)
  }, [onComplete, videoEnded])

  const handleVideoEnd = () => {
    setVideoEnded(true)
    setTimeout(onComplete, 500)
  }

  const handleVideoError = () => {
    setVideoError(true)
    setTimeout(onComplete, 1500)
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="intro-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {!videoError ? (
          <video
            ref={videoRef}
            className="intro-video"
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            onError={handleVideoError}
          >
            <source src="/assets/video/chimera1-bg.mp4" type="video/mp4" />
          </video>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            background: 'linear-gradient(135deg, #0a0f1e 0%, #1a1f2e 100%)'
          }}>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                fontFamily: 'Lexend, sans-serif',
                fontSize: '48px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #00D4FF 0%, #9D4EDD 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '16px'
              }}
            >
              CHIMERA v4
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                color: '#00D4FF',
                fontSize: '16px',
                letterSpacing: '2px'
              }}
            >
              Multi-Agent AI Horse Racing Prediction Platform
            </motion.p>
          </div>
        )}
        
        {/* Skip Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={handleSkip}
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            padding: '12px 24px',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '8px',
            color: '#00D4FF',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease'
          }}
          whileHover={{ 
            background: 'rgba(0, 212, 255, 0.1)',
            borderColor: '#00D4FF'
          }}
        >
          Skip Intro
        </motion.button>
      </motion.div>
    </AnimatePresence>
  )
}

export default IntroScreen
