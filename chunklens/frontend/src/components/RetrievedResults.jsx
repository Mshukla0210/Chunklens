export default function RetrievedResults({ results, method, color, answer, loading }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <div style={{ fontSize: 32, marginBottom: 12, display: 'inline-block', animation: 'spin 1s linear infinite' }}>
          ⟳
        </div>
        <div style={{ color: 'var(--text3)', fontSize: 13 }}>
          {method === 'pageindex' ? 'Navigating document tree with LLM…' : 'Computing relevance scores…'}
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!results || results.length === 0) return null

  return (
    <div>
      {/* LLM Answer */}
      {answer && (
        <div style={{
          background: `${color}0f`,
          border: `1px solid ${color}40`,
          borderRadius: 14, padding: '20px 22px',
          marginBottom: 20,
          borderLeft: `3px solid ${color}`,
        }}>
          <div style={{
            fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
            color, fontWeight: 600, marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span>✦</span> LLM ANSWER · via Groq llama-3.3-70b
          </div>
          <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.75 }}>
            {answer}
          </div>
        </div>
      )}

      {/* Retrieved chunks */}
      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12, fontFamily: 'JetBrains Mono, monospace' }}>
        TOP {results.length} RETRIEVED · {method.toUpperCase()}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {results.map((r, i) => (
          <div key={i} style={{
            background: 'var(--surface)',
            border: `1px solid ${i === 0 ? color + '50' : 'var(--border)'}`,
            borderRadius: 12, padding: '18px 20px',
            borderLeft: `3px solid ${i === 0 ? color : 'var(--border2)'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{
                  fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
                  color, background: `${color}18`, padding: '3px 8px', borderRadius: 5,
                }}>
                  RANK #{r.rank}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {method === 'pageindex' ? `NODE ${r.id + 1}` : `CHUNK ${r.id + 1}`}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace' }}>
                  score: {r.score.toFixed(4)}
                </span>
                {r.matched_terms && r.matched_terms.length > 0 && (
                  <div style={{ display: 'flex', gap: 3 }}>
                    {r.matched_terms.slice(0, 4).map(t => (
                      <span key={t} style={{
                        fontSize: 9, color, background: `${color}14`,
                        padding: '2px 5px', borderRadius: 4,
                        fontFamily: 'JetBrains Mono, monospace',
                      }}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.75 }}>
              {r.content}
            </div>
            {r.navigation_path && (
              <div style={{
                marginTop: 8, fontSize: 10,
                color: color, fontFamily: 'JetBrains Mono, monospace',
              }}>
                🌳 {r.navigation_path}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
