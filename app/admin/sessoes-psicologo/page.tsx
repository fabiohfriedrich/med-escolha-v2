import SessoesPsicologoRelatorioClient from './SessoesPsicologoRelatorioClient'

export const dynamic = 'force-dynamic'

export default function AdminSessoesPsicologo() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Sessões com o psicólogo</h1>
        <p className="text-gray-500 text-sm mt-1">Quantas sessões o Eduardo realizou, mês a mês (dados que ele mesmo registra em /admin/psicologo)</p>
      </div>
      <SessoesPsicologoRelatorioClient />
    </div>
  )
}
