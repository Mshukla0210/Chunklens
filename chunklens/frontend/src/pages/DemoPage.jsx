import { useState } from 'react'
import { METHODS, SAMPLE_TEXTS } from '../services/constants'
import { retrieveAndAnswer } from '../services/api'
import MethodCard from '../components/MethodCard'
import RetrievedResults from '../components/RetrievedResults'
import TextInput from '../components/TextInput'

const SAMPLE_QUERIES = [
  'How does PageIndex differ from chunking?',
  'What is the transformer mechanism?',
  'How do vector databases work?',
  'What are the limitations of fixed-size chunking?',
]

export default function DemoPage() {
  const [activeMethod, setActiveMethod] = useState('fixed')
  const [text, setText] = useState(SAMPLE_TEXTS[0].text)
  const [query, setQuery] = useState(SAMPLE_QUERIES[0])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [chunkSize, setChunkSize] = useState(80)
  const [overlap, setOverlap] = useState(15)

  const method = METHODS.find(m => m.id === activeMethod)

  const handleRetrieve = async () => {
    if (!text.trim() || !query.trim()) return
    setLoading(true); setError(null); setResult(null)
    try {
      const data = await retrieveAndAnswer({ text, query, method: activeMethod, chunkSize, overlap })
      setResult(data)
    } catch (e) {
      setError(e.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{
          fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--accent)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10,
        }}>Interactive Demo</div>
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontSize: 42,
          fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1, margin: 0,
        }}>
          Simulate RAG Retrieval<br />
          <span style={{ color: method.color, transition: 'color 0.3s' }}>with Groq LLM</span>
        </h1>
        <p style={{ color: 'var(--text2)', marginTop: 14, fontSize: 15, maxWidth: 540 }}>
          Upload a document, pick a chunking strategy, ask a question.
          The backend chunks, retrieves, and generates an answer via Groq.
        </p>
      </div>

      {/* Method selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
        {METHODS.map(m => (
          <MethodCard
            key={m.id} method={m}
            isActive={activeMethod === m.id}
            onClick={() => { setActiveMethod(m.id); setResult(null) }}
          />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Document input */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 24 }}>
          <TextInput value={text} onChange={setText} />

          {(activeMethod === 'fixed' || activeMethod === 'recursive') && (
            <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace', display: 'block', marginBottom: 5 }}>
                  CHUNK SIZE: {chunkSize}w
                </label>
                <input type="range" min={30} max={300} value={chunkSize}
                  onChange={e => setChunkSize(+e.target.value)}
                  style={{ width: '100%', accentColor: method.color }} />
              </div>
              {activeMethod === 'fixed' && (
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace', display: 'block', marginBottom: 5 }}>
                    OVERLAP: {overlap}w
                  </label>
                  <input type="range" min={0} max={80} value={overlap}
                    onChange={e => setOverlap(+e.target.value)}
                    style={{ width: '100%', accentColor: method.color }} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Query input */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 24 }}>
          <label style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace', display: 'block', marginBottom: 8 }}>
            YOUR QUESTION
          </label>
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            rows={4}
            placeholder="Ask anything about the document…"
            style={{
              width: '100%', background: 'var(--surface2)',
              border: '1px solid var(--border)', borderRadius: 12,
              padding: '14px 16px', color: 'var(--text)',
              fontSize: 14, lineHeight: 1.6, resize: 'none', outline: 'none',
              fontFamily: 'DM Sans, sans-serif',
            }}
          />

          {/* Sample queries */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 6 }}>
              SAMPLE QUERIES
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SAMPLE_QUERIES.map(q => (
                <button
                  key={q}
                  onClick={() => setQuery(q)}
                  style={{
                    fontSize: 11, color: query === q ? method.color : 'var(--text3)',
                    background: query === q ? `${method.color}14` : 'var(--surface2)',
                    border: `1px solid ${query === q ? method.color + '40' : 'var(--border)'}`,
                    borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >{q}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Retrieve button */}
      <button
        onClick={handleRetrieve}
        disabled={loading || !text.trim() || !query.trim()}
        style={{
          width: '100%', padding: '16px 0',
          background: loading ? 'var(--surface2)' : `linear-gradient(135deg, ${method.color}, ${method.color}cc)`,
          color: loading ? 'var(--text3)' : '#000',
          border: 'none', borderRadius: 14,
          fontWeight: 800, fontSize: 16, fontFamily: 'Syne, sans-serif',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: 28,
          boxShadow: loading ? 'none' : `0 8px 32px ${method.color}30`,
          transition: 'all 0.2s',
          letterSpacing: '-0.3px',
        }}
      >
        {loading ? 'Processing…' : `Retrieve & Answer with ${method.name} →`}
      </button>

      {error && (
        <div style={{
          background: '#f8717118', border: '1px solid #f8717130',
          borderRadius: 12, padding: '14px 18px',
          color: '#f87171', fontSize: 13, marginBottom: 20,
        }}>⚠ {error}</div>
      )}

      {/* Results */}
      <RetrievedResults
        results={result?.retrieved}
        method={activeMethod}
        color={method.color}
        answer={result?.answer}
        loading={loading}
      />
    </div>
  )
}
