

## Atualizar documentos legais com dados reais da empresa

### Alterações

**1. Migration SQL** — Atualizar os 3 documentos na tabela `legal_documents`
- `UPDATE` nos slugs `terms` e `privacy` com dados reais: RB DIGITAL TECH LTDA, CNPJ 49.841.456/0001-73, São Paulo, sac@artiscase.com, https://studio.artiscase.com
- `INSERT` novo documento slug `purchase-policy` (Política de Compra e Devolução) com regras de CDC para produtos personalizados, prazos, frete Sudeste, Stripe/Pix, garantia de defeitos

**2. `src/pages/LegalDocument.tsx`** — Adicionar mapeamento
- Novo entry no `slugMap`: `"/compras": "purchase-policy"`

**3. `src/App.tsx`** — Nova rota
- `<Route path="/compras" element={<LegalDocument />} />`

**4. `src/pages/Landing.tsx`** — Atualizar footer
- Adicionar link "Política de Compra e Devolução" → `/compras`
- Atualizar seção "Contato" com email `sac@artiscase.com`
- Atualizar copyright para "RB DIGITAL TECH LTDA — CNPJ 49.841.456/0001-73"

**5. `src/pages/Signup.tsx`** — Atualizar checkbox de aceite
- Incluir link para `/compras` (Política de Compra e Devolução) junto aos existentes

### Conteúdo dos documentos atualizados

Todos os documentos terão:
- Razão social: RB DIGITAL TECH LTDA
- CNPJ: 49.841.456/0001-73
- Sede: São Paulo/SP
- Contato: sac@artiscase.com
- URL: https://studio.artiscase.com
- Foro: São Paulo/SP

**Política de Compra e Devolução** cobrirá:
- Formas de pagamento (Stripe: Visa, Master, Elo, Amex + Pix)
- Preços em BRL, frete calculado por CEP (atualmente Sudeste)
- Prazo de produção (48h úteis) e pipeline de status
- Direito de arrependimento (7 dias CDC) com exceção para produtos personalizados
- Garantia de defeitos de fabricação (30 dias)
- Cancelamento antes da produção
- Processo de troca/devolução via sac@artiscase.com

### Arquivos alterados
- Migration SQL (update terms + privacy, insert purchase-policy)
- `src/pages/LegalDocument.tsx`
- `src/App.tsx`
- `src/pages/Landing.tsx`
- `src/pages/Signup.tsx`

