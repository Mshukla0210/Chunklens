function QualityDots({ value, max = 5, color }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{
          width: 16, height: 5, borderRadius: 3,
          background: i < value ? color : 'var(--border2)',
          transition: `background 0.3s ease ${i * 0.06}s`,
        }} />
      ))}
    </div>
  )
}

export default function MethodCard({ method, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: isActive ? `${method.color}12` : 'var(--surface)',
        border: `1px solid ${isActive ? method.color + '55' : 'var(--border)'}`,
        borderRadius: 16, padding: '20px 22px',
        cursor: 'pointer', transition: 'all 0.25s ease',
        position: 'relative', overflow: 'hidden',
        transform: isActive ? 'translateY(-1px)' : 'none',
        boxShadow: isActive ? `0 8px 32px ${method.color}20` : 'none',
      }}
    >
      {/* Top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: isActive ? method.color : 'transparent',
        transition: 'background 0.2s',
        borderRadius: '16px 16px 0 0',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${method.color}18`,
          border: `1px solid ${method.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, color: method.color,
          fontFamily: 'Syne, sans-serif',
        }}>{method.icon}</div>
        <div style={{
          fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
          color: method.color, background: `${method.color}18`,
          padding: '3px 8px', borderRadius: 20,
        }}>{method.complexity}</div>
      </div>

      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
        {method.name}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 14 }}>
        {method.subtitle}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { label: 'Quality', val: method.quality },
          { label: 'Speed', val: method.speed },
        ].map(stat => (
          <div key={stat.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>{stat.label}</span>
              <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'JetBrains Mono, monospace' }}>
                {stat.val}/5
              </span>
            </div>
            <QualityDots value={stat.val} color={method.color} />
          </div>
        ))}
      </div>
    </div>
  )
}
