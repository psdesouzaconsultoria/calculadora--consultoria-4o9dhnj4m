import React from 'react'
import { ProposalModel, TaxRegime, ProposalStatus } from '@/types/rt360'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCNPJ } from '@/lib/pricingEngine'
import { Building, Calendar, DollarSign, User, Mail, Phone, Briefcase } from 'lucide-react'

interface TabClientDataProps {
  proposal: Partial<ProposalModel>
  onChange: (updates: Partial<ProposalModel>) => void
}

export default function TabClientData({ proposal, onChange }: TabClientDataProps) {
  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value)
    onChange({ cnpj: formatted })
  }

  return (
    <div className="space-y-6">
      {/* Dados Principais do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            1. Identificação da Empresa e Contrato
          </CardTitle>
          <CardDescription>
            Campos 1.1 a 1.9 da metodologia RT360 para identificação da empresa e parâmetros
            econômicos.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1.1 Razão Social / Nome Fantasia */}
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="client_name">1.1 Razão Social ou Nome do Cliente *</Label>
            <Input
              id="client_name"
              placeholder="Ex: Indústria Metalmecânica Exemplo Ltda"
              value={proposal.client_name || ''}
              onChange={(e) => onChange({ client_name: e.target.value })}
              required
            />
          </div>

          {/* 1.2 CNPJ */}
          <div className="space-y-1.5">
            <Label htmlFor="cnpj">1.2 CNPJ</Label>
            <Input
              id="cnpj"
              placeholder="00.000.000/0000-00"
              value={proposal.cnpj || ''}
              onChange={handleCnpjChange}
              maxLength={18}
            />
          </div>

          {/* 1.3 Data da Proposta */}
          <div className="space-y-1.5">
            <Label htmlFor="proposal_date" className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              1.3 Data de Emissão
            </Label>
            <Input
              id="proposal_date"
              type="date"
              value={proposal.proposal_date || ''}
              onChange={(e) => onChange({ proposal_date: e.target.value })}
            />
          </div>

          {/* Validade */}
          <div className="space-y-1.5">
            <Label htmlFor="valid_until">Validade da Proposta</Label>
            <Input
              id="valid_until"
              type="date"
              value={proposal.valid_until || ''}
              onChange={(e) => onChange({ valid_until: e.target.value })}
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label htmlFor="status">Status da Negociação</Label>
            <select
              id="status"
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={proposal.status || 'rascunho'}
              onChange={(e) => onChange({ status: e.target.value as ProposalStatus })}
            >
              <option value="rascunho">Rascunho</option>
              <option value="enviada">Enviada ao cliente</option>
              <option value="em_negociacao">Em Negociação</option>
              <option value="aprovada">Aprovada / Fechada</option>
              <option value="recusada">Recusada / Declinada</option>
            </select>
          </div>

          {/* 1.4 Regime Tributário Atual */}
          <div className="space-y-1.5">
            <Label htmlFor="tax_regime" className="font-semibold text-primary">
              1.4 Regime Tributário Atual *
            </Label>
            <select
              id="tax_regime"
              className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-medium"
              value={proposal.tax_regime || 'lucro_presumido'}
              onChange={(e) => onChange({ tax_regime: e.target.value as TaxRegime })}
            >
              <option value="simples">Simples Nacional (Regra com base no Honorário)</option>
              <option value="lucro_presumido">Lucro Presumido</option>
              <option value="lucro_real">Lucro Real</option>
              <option value="arbitrado">Lucro Arbitrado</option>
              <option value="imune_isenta">Imune / Isenta / Terceiro Setor</option>
            </select>
          </div>

          {/* 1.5 Faturamento Médio Mensal */}
          <div className="space-y-1.5">
            <Label
              htmlFor="monthly_revenue"
              className="flex items-center gap-1.5 font-semibold text-primary"
            >
              <DollarSign className="h-4 w-4 text-primary" />
              1.5 Faturamento Médio Mensal (R$) *
            </Label>
            <Input
              id="monthly_revenue"
              type="number"
              step="any"
              placeholder="Ex: 500000"
              value={proposal.monthly_revenue ?? ''}
              onChange={(e) => onChange({ monthly_revenue: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-[11px] text-muted-foreground">
              Anualizado estimado: R${' '}
              {((proposal.monthly_revenue || 0) * 12).toLocaleString('pt-BR')}
            </p>
          </div>

          {/* 1.6 Honorário Contábil Mensal */}
          <div className="space-y-1.5">
            <Label htmlFor="current_monthly_fee" className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              1.6 Honorário Contábil Atual (R$)
            </Label>
            <Input
              id="current_monthly_fee"
              type="number"
              step="any"
              placeholder="Ex: 4500"
              value={proposal.current_monthly_fee ?? ''}
              onChange={(e) => onChange({ current_monthly_fee: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-[11px] text-muted-foreground">
              Utilizado na regra do Simples Nacional (3,5x honorário)
            </p>
          </div>

          {/* 1.7 Escritório Contábil */}
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="accounting_firm" className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              1.7 Nome do Escritório de Contabilidade
            </Label>
            <Input
              id="accounting_firm"
              placeholder="Ex: Souza Contabilidade & Consultoria Estratégica"
              value={proposal.accounting_firm || ''}
              onChange={(e) => onChange({ accounting_firm: e.target.value })}
            />
          </div>

          {/* 1.8 Responsável Técnico */}
          <div className="space-y-1.5">
            <Label htmlFor="responsible_name" className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-muted-foreground" />
              1.8 Responsável Técnico / Consultor
            </Label>
            <Input
              id="responsible_name"
              placeholder="Ex: Paulo Souza, Contador e Consultor Tributário"
              value={proposal.responsible_name || ''}
              onChange={(e) => onChange({ responsible_name: e.target.value })}
            />
          </div>

          {/* 1.9 Contato no Cliente */}
          <div className="space-y-1.5">
            <Label htmlFor="contact_name">1.9 Nome do Contato / Decisor</Label>
            <Input
              id="contact_name"
              placeholder="Ex: Carlos Mendes (Diretor Geral)"
              value={proposal.contact_name || ''}
              onChange={(e) => onChange({ contact_name: e.target.value })}
            />
          </div>

          {/* E-mail de Contato */}
          <div className="space-y-1.5">
            <Label htmlFor="contact_email" className="flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-muted-foreground" />
              E-mail do Contato
            </Label>
            <Input
              id="contact_email"
              type="email"
              placeholder="carlos@empresa.com.br"
              value={proposal.contact_email || ''}
              onChange={(e) => onChange({ contact_email: e.target.value })}
            />
          </div>

          {/* Telefone / WhatsApp */}
          <div className="space-y-1.5">
            <Label htmlFor="contact_phone" className="flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Telefone / WhatsApp
            </Label>
            <Input
              id="contact_phone"
              placeholder="(11) 98765-4321"
              value={proposal.contact_phone || ''}
              onChange={(e) => onChange({ contact_phone: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
