import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { proposalsService } from '@/services/proposalsService'
import { parametersService } from '@/services/parametersService'
import { ProposalModel, RT360Parameters } from '@/types/rt360'
import {
  calculateComplexityFactor,
  calculatePricing,
  calculateAudit,
  formatBRL,
} from '@/lib/pricingEngine'
import TabClientData from '@/components/proposal/TabClientData'
import TabComplexity from '@/components/proposal/TabComplexity'
import TabInvestment from '@/components/proposal/TabInvestment'
import TabAudit from '@/components/proposal/TabAudit'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Save,
  Printer,
  ArrowLeft,
  Copy,
  Building,
  Sliders,
  CreditCard,
  ShieldAlert,
  Sparkles,
  FileText,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ProposalEditor() {
  const { id } = useParams<{ id: string }>()
  const isNew = !id || id === 'nova'
  const navigate = useNavigate()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [params, setParams] = useState<RT360Parameters | null>(null)
  const [activeTab, setActiveTab] = useState('cliente')

  const [proposal, setProposal] = useState<Partial<ProposalModel>>({
    code: `PROP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    client_name: '',
    cnpj: '',
    proposal_date: new Date().toISOString().slice(0, 10),
    valid_until: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
    tax_regime: 'lucro_presumido',
    monthly_revenue: 500000,
    current_monthly_fee: 4500,
    accounting_firm: 'Escritório Contábil RT360',
    responsible_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    status: 'rascunho',

    sector: 'comercio_varejo',
    cnpj_count: '1',
    customer_profile: 'b2c_predominante',
    tax_benefits: 'sem_beneficios',
    data_quality: 'erp_padrao',
    suppliers_count: '51_200',
    clients_count: '101_500',
    sku_count: '101_1000',
    complexity_factor: 1.0,

    discount_level: 'none',
    discount_percentage: 0,
    discount_counterpart: '',
    payment_condition: 'entrada_30',
    recommended_product: 'diagnostico',
  })

  // Carregar parâmetros e dados da proposta
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const loadedParams = await parametersService.getActiveParameters()
        setParams(loadedParams)

        if (!isNew && id) {
          const loadedProp = await proposalsService.getProposalById(id)
          setProposal(loadedProp)
        }
      } catch (err: any) {
        toast({
          title: 'Erro ao carregar dados',
          description: err.message,
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, isNew])

  // Recalcular fator e preços dinamicamente
  const calculatedFactor = params ? calculateComplexityFactor(params, proposal) : 1.0

  const calculatedPricing = params
    ? calculatePricing(
        {
          ...proposal,
          complexity_factor: calculatedFactor,
        },
        params,
      )
    : null

  const calculatedAudit =
    params && calculatedPricing ? calculateAudit(calculatedPricing, params) : null

  const handleProposalChange = (updates: Partial<ProposalModel>) => {
    setProposal((prev) => ({
      ...prev,
      ...updates,
    }))
  }

  const handleSave = async () => {
    if (!proposal.client_name?.trim()) {
      toast({
        title: 'Nome do cliente obrigatório',
        description: 'Por favor, preencha o nome da empresa ou cliente.',
        variant: 'destructive',
      })
      setActiveTab('cliente')
      return
    }

    try {
      setSaving(true)
      const dataToSave: Partial<ProposalModel> = {
        ...proposal,
        complexity_factor: calculatedFactor,
        pricing_snapshot: calculatedPricing || undefined,
        audit_snapshot: calculatedAudit || undefined,
      }

      if (isNew) {
        const created = await proposalsService.createProposal(dataToSave)
        toast({
          title: 'Proposta criada!',
          description: `Proposta ${created.code} salva com sucesso.`,
        })
        navigate(`/propostas/${created.id}`)
      } else if (id) {
        const updated = await proposalsService.updateProposal(id, dataToSave)
        setProposal(updated)
        toast({
          title: 'Alterações salvas!',
          description: `Proposta ${updated.code} atualizada.`,
        })
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar proposta',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDuplicate = async () => {
    if (isNew || !id) return
    try {
      setSaving(true)
      const duplicated = await proposalsService.duplicateProposal(id)
      toast({
        title: 'Proposta duplicada!',
        description: `Nova proposta gerada com o código ${duplicated.code}`,
      })
      navigate(`/propostas/${duplicated.id}`)
    } catch (err: any) {
      toast({
        title: 'Erro ao duplicar',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading || !params || !calculatedPricing || !calculatedAudit) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Carregando motor de cálculo RT360...</p>
        </div>
      </div>
    )
  }

  const recProduct = proposal.recommended_product || 'diagnostico'
  const finalPrice =
    recProduct === 'diagnostico'
      ? calculatedPricing.diagnostico.finalPrice
      : recProduct === 'consultoria'
        ? calculatedPricing.consultoria.finalPrice
        : calculatedPricing.comite.finalPrice

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
      {/* Top Bar de Ações e Informações */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 mb-6 border-b">
        <div className="flex items-center gap-3">
          <Link to="/propostas">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                {proposal.code}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {proposal.client_name || 'Nova Proposta RT360'}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Fator de complexidade: <strong>{calculatedFactor.toFixed(3)}x</strong> | Regime:{' '}
              <strong className="capitalize">{proposal.tax_regime?.replace('_', ' ')}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {!isNew && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
                disabled={saving}
                className="gap-1.5"
                title="Duplicar para outro cliente"
              >
                <Copy className="h-4 w-4" />
                Duplicar
              </Button>
              <Link to={`/propostas/${id}/imprimir`}>
                <Button variant="secondary" size="sm" className="gap-1.5">
                  <Printer className="h-4 w-4" />
                  Visualizar / Imprimir
                </Button>
              </Link>
            </>
          )}

          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5 shadow-sm">
            <Save className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Proposta'}
          </Button>
        </div>
      </div>

      {/* Mini Resumo Fixo de Preço e Viabilidade */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-4 rounded-xl bg-card border shadow-2xs">
        <div>
          <span className="text-xs text-muted-foreground block">Produto Recomendado:</span>
          <span className="font-bold text-sm text-foreground flex items-center gap-1 mt-0.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {recProduct === 'diagnostico'
              ? 'Diagnóstico RT'
              : recProduct === 'consultoria'
                ? 'Consultoria RT'
                : 'Comitê RT'}
          </span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground block">Investimento Proposto:</span>
          <span className="font-bold text-base text-foreground mt-0.5 block">
            {formatBRL(finalPrice)}
            {recProduct === 'comite' && (
              <span className="text-xs font-normal text-muted-foreground">/mês</span>
            )}
          </span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground block">Desconto Aplicado:</span>
          <span className="font-semibold text-sm text-foreground mt-0.5 block">
            {calculatedPricing.discountPercentage}%{' '}
            {calculatedPricing.discountPercentage > 0 && (
              <span className="text-xs text-emerald-600 font-normal">com contrapartida</span>
            )}
          </span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground block">Viabilidade Interna:</span>
          <Badge
            className={`mt-1 ${
              calculatedAudit.overallViability === 'verde'
                ? 'bg-emerald-600'
                : calculatedAudit.overallViability === 'amarelo'
                  ? 'bg-amber-600'
                  : 'bg-rose-600'
            }`}
          >
            {calculatedAudit.overallViability === 'verde'
              ? 'Margem Saudável'
              : calculatedAudit.overallViability === 'amarelo'
                ? 'Margem Moderada'
                : 'Piso Crítico'}
          </Badge>
        </div>
      </div>

      {/* Abas Principais da Proposta */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-muted/80 rounded-xl">
          <TabsTrigger value="cliente" className="py-2.5 gap-2 text-xs sm:text-sm">
            <Building className="h-4 w-4" />
            1. Dados do Cliente
          </TabsTrigger>
          <TabsTrigger value="complexidade" className="py-2.5 gap-2 text-xs sm:text-sm">
            <Sliders className="h-4 w-4" />
            2. Perfil & Complexidade
          </TabsTrigger>
          <TabsTrigger value="investimento" className="py-2.5 gap-2 text-xs sm:text-sm">
            <CreditCard className="h-4 w-4" />
            3. Investimento & Preços
          </TabsTrigger>
          <TabsTrigger value="auditoria" className="py-2.5 gap-2 text-xs sm:text-sm">
            <ShieldAlert className="h-4 w-4" />
            4. Auditoria Interna (DRE)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cliente" className="space-y-4">
          <TabClientData proposal={proposal} onChange={handleProposalChange} />
          <div className="flex justify-end pt-4">
            <Button onClick={() => setActiveTab('complexidade')} className="gap-2">
              Avançar para Complexidade
              <Sliders className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="complexidade" className="space-y-4">
          <TabComplexity
            proposal={proposal}
            params={params}
            calculatedFactor={calculatedFactor}
            onChange={handleProposalChange}
          />
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setActiveTab('cliente')}>
              Voltar: Dados do Cliente
            </Button>
            <Button onClick={() => setActiveTab('investimento')} className="gap-2">
              Avançar para Investimento
              <CreditCard className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="investimento" className="space-y-4">
          <TabInvestment
            proposal={proposal}
            params={params}
            pricing={calculatedPricing}
            onChange={handleProposalChange}
          />
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setActiveTab('complexidade')}>
              Voltar: Complexidade
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setActiveTab('auditoria')}
                className="gap-1.5"
              >
                <ShieldAlert className="h-4 w-4" />
                Ver DRE / Auditoria
              </Button>
              <Button onClick={handleSave} disabled={saving} className="gap-1.5 shadow-sm">
                <Save className="h-4 w-4" />
                Salvar Proposta
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="auditoria" className="space-y-4">
          <TabAudit audit={calculatedAudit} params={params} />
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setActiveTab('investimento')}>
              Voltar para Investimento
            </Button>
            {!isNew && (
              <Link to={`/propostas/${id}/imprimir`}>
                <Button className="gap-2">
                  <Printer className="h-4 w-4" />
                  Gerar Proposta Comercial
                </Button>
              </Link>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
