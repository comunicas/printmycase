

## Refatoração e Ajustes Finais - AI Generator + Generations Manager

### Problemas encontrados

1. **Cast desnecessario** (`AiGenerationsManager.tsx:58`): `data as unknown as AiGenImage[]` — o tipo do Supabase ja bate com a interface `AiGenImage`, basta usar o tipo gerado diretamente.

2. **Interface `AiGenImage` duplica o tipo gerado** — pode ser substituida por `Database["public"]["Tables"]["ai_generated_images"]["Row"]`.

3. **`ImageSlot` definido dentro do componente** (`AiImageGenerator.tsx:184-221`): recria o componente a cada render, causando perda de foco nos inputs e re-mounts desnecessarios. Deve ser extraido para fora do componente pai.

4. **`insertError` ignorado** (`generate-gallery-image/index.ts:159`): o resultado do insert nao e verificado — um erro silencioso pode causar perda de dados sem feedback.

5. **useEffect sem deps completas** (`AiImageGenerator.tsx:79`): `toast` e `onSetupConsumed` faltam no array de dependencias (eslint-disable implícito).

6. **`maxRow` cast manual** (`AiGenerationsManager.tsx:125`): `as { sort_order: number } | null` — desnecessario, o tipo do Supabase ja retorna tipado quando se usa `.select("sort_order")`.

7. **`products` cast** (`AiGenerationsManager.tsx:144`): `as ProductOption[]` — pode usar o tipo gerado.

### Plano

| Arquivo | Alteracao |
|---|---|
| `src/components/admin/AiImageGenerator.tsx` | Extrair `ImageSlot` para fora do componente; corrigir deps do useEffect |
| `src/components/admin/AiGenerationsManager.tsx` | Remover interface `AiGenImage`, usar tipo gerado do Supabase; remover casts `as unknown as`; remover cast do `maxRow`; tipar `products` com tipo gerado |
| `supabase/functions/generate-gallery-image/index.ts` | Verificar `insertError` e logar se houver erro (nao bloqueia resposta, pois a imagem ja foi gerada) |

### Detalhes

- O tipo `Database["public"]["Tables"]["ai_generated_images"]["Row"]` sera importado e aliasado como `type AiGenImage = ...` localmente para manter legibilidade.
- `ImageSlot` vira um componente standalone no mesmo arquivo, recebendo `onFile` como prop em vez de capturar `handleFile` do closure.
- O `AiSetup` export permanece inalterado (ja esta correto).

