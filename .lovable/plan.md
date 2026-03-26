

## Fase 1 — Popular Base de Conhecimento do Studio PrintMyCase

### Escopo revisado

Foco em funcionalidades da plataforma e produto. **Sem conteúdo de frete/entrega** nesta fase.

### Categorias (4)

| # | Nome | Slug | Ícone |
|---|------|------|-------|
| 1 | Primeiros Passos | primeiros-passos | HelpCircle |
| 2 | Personalização | personalizacao | Sparkles |
| 3 | Pedidos e Pagamento | pedidos-e-pagamento | CreditCard |
| 4 | Moedas e IA | moedas-e-ia | Coins |

### Artigos (~18)

**1. Primeiros Passos**
- Como funciona o Studio PrintMyCase (3 passos: modelo → foto → personalizar)
- Como escolher o modelo do meu celular
- Quais marcas e modelos estão disponíveis
- Não encontrei meu modelo, o que fazer?
- Material e qualidade da capa (policarbonato + TPU + soft-touch)
- Como é feita a impressão (UV Epson, Micro Piezo, cores que não desbotam)

**2. Personalização**
- Como enviar minha foto para a capinha
- Qual a resolução ideal da foto
- Como ajustar posição, zoom e rotação da imagem
- Como usar designs prontos das coleções
- Como escolher imagens da galeria

**3. Pedidos e Pagamento**
- Quais formas de pagamento são aceitas (cartão e Pix)
- Como finalizar meu pedido

**4. Moedas e IA**
- O que são AI Coins
- Como ganhar moedas grátis (50 no cadastro, 20 por indicação, 15 por compra)
- Como usar filtros de IA na minha foto (custo: 20 moedas)
- O que é o upscale de imagem com IA (custo: 20 moedas)
- Como comprar mais moedas

### FAQs em destaque (5)

1. "Como funciona o Studio PrintMyCase?"
2. "Qual o material da capinha?"
3. "Quais formas de pagamento são aceitas?"
4. "O que são AI Coins?"
5. "Como usar filtros de IA na minha foto?"

### Alteração no llms.txt

Trocar "# PrintMyCase" por "# Studio PrintMyCase" e ajustar descrição para "estúdio digital".

### Detalhes técnicos

- **Método**: Uma migration SQL com INSERTs em `kb_categories`, `kb_articles` e `faqs`
- **Conteúdo real**: dados de `coin_settings` (50/20/15 moedas), custo de filtros (20 moedas), materiais da seção WhyPrintMyCase (policarbonato, TPU, soft-touch, impressão UV Epson Micro Piezo)
- **Código alterado**: apenas `public/llms.txt`
- **Admin**: conteúdo aparece imediatamente nas abas existentes do painel

