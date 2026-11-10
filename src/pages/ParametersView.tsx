import React, { useState, useEffect } from 'react'
import { parametersService } from '@/services/parametersService'
import { RT360Parameters, RevenueBracket, DiscountTier, PaymentCondition } from '@/types/rt360'
import { formatBRL } from '@/lib/pricingEngine'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sliders,
  DollarSign,
  TrendingUp,
  Percent,
  CreditCard,
  FileText,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ParametersView() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [params, setParams] = useState<RT360Parameters | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await parametersService.getActiveParameters()
        setParams(data)
      } catch (err: any) {
        toast({
          title: 'Erro ao carregar parâmetros',
          description: err.message,
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading || !params) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Carregando parâmetros RT360...</p>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await parametersService.saveParameters(params)
      toast({
        title: 'Parâmetros atualizados!',
        description:
          'As novas regras de preço e custos foram salvas com sucesso no banco de dados.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Edição de faixas de faturamento
  const updateBracket = (index: number, updates: Partial<RevenueBracket>) => {
    const updated = [...params.revenue_brackets]
    updated[index] = { ...updated[index], ...updates }
    setParams({ ...params, revenue_brackets: updated })
  }

  const addBracket = () => {
    const newBracket: RevenueBracket = {
      id: `f_${Date.now()}`,
      label: 'Nova Faixa de Faturamento',
      min: 0,
      max: 1000000,
      baseDiagnostico: 5000,
      baseConsultoria: 12000,
      baseComite: 2000,
      floorDiagnostico: 3500,
      ceilDiagnostico: 8000,
    }
    setParams({
      ...params,
      revenue_brackets: [...params.revenue_brackets, newBracket],
    })
  }

  const removeBracket = (index: number) => {
    const updated = params.revenue_brackets.filter((_, i) => i !== index)
    setParams({ ...params, revenue_brackets: updated })
  }

  // Edição de régua de desconto
  const updateDiscount = (index: number, updates: Partial<DiscountTier>) => {
    const updated = [...params.discount_ladder]
    updated[index] = { ...updated[index], ...updates }
    setParams({ ...params, discount_ladder: updated })
  }

  // Edição de condições de pagamento
  const updatePaymentCond = (index: number, updates: Partial<PaymentCondition>) => {
    const updated = [...params.payment_conditions]
    updated[index] = { ...updated[index], ...updates }
    setParams({ ...params, payment_conditions: updated })
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sliders className="h-7 w-7 text-primary" />
            Parâmetros do Motor RT360 v3
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Personalize a tabela base de honorários, faixas de faturamento, pesos de complexidade e
            custos internos do escritório.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 shadow-xs">
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <Tabs defaultValue="faixas" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto p-1 bg-muted/80 rounded-xl">
          <TabsTrigger value="faixas" className="py-2.5 gap-2 text-xs sm:text-sm">
            <DollarSign className="h-4 w-4" />
            Faixas de Preço
          </TabsTrigger>
          <TabsTrigger value="simples" className="py-2.5 gap-2 text-xs sm:text-sm">
            <TrendingUp className="h-4 w-4" />
            Simples Nacional
          </TabsTrigger>
          <TabsTrigger value="descontos" className="py-2.5 gap-2 text-xs sm:text-sm">
            <Percent className="h-4 w-4" />
            Régua de Desconto
          </TabsTrigger>
          <TabsTrigger value="pagamento" className="py-2.5 gap-2 text-xs sm:text-sm">
            <CreditCard className="h-4 w-4" />
            Condições Pagto
          </TabsTrigger>
          <TabsTrigger value="custos" className="py-2.5 gap-2 text-xs sm:text-sm">
            <FileText className="h-4 w-4" />
            Custos & Margens
          </TabsTrigger>
        </TabsList>

        {/* 1. FAIXAS DE FATURAMENTO E BASES */}
        <TabsContent value="faixas" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg">Faixas de Faturamento Anual e Preços Base</CardTitle>
                <CardDescription>
                  Preço base para Diagnóstico, Consultoria e Comitê mensal de acordo com o porte do
                  cliente.
                </CardDescription>
              </div>
              <Button onClick={addBracket} size="sm" variant="outline" className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> Adicionar Faixa
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {params.revenue_brackets.map((b, idx) => (
                <div key={b.id || idx} className="p-4 rounded-xl border bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Input
                      value={b.label}
                      onChange={(e) => updateBracket(idx, { label: e.target.value })}
                      className="font-bold text-sm bg-card"
                      placeholder="Descrição da faixa"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBracket(idx)}
                      className="text-muted-foreground hover:text-destructive h-8 w-8 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                    <div>
                      <Label className="text-[11px] text-muted-foreground">
                        Faturamento Mínimo (R$)
                      </Label>
                      <Input
                        type="number"
                        value={b.min}
                        onChange={(e) =>
                          updateBracket(idx, { min: parseFloat(e.target.value) || 0 })
                        }
                        className="h-8 text-xs bg-card"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-muted-foreground">
                        Faturamento Máximo (R$)
                      </Label>
                      <Input
                        type="number"
                        value={b.max}
                        onChange={(e) =>
                          updateBracket(idx, { max: parseFloat(e.target.value) || 0 })
                        }
                        className="h-8 text-xs bg-card"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] font-semibold text-primary">
                        Base Diagnóstico (R$)
                      </Label>
                      <Input
                        type="number"
                        value={b.baseDiagnostico}
                        onChange={(e) =>
                          updateBracket(idx, { baseDiagnostico: parseFloat(e.target.value) || 0 })
                        }
                        className="h-8 text-xs bg-card font-medium"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] font-semibold text-primary">
                        Base Consultoria (R$)
                      </Label>
                      <Input
                        type="number"
                        value={b.baseConsultoria}
                        onChange={(e) =>
                          updateBracket(idx, { baseConsultoria: parseFloat(e.target.value) || 0 })
                        }
                        className="h-8 text-xs bg-card font-medium"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] font-semibold text-primary">
                        Base Comitê Mensal (R$)
                      </Label>
                      <Input
                        type="number"
                        value={b.baseComite}
                        onChange={(e) =>
                          updateBracket(idx, { baseComite: parseFloat(e.target.value) || 0 })
                        }
                        className="h-8 text-xs bg-card font-medium"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. REGRAS DO SIMPLES NACIONAL */}
        <TabsContent value="simples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Regras Específicas para Simples Nacional</CardTitle>
              <CardDescription>
                Cálculo do Diagnóstico ancorado no honorário contábil mensal pago pelo cliente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 p-4 rounded-xl border bg-muted/20">
                  <Label>Multiplicador do Honorário Mensal (Diagnóstico)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={params.simples_rules.honoraryMultiplier}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        simples_rules: {
                          ...params.simples_rules,
                          honoraryMultiplier: parseFloat(e.target.value) || 3.5,
                        },
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ex: 3,5x significa que um cliente com honorário de R$ 2.000 terá Diagnóstico
                    base de R$ 7.000.
                  </p>
                </div>

                <div className="space-y-1.5 p-4 rounded-xl border bg-muted/20">
                  <Label>Multiplicador para Consultoria RT</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={params.simples_rules.consultoriaMultiplier}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        simples_rules: {
                          ...params.simples_rules,
                          consultoriaMultiplier: parseFloat(e.target.value) || 2.2,
                        },
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ex: 2,2x sobre o valor do Diagnóstico do cliente.
                  </p>
                </div>

                <div className="space-y-1.5 p-4 rounded-xl border bg-muted/20">
                  <Label>Piso Mínimo do Diagnóstico Simples (R$)</Label>
                  <Input
                    type="number"
                    value={params.simples_rules.minPrice}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        simples_rules: {
                          ...params.simples_rules,
                          minPrice: parseFloat(e.target.value) || 3500,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5 p-4 rounded-xl border bg-muted/20">
                  <Label>Teto Máximo do Diagnóstico Simples (R$)</Label>
                  <Input
                    type="number"
                    value={params.simples_rules.maxPrice}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        simples_rules: {
                          ...params.simples_rules,
                          maxPrice: parseFloat(e.target.value) || 15000,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. RÉGUA DE DESCONTO COM CONTRAPARTIDA */}
        <TabsContent value="descontos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Régua de Descontos e Contrapartidas Exigidas
              </CardTitle>
              <CardDescription>
                Cada nível de desconto comercial requer uma contrapartida negociada do cliente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {params.discount_ladder.map((tier, idx) => (
                <div
                  key={tier.level || idx}
                  className="p-4 rounded-xl border bg-muted/20 space-y-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <Label className="text-xs text-muted-foreground">
                        Nome do Nível de Desconto
                      </Label>
                      <Input
                        value={tier.label}
                        onChange={(e) => updateDiscount(idx, { label: e.target.value })}
                        className="bg-card font-semibold text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Percentual (%)</Label>
                      <Input
                        type="number"
                        value={tier.percentage}
                        onChange={(e) =>
                          updateDiscount(idx, { percentage: parseFloat(e.target.value) || 0 })
                        }
                        className="bg-card font-bold text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Contrapartida Obrigatória
                    </Label>
                    <Input
                      value={tier.counterpart}
                      onChange={(e) => updateDiscount(idx, { counterpart: e.target.value })}
                      className="bg-card text-xs"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. CONDIÇÕES DE PAGAMENTO */}
        <TabsContent value="pagamento" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Condições de Pagamento e Taxas Financeiras</CardTitle>
              <CardDescription>
                Defina o número de parcelas e o ajuste percentual (bonificação negativa ou taxa
                positiva).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {params.payment_conditions.map((cond, idx) => (
                <div key={cond.id || idx} className="p-4 rounded-xl border bg-muted/20 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <Label className="text-xs text-muted-foreground">Descrição da Condição</Label>
                      <Input
                        value={cond.label}
                        onChange={(e) => updatePaymentCond(idx, { label: e.target.value })}
                        className="bg-card font-semibold text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Parcelas</Label>
                      <Input
                        type="number"
                        value={cond.installments}
                        onChange={(e) =>
                          updatePaymentCond(idx, { installments: parseInt(e.target.value) || 1 })
                        }
                        className="bg-card text-xs font-bold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Ajuste Financeiro (ex: -0.05 para -5% ou +0.03 para +3%)
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={cond.adjustment}
                        onChange={(e) =>
                          updatePaymentCond(idx, { adjustment: parseFloat(e.target.value) || 0 })
                        }
                        className="bg-card text-xs font-mono"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Detalhe comercial</Label>
                      <Input
                        value={cond.description}
                        onChange={(e) => updatePaymentCond(idx, { description: e.target.value })}
                        className="bg-card text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. CUSTOS E MARGENS (AUDITORIA DRE) */}
        <TabsContent value="custos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Parâmetros de Custo, Horas Técnicas e Margens
              </CardTitle>
              <CardDescription>
                Calibração das variáveis utilizadas na DRE interna de viabilidade financeira.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 p-4 rounded-xl border bg-muted/20">
                  <Label>Custo Médio da Hora Técnica (R$/h)</Label>
                  <Input
                    type="number"
                    value={params.cost_margin_config.hourlyCost}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        cost_margin_config: {
                          ...params.cost_margin_config,
                          hourlyCost: parseFloat(e.target.value) || 140,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5 p-4 rounded-xl border bg-muted/20">
                  <Label>Margem Alvo do Escritório (%)</Label>
                  <Input
                    type="number"
                    step="1"
                    value={params.cost_margin_config.targetMarginRate * 100}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        cost_margin_config: {
                          ...params.cost_margin_config,
                          targetMarginRate: (parseFloat(e.target.value) || 35) / 100,
                        },
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Margem ideal para cor Verde no semáforo.
                  </p>
                </div>

                <div className="space-y-1.5 p-4 rounded-xl border bg-muted/20">
                  <Label>Piso Crítico de Margem (%)</Label>
                  <Input
                    type="number"
                    step="1"
                    value={params.cost_margin_config.criticalMarginRate * 100}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        cost_margin_config: {
                          ...params.cost_margin_config,
                          criticalMarginRate: (parseFloat(e.target.value) || 18) / 100,
                        },
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Abaixo desta taxa o semáforo fica Vermelho.
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-sm mb-3">Horas Técnicas Estimadas por Produto</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Diagnóstico RT (horas)</Label>
                    <Input
                      type="number"
                      value={params.cost_margin_config.hoursEstimated.diagnostico}
                      onChange={(e) =>
                        setParams({
                          ...params,
                          cost_margin_config: {
                            ...params.cost_margin_config,
                            hoursEstimated: {
                              ...params.cost_margin_config.hoursEstimated,
                              diagnostico: parseFloat(e.target.value) || 32,
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Consultoria RT (horas)</Label>
                    <Input
                      type="number"
                      value={params.cost_margin_config.hoursEstimated.consultoria}
                      onChange={(e) =>
                        setParams({
                          ...params,
                          cost_margin_config: {
                            ...params.cost_margin_config,
                            hoursEstimated: {
                              ...params.cost_margin_config.hoursEstimated,
                              consultoria: parseFloat(e.target.value) || 80,
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Comitê RT Mensal (horas)</Label>
                    <Input
                      type="number"
                      value={params.cost_margin_config.hoursEstimated.comite}
                      onChange={(e) =>
                        setParams({
                          ...params,
                          cost_margin_config: {
                            ...params.cost_margin_config,
                            hoursEstimated: {
                              ...params.cost_margin_config.hoursEstimated,
                              comite: parseFloat(e.target.value) || 12,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-sm mb-3">
                  Deduções e Encargos sobre a Nota Fiscal
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Impostos sobre NF (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={(params.cost_margin_config.taxesRate * 100).toFixed(2)}
                      onChange={(e) =>
                        setParams({
                          ...params,
                          cost_margin_config: {
                            ...params.cost_margin_config,
                            taxesRate: (parseFloat(e.target.value) || 14.25) / 100,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Comissão Comercial (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={(params.cost_margin_config.commissionRate * 100).toFixed(2)}
                      onChange={(e) =>
                        setParams({
                          ...params,
                          cost_margin_config: {
                            ...params.cost_margin_config,
                            commissionRate: (parseFloat(e.target.value) || 8) / 100,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Rateio Indireto / TI (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={(params.cost_margin_config.indirectCostRate * 100).toFixed(2)}
                      onChange={(e) =>
                        setParams({
                          ...params,
                          cost_margin_config: {
                            ...params.cost_margin_config,
                            indirectCostRate: (parseFloat(e.target.value) || 10) / 100,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
