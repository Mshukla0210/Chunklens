import { useState } from 'react'
import { METHODS, SAMPLE_TEXTS } from '../services/constants'
import { compareAll } from '../services/api'
import TextInput from '../components/TextInput'

function StatBar({ value, max = 5, color }) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{
          width: 18, height: 5, borderRadius: 3,
          background: i < value ? color : 'var(--border2)',
        }} />
      ))}
      <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace', marginLeft: 4 }}>
        {value}/{max}
      </span>
    </div>
  )
}

function MethodResultCard({ method, result, query }) {
  const [expanded, setExpanded] = useState(null)
  const isPageIndex = method.id === 'pageindex'

  const items = result?.retrieved || []

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${method.color}30`,
      borderRadius: 18, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: `${method.color}10`,
        borderBottom: `1px solid ${method.color}25`,
        padding: '18px 22px',
        borderTop: `3px solid ${method.color}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 20 }}>{method.icon}</span>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16 }}>
                {method.name}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{method.subtitle}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {result?.retrieved ? (
              <div style={{
                fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
                color: method.color, background: `${method.color}18`,
                padding: '4px 10px', borderRadius: 20,
              }}>
                {result.retrieved.length} retrieved
              </div>
            ) : result?.error ? (
              <div style={{ fontSize: 10, color: '#f87171' }}>error</div>
            ) : (
              <div className="shimmer" style={{ width: 70, height: 22, borderRadius: 20 }} />
            )}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
          {[
            { label: 'Quality', val: method.quality },
            { label: 'Speed', val: method.speed },
            { label: 'Structure', val: method.structure },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>
                {s.label.toUpperCase()}
              </div>
              <StatBar value={s.val} color={method.color} />
            </div>
          ))}
        </div>
      </div>

      {/* LLM Answer */}
      {result?.answer && (
        <div style={{
          padding: '16px 22px',
          borderBottom: `1px solid ${method.color}18`,
          background: `${method.color}06`,
        }}>
          <div style={{
            fontSize: 10, color: method.color,
            fontFamily: 'JetBrains Mono, monospace', marginBottom: 6,
          }}>✦ LLM ANSWER</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
            {result.answer}
          </div>
        </div>
      )}

      {/* Retrieved items */}
      <div style={{ padding: '16px 22px' }}>
        {!result && (
          <>
            <div className="shimmer" style={{ height: 60, borderRadius: 10, marginBottom: 8 }} />
            <div className="shimmer" style={{ height: 60, borderRadius: 10 }} />
          </>
        )}
        {result?.error && (
          <div style={{ color: '#f87171', fontSize: 12 }}>⚠ {result.error}</div>
        )}
        {items.map((item, i) => (
          <div
            key={i}
            onClick={() => setExpanded(expanded === i ? null : i)}
            style={{
              background: expanded === i ? `${method.color}10` : 'var(--surface2)',
              border: `1px solid ${expanded === i ? method.color + '40' : 'var(--border)'}`,
              borderRadius: 10, padding: '12px 14px',
              marginBottom: 8, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: expanded === i ? 8 : 0 }}>
              <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: method.color }}>
                RANK #{item.rank} · {isPageIndex ? `NODE ${item.id + 1}` : `CHUNK ${item.id + 1}`}
              </div>
              <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace' }}>
                {item.score.toFixed(4)}
              </span>
            </div>
            {expanded !== i && (
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                {item.content.slice(0, 80)}…
              </div>
            )}
            {expanded === i && (
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
                {item.content}
                {item.matched_terms?.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {item.matched_terms.map(t => (
                      <span key={t} style={{
                        fontSize: 9, color: method.color, background: `${method.color}18`,
                        padding: '2px 6px', borderRadius: 4,
                        fontFamily: 'JetBrains Mono, monospace',
                      }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ComparePage() {
  const [text, setText] = useState(SAMPLE_TEXTS[0].text)
  const [query, setQuery] = useState('How does PageIndex differ from chunking?')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCompare = async () => {
    if (!text.trim() || !query.trim()) return
    setLoading(true); setError(null); setResults(null)
    try {
      const data = await compareAll({ text, query })
      setResults(data.results)
    } catch (e) {
      setError(e.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: 1280, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{
          fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--accent)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 10,
        }}>Side-by-side Comparison</div>
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontSize: 42,
          fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1, margin: 0,
        }}>
          All 4 methods.<br />
          <span style={{ color: 'var(--accent)' }}>One document. One query.</span>
        </h1>
        <p style={{ color: 'var(--text2)', marginTop: 14, fontSize: 15, maxWidth: 540 }}>
          Run every strategy simultaneously and compare retrieved chunks and
          LLM answers side by side.
        </p>
      </div>

      {/* Input area */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 18, padding: 28, marginBottom: 28,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 20 }}>
          <TextInput value={text} onChange={setText} />
          <div>
            <label style={{
              fontSize: 10, color: 'var(--text3)',
              fontFamily: 'JetBrains Mono, monospace', display: 'block', marginBottom: 8,
            }}>QUERY</label>
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              rows={8}
              style={{
                width: '100%', background: 'var(--surface2)',
                border: '1px solid var(--border)', borderRadius: 12,
                padding: '14px 16px', color: 'var(--text)',
                fontSize: 14, lineHeight: 1.6, resize: 'none', outline: 'none',
                fontFamily: 'DM Sans, sans-serif',
              }}
            />
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={loading || !text.trim() || !query.trim()}
          style={{
            marginTop: 20, width: '100%', padding: '15px 0',
            background: loading ? 'var(--surface2)' : 'linear-gradient(135deg, #6366f1, #a78bfa)',
            color: loading ? 'var(--text3)' : '#fff',
            border: 'none', borderRadius: 14,
            fontWeight: 800, fontSize: 16, fontFamily: 'Syne, sans-serif',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 8px 32px rgba(99,102,241,0.35)',
            letterSpacing: '-0.3px', transition: 'all 0.2s',
          }}
        >
          {loading ? 'Running all 4 methods…' : 'Compare All Methods →'}
        </button>
        {error && <div style={{ marginTop: 10, fontSize: 12, color: '#f87171' }}>⚠ {error}</div>}
      </div>

      {/* Results grid */}
      {(results || loading) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {METHODS.map(method => (
            <MethodResultCard
              key={method.id}
              method={method}
              result={results?.[method.id]}
              query={query}
            />
          ))}
        </div>
      )}

      {/* Comparison table (shown after results) */}
      {results && (
        <div style={{
          marginTop: 28,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 18, padding: 28, overflowX: 'auto',
        }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
            color: 'var(--text3)', letterSpacing: 1, marginBottom: 20,
          }}>STRATEGY COMPARISON MATRIX</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Method', 'Chunks/Nodes', 'Top Score', 'Quality', 'Speed', 'Best For'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 14px',
                    fontSize: 10, color: 'var(--text3)',
                    fontFamily: 'JetBrains Mono, monospace',
                    borderBottom: '1px solid var(--border)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {METHODS.map(method => {
                const r = results[method.id]
                const topScore = r?.retrieved?.[0]?.score?.toFixed(4) ?? '—'
                const count = r?.retrieved?.length ?? '—'
                return (
                  <tr key={method.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{method.icon}</span>
                        <span style={{ color: method.color, fontWeight: 600 }}>{method.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text2)' }}>
                      {count}
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', color: method.color }}>
                      {topScore}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <StatBar value={method.quality} color={method.color} />
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <StatBar value={method.speed} color={method.color} />
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text3)', fontSize: 12, maxWidth: 200 }}>
                      {method.useCase.slice(0, 60)}…
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
