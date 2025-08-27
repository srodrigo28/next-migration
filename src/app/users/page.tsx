"use client"

import { useEffect, useState } from "react"
import type { User, CreateUserInput } from "@/lib/types/user"
import axios from "axios"
import { PencilIcon, TrashIcon, UserPlusIcon } from "@heroicons/react/24/outline"

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            Gerenciamento de Usuários
          </h1>
          <button
            onClick={() => {
              setFormData({ nome: "", email: "", telefone: "" })
              setEditingUserId(null)
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105"
          >
            <UserPlusIcon className="h-5 w-5" />
            Adicionar Usuário
          </button>
        </div>

        {users.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Nenhum usuário cadastrado.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {user.nome}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-yellow-500 hover:text-yellow-600 transition-colors duration-200"
                      title="Editar"
                    >
                      <PencilIcon className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-500 hover:text-red-600 transition-colors duration-200"
                      title="Excluir"
                    >
                      <TrashIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Telefone:{" "}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {user.telefone}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-lg transform scale-100 transition-transform duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                {editingUserId ? "Editar Usuário" : "Adicionar Usuário"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="nome"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Nome
                  </label>
                  <input
                    id="nome"
                    type="text"
                    name="nome"
                    placeholder="Nome completo"
                    value={formData.nome}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="seu.email@exemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="telefone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Telefone
                  </label>
                  <input
                    id="telefone"
                    type="text"
                    name="telefone"
                    placeholder="(99) 99999-9999"
                    value={formData.telefone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors"
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