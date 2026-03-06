import { useState } from 'react'
import { METHODS, SAMPLE_TEXTS } from '../services/constants'
import { chunkDocument } from '../services/api'
import MethodCard from '../components/MethodCard'
import ChunkVisualizer from '../components/ChunkVisualizer'
import TextInput from '../components/TextInput'

export default function ExplainerPage() {
  const [activeMethod, setActiveMethod] = useState('fixed')
  const [text, setText] = useState(SAMPLE_TEXTS[0].text)
  const [chunkData, setChunkData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [chunkSize, setChunkSize] = useState(80)
  const [overlap, setOverlap] = useState(15)

  const method = METHODS.find(m => m.id === activeMethod)

  const handleChunk = async () => {
    if (!text.trim()) return
    setLoading(true); setError(null); setChunkData(null)
    try {
      const result = await chunkDocument({ text, method: activeMethod, chunkSize, overlap })
      setChunkData(result)
    } catch (e) {
      setError(e.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }

  const pipelineSteps = [
    { label: 'Raw Document', icon: '📄' },
    { label: activeMethod === 'pageindex' ? 'Tree Indexing' : 'Chunking', icon: method.icon, highlight: true },
    { label: activeMethod === 'pageindex' ? 'LLM Navigation' : 'Embedding', icon: activeMethod === 'pageindex' ? '🤖' : '🔢', highlight: activeMethod === 'pageindex' },
    { label: 'Vector Search', icon: '🔍' },
    { label: 'LLM Generate', icon: '✨' },
    { label: 'Answer', icon: '💡' },
  ]

  return (
    <div style={{ padding: '40px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 40, animation: 'fadeUp 0.5s ease' }}>
        <div style={{
          fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--accent)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10,
        }}>Visual Explainer</div>
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontSize: 42,
          fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1,
          margin: 0, color: 'var(--text)',
        }}>
          How does your pipeline<br />
          <span style={{ color: method.color, transition: 'color 0.3s' }}>slice up knowledge?</span>
        </h1>
        <p style={{ color: 'var(--text2)', marginTop: 14, fontSize: 15, maxWidth: 540 }}>
          Select a chunking strategy, configure its parameters, and see how it
          divides your document — live.
        </p>
      </div>

      {/* Method selector */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12, marginBottom: 36,
      }}>
        {METHODS.map(m => (
          <MethodCard
            key={m.id} method={m}
            isActive={activeMethod === m.id}
            onClick={() => { setActiveMethod(m.id); setChunkData(null) }}
          />
        ))}
      </div>

      {/* Detail area */}
      <div style={{
        display: 'grid', gridTemplateColumns: '320px 1fr',
        gap: 20, marginBottom: 28,
      }}>
        {/* Method info */}
        <div style={{
          background: 'var(--surface)',
          border: `1px solid ${method.color}30`,
          borderRadius: 18, padding: '28px 26px',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: `${method.color}18`, border: `1px solid ${method.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, color: method.color, marginBottom: 16,
          }}>{method.icon}</div>

          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>
            {method.name}
          </div>
          <div style={{ color: method.color, fontSize: 12, marginBottom: 16 }}>
            {method.subtitle}
          </div>
          <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.75, marginBottom: 20 }}>
            {method.description}
          </p>

          {/* Pros & Cons */}
          <div>
            <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1, marginBottom: 10 }}>
              TRADEOFFS
            </div>
            {method.pros.map(p => (
              <div key={p} style={{ display: 'flex', gap: 8, marginBottom: 5, fontSize: 12, color: '#10b981' }}>
                <span>✓</span>{p}
              </div>
            ))}
            {method.cons.map(c => (
              <div key={c} style={{ display: 'flex', gap: 8, marginBottom: 5, fontSize: 12, color: '#f87171' }}>
                <span>✗</span>{c}
              </div>
            ))}
          </div>

          {/* Use case */}
          <div style={{
            marginTop: 20, background: `${method.color}0d`,
            border: `1px solid ${method.color}20`,
            borderRadius: 10, padding: '12px 14px',
          }}>
            <div style={{ fontSize: 10, color: method.color, fontFamily: 'JetBrains Mono, monospace', marginBottom: 5 }}>
              BEST FOR
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
              {method.useCase}
            </div>
          </div>
        </div>

        {/* Right: input + output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Text input */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 24 }}>
            <TextInput value={text} onChange={setText} />

            {/* Controls */}
            {(activeMethod === 'fixed' || activeMethod === 'recursive') && (
              <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace', display: 'block', marginBottom: 6 }}>
                    CHUNK SIZE (words): {chunkSize}
                  </label>
                  <input type="range" min={30} max={300} value={chunkSize} onChange={e => setChunkSize(+e.target.value)}
                    style={{ width: '100%', accentColor: method.color }} />
                </div>
                {activeMethod === 'fixed' && (
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace', display: 'block', marginBottom: 6 }}>
                      OVERLAP (words): {overlap}
                    </label>
                    <input type="range" min={0} max={80} value={overlap} onChange={e => setOverlap(+e.target.value)}
                      style={{ width: '100%', accentColor: method.color }} />
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleChunk}
              disabled={loading || !text.trim()}
              style={{
                marginTop: 16, width: '100%',
                background: loading ? 'var(--surface2)' : method.color,
                color: loading ? 'var(--text3)' : '#000',
                border: 'none', borderRadius: 12,
                padding: '13px 0', fontWeight: 700,
                fontSize: 14, fontFamily: 'Syne, sans-serif',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Chunking…' : `Chunk with ${method.name} →`}
            </button>
            {error && <div style={{ marginTop: 10, fontSize: 12, color: '#f87171' }}>⚠ {error}</div>}
          </div>

          {/* Chunk output */}
          {(chunkData || loading) && (
            <div style={{ background: 'var(--surface)', border: `1px solid ${method.color}30`, borderRadius: 18, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Document Breakdown</div>
                {chunkData && (
                  <span style={{
                    fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                    color: method.color, background: `${method.color}18`,
                    padding: '4px 10px', borderRadius: 20,
                  }}>
                    {chunkData.method === 'pageindex'
                      ? `${chunkData.count} sections`
                      : `${chunkData.count} chunks`}
                  </span>
                )}
              </div>
              {loading
                ? <div className="shimmer" style={{ height: 80, borderRadius: 10 }} />
                : <ChunkVisualizer data={chunkData} method={activeMethod} color={method.color} />
              }
            </div>
          )}
        </div>
      </div>

      {/* Pipeline diagram */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 18, padding: '28px 32px',
      }}>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20, fontFamily: 'JetBrains Mono, monospace' }}>
          RAG PIPELINE — how {method.name} fits in
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
          {pipelineSteps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                background: step.highlight ? `${method.color}18` : 'var(--surface2)',
                border: `1px solid ${step.highlight ? method.color + '50' : 'var(--border)'}`,
                borderRadius: 12, padding: '12px 18px',
                textAlign: 'center', minWidth: 120,
                transition: 'all 0.3s ease',
              }}>
                <div style={{ fontSize: 20, marginBottom: 5 }}>{step.icon}</div>
                <div style={{
                  fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
                  color: step.highlight ? method.color : 'var(--text3)',
                  fontWeight: step.highlight ? 700 : 400,
                }}>{step.label}</div>
              </div>
              {i < pipelineSteps.length - 1 && (
                <div style={{ color: 'var(--text3)', fontSize: 16, padding: '0 10px' }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
