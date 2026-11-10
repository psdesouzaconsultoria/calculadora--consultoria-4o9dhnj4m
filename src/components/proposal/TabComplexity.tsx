import React from 'react'
import { ProposalModel, RT360Parameters } from '@/types/rt360'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Gauge, Info, HelpCircle } from 'lucide-react'

export interface TabComplexityProps {
  proposal: Partial<ProposalModel>
  params: RT360Parameters
  calculatedFactor: number
  onChange: (updates: Partial<ProposalModel>) => void
}

export const TabComplexity: React.FC<TabComplexityProps> = ({
  proposal,
  params,
  calculatedFactor,
  onChange,
}) => {
  const weights = params.complexity_weights || {
    sector: [],
    cnpj_count: [],
    customer_profile: [],
    tax_benefits: [],
    data_quality: [],
    suppliers_count: [],
    clients_count: [],
    sku_count: [],
  }

  const getBadgeColor = (factor: number) => {
    if (factor < 1.0) return 'bg-brand-navy text-white'
    if (factor <= 1.15) return 'bg-brand-navy-light text-white'
    if (factor <= 1.3) return 'bg-brand-gold text-white'
    return 'bg-rose-600 text-white'
  }

  const getComplexityLabel = (factor: number) => {
    if (factor < 1.0) return 'Baixa Complexidade'
    if (factor <= 1.15) return 'Média-Baixa Complexidade'
    if (factor <= 1.3) return 'Média-Alta Complexidade'
    return 'Alta Complexidade Operacional'
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-card via-card to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-brand-navy/10 flex items-center justify-center text-brand-navy">
                <Gauge className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-foreground">Fator de Complexidade RT360</h3>
                  <Badge className={getBadgeColor(calculatedFactor)}>
                    {getComplexityLabel(calculatedFactor)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Multiplicador estratégico calculado automaticamente a partir dos 8 vetores
                  operacionais abaixo.
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right bg-background/80 px-6 py-3 rounded-xl border shadow-xs">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Fator Calculado
              </span>
              <div className="text-3xl font-black text-brand-navy font-mono tracking-tight">
                {calculatedFactor.toFixed(3)}x
              </div>
              <span className="text-[11px] text-muted-foreground">
                {calculatedFactor > 1.0
                  ? `+${((calculatedFactor - 1) * 100).toFixed(1)}% sobre base`
                  : 'Base padrão / com desconto'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="h-5 w-5 text-brand-gold-dark" />
            2. Vetores de Complexidade Operacional e Tributária
          </CardTitle>
          <CardDescription>
            Selecione as opções correspondentes à realidade do cliente para calibrar as horas
            técnicas e esforço da RTE.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5 p-4 rounded-lg bg-muted/40 border">
            <div className="flex items-center justify-between">
              <Label htmlFor="sector" className="font-semibold text-foreground">
                2.1 Setor de Atuação Econômica
              </Label>
              <span title="Impacta diretamente a profundidade de análise">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </span>
            </div>
            <select
              id="sector"
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={proposal.sector || 'comercio_varejo'}
              onChange={(e) => onChange({ sector: e.target.value })}
            >
              {weights.sector?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} (peso {opt.weight}x)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 p-4 rounded-lg bg-muted/40 border">
            <Label htmlFor="cnpj_count" className="font-semibold text-foreground">
              2.2 Quantidade de CNPJs / Estabelecimentos
            </Label>
            <select
              id="cnpj_count"
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={proposal.cnpj_count || '1'}
              onChange={(e) => onChange({ cnpj_count: e.target.value })}
            >
              {weights.cnpj_count?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} (peso {opt.weight}x)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 p-4 rounded-lg bg-muted/40 border">
            <Label htmlFor="customer_profile" className="font-semibold text-foreground">
              2.3 Perfil de Clientes e Abrangência
            </Label>
            <select
              id="customer_profile"
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={proposal.customer_profile || 'b2c_predominante'}
              onChange={(e) => onChange({ customer_profile: e.target.value })}
            >
              {weights.customer_profile?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} (peso {opt.weight}x)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 p-4 rounded-lg bg-muted/40 border">
            <Label htmlFor="tax_benefits" className="font-semibold text-foreground">
              2.4 Benefícios Fiscais Atuais
            </Label>
            <select
              id="tax_benefits"
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={proposal.tax_benefits || 'sem_beneficios'}
              onChange={(e) => onChange({ tax_benefits: e.target.value })}
            >
              {weights.tax_benefits?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} (peso {opt.weight}x)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 p-4 rounded-lg bg-muted/40 border">
            <Label htmlFor="data_quality" className="font-semibold text-foreground">
              2.5 Qualidade dos Dados e ERP
            </Label>
            <select
              id="data_quality"
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={proposal.data_quality || 'erp_padrao'}
              onChange={(e) => onChange({ data_quality: e.target.value })}
            >
              {weights.data_quality?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} (peso {opt.weight}x)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 p-4 rounded-lg bg-muted/40 border">
            <Label htmlFor="suppliers_count" className="font-semibold text-foreground">
              2.6 Quantidade de Fornecedores Ativos
            </Label>
            <select
              id="suppliers_count"
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={proposal.suppliers_count || '51_200'}
              onChange={(e) => onChange({ suppliers_count: e.target.value })}
            >
              {weights.suppliers_count?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} (peso {opt.weight}x)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 p-4 rounded-lg bg-muted/40 border">
            <Label htmlFor="clients_count" className="font-semibold text-foreground">
              2.7 Volume da Carteira de Clientes
            </Label>
            <select
              id="clients_count"
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={proposal.clients_count || '101_500'}
              onChange={(e) => onChange({ clients_count: e.target.value })}
            >
              {weights.clients_count?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} (peso {opt.weight}x)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 p-4 rounded-lg bg-muted/40 border">
            <Label htmlFor="sku_count" className="font-semibold text-foreground">
              2.8 Quantidade de SKUs / Itens no Catálogo
            </Label>
            <select
              id="sku_count"
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={proposal.sku_count || '101_1000'}
              onChange={(e) => onChange({ sku_count: e.target.value })}
            >
              {weights.sku_count?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} (peso {opt.weight}x)
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TabComplexity
