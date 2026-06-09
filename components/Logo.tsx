import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'light' | 'dark'
}

export default function Logo({ size = 'md', variant = 'dark' }: LogoProps) {
  const sizes = {
    sm: { width: 130, height: 40 },
    md: { width: 180, height: 55 },
    lg: { width: 240, height: 74 },
  }
  const { width, height } = sizes[size]

  return (
    <Image
      src="/logo-med-escolha.svg"
      alt="Med Escolha por Amo Medicina"
      width={width}
      height={height}
      priority
    />
  )
}
