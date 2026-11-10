import pb from '@/lib/pocketbase/client'
import { ProposalModel } from '@/types/rt360'

export const proposalsService = {
  async listProposals(): Promise<ProposalModel[]> {
    const records = await pb.collection('proposals').getFullList({
      sort: '-created',
    })
    return records.map(recordToProposal)
  },

  async getProposalById(id: string): Promise<ProposalModel> {
    const record = await pb.collection('proposals').getOne(id)
    return recordToProposal(record)
  },

  async createProposal(data: Partial<ProposalModel>): Promise<ProposalModel> {
    const currentUser = pb.authStore.record
    if (!currentUser) {
      throw new Error('Usuário precisa estar autenticado para criar proposta')
    }

    const payload = {
      user_id: currentUser.id,
      code:
        data.code || `PROP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      client_name: data.client_name || 'Novo Cliente',
      cnpj: data.cnpj || '',
      proposal_date: data.proposal_date || new Date().toISOString().slice(0, 10),
      valid_until:
        data.valid_until || new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      tax_regime: data.tax_regime || 'lucro_presumido',
      monthly_revenue: Number(data.monthly_revenue || 0),
      current_monthly_fee: Number(data.current_monthly_fee || 0),
      accounting_firm: data.accounting_firm || '',
      responsible_name: data.responsible_name || currentUser.name || 'Responsável Técnico',
      contact_name: data.contact_name || '',
      contact_email: data.contact_email || '',
      contact_phone: data.contact_phone || '',
      status: data.status || 'rascunho',

      sector: data.sector || 'comercio_varejo',
      cnpj_count: data.cnpj_count || '1',
      customer_profile: data.customer_profile || 'b2c_predominante',
      tax_benefits: data.tax_benefits || 'sem_beneficios',
      data_quality: data.data_quality || 'erp_padrao',
      suppliers_count: data.suppliers_count || '51_200',
      clients_count: data.clients_count || '101_500',
      sku_count: data.sku_count || '101_1000',
      complexity_factor: Number(data.complexity_factor || 1.0),

      discount_level: data.discount_level || 'none',
      discount_percentage: Number(data.discount_percentage || 0),
      discount_counterpart: data.discount_counterpart || '',
      payment_condition: data.payment_condition || 'entrada_30',
      recommended_product: data.recommended_product || 'diagnostico',

      pricing_snapshot: data.pricing_snapshot,
      audit_snapshot: data.audit_snapshot,
      custom_notes: data.custom_notes || '',
    }

    const record = await pb.collection('proposals').create(payload)
    return recordToProposal(record)
  },

  async updateProposal(id: string, data: Partial<ProposalModel>): Promise<ProposalModel> {
    const payload: any = { ...data }
    delete payload.id
    delete payload.user_id
    delete payload.created
    delete payload.updated

    const record = await pb.collection('proposals').update(id, payload)
    return recordToProposal(record)
  },

  async duplicateProposal(id: string): Promise<ProposalModel> {
    const original = await this.getProposalById(id)
    const duplicateData: Partial<ProposalModel> = {
      ...original,
      code: `PROP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      client_name: `${original.client_name} (Cópia)`,
      status: 'rascunho',
      proposal_date: new Date().toISOString().slice(0, 10),
      valid_until: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
    }
    delete duplicateData.id
    delete duplicateData.created
    delete duplicateData.updated

    return this.createProposal(duplicateData)
  },

  async deleteProposal(id: string): Promise<boolean> {
    return await pb.collection('proposals').delete(id)
  },
}

function recordToProposal(rec: any): ProposalModel {
  return {
    id: rec.id,
    user_id: rec.user_id,
    code: rec.code,
    client_name: rec.client_name,
    cnpj: rec.cnpj,
    proposal_date: rec.proposal_date,
    valid_until: rec.valid_until,
    tax_regime: rec.tax_regime,
    monthly_revenue: rec.monthly_revenue,
    current_monthly_fee: rec.current_monthly_fee,
    accounting_firm: rec.accounting_firm,
    responsible_name: rec.responsible_name,
    contact_name: rec.contact_name,
    contact_email: rec.contact_email,
    contact_phone: rec.contact_phone,
    status: rec.status,

    sector: rec.sector,
    cnpj_count: rec.cnpj_count,
    customer_profile: rec.customer_profile,
    tax_benefits: rec.tax_benefits,
    data_quality: rec.data_quality,
    suppliers_count: rec.suppliers_count,
    clients_count: rec.clients_count,
    sku_count: rec.sku_count,
    complexity_factor: rec.complexity_factor,

    discount_level: rec.discount_level,
    discount_percentage: rec.discount_percentage,
    discount_counterpart: rec.discount_counterpart,
    payment_condition: rec.payment_condition,
    recommended_product: rec.recommended_product,

    pricing_snapshot:
      typeof rec.pricing_snapshot === 'string'
        ? JSON.parse(rec.pricing_snapshot)
        : rec.pricing_snapshot,
    audit_snapshot:
      typeof rec.audit_snapshot === 'string' ? JSON.parse(rec.audit_snapshot) : rec.audit_snapshot,
    custom_notes: rec.custom_notes,
    created: rec.created,
    updated: rec.updated,
  }
}
