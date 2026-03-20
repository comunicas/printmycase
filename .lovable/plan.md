

## Corrigir envio do `target_style` no Style Transfer

### Problema
Na edge function `apply-ai-filter`, quando o filtro Style Transfer tem uma `style_image_url`, o código envia apenas `style_reference_image_url` e **omite** o `target_style`. A lógica atual é excludente (ou um ou outro), mas a API fal.ai aceita ambos simultaneamente e o `target_style` é o parâmetro principal que define o estilo.

Código atual (linhas 107-109):
```text
if style_image_url → envia style_reference_image_url (sem target_style)
else              → envia target_style (sem style_reference_image_url)
```

### Correção

**`supabase/functions/apply-ai-filter/index.ts`** (linhas 107-109)
- Sempre enviar `target_style: filter.prompt` para Style Transfer
- Adicionalmente enviar `style_reference_image_url` quando `style_image_url` existir
- Resultado: ambos os parâmetros são enviados juntos quando disponíveis

```text
style_transfer → {
  image_url,
  target_style: filter.prompt,        // sempre presente
  style_reference_image_url?,          // quando houver imagem de referência
  aspect_ratio
}
```

### Impacto
- Filtros como "3D mascot" (Cartoon 3D + imagem de referência) passarão a enviar o estilo correto
- Filtros sem imagem de referência continuam funcionando normalmente

