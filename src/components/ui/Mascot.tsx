import { useEffect, useRef, useState } from 'react'

export type MascotRole  = 'student' | 'teacher' | 'parent'
export type MascotState = 'idle' | 'happy' | 'sad' | 'thinking' | 'wave'

const MASCOT_SRC: Record<MascotRole, string> = {
  student: '/mascots/mascot_sagird.png',
  teacher: '/mascots/mascot_muellim.png',
  parent:  '/mascots/mascot_validyen.png',
}

const KEYFRAMES = `
@keyframes mascot-float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50%       { transform: translateY(-10px) rotate(1deg); }
}
@keyframes mascot-happy {
  0%   { transform: translateY(0px) scale(1) rotate(0deg); }
  20%  { transform: translateY(-18px) scale(1.08) rotate(-3deg); }
  40%  { transform: translateY(-6px) scale(1.04) rotate(2deg); }
  60%  { transform: translateY(-14px) scale(1.06) rotate(-2deg); }
  80%  { transform: translateY(-4px) scale(1.02) rotate(1deg); }
  100% { transform: translateY(0px) scale(1) rotate(0deg); }
}
@keyframes mascot-sad {
  0%   { transform: translateX(0px) rotate(0deg); }
  20%  { transform: translateX(-6px) rotate(-3deg); }
  40%  { transform: translateX(6px) rotate(3deg); }
  60%  { transform: translateX(-4px) rotate(-2deg); }
  80%  { transform: translateX(4px) rotate(2deg); }
  100% { transform: translateX(0px) rotate(0deg); }
}
@keyframes mascot-thinking {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33%       { transform: translateY(-4px) rotate(-2deg); }
  66%       { transform: translateY(-2px) rotate(2deg); }
}
@keyframes mascot-wave {
  0%   { transform: translateY(0px) rotate(0deg) scale(0.85); opacity: 0; }
  30%  { transform: translateY(-12px) rotate(-4deg) scale(1.05); opacity: 1; }
  60%  { transform: translateY(-6px) rotate(3deg) scale(1); }
  100% { transform: translateY(0px) rotate(0deg) scale(1); opacity: 1; }
}
@keyframes mascot-hover {
  0%   { transform: translateY(0px) scale(1); }
  100% { transform: translateY(-8px) scale(1.06); }
}
`

const ANIMATION: Record<MascotState, string> = {
  idle:     'mascot-float 3.5s ease-in-out infinite',
  happy:    'mascot-happy 0.7s ease-in-out',
  sad:      'mascot-sad 0.6s ease-in-out',
  thinking: 'mascot-thinking 2s ease-in-out infinite',
  wave:     'mascot-wave 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards',
}

interface MascotProps {
  role:      MascotRole
  state?:    MascotState
  size?:     number
  onAnimEnd?: () => void
}

export default function Mascot({ role, state = 'idle', size = 200, onAnimEnd }: MascotProps) {
  const [hovered, setHovered] = useState(false)
  const [currentAnim, setCurrentAnim] = useState(ANIMATION[state])
  const imgRef = useRef<HTMLImageElement>(null)

  // Inject keyframes once
  useEffect(() => {
    if (document.getElementById('mascot-keyframes')) return
    const style = document.createElement('style')
    style.id = 'mascot-keyframes'
    style.textContent = KEYFRAMES
    document.head.appendChild(style)
  }, [])

  useEffect(() => {
    setCurrentAnim(ANIMATION[state])
  }, [state])

  const handleAnimEnd = () => {
    if (state !== 'idle' && state !== 'thinking') {
      setCurrentAnim(ANIMATION['idle'])
    }
    onAnimEnd?.()
  }

  return (
    <div
      style={{ display: 'inline-block', width: size, height: size * 1.2, position: 'relative', cursor: 'pointer' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        ref={imgRef}
        src={MASCOT_SRC[role]}
        alt="LUNO maskot"
        onAnimationEnd={handleAnimEnd}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          animation: hovered && state === 'idle'
            ? 'mascot-hover 0.3s ease forwards'
            : currentAnim,
          transformOrigin: 'bottom center',
          userSelect: 'none',
          filter: state === 'sad'
            ? 'grayscale(0.3) brightness(0.9)'
            : state === 'happy'
            ? 'brightness(1.08) drop-shadow(0 0 12px rgba(0,201,167,0.5))'
            : 'none',
          transition: 'filter 0.3s ease',
        }}
      />

      {/* Happy sparkles */}
      {state === 'happy' && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
          {['⭐', '✨', '🌟'].map((s, i) => (
            <span key={i} style={{
              position: 'absolute',
              fontSize: 16 + i * 4,
              top: `${10 + i * 15}%`,
              left: i % 2 === 0 ? '-10%' : '90%',
              animation: `mascot-wave 0.6s ease ${i * 0.1}s forwards`,
              opacity: 0,
            }}>{s}</span>
          ))}
        </div>
      )}
    </div>
  )
}
