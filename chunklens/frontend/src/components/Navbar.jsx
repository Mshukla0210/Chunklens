import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  { id: '/', label: 'Explainer' },
  { id: '/demo', label: 'Live Demo' },
  { id: '/compare', label: 'Compare All' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      borderBottom: '1px solid var(--border)',
      background: 'rgba(8,8,16,0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      padding: '0 40px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 64,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #6366f1 0%, #a78bfa 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 800, fontFamily: 'Syne, sans-serif',
          boxShadow: '0 0 20px rgba(99,102,241,0.4)',
        }}>⟡</div>
        <div>
          <div style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: 17, letterSpacing: '-0.5px', color: 'var(--text)',
          }}>ChunkLens</div>
          <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.5px' }}>
            Vector Chunking Explorer
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 2,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12, padding: 4,
      }}>
        {tabs.map(tab => {
          const active = location.pathname === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              style={{
                padding: '7px 20px', borderRadius: 9, border: 'none',
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? '#fff' : 'var(--text2)',
                fontSize: 13, fontWeight: active ? 600 : 400,
                fontFamily: 'DM Sans, sans-serif',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
            >{tab.label}</button>
          )
        })}
      </div>

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: '#10b981',
          boxShadow: '0 0 8px #10b981',
        }} />
        <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace' }}>
          Groq · llama-3.3-70b
        </span>
      </div>
    </nav>
  )
}
