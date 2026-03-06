import { useState } from 'react'

export default function ChunkVisualizer({ data, method, color }) {
  const [hovered, setHovered] = useState(null)

  if (!data) return (
    <div style={{ color: 'var(--text3)', fontSize: 13, padding: '20px 0' }}>
      No chunks yet. Click "Chunk Document" to generate.
    </div>
  )

  if (method === 'pageindex') {
    const tree = data.tree
    if (!tree) return null
    return (
      <div>
        {/* Root node */}
        <div style={{
          background: `${color}18`,
          border: `1px solid ${color}44`,
          borderRadius: 12, padding: '14px 18px',
          marginBottom: 10, fontFamily: 'JetBrains Mono, monospace',
        }}>
          <div style={{ color, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
            ⟡ {tree.root.title}
          </div>
          <div style={{ color: 'var(--text3)', fontSize: 11 }}>
            {tree.total_sections} sections · {tree.total_words} total words
          </div>
        </div>

        {/* Section nodes */}
        <div style={{ marginLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {tree.children.map((node, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === i ? `${color}14` : `${color}07`,
                border: `1px solid ${hovered === i ? color + '50' : color + '1f'}`,
                borderRadius: 10, padding: '12px 16px',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color, fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', marginBottom: 3 }}>
                    📄 {node.title}
                  </div>
                  <div style={{ color: 'var(--text2)', fontSize: 12 }}>
                    {node.topic}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 160, justifyContent: 'flex-end' }}>
                  {node.keywords.map(kw => (
                    <span key={kw} style={{
                      fontSize: 9, fontFamily: 'JetBrains Mono, monospace',
                      color, background: `${color}18`,
                      padding: '2px 6px', borderRadius: 4,
                    }}>{kw}</span>
                  ))}
                </div>
              </div>
              {hovered === i && (
                <div style={{
                  marginTop: 10, paddingTop: 10,
                  borderTop: `1px solid ${color}20`,
                  color: 'var(--text2)', fontSize: 12, lineHeight: 1.7,
                }}>{node.content}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const chunks = data.chunks || []
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {chunks.map((chunk, i) => (
        <div
          key={i}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          style={{
            background: hovered === i ? `${color}18` : `${color}0a`,
            border: `1px solid ${hovered === i ? color + '60' : color + '25'}`,
            borderRadius: 10, padding: '10px 14px',
            cursor: 'pointer', transition: 'all 0.22s ease',
            flex: hovered === i ? '1 1 100%' : '0 0 auto',
            maxWidth: hovered === i ? '100%' : 180,
            fontSize: 12, lineHeight: 1.6,
          }}
        >
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10, color, fontWeight: 600, marginBottom: 4,
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>CHUNK {chunk.id + 1}</span>
            <span style={{ color: 'var(--text3)' }}>{chunk.word_count}w</span>
          </div>
          <div style={{ color: hovered === i ? 'var(--text)' : 'var(--text2)' }}>
            {hovered === i
              ? chunk.content
              : chunk.content.slice(0, 70) + (chunk.content.length > 70 ? '…' : '')}
          </div>
          {hovered === i && chunk.avg_similarity !== undefined && (
            <div style={{ marginTop: 6, fontSize: 10, color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace' }}>
              avg_similarity: {chunk.avg_similarity} · sentences: {chunk.sentence_count}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
