# Aprimorar seletor de modelos: busca com autocomplete + agrupamento

## Problema
O seletor atual no header de customização (`ModelSelector`) é um dropdown simples com 60+ modelos misturados, sem busca nem agrupamento. Encontrar um modelo específico exige rolar uma lista longa.

## Solução
Transformar o `ModelSelector` em um **modal de busca** (estilo command palette) com:

1. **Trigger** mantém aparência atual (foto + nome + chevron) — sem mudança visual no header.
2. **Modal responsivo** abre ao clicar:
   - Mobile: fullscreen, cantos retos (memória do projeto: Modals).
   - Desktop: card centralizado, ~520px de largura, cantos arredondados.
3. **Campo de busca** no topo com:
   - `autoFocus` ao abrir.
   - Placeholder: "Buscar modelo (ex: iPhone 15, S24 Ultra, Redmi)".
   - Filtro fuzzy/case-insensitive em tempo real (match no nome sem o prefixo "Capa").
   - Ícone de busca à esquerda + botão "limpar" (X) quando há texto.
4. **Resultados agrupados por marca** (extraída do nome: iPhone → Apple, Galaxy → Samsung, Redmi/Poco/Xiaomi → Xiaomi, Motorola → Motorola, demais → Outros):
   - Cabeçalhos sticky por marca com contagem.
   - Ordenação interna alfanumérica natural (ex: 11 < 12 < 12 Pro < 12 Pro Max).
   - Item exibe thumb 36px + nome + preço; ativo destacado com check + cor primária.
5. **Atalhos de teclado**:
   - `Esc` fecha (já provido pelo Dialog).
   - `↑/↓` navega entre resultados; `Enter` seleciona; foco visual na linha.
6. **Estado vazio**: mensagem "Nenhum modelo encontrado para '<termo>'" + sugestão para entrar em contato (link para `/contato`).
7. **Fechar e navegar**: ao selecionar, fecha o modal e faz `navigate(/customize/{slug})` (sem reload se já está na rota).

## Arquivos afetados
- `src/components/customize/ModelSelector.tsx` — refatoração completa: trigger + Dialog com busca, agrupamento e navegação por teclado.

## Detalhes técnicos
- Usar `@/components/ui/dialog` (Radix Dialog já no projeto).
- Helpers locais (no próprio arquivo, sem novas libs):
  - `getBrand(name)`: regex para iPhone/Galaxy/Redmi/Poco/Xiaomi/Motorola → label legível.
  - `naturalSort(a, b)`: usa `localeCompare(b, undefined, { numeric: true, sensitivity: "base" })`.
  - `normalize(s)`: remove acentos + lowercase + remove "Capa " inicial para o filtro.
- `useMemo` para o índice agrupado e para os resultados filtrados (recomputa quando `query` ou `products` muda).
- Navegação por teclado: índice ativo controlado em `useState`, `scrollIntoView({ block: "nearest" })` em mudança.
- Reset de `query` e índice ao fechar (`onOpenChange`).
- Sem mudanças no banco, no `useProducts` ou em `CustomizeHeader`.

## Fora de escopo
- Não altera o seletor da página `/select-model` nem o admin.
- Não adiciona dependências (sem `cmdk`, sem `fuse.js`).
