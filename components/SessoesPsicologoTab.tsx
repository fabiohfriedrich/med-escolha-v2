'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

const WHATSAPP_EDUARDO = process.env.NEXT_PUBLIC_WHATSAPP_EDUARDO ?? ''
const HOTMART_CHECKOUT_PSICOLOGO = process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_PSICOLOGO ?? '#'

interface Saldo {
  temPacote: boolean
  saldo: number
  sessoes_total: number
  sessoes_usadas: number
}

export default function SessoesPsicologoTab() {
  const { user } = useUser()
  const [saldo, setSaldo] = useState<Saldo | null>(null)

  useEffect(() => {
    fetch('/api/sessoes-psicologo')
      .then((r) => r.json())
      .then(setSaldo)
      .catch(() => setSaldo(null))
  }, [])

  if (!saldo) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!saldo.temPacote) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400 text-sm mb-4">
          Você ainda não tem sessões com psicólogo. Adquira o pacote de 2 sessões pra começar.
        </p>
        <a
          href={HOTMART_CHECKOUT_PSICOLOGO}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-700 text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-blue-800 transition"
        >
          Quero as sessões →
        </a>
      </div>
    )
  }

  if (saldo.saldo <= 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400 text-sm">Você já usou as suas {saldo.sessoes_total} sessões com o psicólogo.</p>
      </div>
    )
  }

  const nome = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
  const email = user?.primaryEmailAddress?.emailAddress ?? ''
  const mensagem = `Olá Eduardo! Comprei o pacote de sessões do Med Escolha.\nMeu nome é ${nome || '(nome)'}, e-mail ${email || '(e-mail)'}.\nGostaria de combinar minha primeira sessão.`
  const linkWhatsapp = WHATSAPP_EDUARDO
    ? `https://wa.me/${WHATSAPP_EDUARDO}?text=${encodeURIComponent(mensagem)}`
    : null

  return (
    <div className="text-center py-10">
      <p className="text-gray-700 text-sm mb-1">
        Você tem <strong>{saldo.saldo}</strong> sessão{saldo.saldo !== 1 ? 'ões' : ''} disponível{saldo.saldo !== 1 ? 'is' : ''}.
      </p>
      <p className="text-xs text-gray-400 mb-6">
        Cancelamentos com menos de 24h de antecedência não devolvem a sessão.
      </p>
      {linkWhatsapp ? (
        <a
          href={linkWhatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-600 text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-green-700 transition"
        >
          Falar com o Eduardo no WhatsApp →
        </a>
      ) : (
        <p className="text-gray-400 text-sm">
          O contato direto com o Eduardo estará disponível aqui em breve.
        </p>
      )}
    </div>
  )
}
