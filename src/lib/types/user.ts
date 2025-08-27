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