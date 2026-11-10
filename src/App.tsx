/* Main App Component - Handles routing (using react-router-dom), query client and other providers */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import ProposalsList from './pages/ProposalsList'
import ProposalEditor from './pages/ProposalEditor'
import ProposalPrintView from './pages/ProposalPrintView'
import ParametersView from './pages/ParametersView'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/propostas" replace />} />
            <Route path="/propostas" element={<ProposalsList />} />
            <Route path="/propostas/nova" element={<ProposalEditor />} />
            <Route path="/propostas/:id" element={<ProposalEditor />} />
            <Route path="/propostas/:id/imprimir" element={<ProposalPrintView />} />
            <Route path="/parametros" element={<ParametersView />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
