migrate(
  (app) => {
    // 1. Seed default user if not exists
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let adminUser
    try {
      adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'psdesouzaconsultoria@gmail.com')
    } catch (_) {
      adminUser = new Record(users)
      adminUser.setEmail('psdesouzaconsultoria@gmail.com')
      adminUser.setPassword('Skip@Pass')
      adminUser.setVerified(true)
      adminUser.set('name', 'Consultor RT360')
      app.save(adminUser)
    }

    // 2. Seed RT360 v3 Parameters
    const paramsCol = app.findCollectionByNameOrId('parameters')
    const existingParams = app.findRecordsByFilter(
      'parameters',
      "version_name = 'RT360 v3.0 Padrão'",
      '',
      1,
      0,
    )
    if (existingParams.length === 0) {
      const paramsRec = new Record(paramsCol)
      paramsRec.set('version_name', 'RT360 v3.0 Padrão')
      paramsRec.set('is_active', true)

      // Revenue Brackets (Faixas de faturamento)
      paramsRec.set(
        'revenue_brackets',
        JSON.stringify([
          {
            id: 'f1',
            label: 'Até R$ 180 mil/ano (Microempresa)',
            min: 0,
            max: 180000,
            baseDiagnostico: 3500,
            baseConsultoria: 8000,
            baseComite: 1500,
            floorDiagnostico: 2500,
            ceilDiagnostico: 6000,
          },
          {
            id: 'f2',
            label: 'R$ 180 mil a R$ 720 mil/ano',
            min: 180000,
            max: 720000,
            baseDiagnostico: 5500,
            baseConsultoria: 12000,
            baseComite: 2200,
            floorDiagnostico: 4000,
            ceilDiagnostico: 9000,
          },
          {
            id: 'f3',
            label: 'R$ 720 mil a R$ 2,4 milhões/ano',
            min: 720000,
            max: 2400000,
            baseDiagnostico: 8500,
            baseConsultoria: 18500,
            baseComite: 3200,
            floorDiagnostico: 6000,
            ceilDiagnostico: 14000,
          },
          {
            id: 'f4',
            label: 'R$ 2,4 milhões a R$ 4,8 milhões/ano (Teto Simples)',
            min: 2400000,
            max: 4800000,
            baseDiagnostico: 12500,
            baseConsultoria: 26000,
            baseComite: 4500,
            floorDiagnostico: 8500,
            ceilDiagnostico: 20000,
          },
          {
            id: 'f5',
            label: 'R$ 4,8 milhões a R$ 12 milhões/ano',
            min: 4800000,
            max: 12000000,
            baseDiagnostico: 18000,
            baseConsultoria: 38000,
            baseComite: 6500,
            floorDiagnostico: 12000,
            ceilDiagnostico: 28000,
          },
          {
            id: 'f6',
            label: 'R$ 12 milhões a R$ 36 milhões/ano',
            min: 12000000,
            max: 36000000,
            baseDiagnostico: 25000,
            baseConsultoria: 54000,
            baseComite: 9000,
            floorDiagnostico: 18000,
            ceilDiagnostico: 40000,
          },
          {
            id: 'f7',
            label: 'R$ 36 milhões a R$ 78 milhões/ano',
            min: 36000000,
            max: 78000000,
            baseDiagnostico: 36000,
            baseConsultoria: 78000,
            baseComite: 13000,
            floorDiagnostico: 25000,
            ceilDiagnostico: 60000,
          },
          {
            id: 'f8',
            label: 'Acima de R$ 78 milhões/ano',
            min: 78000000,
            max: 9999999999,
            baseDiagnostico: 52000,
            baseConsultoria: 110000,
            baseComite: 18000,
            floorDiagnostico: 36000,
            ceilDiagnostico: 90000,
          },
        ]),
      )

      // Complexity Factors (Campos 2.1 a 2.8)
      paramsRec.set(
        'complexity_weights',
        JSON.stringify({
          sector: [
            {
              value: 'servicos_simples',
              label: 'Serviços puros / Profissionais liberais',
              weight: 0.9,
            },
            { value: 'comercio_varejo', label: 'Comércio Varejista', weight: 1.0 },
            {
              value: 'comercio_atacado',
              label: 'Comércio Atacadista / Distribuição',
              weight: 1.15,
            },
            { value: 'industria_transformacao', label: 'Indústria de Transformação', weight: 1.3 },
            {
              value: 'construcao_imobiliario',
              label: 'Construção Civil / Incorporação',
              weight: 1.25,
            },
            { value: 'agronegocio', label: 'Agronegócio / Cooperativas', weight: 1.2 },
            {
              value: 'misto_complexo',
              label: 'Misto (Indústria + Comércio + Serviços)',
              weight: 1.35,
            },
          ],
          cnpj_count: [
            { value: '1', label: '1 CNPJ (Matriz única)', weight: 1.0 },
            { value: '2_3', label: '2 a 3 CNPJs (Filiais ou Coligadas)', weight: 1.15 },
            { value: '4_7', label: '4 a 7 CNPJs (Grupo Econômico Médio)', weight: 1.3 },
            { value: '8_mais', label: '8 ou mais CNPJs (Holding / Grupo Grande)', weight: 1.5 },
          ],
          customer_profile: [
            {
              value: 'b2c_predominante',
              label: 'Predominante B2C (Consumidor Final)',
              weight: 0.95,
            },
            { value: 'b2b_estadual', label: 'Predominante B2B Estadual', weight: 1.05 },
            {
              value: 'b2b_interestadual',
              label: 'B2B Interestadual com ST e Diferencial',
              weight: 1.2,
            },
            { value: 'misto_b2b_b2c', label: 'Misto B2B e B2C amplo', weight: 1.15 },
          ],
          tax_benefits: [
            { value: 'sem_beneficios', label: 'Nenhum benefício fiscal específico', weight: 1.0 },
            {
              value: 'moderado',
              label: '1 a 2 benefícios (Desoneração, TTD Estadual)',
              weight: 1.15,
            },
            {
              value: 'complexo',
              label: 'Múltiplos benefícios / regimes especiais / SUDENE/SUDAM',
              weight: 1.3,
            },
          ],
          data_quality: [
            {
              value: 'erp_integrado',
              label: 'ERP consolidado, inventário e SPED auditado',
              weight: 0.9,
            },
            {
              value: 'erp_padrao',
              label: 'ERP padrão com ajustes manuais ocasionais',
              weight: 1.05,
            },
            {
              value: 'planilhas_disperso',
              label: 'Sistemas fragmentados / Controles manuais',
              weight: 1.25,
            },
          ],
          suppliers_count: [
            { value: 'ate_50', label: 'Até 50 fornecedores ativos', weight: 0.95 },
            { value: '51_200', label: '51 a 200 fornecedores', weight: 1.05 },
            { value: '201_500', label: '201 a 500 fornecedores', weight: 1.15 },
            { value: 'mais_500', label: 'Acima de 500 fornecedores', weight: 1.25 },
          ],
          clients_count: [
            { value: 'ate_100', label: 'Carteira concentrada (até 100 clientes)', weight: 0.95 },
            { value: '101_500', label: 'Carteira média (101 a 500 clientes)', weight: 1.05 },
            {
              value: 'mais_500',
              label: 'Carteira pulverizada (acima de 500 clientes)',
              weight: 1.15,
            },
          ],
          sku_count: [
            { value: 'ate_100', label: 'Até 100 SKUs / Itens de faturamento', weight: 0.95 },
            { value: '101_1000', label: '101 a 1.000 SKUs', weight: 1.05 },
            { value: '1001_5000', label: '1.001 a 5.000 SKUs', weight: 1.2 },
            { value: 'mais_5000', label: 'Acima de 5.000 SKUs (Grande catálogo)', weight: 1.35 },
          ],
        }),
      )

      // Simples Nacional Rules
      paramsRec.set(
        'simples_rules',
        JSON.stringify({
          useHonoraryFormula: true,
          honoraryMultiplier: 3.5, // 3,5x o honorário contábil mensal
          minPrice: 3500,
          maxPrice: 15000,
          consultoriaMultiplier: 2.2, // Consultoria = ~2.2x Diagnóstico
          comiteMonthlyMultiplier: 0.45, // Comitê = ~45% do honorário mensal do cliente
        }),
      )

      // Discount Ladder (Régua de desconto com contrapartida)
      paramsRec.set(
        'discount_ladder',
        JSON.stringify([
          {
            level: 'none',
            label: 'Sem desconto (Tabela Cheia)',
            percentage: 0,
            counterpart: 'Condição padrão sem exigência de contrapartida',
          },
          {
            level: 'd5',
            label: 'Nível 1 — 5% de desconto',
            percentage: 5,
            counterpart: 'Pagamento à vista via PIX no aceite da proposta',
          },
          {
            level: 'd10',
            label: 'Nível 2 — 10% de desconto',
            percentage: 10,
            counterpart:
              'PIX à vista + gravação de depoimento em vídeo ou autorização de uso de marca como case',
          },
          {
            level: 'd15',
            label: 'Nível 3 — 15% de desconto',
            percentage: 15,
            counterpart:
              'Fechamento imediato em 48h + indicação ativa de 2 empresas do mesmo porte',
          },
          {
            level: 'd20',
            label: 'Nível 4 — 20% de desconto (Máximo Comercial)',
            percentage: 20,
            counterpart:
              'Contrato combinado (Diagnóstico + Comitê RT 12 meses) com PIX à vista no Diagnóstico',
          },
        ]),
      )

      // Payment Conditions (Condições de pagamento)
      paramsRec.set(
        'payment_conditions',
        JSON.stringify([
          {
            id: 'avista_pix',
            label: 'À vista via PIX (Aceite da proposta)',
            installments: 1,
            adjustment: -0.05,
            description: '5% de bonificação financeira adicional',
          },
          {
            id: 'entrada_30',
            label: 'Entrada 50% + 50% na entrega final',
            installments: 2,
            adjustment: 0,
            description: 'Sem juros',
          },
          {
            id: '3x_sem_juros',
            label: '3x mensais fixas (Entrada + 30 + 60 dias)',
            installments: 3,
            adjustment: 0,
            description: 'Sem acréscimo',
          },
          {
            id: '4x_sem_juros',
            label: '4x mensais fixas no cartão ou boleto',
            installments: 4,
            adjustment: 0.03,
            description: '+3% de taxa financeira',
          },
          {
            id: '6x_parcelado',
            label: '6x mensais no cartão de crédito',
            installments: 6,
            adjustment: 0.06,
            description: '+6% de taxa financeira',
          },
        ]),
      )

      // Cost & Margin Config (Auditoria e viabilidade)
      paramsRec.set(
        'cost_margin_config',
        JSON.stringify({
          hourlyCost: 140, // Custo da hora técnica média do escritório (R$/h)
          hoursEstimated: {
            diagnostico: 32, // Horas estimadas para Diagnóstico RT
            consultoria: 80, // Horas estimadas para Consultoria RT completa
            comite: 12, // Horas mensais de acompanhamento do Comitê RT
          },
          taxesRate: 0.1425, // Impostos sobre a nota (14,25% PIS/COFINS/ISS/IRPJ)
          commissionRate: 0.08, // Comissão comercial (8%)
          indirectCostRate: 0.1, // Rateio de custos indiretos e tecnologia (10%)
          targetMarginRate: 0.35, // Margem de contribuição alvo (35%)
          criticalMarginRate: 0.18, // Abaixo de 18% = Semáforo Vermelho; 18%-30% = Amarelo; >30% = Verde
        }),
      )

      // Proposal Texts & Deliverables Templates
      paramsRec.set(
        'proposal_templates',
        JSON.stringify({
          presentation:
            'Apresentamos a presente Proposta Comercial para prestação de serviços técnicos especializados voltados à preparação, transição e governança da sua empresa frente às diretrizes da Reforma Tributária (EC 132/2023, IBS, CBS e Imposto Seletivo).',
          context:
            'A Reforma Tributária sobre o consumo é a maior transformação das últimas cinco décadas no ambiente de negócios brasileiro. A introdução do IBS e da CBS, o mecanismo de split payment em tempo real, a extinção gradativa do ICMS, ISS, PIS e COFINS e o novo modelo de créditos exigem uma revisão profunda de precificação, contratos, compras, vendas, sistemas ERP e fluxo de caixa.',
          deliverables: {
            diagnostico: {
              title: 'Produto 1: Diagnóstico RT (Impacto e Prontidão)',
              subtitle:
                'Mapeamento executivo de riscos, oportunidades de crédito e preparação técnica',
              scope: [
                'Mapeamento dos fluxos de compras, vendas e créditos tributários da operação',
                'Simulação comparativa de carga tributária estimada (modelo atual vs. novo IBS/CBS)',
                'Avaliação de impacto no fluxo de caixa decorrente do Split Payment',
                'Auditoria de cadastros de itens, regras fiscais e parametrização ERP',
                'Matriz de Vulnerabilidade e Plano de Ação Estratégico com roadmap de prioridades',
                'Relatório Executivo em PDF e reunião de apresentação com a diretoria',
              ],
              duration: '30 a 45 dias úteis',
              format: 'Entrega pontual com apresentação final',
            },
            consultoria: {
              title: 'Produto 2: Consultoria RT (Implementação e Adequação)',
              subtitle: 'Reestruturação operacional, contratual, de preços e sistemas',
              scope: [
                'Tudo incluído no Diagnóstico RT com aprofundamento operacional',
                'Reprecificação estratégica de produtos e serviços para neutralizar a nova carga',
                'Revisão e renegociação de cláusulas tributárias em contratos com fornecedores e clientes',
                'Apoio técnico direto na homologação das regras fiscais no ERP da empresa',
                'Capacitação da equipe interna de compras, faturamento e financeiro',
                'Planejamento de transição do período híbrido (2026 a 2032)',
              ],
              duration: '3 a 6 meses de execução com reuniões quinzenais',
              format: 'Acompanhamento consultivo intensivo',
            },
            comite: {
              title: 'Produto 3: Comitê Permanente RT (Governança Mensal)',
              subtitle: 'Suporte contínuo, monitoramento legislativo e governança estratégica',
              scope: [
                'Mesa de governança mensal com a diretoria e comitê interno de transição',
                'Atualização contínua das Leis Complementares e normas infralegais regulamentadoras',
                'Monitoramento periódico da conformidade do split payment e escrituração fiscal',
                'Plantão de dúvidas prioritário para a equipe fiscal e financeira',
                'Boletins executivos mensais de inteligência tributária e cenários macro',
              ],
              duration: 'Contrato recorrente de 12 meses renováveis',
              format: 'Assinatura mensal de governança',
            },
          },
          commercialConditions:
            'A presente proposta é válida por 15 (quinze) dias a contar da data de emissão. Os honorários não abrangem taxas públicas, custos de aquisição ou licenciamento de novos módulos de softwares ERP, ou honorários de perícias e contencioso judicial.',
          nextSteps:
            'Para formalização, basta o aceite eletrônico ou confirmação por e-mail com a indicação da condição de pagamento escolhida. Em seguida, agendaremos a reunião inicial de kick-off e enviaremos o checklist documental.',
        }),
      )

      app.save(paramsRec)
    }

    // 3. Seed an initial sample proposal to showcase the functionality immediately
    const proposalsCol = app.findCollectionByNameOrId('proposals')
    const existingProposals = app.findRecordsByFilter(
      'proposals',
      "code = 'PROP-2025-001'",
      '',
      1,
      0,
    )
    if (existingProposals.length === 0) {
      const prop = new Record(proposalsCol)
      prop.set('user_id', adminUser.id)
      prop.set('code', 'PROP-2025-001')
      prop.set('client_name', 'Indústria Metalmecânica Aliança Ltda')
      prop.set('cnpj', '12.345.678/0001-90')
      prop.set('proposal_date', new Date().toISOString().slice(0, 10))
      prop.set('valid_until', new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10))
      prop.set('tax_regime', 'lucro_real')
      prop.set('monthly_revenue', 3200000) // R$ 38.4M/ano
      prop.set('current_monthly_fee', 8500)
      prop.set('accounting_firm', 'Souza & Associados Contabilidade Estratégica')
      prop.set('responsible_name', 'Paulo Souza')
      prop.set('contact_name', 'Roberto Silva (Diretor Financeiro)')
      prop.set('contact_email', 'roberto@aliancametal.com.br')
      prop.set('contact_phone', '(11) 98765-4321')
      prop.set('status', 'em_negociacao')

      prop.set('sector', 'industria_transformacao')
      prop.set('cnpj_count', '2_3')
      prop.set('customer_profile', 'b2b_interestadual')
      prop.set('tax_benefits', 'moderado')
      prop.set('data_quality', 'erp_padrao')
      prop.set('suppliers_count', '201_500')
      prop.set('clients_count', '101_500')
      prop.set('sku_count', '1001_5000')
      prop.set('complexity_factor', 1.25)

      prop.set('discount_level', 'd10')
      prop.set('discount_percentage', 10)
      prop.set('discount_counterpart', 'PIX à vista + depoimento em vídeo ou autorização como case')
      prop.set('payment_condition', 'entrada_30')
      prop.set('recommended_product', 'consultoria')

      prop.set(
        'pricing_snapshot',
        JSON.stringify({
          factor: 1.25,
          diagnostico: { base: 36000, adjusted: 45000, finalPrice: 40500 },
          consultoria: { base: 78000, adjusted: 97500, finalPrice: 87750 },
          comite: { base: 13000, adjusted: 16250, finalPrice: 14625 },
        }),
      )

      prop.set(
        'audit_snapshot',
        JSON.stringify({
          productEvaluated: 'consultoria',
          revenue: 87750,
          directCost: 11200,
          taxes: 12504.38,
          commission: 7020,
          indirectCost: 8775,
          contributionMargin: 48250.62,
          marginRate: 0.55,
          resultPerHour: 603.13,
          breakEvenPrice: 32900,
          status: 'verde',
        }),
      )

      prop.set(
        'custom_notes',
        'Cliente muito interessado no impacto do Split Payment no fluxo de caixa do segundo semestre.',
      )
      app.save(prop)
    }
  },
  (app) => {
    // down logic
  },
)
