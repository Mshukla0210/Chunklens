import { useState } from 'react'
import { SAMPLE_TEXTS } from '../services/constants'

export default function TextInput({ value, onChange, placeholder }) {
  const [showSamples, setShowSamples] = useState(false)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <label style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace' }}>
          DOCUMENT INPUT
        </label>
        <button
          onClick={() => setShowSamples(!showSamples)}
          style={{
            fontSize: 11, color: 'var(--accent)',
            background: 'transparent', border: '1px solid var(--accent)30',
            borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {showSamples ? 'Hide samples' : 'Load sample ↓'}
        </button>
      </div>

      {showSamples && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          {SAMPLE_TEXTS.map(s => (
            <button
              key={s.label}
              onClick={() => { onChange(s.text); setShowSamples(false) }}
              style={{
                fontSize: 12, color: 'var(--text2)',
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.target.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}
            >{s.label}</button>
          ))}
        </div>
      )}

      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Paste your document here…'}
        rows={8}
        style={{
          width: '100%', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 12,
          padding: '16px 18px', color: 'var(--text)',
          fontSize: 13, lineHeight: 1.7, resize: 'vertical',
          outline: 'none', transition: 'border-color 0.2s',
          fontFamily: 'DM Sans, sans-serif',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--border2)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4, textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>
        {value.split(/\s+/).filter(Boolean).length} words
      </div>
    </div>
  )
}
