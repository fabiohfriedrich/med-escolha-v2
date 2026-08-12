import { createClerkClient } from '@clerk/backend'

const email = 'brenogand@hotmail.com'
const senha = 'MedEscolha2026'

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

const { data: existentes } = await clerk.users.getUserList({ emailAddress: [email] })
const existente = existentes[0]

if (existente) {
  await clerk.users.updateUser(existente.id, { password: senha })
  await clerk.users.updateUserMetadata(existente.id, { publicMetadata: { mustChangePassword: true } })
  console.log(JSON.stringify({ status: 'senha_atualizada', clerkUserId: existente.id, email }))
} else {
  const novo = await clerk.users.createUser({
    emailAddress: [email],
    firstName: 'Breno',
    lastName: 'de Amaral Gandini',
    password: senha,
    publicMetadata: { mustChangePassword: true },
  })
  console.log(JSON.stringify({ status: 'usuario_criado', clerkUserId: novo.id, email }))
}
