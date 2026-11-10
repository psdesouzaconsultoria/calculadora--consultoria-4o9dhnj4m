import React, { createContext, useContext, useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { RecordModel } from 'pocketbase'

interface AuthContextType {
  user: RecordModel | null
  token: string | null
  isLoading: boolean
  login: (email: string, pass: string) => Promise<void>
  logout: () => void
  requestPasswordReset: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<RecordModel | null>(pb.authStore.record)
  const [token, setToken] = useState<string | null>(pb.authStore.token)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Escutar mudanças no authStore do PocketBase
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setToken(token)
      setUser(model)
    })

    // Checar validade da sessão
    if (pb.authStore.isValid && pb.authStore.record) {
      setUser(pb.authStore.record)
      setToken(pb.authStore.token)
    }
    setIsLoading(false)

    return () => {
      unsubscribe()
    }
  }, [])

  const login = async (email: string, pass: string) => {
    await pb.collection('users').authWithPassword(email, pass)
    setUser(pb.authStore.record)
    setToken(pb.authStore.token)
  }

  const logout = () => {
    pb.authStore.clear()
    setUser(null)
    setToken(null)
  }

  const requestPasswordReset = async (email: string) => {
    await pb.collection('users').requestPasswordReset(email)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        requestPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
