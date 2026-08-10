'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { useInView, useMotionValue, useSpring } from 'framer-motion'

interface CountUpProps {
  end: number
  decimals?: number
  suffix?: string
  duration?: number
  className?: string
}

// useLayoutEffect warns during SSR; fall back to useEffect there since the reset only matters in the browser.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export default function CountUp({ end, decimals = 0, suffix = '', duration = 1.4, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { duration: duration * 1000, bounce: 0 })

  // Server/no-JS markup shows the real number (see JSX below). Once JS takes over, reset to 0
  // before the browser paints so the count-up still plays without ever flashing the final value.
  useIsomorphicLayoutEffect(() => {
    if (ref.current) ref.current.textContent = `${(0).toFixed(decimals)}${suffix}`
  }, [decimals, suffix])

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

  return <span ref={ref} className={className}>{end.toFixed(decimals)}{suffix}</span>
}
