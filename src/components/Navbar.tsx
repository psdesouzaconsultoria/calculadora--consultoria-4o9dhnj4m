import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { FileText, Sliders, LogOut, PlusCircle, Building2, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!user) return null

  const navItems = [
    { label: 'Propostas', path: '/propostas', icon: FileText },
    { label: 'Parâmetros RT360', path: '/parametros', icon: Sliders },
  ]

  const isActive = (path: string) => {
    if (path === '/propostas') {
      return location.pathname === '/' || location.pathname.startsWith('/propostas')
    }
    return location.pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 print:hidden shadow-xs">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link to="/propostas" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-foreground flex items-center gap-1.5">
                RT360{' '}
                <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                  v3.0
                </span>
              </span>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Metodologia RTE para Escritórios Contábeis
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/propostas/nova" className="hidden sm:inline-flex">
            <Button size="sm" className="gap-1.5 shadow-sm">
              <PlusCircle className="h-4 w-4" />
              Nova Proposta
            </Button>
          </Link>

          <div className="hidden sm:flex items-center gap-2 pl-2 border-l">
            <div className="text-right">
              <p className="text-xs font-semibold leading-none text-foreground">
                {user.name || user.email}
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate max-w-[140px]">
                {user.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={logout}
              title="Sair do sistema"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-card px-4 py-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium ${
                  active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
          <Link
            to="/propostas/nova"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium bg-primary text-primary-foreground"
          >
            <PlusCircle className="h-4 w-4" />
            Nova Proposta
          </Link>
          <div className="pt-2 border-t flex items-center justify-between">
            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-destructive gap-1 text-xs"
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
