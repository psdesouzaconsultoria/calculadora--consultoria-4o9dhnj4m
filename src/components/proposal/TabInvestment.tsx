import { ProposalModel, RT360Parameters, CalculatedPricing, ProductType } from '@/types/rt360'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { formatBRL } from '@/lib/pricingEngine'
import { Sparkles, Percent, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react'

interface TabInvestmentProps {
  proposal: Partial<ProposalModel>
  params: RT360Parameters
  pricing: CalculatedPricing
  onChange: (updates: Partial<ProposalModel>) => void
}

export default function TabInvestment({ proposal, params, pricing, onChange }: TabInvestmentProps) {
  const discountLadder = params.discount_ladder || []
  const paymentConditions = params.payment_conditions || []

  const handleDiscountChange = (level: string) => {
    const tier = discountLadder.find((d) => d.level === level)
    if (tier) {
      onChange({
        discount_level: tier.level,
        discount_percentage: tier.percentage,
        discount_counterpart: tier.counterpart,
      })
    } else {
      onChange({
        discount_level: 'none',
        discount_percentage: 0,
        discount_counterpart: '',
      })
    }
  }

  const selectedTier = discountLadder.find((d) => d.level === (proposal.discount_level || 'none'))

  const productsList: {
    key: ProductType
    name: string
    sub: string
    item: typeof pricing.diagnostico
  }[] = [
    {
      key: 'diagnostico',
      name: 'Diagnóstico RT',
      sub: 'Impacto & Prontidão Executiva',
      item: pricing.diagnostico,
    },
    {
      key: 'consultoria',
      name: 'Consultoria RT',
      sub: 'Implementação, Preços e ERP',
      item: pricing.consultoria,
    },
    {
      key: 'comite',
      name: 'Comitê Permanente RT',
      sub: 'Governança Mensal Recorrente',
      item: pricing.comite,
    },
  ]

  return (
    <div className="space-y-8">
      {/* 1. Escolha do Produto Recomendado */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-gold-dark" />
                3.1 Produto Recomendado para o Cliente
              </CardTitle>
              <CardDescription>
                Selecione o produto principal recomendado. Ele receberá destaque visual na proposta
                comercial.
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="bg-brand-navy/5 text-brand-navy border-brand-navy/20 text-xs"
            >
              Sugerido por IA / Regime
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {productsList.map(({ key, name, sub }) => {
              const isSelected = proposal.recommended_product === key
              return (
                <div
                  key={key}
                  onClick={() => onChange({ recommended_product: key })}
                  className={`cursor-pointer rounded-xl p-4 border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-border/60 hover:border-border hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-brand-gold-dark shrink-0" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. Régua de Desconto com Contrapartida */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Percent className="h-5 w-5 text-brand-gold-dark" />
            3.2 Régua de Desconto Comercial e Contrapartida
          </CardTitle>
          <CardDescription>
            Conforme a metodologia RT360, nenhum desconto deve ser concedido sem uma contrapartida
            clara do cliente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {discountLadder.map((tier) => {
              const isSelected = (proposal.discount_level || 'none') === tier.level
              return (
                <div
                  key={tier.level}
                  onClick={() => handleDiscountChange(tier.level)}
                  className={`cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-gold bg-brand-gold/10 ring-1 ring-brand-gold shadow-xs'
                      : 'border-border/60 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-foreground">{tier.label}</span>
                    <Badge variant={tier.percentage > 0 ? 'secondary' : 'outline'}>
                      {tier.percentage}% OFF
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground italic">"{tier.counterpart}"</p>
                </div>
              )
            })}
          </div>

          {selectedTier && selectedTier.percentage > 0 && (
            <div className="p-3.5 rounded-lg bg-brand-gold/10 border border-brand-gold/30 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-brand-gold-dark shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-brand-gold-dark">
                  Contrapartida Obrigatória ({selectedTier.percentage}%):
                </span>{' '}
                <span className="text-foreground/80">
                  {proposal.discount_counterpart || selectedTier.counterpart}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Condição de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-brand-gold-dark" />
            3.3 Condições de Pagamento e Ajuste Financeiro
          </CardTitle>
          <CardDescription>
            Opção de parcelamento com aplicação automática de bonificação à vista ou taxa
            financeira.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {paymentConditions.map((cond) => {
            const isSelected = (proposal.payment_condition || 'entrada_30') === cond.id
            return (
              <div
                key={cond.id}
                onClick={() => onChange({ payment_condition: cond.id })}
                className={`cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs'
                    : 'border-border/60 hover:bg-muted/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-foreground">{cond.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{cond.description}</p>
                </div>
                <div className="mt-3 text-[11px] font-mono text-brand-gold-dark font-medium">
                  {cond.adjustment < 0
                    ? `${(cond.adjustment * 100).toFixed(0)}% bonificação`
                    : cond.adjustment > 0
                      ? `+${(cond.adjustment * 100).toFixed(0)}% taxa`
                      : 'Taxa zero'}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* 4. Quadro Comparativo dos Preços Finais Calculados */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">
          Investimento Final Calculado por Produto
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {productsList.map(({ key, name, sub, item }) => {
            const isRec = proposal.recommended_product === key
            return (
              <Card
                key={key}
                className={`relative flex flex-col justify-between overflow-hidden transition-all ${
                  isRec
                    ? 'border-2 border-brand-gold shadow-md bg-gradient-to-b from-card to-brand-gold/5'
                    : 'border-border/80'
                }`}
              >
                {isRec && (
                  <div className="bg-brand-navy text-white text-center py-1 text-xs font-semibold uppercase tracking-wider">
                    Recomendação Estratégica
                  </div>
                )}
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{name}</CardTitle>
                  <CardDescription className="text-xs">{sub}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Preço Base Faixa:</span>
                      <span>{formatBRL(item.base)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Fator Complexidade ({item.factor.toFixed(2)}x):</span>
                      <span>{formatBRL(item.adjustedBeforeDiscount)}</span>
                    </div>
                    {item.discountValue > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Desconto ({pricing.discountPercentage}%):</span>
                        <span>- {formatBRL(item.discountValue)}</span>
                      </div>
                    )}
                    {item.financialAdjustmentValue !== 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Ajuste Financeiro:</span>
                        <span>{formatBRL(item.financialAdjustmentValue)}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t">
                    <span className="text-xs text-muted-foreground">Valor Final:</span>
                    <div className="text-2xl font-black text-foreground">
                      {formatBRL(item.finalPrice)}
                      {key === 'comite' && (
                        <span className="text-xs font-normal text-muted-foreground"> /mês</span>
                      )}
                    </div>
                    {key !== 'comite' && item.installmentsCount > 1 && (
                      <p className="text-xs text-brand-gold-dark font-medium mt-1">
                        ou {item.installmentsCount}x de {formatBRL(item.installmentValue)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
