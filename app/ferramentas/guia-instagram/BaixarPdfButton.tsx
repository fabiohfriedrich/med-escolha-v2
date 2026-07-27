'use client'

export default function BaixarPdfButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#7c3aed', color: 'white', fontWeight: 700, fontSize: 14, padding: '12px 28px', borderRadius: 10, border: 'none', cursor: 'pointer' }}
    >
      🖨️ Baixar em PDF
    </button>
  )
}
