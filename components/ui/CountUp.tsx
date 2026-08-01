'use client'

import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'

interface CountUpProps {
  end: number
  decimals?: number
  suffix?: string
  duration?: number
  className?: string
}

export default function CountUp({ end, decimals = 0, suffix = '', duration = 1.4, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { duration: duration * 1000, bounce: 0 })

  useEffect(() => {
    if (inView) motionValue.set(end)
  }, [inView, end, motionValue])

  useEffect(() => {
    return springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${latest.toFixed(decimals)}${suffix}`
      }
    })
  }, [springValue, decimals, suffix])

  return <span ref={ref} className={className}>0{suffix}</span>
}
