import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { proposalsService } from '@/services/proposalsService'
import { parametersService } from '@/services/parametersService'
import { ProposalModel, RT360Parameters, CalculatedPricing } from '@/types/rt360'
import { calculateComplexityFactor, calculatePricing, formatBRL } from '@/lib/pricingEngine'
import { Button } from '@/components/ui/button'
import {
  Printer,
  ArrowLeft,
  CheckCircle2,
  FileCheck,
  ShieldCheck,
  Award,
  Sparkles,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { BrandLogo } from '@/lib/brand'

export default function ProposalPrintView() {
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [proposal, setProposal] = useState<ProposalModel | null>(null)
  const [params, setParams] = useState<RT360Parameters | null>(null)

  useEffect(() => {
    async function load() {
      if (!id) return
      try {
        setLoading(true)
        const [loadedProp, loadedParams] = await Promise.all([
          proposalsService.getProposalById(id),
          parametersService.getActiveParameters(),
        ])
        setProposal(loadedProp)
        setParams(loadedParams)
      } catch (err: any) {
        toast({
          title: 'Erro ao carregar proposta',
          description: err.message,
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading || !proposal || !params) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Preparando proposta comercial...</p>
        </div>
      </div>
    )
  }

  // Recalcular ou usar snapshot
  const factor = proposal.complexity_factor || calculateComplexityFactor(params, proposal)
  const pricing: CalculatedPricing =
    proposal.pricing_snapshot ||
    calculatePricing(
      {
        ...proposal,
        complexity_factor: factor,
      },
      params,
    )

  const templates = params.proposal_templates
  const recProduct = proposal.recommended_product || 'diagnostico'

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 sm:px-6 print:p-0 print:bg-white text-slate-900">
      {/* Barra de Ferramentas Superior (Oculta na Impressão) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link to={`/propostas/${proposal.id}`}>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Editor
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Button
            onClick={handlePrint}
            size="sm"
            className="gap-2 shadow-xs bg-brand-navy hover:bg-brand-navy/90 text-white"
          >
            <Printer className="h-4 w-4" />
            Imprimir / Salvar em PDF
          </Button>
        </div>
      </div>

      {/* DOCUMENTO DA PROPOSTA COMERCIAL */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-lg border border-slate-200 rounded-xl print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
        {/* CABEÇALHO DO ESCRITÓRIO */}
        <header className="border-b-4 border-brand-navy pb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-4">
              <BrandLogo className="h-16 w-auto rounded-md print:h-14" />
              <div>
                <h1 className="text-2xl font-black tracking-tight text-brand-navy uppercase">
                  {proposal.accounting_firm || 'PS DE SOUZA — CONSULTORIA & SERVIÇOS CONTÁBIL'}
                </h1>
                <p className="text-xs uppercase font-semibold text-brand-gold-dark tracking-wider">
                  Divisão de Consultoria e Planejamento Tributário Estratégico
                </p>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 space-y-1">
            <p className="font-mono font-bold text-brand-navy text-sm">{proposal.code}</p>
            <p>Emissão: {new Date(proposal.proposal_date).toLocaleDateString('pt-BR')}</p>
            <p>Validade: {new Date(proposal.valid_until).toLocaleDateString('pt-BR')}</p>
            <p className="font-medium text-brand-navy">Resp: {proposal.responsible_name}</p>
          </div>
        </header>

        {/* DESTINATÁRIO */}
        <section className="my-8 p-5 rounded-lg bg-slate-50 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">
                Cliente / Empresa:
              </span>
              <p className="text-base font-bold text-slate-900">{proposal.client_name}</p>
              <p className="text-slate-600 font-mono mt-0.5">
                {proposal.cnpj ? `CNPJ: ${proposal.cnpj}` : 'CNPJ em cadastramento'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">
                Aos Cuidados de:
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {proposal.contact_name || 'Diretoria Executiva e Gestão Financeira'}
              </p>
              {(proposal.contact_email || proposal.contact_phone) && (
                <p className="text-slate-600 mt-0.5">
                  {[proposal.contact_email, proposal.contact_phone].filter(Boolean).join(' • ')}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* TÍTULO DA PROPOSTA */}
        <div className="text-center my-10">
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-brand-navy text-white mb-2">
            Metodologia RTE • Reforma Tributária 360°
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
            PROPOSTA TÉCNICA DE ADEQUAÇÃO E GOVERNANÇA
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto mt-2">
            Preparação estratégica para o novo modelo tributário sobre o consumo: IBS, CBS e Split
            Payment.
          </p>
        </div>

        {/* 1. APRESENTAÇÃO E CONTEXTO */}
        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <div>
            <h3 className="text-base font-bold text-brand-navy uppercase tracking-wide border-b-2 border-brand-gold pb-1 mb-3 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-brand-gold-dark" />
              1. Apresentação Executiva
            </h3>
            <p className="text-justify">
              {templates.presentation ||
                'Apresentamos a presente proposta técnica comercial para condução do projeto de adequação e transição para a Reforma Tributária.'}
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-brand-navy uppercase tracking-wide border-b-2 border-brand-gold pb-1 mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-gold-dark" />
              2. Contexto de Urgência da Reforma Tributária
            </h3>
            <p className="text-justify">
              {templates.context ||
                'A Reforma Tributária extingue PIS, COFINS, IPI, ICMS e ISS, instituindo a CBS e o IBS com o mecanismo de Split Payment na liquidação financeira.'}
            </p>
          </div>

          {/* 3. OPÇÕES DE ATENDIMENTO E ENTREGÁVEIS */}
          <div>
            <h3 className="text-base font-bold text-brand-navy uppercase tracking-wide border-b-2 border-brand-gold pb-1 mb-4 flex items-center gap-2">
              <Award className="h-4 w-4 text-brand-gold-dark" />
              3. Opções de Escopo e Entregáveis (Metodologia RTE)
            </h3>

            <div className="space-y-6">
              {/* PRODUTO 1: DIAGNÓSTICO */}
              <div
                className={`p-5 rounded-lg border ${
                  recProduct === 'diagnostico'
                    ? 'border-brand-navy bg-brand-navy/5 ring-1 ring-brand-navy'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Etapa de Prontidão
                    </span>
                    <h4 className="font-bold text-base text-slate-900">
                      {templates.deliverables.diagnostico.title}
                    </h4>
                    <p className="text-xs text-slate-600">
                      {templates.deliverables.diagnostico.subtitle}
                    </p>
                  </div>
                  {recProduct === 'diagnostico' && (
                    <span className="px-2.5 py-1 text-xs font-bold rounded bg-brand-navy text-white shrink-0">
                      ★ Recomendado para a Empresa
                    </span>
                  )}
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3 text-xs text-slate-700">
                  {templates.deliverables.diagnostico.scope.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand-gold-dark shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2 border-t flex flex-col sm:flex-row justify-between text-xs text-slate-500">
                  <span>
                    Prazo de execução:{' '}
                    <strong>{templates.deliverables.diagnostico.duration}</strong>
                  </span>
                  <span>
                    Formato: <strong>{templates.deliverables.diagnostico.format}</strong>
                  </span>
                </div>
              </div>

              {/* PRODUTO 2: CONSULTORIA */}
              <div
                className={`p-5 rounded-lg border ${
                  recProduct === 'consultoria'
                    ? 'border-brand-navy bg-brand-navy/5 ring-1 ring-brand-navy'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Etapa de Implementação
                    </span>
                    <h4 className="font-bold text-base text-slate-900">
                      {templates.deliverables.consultoria.title}
                    </h4>
                    <p className="text-xs text-slate-600">
                      {templates.deliverables.consultoria.subtitle}
                    </p>
                  </div>
                  {recProduct === 'consultoria' && (
                    <span className="px-2.5 py-1 text-xs font-bold rounded bg-brand-navy text-white shrink-0">
                      ★ Recomendado para a Empresa
                    </span>
                  )}
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3 text-xs text-slate-700">
                  {templates.deliverables.consultoria.scope.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand-gold-dark shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2 border-t flex flex-col sm:flex-row justify-between text-xs text-slate-500">
                  <span>
                    Prazo de execução:{' '}
                    <strong>{templates.deliverables.consultoria.duration}</strong>
                  </span>
                  <span>
                    Formato: <strong>{templates.deliverables.consultoria.format}</strong>
                  </span>
                </div>
              </div>

              {/* PRODUTO 3: COMITÊ */}
              <div
                className={`p-5 rounded-lg border ${
                  recProduct === 'comite'
                    ? 'border-brand-navy bg-brand-navy/5 ring-1 ring-brand-navy'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Etapa de Governança Contínua
                    </span>
                    <h4 className="font-bold text-base text-slate-900">
                      {templates.deliverables.comite.title}
                    </h4>
                    <p className="text-xs text-slate-600">
                      {templates.deliverables.comite.subtitle}
                    </p>
                  </div>
                  {recProduct === 'comite' && (
                    <span className="px-2.5 py-1 text-xs font-bold rounded bg-brand-navy text-white shrink-0">
                      ★ Recomendado para a Empresa
                    </span>
                  )}
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3 text-xs text-slate-700">
                  {templates.deliverables.comite.scope.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand-gold-dark shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2 border-t flex flex-col sm:flex-row justify-between text-xs text-slate-500">
                  <span>
                    Duração: <strong>{templates.deliverables.comite.duration}</strong>
                  </span>
                  <span>
                    Formato: <strong>{templates.deliverables.comite.format}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. QUADRO DE INVESTIMENTO COMERCIAL */}
          <div className="pt-4 page-break-inside-avoid">
            <h3 className="text-base font-bold text-brand-navy uppercase tracking-wide border-b-2 border-brand-gold pb-1 mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-gold-dark" />
              4. Quadro de Investimento e Condições Comerciais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Diagnóstico */}
              <div
                className={`p-4 rounded-lg border text-center ${
                  recProduct === 'diagnostico'
                    ? 'bg-brand-navy/5 border-brand-navy ring-2 ring-brand-gold'
                    : 'border-slate-200'
                }`}
              >
                <h5 className="font-bold text-sm text-brand-navy">Diagnóstico RT</h5>
                <p className="text-[11px] text-slate-500 mb-3">Impacto & Prontidão</p>
                <div className="text-2xl font-black text-brand-navy">
                  {formatBRL(pricing.diagnostico.finalPrice)}
                </div>
                {pricing.diagnostico.installmentsCount > 1 && (
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    ou {pricing.diagnostico.installmentsCount}x de{' '}
                    {formatBRL(pricing.diagnostico.installmentValue)}
                  </p>
                )}
                {recProduct === 'diagnostico' && (
                  <span className="mt-2 inline-block text-[10px] font-bold text-brand-gold-dark uppercase">
                    Opção Recomendada
                  </span>
                )}
              </div>

              {/* Consultoria */}
              <div
                className={`p-4 rounded-lg border text-center ${
                  recProduct === 'consultoria'
                    ? 'bg-brand-navy/5 border-brand-navy ring-2 ring-brand-gold'
                    : 'border-slate-200'
                }`}
              >
                <h5 className="font-bold text-sm text-brand-navy">Consultoria RT</h5>
                <p className="text-[11px] text-slate-500 mb-3">Implementação Completa</p>
                <div className="text-2xl font-black text-brand-navy">
                  {formatBRL(pricing.consultoria.finalPrice)}
                </div>
                {pricing.consultoria.installmentsCount > 1 && (
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    ou {pricing.consultoria.installmentsCount}x de{' '}
                    {formatBRL(pricing.consultoria.installmentValue)}
                  </p>
                )}
                {recProduct === 'consultoria' && (
                  <span className="mt-2 inline-block text-[10px] font-bold text-brand-gold-dark uppercase">
                    Opção Recomendada
                  </span>
                )}
              </div>

              {/* Comitê */}
              <div
                className={`p-4 rounded-lg border text-center ${
                  recProduct === 'comite'
                    ? 'bg-brand-navy/5 border-brand-navy ring-2 ring-brand-gold'
                    : 'border-slate-200'
                }`}
              >
                <h5 className="font-bold text-sm text-brand-navy">Comitê Permanente RT</h5>
                <p className="text-[11px] text-slate-500 mb-3">Governança Recorrente</p>
                <div className="text-2xl font-black text-brand-navy">
                  {formatBRL(pricing.comite.finalPrice)}
                  <span className="text-xs font-normal text-slate-600"> /mês</span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Assinatura mensal de governança
                </p>
                {recProduct === 'comite' && (
                  <span className="mt-2 inline-block text-[10px] font-bold text-brand-gold-dark uppercase">
                    Opção Recomendada
                  </span>
                )}
              </div>
            </div>

            {/* Condição de pagamento e contrapartida se houver */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <p>
                <strong>Condição de Pagamento Selecionada:</strong>{' '}
                {pricing.paymentCondition?.label || 'Entrada 50% + 50% na entrega final'} (
                {pricing.paymentCondition?.description})
              </p>
              {proposal.discount_percentage > 0 && proposal.discount_counterpart && (
                <p className="text-slate-700">
                  <strong>
                    Bonificação Comercial ({proposal.discount_percentage}% concedido):
                  </strong>{' '}
                  Medida condicionada à contrapartida acordada:{' '}
                  <em>"{proposal.discount_counterpart}"</em>.
                </p>
              )}
            </div>
          </div>

          {/* 5. CONDIÇÕES GERAIS E PRÓXIMOS PASSOS */}
          <div className="pt-4 space-y-4">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wide text-slate-900 mb-1">
                5. Condições Gerais de Fornecimento
              </h4>
              <p className="text-xs text-slate-600 text-justify">
                {templates.commercialConditions ||
                  'Proposta válida por 15 dias. Não inclui aquisições de licenças de ERP ou contencioso judicial.'}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wide text-slate-900 mb-1">
                6. Próximos Passos para Ativação do Projeto
              </h4>
              <p className="text-xs text-slate-600 text-justify">
                {templates.nextSteps ||
                  'Para formalização, basta a confirmação de aceite por e-mail ou assinatura da proposta para agendamento do kick-off.'}
              </p>
            </div>
          </div>
        </div>

        {/* ASSINATURAS */}
        <footer className="mt-16 pt-8 border-t border-slate-300 page-break-inside-avoid">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 text-center text-xs">
            <div className="space-y-1">
              <div className="border-b border-slate-400 pb-1 mb-2"></div>
              <p className="font-bold text-brand-navy">
                {proposal.accounting_firm || 'PS DE SOUZA — Consultoria & Serviços Contábil'}
              </p>
              <p className="text-slate-600">{proposal.responsible_name || 'Responsável Técnico'}</p>
            </div>
            <div className="space-y-1">
              <div className="border-b border-slate-400 pb-1 mb-2"></div>
              <p className="font-bold text-slate-900">{proposal.client_name}</p>
              <p className="text-slate-600">
                {proposal.contact_name || 'De Acordo / Representante Legal'}
              </p>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-500 mt-10 print:mt-6 border-t-2 border-brand-gold pt-3">
            Documento gerado pela Calculadora RT360 v3.0 • PS DE SOUZA — Consultoria & Serviços
            Contábil
          </div>
        </footer>
      </div>
    </div>
  )
}
