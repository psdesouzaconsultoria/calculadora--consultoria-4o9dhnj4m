migrate(
  (app) => {
    // 1. Collection 'parameters' - stores RT360 calculation rules, brackets, margins, and proposal texts
    const parameters = new Collection({
      name: 'parameters',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'version_name', type: 'text', required: true },
        { name: 'is_active', type: 'bool' },
        // JSON fields for configurable tables
        { name: 'revenue_brackets', type: 'json' },
        { name: 'complexity_weights', type: 'json' },
        { name: 'discount_ladder', type: 'json' },
        { name: 'payment_conditions', type: 'json' },
        { name: 'simples_rules', type: 'json' },
        { name: 'cost_margin_config', type: 'json' },
        { name: 'proposal_templates', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(parameters)

    // 2. Collection 'proposals' - client proposals
    const proposals = new Collection({
      name: 'proposals',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'code', type: 'text' },
        { name: 'client_name', type: 'text', required: true },
        { name: 'cnpj', type: 'text' },
        { name: 'proposal_date', type: 'text' },
        { name: 'valid_until', type: 'text' },
        { name: 'tax_regime', type: 'text' }, // simples, lucro_presumido, lucro_real, etc.
        { name: 'monthly_revenue', type: 'number' },
        { name: 'current_monthly_fee', type: 'number' },
        { name: 'accounting_firm', type: 'text' },
        { name: 'responsible_name', type: 'text' },
        { name: 'contact_name', type: 'text' },
        { name: 'contact_email', type: 'text' },
        { name: 'contact_phone', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['rascunho', 'enviada', 'em_negociacao', 'aprovada', 'recusada'],
          maxSelect: 1,
        },

        // Complexity profile fields (2.1 to 2.8)
        { name: 'sector', type: 'text' },
        { name: 'cnpj_count', type: 'text' },
        { name: 'customer_profile', type: 'text' },
        { name: 'tax_benefits', type: 'text' },
        { name: 'data_quality', type: 'text' },
        { name: 'suppliers_count', type: 'text' },
        { name: 'clients_count', type: 'text' },
        { name: 'sku_count', type: 'text' },
        { name: 'complexity_factor', type: 'number' },

        // Investment & Pricing
        { name: 'discount_level', type: 'text' },
        { name: 'discount_percentage', type: 'number' },
        { name: 'discount_counterpart', type: 'text' },
        { name: 'payment_condition', type: 'text' },
        { name: 'recommended_product', type: 'text' }, // diagnostico, consultoria, comite

        // Calculated details payload (stores snapshot of prices, hours, DRE, viability)
        { name: 'pricing_snapshot', type: 'json' },
        { name: 'audit_snapshot', type: 'json' },
        { name: 'custom_notes', type: 'text' },

        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_proposals_user ON proposals (user_id)',
        'CREATE INDEX idx_proposals_status ON proposals (status)',
        'CREATE INDEX idx_proposals_created ON proposals (created DESC)',
      ],
    })
    app.save(proposals)
  },
  (app) => {
    try {
      const proposals = app.findCollectionByNameOrId('proposals')
      app.delete(proposals)
    } catch (_) {}
    try {
      const parameters = app.findCollectionByNameOrId('parameters')
      app.delete(parameters)
    } catch (_) {}
  },
)
