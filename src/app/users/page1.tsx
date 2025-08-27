"use client"
import { useEffect, useState } from "react"
import type { User, CreateUserInput } from "@/lib/types/user"
import axios from "axios"

export default function UsersPage1() {
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
