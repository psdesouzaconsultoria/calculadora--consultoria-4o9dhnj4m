import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { proposalsService } from '@/services/proposalsService'
import { ProposalModel } from '@/types/rt360'
import { formatBRL } from '@/lib/pricingEngine'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PlusCircle,
  Search,
  FileText,
  Copy,
  Trash2,
  Printer,
  ChevronRight,
  Clock,
  Sparkles,
  ArrowUpRight,
  Sliders,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ProposalsList() {
  const [proposals, setProposals] = useState<ProposalModel[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const { toast } = useToast()
  const navigate = useNavigate()

  const loadProposals = async () => {
    try {
      setLoading(true)
      const data = await proposalsService.listProposals()
      setProposals(data)
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Erro ao carregar propostas',
        description: err.message || 'Falha ao buscar propostas salvas.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProposals()
  }, [])

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const duplicated = await proposalsService.duplicateProposal(id)
      toast({
        title: 'Proposta duplicada com sucesso!',
        description: `Nova proposta criada: ${duplicated.code}`,
      })
      await loadProposals()
      navigate(`/propostas/${duplicated.id}`)
    } catch (err: any) {
      toast({
        title: 'Erro ao duplicar proposta',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string, code: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm(`Tem certeza que deseja remover a proposta ${code}?`)) {
      return
    }

    try {
      await proposalsService.deleteProposal(id)
      toast({
        title: 'Proposta excluída',
        description: `Proposta ${code} removida com sucesso.`,
      })
      setProposals(proposals.filter((p) => p.id !== id))
    } catch (err: any) {
      toast({
        title: 'Erro ao excluir proposta',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  const filteredProposals = proposals.filter((p) => {
    const matchesSearch =
      p.client_name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      (p.cnpj && p.cnpj.includes(search))

    const matchesStatus = statusFilter === 'todos' || p.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovada':
        return <Badge className="bg-brand-gold hover:bg-brand-gold-dark text-white">Aprovada</Badge>
      case 'em_negociacao':
        return (
          <Badge
            variant="outline"
            className="text-brand-gold-dark border-brand-gold bg-brand-gold/10"
          >
            Em Negociação
          </Badge>
        )
      case 'enviada':
        return (
          <Badge variant="secondary" className="bg-brand-navy text-white">
            Enviada
          </Badge>
        )
      case 'recusada':
        return <Badge variant="destructive">Recusada</Badge>
      case 'rascunho':
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Rascunho
          </Badge>
        )
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Propostas Comerciais RT360
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestão de diagnósticos, consultorias e comitês de governança da Reforma Tributária.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/parametros">
            <Button variant="outline" size="sm" className="gap-2">
              <Sliders className="h-4 w-4" />
              Parâmetros RT360
            </Button>
          </Link>
          <Link to="/propostas/nova">
            <Button size="sm" className="gap-2 shadow-xs">
              <PlusCircle className="h-4 w-4" />
              Nova Proposta
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, CNPJ ou código da proposta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="todos">Todos os status</option>
            <option value="rascunho">Rascunho</option>
            <option value="enviada">Enviada</option>
            <option value="em_negociacao">Em Negociação</option>
            <option value="aprovada">Aprovada</option>
            <option value="recusada">Recusada</option>
          </select>
        </div>
      </div>

      {/* Lista de Propostas */}
      {loading ? (
        <div className="flex items-center justify-center p-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
        </div>
      ) : filteredProposals.length === 0 ? (
        <Card className="text-center p-12 border-dashed">
          <CardContent className="space-y-4 pt-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-brand-navy/10 flex items-center justify-center text-brand-navy">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">Nenhuma proposta encontrada</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
                {search || statusFilter !== 'todos'
                  ? 'Nenhuma proposta corresponde aos filtros aplicados.'
                  : 'Comece criando a sua primeira proposta comercial RT360 para seus clientes.'}
              </p>
            </div>
            <Link to="/propostas/nova">
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Criar Proposta Agora
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProposals.map((prop) => {
            const pricing = prop.pricing_snapshot
            const recProduct = prop.recommended_product || 'diagnostico'
            const finalPrice =
              recProduct === 'diagnostico'
                ? pricing?.diagnostico?.finalPrice
                : recProduct === 'consultoria'
                  ? pricing?.consultoria?.finalPrice
                  : pricing?.comite?.finalPrice

            return (
              <Card
                key={prop.id}
                className="hover:shadow-md transition-all duration-200 border-border/80 flex flex-col justify-between group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-semibold text-brand-navy px-2 py-0.5 rounded bg-brand-navy/10">
                      {prop.code}
                    </span>
                    {getStatusBadge(prop.status)}
                  </div>
                  <CardTitle className="text-lg font-bold tracking-tight text-foreground line-clamp-1 mt-1 group-hover:text-brand-navy transition-colors">
                    {prop.client_name}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-1">
                    {prop.cnpj ? `CNPJ: ${prop.cnpj}` : 'CNPJ não informado'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pb-3 text-sm">
                  <div className="p-2.5 rounded-lg bg-muted/60 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Produto Sugerido:</span>
                    <span className="font-semibold capitalize text-foreground flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-brand-gold-dark" />
                      {recProduct === 'diagnostico'
                        ? 'Diagnóstico RT'
                        : recProduct === 'consultoria'
                          ? 'Consultoria RT'
                          : 'Comitê RT (Mensal)'}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1 border-t">
                    <span className="text-xs text-muted-foreground">Investimento Proposto:</span>
                    <span className="text-base font-bold text-foreground">
                      {finalPrice ? formatBRL(finalPrice) : 'Sob Consulta'}
                      {recProduct === 'comite' && (
                        <span className="text-xs font-normal text-muted-foreground">/mês</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {prop.proposal_date
                        ? new Date(prop.proposal_date).toLocaleDateString('pt-BR')
                        : 'Data n/d'}
                    </span>
                    <span>Resp: {prop.responsible_name || 'N/A'}</span>
                  </div>
                </CardContent>

                <div className="p-3 bg-muted/30 border-t flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title="Duplicar proposta"
                      onClick={(e) => handleDuplicate(prop.id!, e)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Link to={`/propostas/${prop.id}/imprimir`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-brand-navy"
                        title="Ver Proposta Comercial (Impressão / PDF)"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      title="Excluir proposta"
                      onClick={(e) => handleDelete(prop.id!, prop.code, e)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <Link to={`/propostas/${prop.id}`}>
                    <Button size="sm" variant="default" className="h-8 text-xs gap-1">
                      Editar
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
