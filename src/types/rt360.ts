// Tipos e estruturas de dados para a Calculadora RT360 v3 (Metodologia RTE: Diagnóstico, Consultoria e Comitê)

export type TaxRegime = 'simples' | 'lucro_presumido' | 'lucro_real' | 'arbitrado' | 'imune_isenta'

export type ProposalStatus = 'rascunho' | 'enviada' | 'em_negociacao' | 'aprovada' | 'recusada'

export type ProductType = 'diagnostico' | 'consultoria' | 'comite'

export interface RevenueBracket {
  id: string
  label: string
  min: number
  max: number
  baseDiagnostico: number
  baseConsultoria: number
  baseComite: number
  floorDiagnostico: number
  ceilDiagnostico: number
}

export interface ComplexityOption {
  value: string
  label: string
  weight: number
}

export interface ComplexityWeights {
  sector: ComplexityOption[]
  cnpj_count: ComplexityOption[]
  customer_profile: ComplexityOption[]
  tax_benefits: ComplexityOption[]
  data_quality: ComplexityOption[]
  suppliers_count: ComplexityOption[]
  clients_count: ComplexityOption[]
  sku_count: ComplexityOption[]
}

export interface SimplesRules {
  useHonoraryFormula: boolean
  honoraryMultiplier: number
  minPrice: number
  maxPrice: number
  consultoriaMultiplier: number
  comiteMonthlyMultiplier: number
}

export interface DiscountTier {
  level: string
  label: string
  percentage: number
  counterpart: string
}

export interface PaymentCondition {
  id: string
  label: string
  installments: number
  adjustment: number // e.g. -0.05 para -5% à vista ou +0.03 para +3%
  description: string
}

export interface CostMarginConfig {
  hourlyCost: number
  hoursEstimated: {
    diagnostico: number
    consultoria: number
    comite: number
  }
  taxesRate: number // ex: 0.1425
  commissionRate: number // ex: 0.08
  indirectCostRate: number // ex: 0.10
  targetMarginRate: number // ex: 0.35
  criticalMarginRate: number // ex: 0.18
}

export interface DeliverableScope {
  title: string
  subtitle: string
  scope: string[]
  duration: string
  format: string
}

export interface ProposalTemplates {
  presentation: string
  context: string
  deliverables: {
    diagnostico: DeliverableScope
    consultoria: DeliverableScope
    comite: DeliverableScope
  }
  commercialConditions: string
  nextSteps: string
}

export interface RT360Parameters {
  id?: string
  version_name: string
  is_active: boolean
  revenue_brackets: RevenueBracket[]
  complexity_weights: ComplexityWeights
  simples_rules: SimplesRules
  discount_ladder: DiscountTier[]
  payment_conditions: PaymentCondition[]
  cost_margin_config: CostMarginConfig
  proposal_templates: ProposalTemplates
}

export interface ProposalModel {
  id?: string
  user_id: string
  code: string
  client_name: string
  cnpj: string
  proposal_date: string
  valid_until: string
  tax_regime: TaxRegime
  monthly_revenue: number
  current_monthly_fee: number
  accounting_firm: string
  responsible_name: string
  contact_name: string
  contact_email: string
  contact_phone: string
  status: ProposalStatus

  // 2.1 - 2.8
  sector: string
  cnpj_count: string
  customer_profile: string
  tax_benefits: string
  data_quality: string
  suppliers_count: string
  clients_count: string
  sku_count: string
  complexity_factor: number

  // Investimento
  discount_level: string
  discount_percentage: number
  discount_counterpart: string
  payment_condition: string
  recommended_product: ProductType

  pricing_snapshot?: CalculatedPricing
  audit_snapshot?: AuditResult
  custom_notes?: string
  created?: string
  updated?: string
}

export interface ProductPriceItem {
  base: number
  factor: number
  adjustedBeforeDiscount: number
  discountValue: number
  finalPrice: number
  financialAdjustmentValue: number
  installmentsCount: number
  installmentValue: number
  isRecommended: boolean
  isSpecialSimples: boolean
}

export interface CalculatedPricing {
  annualRevenue: number
  bracket?: RevenueBracket
  complexityFactor: number
  discountPercentage: number
  paymentConditionId: string
  paymentCondition?: PaymentCondition
  diagnostico: ProductPriceItem
  consultoria: ProductPriceItem
  comite: ProductPriceItem
  recommendedProduct: ProductType
}

export interface ProductDRE {
  product: ProductType
  productLabel: string
  revenue: number
  directHours: number
  hourlyCost: number
  directLaborCost: number
  taxes: number
  commission: number
  indirectCost: number
  totalCostsAndDeductions: number
  contributionMargin: number
  marginRate: number
  resultPerHour: number
  breakEvenPrice: number
  marginTargetPrice: number
  viabilityStatus: 'verde' | 'amarelo' | 'vermelho'
  viabilityMessage: string
}

export interface AuditResult {
  evaluatedAt: string
  diagnostico: ProductDRE
  consultoria: ProductDRE
  comite: ProductDRE
  overallViability: 'verde' | 'amarelo' | 'vermelho'
}
