/* Layout Component - A component that wraps the main content of the app
   - Use this file to add a header, footer, or other elements that should be present on every page
   - This component is used in the App.tsx file to wrap the main content of the app */

import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'

export default function Layout() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Se não estiver logado e não for página de login, redireciona
  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />
  }

  // Se já estiver logado e tentar ir para login, redireciona para propostas
  if (user && location.pathname === '/login') {
    return <Navigate to="/propostas" replace />
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
