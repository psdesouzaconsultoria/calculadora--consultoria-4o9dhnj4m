import { AuditResult, ProductDRE, RT360Parameters } from '@/types/rt360'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatBRL } from '@/lib/pricingEngine'
import {
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Lock,
} from 'lucide-react'

interface TabAuditProps {
  audit: AuditResult
  params: RT360Parameters
}

export default function TabAudit({ audit, params }: TabAuditProps) {
  const cfg = params.cost_margin_config

  const getStatusIcon = (status: 'verde' | 'amarelo' | 'vermelho') => {
    switch (status) {
      case 'verde':
        return <CheckCircle className="h-5 w-5 text-brand-gold" />
      case 'amarelo':
        return <AlertTriangle className="h-5 w-5 text-brand-gold-dark" />
      case 'vermelho':
        return <XCircle className="h-5 w-5 text-rose-500" />
    }
  }

  const getStatusBadge = (status: 'verde' | 'amarelo' | 'vermelho') => {
    switch (status) {
      case 'verde':
        return (
          <Badge className="bg-brand-gold hover:bg-brand-gold-dark text-white">
            Viável / Margem Saudável
          </Badge>
        )
      case 'amarelo':
        return (
          <Badge className="bg-brand-navy hover:bg-brand-navy/90 text-white">
            Atenção / Margem Baixa
          </Badge>
        )
      case 'vermelho':
        return <Badge variant="destructive">Crítico / Inviável</Badge>
    }
  }

  const renderDRETable = (dre: ProductDRE) => {
    const isLoss = dre.contributionMargin < 0

    return (
      <Card key={dre.product} className="border-border/80">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {getStatusIcon(dre.viabilityStatus)}
                {dre.productLabel}
              </CardTitle>
              <CardDescription className="text-xs">
                Dedicação estimada: {dre.directHours} horas técnicas ({formatBRL(dre.hourlyCost)}/h)
              </CardDescription>
            </div>
            <div>{getStatusBadge(dre.viabilityStatus)}</div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <p className="text-xs text-muted-foreground italic bg-muted/40 p-2.5 rounded">
            {dre.viabilityMessage}
          </p>

          {/* DRE Sintética */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-semibold text-foreground text-sm py-1 border-b">
              <span>(=) Receita Bruta da Proposta:</span>
              <span>{formatBRL(dre.revenue)}</span>
            </div>

            <div className="flex justify-between text-muted-foreground pl-2">
              <span>(-) Impostos s/ NF ({(cfg.taxesRate * 100).toFixed(1)}%):</span>
              <span className="text-rose-600 dark:text-rose-400">- {formatBRL(dre.taxes)}</span>
            </div>

            <div className="flex justify-between text-muted-foreground pl-2">
              <span>(-) Comissão Comercial ({(cfg.commissionRate * 100).toFixed(1)}%):</span>
              <span className="text-rose-600 dark:text-rose-400">
                - {formatBRL(dre.commission)}
              </span>
            </div>

            <div className="flex justify-between text-muted-foreground pl-2">
              <span>
                (-) Custos Indiretos / Softwares ({(cfg.indirectCostRate * 100).toFixed(1)}%):
              </span>
              <span className="text-rose-600 dark:text-rose-400">
                - {formatBRL(dre.indirectCost)}
              </span>
            </div>

            <div className="flex justify-between text-muted-foreground pl-2 border-b pb-2">
              <span>
                (-) Custo de Mão de Obra Técnica ({dre.directHours}h × {formatBRL(dre.hourlyCost)}):
              </span>
              <span className="text-rose-600 dark:text-rose-400">
                - {formatBRL(dre.directLaborCost)}
              </span>
            </div>

            <div
              className={`flex justify-between font-bold text-sm py-2 px-3 rounded-lg ${
                isLoss ? 'bg-rose-500/10 text-rose-600' : 'bg-brand-gold/15 text-brand-gold-dark'
              }`}
            >
              <span>(=) Margem de Contribuição:</span>
              <span>
                {formatBRL(dre.contributionMargin)} ({(dre.marginRate * 100).toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Métricas de Decisão Rápida */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t text-xs">
            <div className="p-2 rounded bg-muted/30">
              <span className="text-muted-foreground block text-[11px]">Resultado por Hora:</span>
              <span className="font-bold text-foreground">{formatBRL(dre.resultPerHour)}/h</span>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <span className="text-muted-foreground block text-[11px]">Preço Mínimo Viável:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {formatBRL(dre.breakEvenPrice)}
              </span>
            </div>
            <div className="p-2 rounded bg-muted/30 col-span-2 sm:col-span-1">
              <span className="text-muted-foreground block text-[11px]">
                Preço p/ Margem Alvo ({(cfg.targetMarginRate * 100).toFixed(0)}%):
              </span>
              <span className="font-bold text-brand-navy">{formatBRL(dre.marginTargetPrice)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alerta de Confidencialidade Interna */}
      <div className="p-4 rounded-xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-gold/20 text-brand-gold-dark">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground">
              Painel de Auditoria Interna e DRE (Uso Restrito do Escritório)
            </h4>
            <p className="text-xs text-muted-foreground">
              Estes dados de custos, horas e margem são confidenciais e <strong>NUNCA</strong>{' '}
              aparecem na proposta comercial entregue ao cliente.
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="border-brand-gold/50 text-brand-gold-dark hover:bg-brand-gold/10 hidden sm:inline-flex"
        >
          Confidencial
        </Badge>
      </div>

      {/* Resumo de Parâmetros de Custo Base */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-brand-navy" /> Custo Hora Técnica
          </span>
          <div className="text-xl font-bold text-foreground mt-1">
            {formatBRL(cfg.hourlyCost)}/h
          </div>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-navy" /> Deduções s/ Nota
          </span>
          <div className="text-xl font-bold text-foreground mt-1">
            {((cfg.taxesRate + cfg.commissionRate + cfg.indirectCostRate) * 100).toFixed(1)}%
          </div>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-brand-navy" /> Margem Alvo Escritório
          </span>
          <div className="text-xl font-bold text-brand-gold-dark mt-1">
            {(cfg.targetMarginRate * 100).toFixed(0)}%
          </div>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" /> Piso Crítico Viável
          </span>
          <div className="text-xl font-bold text-rose-600 mt-1">
            {(cfg.criticalMarginRate * 100).toFixed(0)}%
          </div>
        </Card>
      </div>

      {/* DRE dos Três Produtos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {renderDRETable(audit.diagnostico)}
        {renderDRETable(audit.consultoria)}
        {renderDRETable(audit.comite)}
      </div>
    </div>
  )
}
