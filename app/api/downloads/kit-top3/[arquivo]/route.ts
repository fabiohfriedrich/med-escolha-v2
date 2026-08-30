import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { obterArquivoKitTop3 } from '@/lib/kit-top3'
import { PRODUTO_DIGITAL_KIT_TOP3, temAcessoProdutoDigital } from '@/lib/produtos-digitais'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type ContextoDownload = {
  params: Promise<{ arquivo: string }>
}

export async function GET(_request: Request, { params }: ContextoDownload) {
  const { arquivo: slug } = await params
  const arquivo = obterArquivoKitTop3(slug)
  if (!arquivo) {
    return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })
  }

  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress
  if (!email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  try {
    const desbloqueado = await temAcessoProdutoDigital(email, PRODUTO_DIGITAL_KIT_TOP3)
    if (!desbloqueado) {
      return NextResponse.json({ error: 'Compra do kit necessária' }, { status: 403 })
    }

    const caminho = path.join(process.cwd(), 'assets', 'downloads', 'kit-top3', arquivo.nomeArquivo)
    const conteudo = await readFile(caminho)

    console.log(`[kit-top3] Download autorizado: ${arquivo.slug} (${arquivo.tipo})`)
    return new NextResponse(conteudo, {
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Disposition': `attachment; filename="${arquivo.nomeArquivo}"`,
        'Content-Length': String(conteudo.byteLength),
        'Content-Type': arquivo.contentType,
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error(`[kit-top3] Falha no download ${arquivo.slug}:`, error)
    return NextResponse.json({ error: 'Não foi possível entregar o arquivo' }, { status: 500 })
  }
}
