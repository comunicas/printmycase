
## Melhorias UX mobile — `/colecoes`

### Problemas identificados (mobile 390px)

1. **Hero rouba a primeira dobra inteira** — usuário vê 0 produtos sem rolar
2. **Grid 2-col com cards altos** — só ~2 produtos visíveis por scroll, fadiga em 3 coleções × 8 itens
3. **Botão "Ver todos os X designs" redundante** com "Ver tudo →" do header da seção
4. **CTA "Personalizar" só no rodapé** — invisível para 80% da sessão mobile
5. **Tag "Todas" inerte** quando já está mostrando todas (ocupa espaço sem função)
6. **Tags sem contagem** — usuário não sabe o tamanho da coleção antes de abrir
7. **CtaCard "Personalize sua capinha" oculto** fora do modo busca — perde oportunidade de conversão
8. **Sem badges sociais** (Novo, Mais vendido) — cards parecem catálogo estático

### Mudanças propostas (apenas mobile, desktop intacto)

**1. Hero compacto no mobile**
- Reduzir padding `py-12` → `py-6` no mobile
- H1 menor: `text-3xl` → `text-2xl` no mobile
- Subtítulo reduzido a 1 linha (truncate descrição) ou ocultado em <sm
- **Resultado:** primeira dobra mostra hero + busca + tags + topo do primeiro produto

**2. Grid 2-col mais denso**
- Manter 2 colunas (UX padrão e-commerce mobile) mas reduzir gap `gap-4` → `gap-2.5`
- Padding `CardContent` `p-2.5` → `p-2`
- **Resultado:** ~2.3 produtos por dobra em vez de 1.8

**3. Tags com contagem + scroll suave**
- Cada chip mostra `Brasil · 15`, `Creative · 23`
- Remover chip "Todas" no mobile (já é o estado padrão; libera espaço)
- Tags com `pl-5` para alinhar com conteúdo

**4. CTA "Personalizar" sticky no mobile**
- Botão flutuante fixo no canto inferior direito (FAB) com ícone Sparkles + label "Criar"
- Aparece após scroll > 400px, esconde no rodapé (já tem CTA grande)
- Z-index abaixo do header mas acima do conteúdo
- Apenas mobile (`lg:hidden`)

**5. Inserir CtaCard inline na 1ª coleção**
- No mobile, injetar o card "Personalize sua capinha" como **3ª posição** da primeira vitrine
- Em vez de ficar oculto até buscar, vira ponto de conversão visual entre produtos reais

**6. Remover botão "Ver todos os X designs" redundante no mobile**
- Já existe "Ver tudo →" no header de cada seção
- Liberar espaço vertical (cada seção fica ~60px mais curta)

**7. CTA final do rodapé mais compacto no mobile**
- `p-8 md:p-12` → `p-5 md:p-12`
- Manter intacto no desktop

### Arquivos a editar

- `src/pages/Collections.tsx` — todos os ajustes acima (hero, grid, tags, FAB, CtaCard inline, remover botão duplicado, CTA rodapé)

Nenhuma mudança em rotas, dados, hooks ou componentes compartilhados. Desktop mantém comportamento atual via classes responsivas.

### Fora de escopo

- Refatorar `CollectionCard.tsx` (não usado nesta tela)
- Adicionar wishlist/favoritos (nova feature, não UX puro)
- Mudar o número de colunas no mobile (2-col é padrão validado e-commerce)
