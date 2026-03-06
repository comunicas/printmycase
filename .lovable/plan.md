

## Plano revisado — Etapas incrementais

Cada etapa é independente e funcional ao final, sem quebrar nada.

---

### Etapa 1: Criar tabela `ai_filters` + RLS

Migration SQL para criar a tabela que o admin usará para gerenciar filtros:

```sql
CREATE TABLE public.ai_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  prompt text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active filters"
  ON public.ai_filters FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage filters"
  ON public.ai_filters FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
```

Nenhuma mudança de código — apenas schema.

---

### Etapa 2: Admin — Gerenciador de filtros IA

Criar `src/components/admin/AiFiltersManager.tsx` seguindo o padrão exato do `FaqManager` (CRUD com nome, prompt, ativo, ordenação).

Adicionar nova tab "Filtros IA" (ícone `Wand2`) em `src/pages/Admin.tsx`.

Resultado: admin pode criar/editar/reordenar/ativar filtros. Frontend de customização ainda não muda.

---

### Etapa 3: Solicitar API key do Fal.ai

Usar `add_secret` para pedir `FAL_API_KEY` ao usuário. Bloquear próxima etapa até confirmação.

---

### Etapa 4: Edge function `apply-ai-filter`

Criar `supabase/functions/apply-ai-filter/index.ts`:
- Recebe `{ imageBase64, filterId }`
- Busca prompt da tabela `ai_filters` via service role
- Chama Fal.ai API (image-to-image com o prompt)
- Retorna imagem processada em base64
- CORS headers, `verify_jwt = false`, validação de auth via `getClaims()`

Adicionar ao `config.toml`.

---

### Etapa 5: Customize — Remover preço + adicionar rotação 90°

Alterações em `src/pages/Customize.tsx`:
- Remover `productPrice`, referências a `formatPrice` e blocos de preço no JSX (desktop e mobile)
- Adicionar estado `rotation` (0/90/180/270)
- Botão de rotação 90° (ícone `RotateCw`) na barra de controles
- Incluir `rotation` no draft e no `customData` do sessionStorage

Alterações em `src/components/PhonePreview.tsx`:
- Nova prop `rotation: number`
- Aplicar `transform: rotate(${rotation}deg)` com `transition: transform 0.3s ease` na div da imagem

Alterações em `renderSnapshot`:
- Aplicar rotação no canvas (`ctx.translate` + `ctx.rotate`) antes de desenhar

---

### Etapa 6: Customize — Adicionar filtros IA

Alterações em `src/pages/Customize.tsx`:
- Buscar filtros ativos da tabela `ai_filters` via Supabase query
- Exibir botões dos filtros abaixo do slider de zoom (chips com nome do filtro)
- Ao clicar, chamar `supabase.functions.invoke('apply-ai-filter', { body: { imageBase64, filterId } })`
- Mostrar estado de loading no botão clicado
- Substituir `image` pela versão filtrada; guardar imagem original para permitir "desfazer filtro"
- Botão "Original" para reverter ao estado sem filtro

---

### Resumo da ordem

| Etapa | O que entrega | Arquivos |
|-------|--------------|----------|
| 1 | Tabela no banco | Migration SQL |
| 2 | Admin gerencia filtros | `AiFiltersManager.tsx`, `Admin.tsx` |
| 3 | Secret configurada | — |
| 4 | Backend de IA funcional | `apply-ai-filter/index.ts`, `config.toml` |
| 5 | Rotação + sem preço | `Customize.tsx`, `PhonePreview.tsx` |
| 6 | Filtros IA no customize | `Customize.tsx` |

Cada etapa pode ser testada isoladamente antes de avançar.

