## Situação

Você relatou que **todas as imagens da home e cards de produtos** aparecem como **espaço em branco**, e isso começou **depois das últimas mudanças** (que foram só edições de texto no Hero).

## O que já investiguei

Tenho evidências contraditórias:

- ✅ Replay mostra o **carrossel do Hero rodando normal** (alternando entre Cyberpunk → Cartoon 3D → Artística)
- ✅ Requisições de imagem do Supabase Storage retornam **HTTP 200** (testei via curl)
- ✅ Queries de `products` e `collection_designs` retornam dados com `image_url` válidos
- ✅ Sem erros JS no dev-server
- ⚠️ Único erro de fetch: `public_ai_generations` (afeta só o mosaico de IA, não tudo)
- ⚠️ Erro do Supabase Auth: `Lock broken by another request with the 'steal' option` — clássico de **múltiplas abas** do mesmo app abertas competindo pelo lock de auth

Como você disse que requisições retornam 200 mas a tela está em branco, **o problema não é fetch — é renderização**. As causas mais prováveis nessa situação são cache do preview ou estado quebrado.

## Plano de ação

### Passo 1 — Validar visualmente no preview real (com browser tools)

Abrir o preview com a ferramenta de browser, tirar screenshot da home, e inspecionar o DOM para confirmar exatamente o que está em branco. Isso elimina ambiguidade — vou ver o mesmo que você está vendo.

### Passo 2 — Limpar cache do preview e forçar reload

Se o screenshot confirmar imagens em branco, **a primeira ação** será verificar:
- Se você tem **mais de uma aba do app aberta** (causa o erro do auth lock)
- Se o problema persiste com hard reload (Ctrl+Shift+R)

Se for só cache, resolve sem mudança de código.

### Passo 3 — Corrigir o auth lock (se confirmar que é causa)

O erro `Lock broken with 'steal' option` acontece quando o Supabase JS tenta renovar o token em uma aba enquanto outra também está tentando. Isso pode travar o `AuthContext` em loading e impedir componentes filhos de renderizar.

**Mitigação:** ajustar `src/contexts/AuthContext.tsx` para não bloquear o render do app caso o lock falhe (renderizar com `user = null` em vez de ficar em loading infinito).

### Passo 4 — Fallback do `AiCoinsSection`

O `public_ai_generations query failed: Failed to fetch` indica que essa query especificamente está sendo bloqueada (provavelmente CORS no contexto do iframe do preview, mas funciona em produção). Como o componente já retorna `null` quando `images.length === 0`, **não causa tela branca** — só não aparece o mosaico de IA. Vou apenas silenciar o `console.error` para não poluir.

## O que NÃO vou fazer ainda

- Não vou reescrever `ProductCard`, `HeroPhoneCarousel`, ou `getOptimizedUrl` — o código deles está correto e os testes mostram que funcionam
- Não vou desfazer as edições de texto recentes — elas não tocaram em nada de imagem

## Pergunta importante antes de aprovar

Se possível, faça um teste rápido: **abra https://studio.printmycase.com.br/ em uma aba anônima** (sem cache, sem login). Se as imagens aparecerem lá, o problema é 100% cache/multi-aba do preview e não precisa mudança de código.

Aprove o plano para eu prosseguir com o diagnóstico via browser e aplicar as correções identificadas.