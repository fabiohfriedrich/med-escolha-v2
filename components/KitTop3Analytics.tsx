'use client'

import { useEffect } from 'react'
import {
  trackKitTop3Checkout,
  trackKitTop3Download,
  trackKitTop3OfferView,
  trackKitTop3Page,
  type OrigemOfertaKitTop3,
} from '@/lib/ad-tracking'

export function KitTop3PageTracker({ desbloqueado }: { desbloqueado: boolean }) {
  useEffect(() => {
    trackKitTop3Page(desbloqueado)
  }, [desbloqueado])

  return null
}

export function KitTop3OfferTracker({ origem }: { origem: OrigemOfertaKitTop3 }) {
  useEffect(() => {
    trackKitTop3OfferView(origem)
  }, [origem])

  return null
}

type CheckoutLinkProps = {
  href: string
  origem: OrigemOfertaKitTop3
  className?: string
  children: React.ReactNode
}

export function KitTop3CheckoutLink({ href, origem, className, children }: CheckoutLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackKitTop3Checkout(origem)}
    >
      {children}
    </a>
  )
}

type DownloadLinkProps = {
  href: string
  arquivo: string
  tipo: 'individual' | 'pacote'
  className?: string
  children: React.ReactNode
}

export function KitTop3DownloadLink({ href, arquivo, tipo, className, children }: DownloadLinkProps) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => trackKitTop3Download(arquivo, tipo)}
    >
      {children}
    </a>
  )
}
