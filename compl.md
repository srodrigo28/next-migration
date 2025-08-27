### Projet Next Migration
* Prisma ORM
* Neon Tech banco de dados.
* NextJS 15
* TailwindCSS
* Axios
* @heroicons/react

#### Preview

<img src="" alt="" />

#### 1. Criando Aplicação
```
npx create-next-app@latest next-prisma
```

#### 2. Instalando Dependências
* opção 1
```
npm install prisma --save-dev
npm install @prisma/client
npm install sqlite3
@heroicons/react
```
* opção 2
```
npm i axios prisma --save-dev @prisma/client sqlite3
```

#### 3. Iniciando o prisma ORM
* inicializando o prisma

```
npx prisma init
```

#### 4. Configure o .env

``` SQLite
DATABASE_URL="file:./dev.db"
```

```Postgres
DATABASE_URL="postgresql://neondb_owner:npg_n5CPfFgebi4p@ep-noisy-heart-acvd4ii4-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

#### 5. Crie seu schema.prisma

```
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id       Int    @id @default(autoincrement())
  nome     String
  email    String @unique
  telefone String
}
```

#### 6. Rodando primeiro migrate
```
npx prisma migrate dev --name create_table_user
```

#### 6.1 Prisma Generate
```
npx prisma generate
```

* Quando rodar esse comando
```
Quando você precisa rodar esse comando?
Você deve rodar npx prisma generate sempre que fizer qualquer alteração no seu arquivo schema.prisma, como por exemplo:

Adicionar um novo model.

Adicionar, remover ou modificar um campo em um model existente.

Criar ou alterar um relacionamento entre models.

Mudar o tipo de um campo.
```

#### 7. Criando conexão lib/prisma.ts
```
// lib/prisma.ts
import { PrismaClient } from '../generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

#### 8. Criando types lib/types/user
```
// lib/types/user.ts

export interface User {
  id: number
  nome: string
  email: string
  telefone: string
}

export interface CreateUserInput {
  nome: string
  email: string
  telefone: string
}

export interface UpdateUserInput {
  id: number
  nome?: string
  email?: string
  telefone?: string
}
```

#### 8.1 package.json
```
"build": "prisma generate && next build",
```

#### 9. Primeiro endpoint
```
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const users = await prisma.user.findMany()
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nome, email, telefone } = body

    if (!nome || !email || !telefone) {
      return NextResponse.json({ error: 'Campos obrigatórios' }, { status: 400 })
    }

    const user = await prisma.user.create({
      data: { nome, email, telefone },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, nome, email, telefone } = body
    const userId = Number(id)

    if (!userId) {
      return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { nome, email, telefone },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: Number(id) },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar usuário' }, { status: 500 })
  }
}
```

#### 9.1 Prisma Studio
```
npx prisma studio
```

#### 10. Criar nosso frontend 1
* app/users/page.tsx
```
"use client"
import { useEffect, useState } from "react"
import type { User, CreateUserInput } from "@/lib/types/user"
import axios from "axios"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState<CreateUserInput>({
    nome: "",
    email: "",
    telefone: "",
  })
  const [editingUserId, setEditingUserId] = useState<number | null>(null)

  const fetchUsers = async () => {
    try {
      const res = await axios.get<User[]>("/api/users")
      setUsers(res.data)
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingUserId) {
        // Atualizar
        await axios.put("/api/users", { id: editingUserId, ...formData })
      } else {
        // Criar novo
        await axios.post("/api/users", formData)
      }

      setFormData({ nome: "", email: "", telefone: "" })
      setEditingUserId(null)
      setIsModalOpen(false)
      fetchUsers()
    } catch (error) {
      console.error("Erro ao salvar usuário:", error)
    }
  }

  const handleEdit = (user: User) => {
    setFormData({
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
    })
    setEditingUserId(user.id)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return
    try {
      await axios.delete(`/api/users?id=${id}`)
      fetchUsers()
    } catch (error) {
      console.error("Erro ao excluir usuário:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Usuários</h1>
          <button
            onClick={() => {
              setFormData({ nome: "", email: "", telefone: "" })
              setEditingUserId(null)
              setIsModalOpen(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Adicionar Usuário
          </button>
        </div>

        <div className="bg-white shadow rounded p-4">
          {users.length === 0 ? (
            <p className="text-gray-500">Nenhum usuário cadastrado.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4">Nome</th>
                  <th className="py-2 px-4">Email</th>
                  <th className="py-2 px-4">Telefone</th>
                  <th className="py-2 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{user.nome}</td>
                    <td className="py-2 px-4">{user.email}</td>
                    <td className="py-2 px-4">{user.telefone}</td>
                    <td className="py-2 px-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="px-2 py-1 bg-yellow-400 rounded hover:bg-yellow-500 text-white"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="px-2 py-1 bg-red-500 rounded hover:bg-red-600 text-white"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                {editingUserId ? "Editar Usuário" : "Adicionar Usuário"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="nome"
                  placeholder="Nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded"
                  required
                />
                <input
                  type="text"
                  name="telefone"
                  placeholder="Telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {editingUserId ? "Atualizar" : "Salvar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```