

## Imagens da Galeria de Inspiração Quebradas — URLs Expiradas

### Causa Raiz

As `image_url` salvas em `user_ai_generations` são **signed URLs** do bucket `customizations` (que é **privado**). Essas URLs expiram em ~1 hora. Depois disso, as imagens ficam inacessíveis e mostram apenas o alt text.

Exemplo de URL salva:
```
.../object/sign/customizations/...?token=...&exp=1774255407
```

### Solução

Quando o admin marcar uma geração como `public = true`, copiar a imagem para o bucket **público** `product-assets` (em `galleries/public/`) e salvar a URL pública permanente em um novo campo `public_image_url`. O componente `PublicGallerySection` passa a usar esse campo.

### Alterações

| # | O que | Detalhe |
|---|-------|---------|
| 1 | Migration | Adicionar coluna `public_image_url text` na tabela `user_ai_generations` |
| 2 | `PublicGallerySection.tsx` | Usar `public_image_url` (com fallback para `image_url`) no select e na renderização |
| 3 | `UserGenerationsManager.tsx` (admin) | Ao toggle `public = true`, fazer download da signed URL, upload para `product-assets/galleries/public/{id}.jpg`, salvar a URL pública em `public_image_url`. Ao toggle `public = false`, limpar `public_image_url` |

### Fluxo

```text
Admin marca public = true
  → fetch image da signed URL (ainda válida no momento do toggle)
  → upload para product-assets/galleries/public/{generation_id}.jpg
  → update public_image_url = URL pública permanente
  → Galeria de Inspiração usa a URL pública (nunca expira)
```

### Por que não simplesmente tornar o bucket público?

O bucket `customizations` contém TODAS as customizações de TODOS os usuários — torná-lo público exporia dados privados. A abordagem correta é copiar apenas as imagens aprovadas para um bucket público.

