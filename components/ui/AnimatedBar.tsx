'use client'

import { motion } from 'framer-motion'

interface AnimatedBarProps {
  percent: number
  color?: string
  trackClassName?: string
  fillClassName?: string
  fillStyle?: React.CSSProperties
  height?: number
  delay?: number
}

export default function AnimatedBar({ percent, color = '#2dd4bf', trackClassName, fillClassName, fillStyle, height = 8, delay = 0 }: AnimatedBarProps) {
  const trackStyle = trackClassName ? undefined : { width: '100%', background: '#f3f4f6', borderRadius: 999, height, overflow: 'hidden' as const }
  const baseFillStyle = fillClassName ? fillStyle : { height: '100%', borderRadius: 999, background: color, ...fillStyle }

  return (
    <div className={trackClassName} style={trackStyle}>
      <motion.div
        className={fillClassName}
        style={baseFillStyle}
        initial={{ width: 0 }}
        whileInView={{ width: `${Math.min(percent, 100)}%` }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}
