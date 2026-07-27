import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { readFile } from 'fs/promises'
import path from 'path'

const FILE_PATH = path.join(process.cwd(), 'assets', 'downloads', 'planilha-financeira-medico.xlsx')

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const file = await readFile(FILE_PATH)

  return new NextResponse(file, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="planilha-financeira-medico.xlsx"',
    },
  })
}
