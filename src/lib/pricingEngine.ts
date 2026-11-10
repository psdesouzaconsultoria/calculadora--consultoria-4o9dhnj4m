import {
  RT360Parameters,
  ProposalModel,
  CalculatedPricing,
  ProductPriceItem,
  AuditResult,
  ProductDRE,
  ProductType,
  RevenueBracket,
} from '@/types/rt360'

/**
 * Arredonda um valor para centenas ou dezenas inteiras, deixando preço comercial elegante
 */
export function roundCommercial(val: number): number {
  if (val <= 0) return 0
  if (val < 5000) {
    return Math.round(val / 50) * 50
  }
  return Math.round(val / 100) * 100
}

/**
 * Calcula o fator de complexidade ponderado a partir das escolhas 2.1 a 2.8
 */
export function calculateComplexityFactor(
  params: RT360Parameters,
  inputs: {
    sector?: string
    cnpj_count?: string
    customer_profile?: string
    tax_benefits?: string
    data_quality?: string
    suppliers_count?: string
    clients_count?: string
    sku_count?: string
  },
): number {
  const weights = params.complexity_weights
  if (!weights) return 1.0

  const getWeight = (
    list: { value: string; weight: number }[] | undefined,
    val?: string,
    defaultW = 1.0,
  ) => {
    if (!list || !val) return defaultW
    const found = list.find((item) => item.value === val)
    return found ? found.weight : defaultW
  }

  // Pesos específicos de cada dimensão
  const wSector = getWeight(weights.sector, inputs.sector, 1.0)
  const wCnpj = getWeight(weights.cnpj_count, inputs.cnpj_count, 1.0)
  const wProfile = getWeight(weights.customer_profile, inputs.customer_profile, 1.0)
  const wTaxBenefits = getWeight(weights.tax_benefits, inputs.tax_benefits, 1.0)
  const wData = getWeight(weights.data_quality, inputs.data_quality, 1.0)
  const wSuppliers = getWeight(weights.suppliers_count, inputs.suppliers_count, 1.0)
  const wClients = getWeight(weights.clients_count, inputs.clients_count, 1.0)
  const wSku = getWeight(weights.sku_count, inputs.sku_count, 1.0)

  // Média ponderada estratégica (setor, cnpj e benefícios com maior relevância para RT)
  const factor =
    wSector * 0.22 +
    wCnpj * 0.18 +
    wTaxBenefits * 0.16 +
    wProfile * 0.12 +
    wSku * 0.12 +
    wData * 0.08 +
    wSuppliers * 0.06 +
    wClients * 0.06

  return Number(factor.toFixed(3))
}

/**
 * Sugere o produto recomendado conforme o regime tributário e perfil
 */
export function suggestRecommendedProduct(taxRegime: string, annualRevenue: number): ProductType {
  if (taxRegime === 'simples' || annualRevenue <= 4800000) {
    // Para Simples Nacional ou pequeno porte, Diagnóstico RT é a porta de entrada ideal
    return 'diagnostico'
  }
  if (taxRegime === 'lucro_presumido') {
    return annualRevenue > 20000000 ? 'consultoria' : 'diagnostico'
  }
  // Lucro Real ou grandes empresas: Consultoria de adequação
  return 'consultoria'
}

/**
 * Encontra a faixa de faturamento adequada
 */
export function findRevenueBracket(params: RT360Parameters, annualRevenue: number): RevenueBracket {
  const brackets = params.revenue_brackets || []
  const found = brackets.find((b) => annualRevenue >= b.min && annualRevenue < b.max)
  if (found) return found
  if (brackets.length > 0) {
    return brackets[brackets.length - 1]
  }
  // Fallback seguro caso lista vazia
  return {
    id: 'default',
    label: 'Padrão',
    min: 0,
    max: 999999999,
    baseDiagnostico: 8500,
    baseConsultoria: 18500,
    baseComite: 3200,
    floorDiagnostico: 6000,
    ceilDiagnostico: 14000,
  }
}

/**
 * Calcula a precificação completa dos 3 produtos (Diagnóstico, Consultoria, Comitê)
 */
export function calculatePricing(
  proposal: Partial<ProposalModel>,
  params: RT360Parameters,
): CalculatedPricing {
  const monthlyRevenue = Number(proposal.monthly_revenue || 0)
  const annualRevenue = monthlyRevenue * 12
  const monthlyFee = Number(proposal.current_monthly_fee || 0)
  const taxRegime = proposal.tax_regime || 'lucro_presumido'

  // Fator de complexidade
  const factor =
    proposal.complexity_factor && proposal.complexity_factor > 0
      ? proposal.complexity_factor
      : calculateComplexityFactor(params, proposal)

  // Encontrar faixa
  const bracket = findRevenueBracket(params, annualRevenue)

  // Desconto selecionado
  const discountTier = (params.discount_ladder || []).find(
    (d) => d.level === proposal.discount_level,
  )
  const discountPercent = discountTier
    ? discountTier.percentage
    : Number(proposal.discount_percentage || 0)

  // Condição de pagamento
  const paymentCond = (params.payment_conditions || []).find(
    (p) => p.id === proposal.payment_condition,
  ) || {
    id: 'entrada_30',
    label: 'Padrão',
    installments: 2,
    adjustment: 0,
    description: 'Sem juros',
  }

  // Recomendado
  const recommendedProduct: ProductType =
    (proposal.recommended_product as ProductType) ||
    suggestRecommendedProduct(taxRegime, annualRevenue)

  // 1. Diagnóstico RT
  let baseDiag = bracket.baseDiagnostico
  let isSpecialSimples = false

  if (taxRegime === 'simples' && params.simples_rules?.useHonoraryFormula && monthlyFee > 0) {
    // Regra do Simples: Honorário mensal * multiplicador
    const calcByFee = monthlyFee * (params.simples_rules.honoraryMultiplier || 3.5)
    baseDiag = Math.min(
      Math.max(calcByFee, params.simples_rules.minPrice || 3500),
      params.simples_rules.maxPrice || 15000,
    )
    isSpecialSimples = true
  }

  // Preço ajustado por complexidade
  let diagAdjusted = baseDiag * factor
  if (bracket.floorDiagnostico && diagAdjusted < bracket.floorDiagnostico) {
    diagAdjusted = bracket.floorDiagnostico
  }
  if (bracket.ceilDiagnostico && diagAdjusted > bracket.ceilDiagnostico) {
    diagAdjusted = bracket.ceilDiagnostico
  }
  diagAdjusted = roundCommercial(diagAdjusted)

  // Aplicação do desconto
  const diagDiscountVal = roundCommercial(diagAdjusted * (discountPercent / 100))
  let diagWithDiscount = diagAdjusted - diagDiscountVal

  // Aplicação da condição financeira
  const diagFinAdj = roundCommercial(diagWithDiscount * paymentCond.adjustment)
  const diagFinal = roundCommercial(diagWithDiscount + diagFinAdj)
  const diagInstallment = roundCommercial(diagFinal / Math.max(1, paymentCond.installments))

  const diagnosticoPrice: ProductPriceItem = {
    base: baseDiag,
    factor,
    adjustedBeforeDiscount: diagAdjusted,
    discountValue: diagDiscountVal,
    financialAdjustmentValue: diagFinAdj,
    finalPrice: diagFinal,
    installmentsCount: paymentCond.installments,
    installmentValue: diagInstallment,
    isRecommended: recommendedProduct === 'diagnostico',
    isSpecialSimples,
  }

  // 2. Consultoria RT
  let baseCons = bracket.baseConsultoria
  if (taxRegime === 'simples' && params.simples_rules) {
    baseCons = baseDiag * (params.simples_rules.consultoriaMultiplier || 2.2)
  }
  let consAdjusted = roundCommercial(baseCons * factor)
  const consDiscountVal = roundCommercial(consAdjusted * (discountPercent / 100))
  const consWithDiscount = consAdjusted - consDiscountVal
  const consFinAdj = roundCommercial(consWithDiscount * paymentCond.adjustment)
  const consFinal = roundCommercial(consWithDiscount + consFinAdj)
  const consInstallment = roundCommercial(consFinal / Math.max(1, paymentCond.installments))

  const consultoriaPrice: ProductPriceItem = {
    base: baseCons,
    factor,
    adjustedBeforeDiscount: consAdjusted,
    discountValue: consDiscountVal,
    financialAdjustmentValue: consFinAdj,
    finalPrice: consFinal,
    installmentsCount: paymentCond.installments,
    installmentValue: consInstallment,
    isRecommended: recommendedProduct === 'consultoria',
    isSpecialSimples,
  }

  // 3. Comitê Permanente RT (Preço mensal de governança)
  let baseComite = bracket.baseComite
  if (taxRegime === 'simples' && params.simples_rules && monthlyFee > 0) {
    baseComite = Math.max(1200, monthlyFee * (params.simples_rules.comiteMonthlyMultiplier || 0.45))
  }
  let comiteAdjusted = roundCommercial(baseComite * factor)
  const comiteDiscountVal = roundCommercial(comiteAdjusted * (discountPercent / 100))
  const comiteWithDiscount = comiteAdjusted - comiteDiscountVal
  // O comitê normalmente é mensal, mas se aplicado ajuste à vista ou desconto:
  const comiteFinAdj = roundCommercial(comiteWithDiscount * paymentCond.adjustment)
  const comiteFinal = roundCommercial(comiteWithDiscount + comiteFinAdj)

  const comitePrice: ProductPriceItem = {
    base: baseComite,
    factor,
    adjustedBeforeDiscount: comiteAdjusted,
    discountValue: comiteDiscountVal,
    financialAdjustmentValue: comiteFinAdj,
    finalPrice: comiteFinal,
    installmentsCount: 1, // mensalidade
    installmentValue: comiteFinal,
    isRecommended: recommendedProduct === 'comite',
    isSpecialSimples,
  }

  return {
    annualRevenue,
    bracket,
    complexityFactor: factor,
    discountPercentage: discountPercent,
    paymentConditionId: paymentCond.id,
    paymentCondition: paymentCond,
    diagnostico: diagnosticoPrice,
    consultoria: consultoriaPrice,
    comite: comitePrice,
    recommendedProduct,
  }
}

/**
 * Calcula a DRE interna e viabilidade financeira (Auditoria) para um produto
 */
function calculateProductDRE(
  product: ProductType,
  productLabel: string,
  priceItem: ProductPriceItem,
  costConfig: RT360Parameters['cost_margin_config'],
): ProductDRE {
  const revenue = priceItem.finalPrice
  const hours =
    product === 'diagnostico'
      ? costConfig.hoursEstimated.diagnostico
      : product === 'consultoria'
        ? costConfig.hoursEstimated.consultoria
        : costConfig.hoursEstimated.comite

  const hourlyCost = costConfig.hourlyCost || 140
  const directLaborCost = hours * hourlyCost

  // Deduções e impostos
  const taxes = revenue * (costConfig.taxesRate || 0.1425)
  const commission = revenue * (costConfig.commissionRate || 0.08)
  const indirectCost = revenue * (costConfig.indirectCostRate || 0.1)

  const totalCostsAndDeductions = directLaborCost + taxes + commission + indirectCost
  const contributionMargin = revenue - totalCostsAndDeductions
  const marginRate = revenue > 0 ? contributionMargin / revenue : 0
  const resultPerHour = hours > 0 ? (revenue - (taxes + commission + indirectCost)) / hours : 0

  // Preço mínimo viável (break even) para cobrir custos e deduções (margem 0)
  // Revenue_be * (1 - taxes - comm - indirect) = directLaborCost
  const deductionSum =
    (costConfig.taxesRate || 0.1425) +
    (costConfig.commissionRate || 0.08) +
    (costConfig.indirectCostRate || 0.1)
  const netMultiplier = Math.max(0.1, 1 - deductionSum)
  const breakEvenPrice = roundCommercial(directLaborCost / netMultiplier)

  // Preço para atingir a margem alvo
  const targetMultiplier = Math.max(0.05, 1 - deductionSum - (costConfig.targetMarginRate || 0.35))
  const marginTargetPrice = roundCommercial(directLaborCost / targetMultiplier)

  // Semáforo de viabilidade
  let viabilityStatus: 'verde' | 'amarelo' | 'vermelho' = 'verde'
  let viabilityMessage = 'Excelente viabilidade financeira acima da margem alvo.'

  if (marginRate < (costConfig.criticalMarginRate || 0.18)) {
    viabilityStatus = 'vermelho'
    viabilityMessage = 'Alerta Crítico: Margem de contribuição abaixo do piso mínimo viável!'
  } else if (marginRate < (costConfig.targetMarginRate || 0.35)) {
    viabilityStatus = 'amarelo'
    viabilityMessage = 'Atenção: Margem aceitável, mas inferior à margem de contribuição alvo.'
  }

  return {
    product,
    productLabel,
    revenue,
    directHours: hours,
    hourlyCost,
    directLaborCost,
    taxes,
    commission,
    indirectCost,
    totalCostsAndDeductions,
    contributionMargin,
    marginRate,
    resultPerHour,
    breakEvenPrice,
    marginTargetPrice,
    viabilityStatus,
    viabilityMessage,
  }
}

/**
 * Executa a auditoria completa dos 3 produtos
 */
export function calculateAudit(pricing: CalculatedPricing, params: RT360Parameters): AuditResult {
  const cfg = params.cost_margin_config || {
    hourlyCost: 140,
    hoursEstimated: { diagnostico: 32, consultoria: 80, comite: 12 },
    taxesRate: 0.1425,
    commissionRate: 0.08,
    indirectCostRate: 0.1,
    targetMarginRate: 0.35,
    criticalMarginRate: 0.18,
  }

  const diagDRE = calculateProductDRE('diagnostico', 'Diagnóstico RT', pricing.diagnostico, cfg)
  const consDRE = calculateProductDRE('consultoria', 'Consultoria RT', pricing.consultoria, cfg)
  const comiteDRE = calculateProductDRE(
    'comite',
    'Comitê Permanente RT (Mensal)',
    pricing.comite,
    cfg,
  )

  // Viabilidade geral baseada no produto recomendado
  const recProduct = pricing.recommendedProduct
  const recDRE =
    recProduct === 'diagnostico' ? diagDRE : recProduct === 'consultoria' ? consDRE : comiteDRE

  return {
    evaluatedAt: new Date().toISOString(),
    diagnostico: diagDRE,
    consultoria: consDRE,
    comite: comiteDRE,
    overallViability: recDRE.viabilityStatus,
  }
}

/**
 * Utilitário de formatação de moeda BRL
 */
export function formatBRL(val?: number): string {
  if (val === undefined || val === null || isNaN(val)) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(val)
}

/**
 * Formatação de CNPJ
 */
export function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`
}
