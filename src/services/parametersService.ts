import pb from '@/lib/pocketbase/client'
import { RT360Parameters } from '@/types/rt360'

export const parametersService = {
  async getActiveParameters(): Promise<RT360Parameters> {
    try {
      // Tenta buscar o ativo
      const records = await pb.collection('parameters').getFullList({
        filter: 'is_active = true',
        sort: '-updated',
      })

      if (records.length > 0) {
        const rec = records[0]
        return {
          id: rec.id,
          version_name: rec.version_name,
          is_active: rec.is_active,
          revenue_brackets:
            typeof rec.revenue_brackets === 'string'
              ? JSON.parse(rec.revenue_brackets)
              : rec.revenue_brackets,
          complexity_weights:
            typeof rec.complexity_weights === 'string'
              ? JSON.parse(rec.complexity_weights)
              : rec.complexity_weights,
          discount_ladder:
            typeof rec.discount_ladder === 'string'
              ? JSON.parse(rec.discount_ladder)
              : rec.discount_ladder,
          payment_conditions:
            typeof rec.payment_conditions === 'string'
              ? JSON.parse(rec.payment_conditions)
              : rec.payment_conditions,
          simples_rules:
            typeof rec.simples_rules === 'string'
              ? JSON.parse(rec.simples_rules)
              : rec.simples_rules,
          cost_margin_config:
            typeof rec.cost_margin_config === 'string'
              ? JSON.parse(rec.cost_margin_config)
              : rec.cost_margin_config,
          proposal_templates:
            typeof rec.proposal_templates === 'string'
              ? JSON.parse(rec.proposal_templates)
              : rec.proposal_templates,
        }
      }

      // Se nenhum registro existe, busca qualquer um
      const anyRec = await pb.collection('parameters').getFullList({ sort: '-created' })
      if (anyRec.length > 0) {
        const rec = anyRec[0]
        return {
          id: rec.id,
          version_name: rec.version_name,
          is_active: rec.is_active,
          revenue_brackets:
            typeof rec.revenue_brackets === 'string'
              ? JSON.parse(rec.revenue_brackets)
              : rec.revenue_brackets,
          complexity_weights:
            typeof rec.complexity_weights === 'string'
              ? JSON.parse(rec.complexity_weights)
              : rec.complexity_weights,
          discount_ladder:
            typeof rec.discount_ladder === 'string'
              ? JSON.parse(rec.discount_ladder)
              : rec.discount_ladder,
          payment_conditions:
            typeof rec.payment_conditions === 'string'
              ? JSON.parse(rec.payment_conditions)
              : rec.payment_conditions,
          simples_rules:
            typeof rec.simples_rules === 'string'
              ? JSON.parse(rec.simples_rules)
              : rec.simples_rules,
          cost_margin_config:
            typeof rec.cost_margin_config === 'string'
              ? JSON.parse(rec.cost_margin_config)
              : rec.cost_margin_config,
          proposal_templates:
            typeof rec.proposal_templates === 'string'
              ? JSON.parse(rec.proposal_templates)
              : rec.proposal_templates,
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar parâmetros do backend, usando defaults de segurança:', err)
    }

    // Fallback padrão se não houver dados
    return {
      version_name: 'RT360 v3.0 Padrão',
      is_active: true,
      revenue_brackets: [],
      complexity_weights: {
        sector: [],
        cnpj_count: [],
        customer_profile: [],
        tax_benefits: [],
        data_quality: [],
        suppliers_count: [],
        clients_count: [],
        sku_count: [],
      },
      discount_ladder: [],
      payment_conditions: [],
      simples_rules: {
        useHonoraryFormula: true,
        honoraryMultiplier: 3.5,
        minPrice: 3500,
        maxPrice: 15000,
        consultoriaMultiplier: 2.2,
        comiteMonthlyMultiplier: 0.45,
      },
      cost_margin_config: {
        hourlyCost: 140,
        hoursEstimated: { diagnostico: 32, consultoria: 80, comite: 12 },
        taxesRate: 0.1425,
        commissionRate: 0.08,
        indirectCostRate: 0.1,
        targetMarginRate: 0.35,
        criticalMarginRate: 0.18,
      },
      proposal_templates: {
        presentation: '',
        context: '',
        deliverables: {
          diagnostico: { title: '', subtitle: '', scope: [], duration: '', format: '' },
          consultoria: { title: '', subtitle: '', scope: [], duration: '', format: '' },
          comite: { title: '', subtitle: '', scope: [], duration: '', format: '' },
        },
        commercialConditions: '',
        nextSteps: '',
      },
    }
  },

  async saveParameters(params: RT360Parameters): Promise<RT360Parameters> {
    const payload = {
      version_name: params.version_name || 'RT360 v3.0 Padrão',
      is_active: params.is_active ?? true,
      revenue_brackets: params.revenue_brackets,
      complexity_weights: params.complexity_weights,
      discount_ladder: params.discount_ladder,
      payment_conditions: params.payment_conditions,
      simples_rules: params.simples_rules,
      cost_margin_config: params.cost_margin_config,
      proposal_templates: params.proposal_templates,
    }

    if (params.id) {
      const rec = await pb.collection('parameters').update(params.id, payload)
      return {
        ...params,
        id: rec.id,
      }
    } else {
      const rec = await pb.collection('parameters').create(payload)
      return {
        ...params,
        id: rec.id,
      }
    }
  },
}
