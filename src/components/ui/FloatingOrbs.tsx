export function FloatingOrbs() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: -160, left: -160,
        width: 500, height: 500, borderRadius: '50%',
        background: 'var(--orb1)', filter: 'blur(100px)',
        opacity: 0.22,
        animation: 'orbFloat1 20s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: -160, right: -160,
        width: 500, height: 500, borderRadius: '50%',
        background: 'var(--orb2)', filter: 'blur(100px)',
        opacity: 0.18,
        animation: 'orbFloat2 24s ease-in-out infinite 4s',
      }} />
      <div style={{
        position: 'absolute', top: '38%', left: '40%',
        width: 280, height: 280, borderRadius: '50%',
        background: 'var(--orb3)', filter: 'blur(80px)',
        opacity: 0.13,
        animation: 'orbPulse 16s ease-in-out infinite 8s',
      }} />
      <style>{`
        @keyframes orbFloat1 { 0%,100%{transform:translate(0,0)} 25%{transform:translate(40px,-30px)} 50%{transform:translate(-20px,20px)} 75%{transform:translate(30px,-15px)} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0)} 25%{transform:translate(-35px,25px)} 50%{transform:translate(20px,-20px)} 75%{transform:translate(-25px,10px)} }
        @keyframes orbPulse  { 0%,100%{opacity:0.13;transform:scale(1)} 50%{opacity:0.2;transform:scale(1.18)} }
      `}</style>
    </div>
  )
}

export default FloatingOrbs
