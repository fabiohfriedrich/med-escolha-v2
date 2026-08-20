import FinanceiroClient from './FinanceiroClient'

export const dynamic = 'force-dynamic'

export default function AdminFinanceiro() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Financeiro</h1>
        <p className="text-gray-500 text-sm mt-1">Gasto em campanhas (Meta Ads) x receita de vendas (Hotmart) do Med Escolha</p>
      </div>
      <FinanceiroClient />
    </div>
  )
}
