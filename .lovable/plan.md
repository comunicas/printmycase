

## Galeria de Inspiração na Landing Page — Gerações Públicas

### O que será feito

Nova seção na landing page exibindo imagens de gerações IA marcadas como públicas pelos admins. Funciona como galeria de inspiração, mostrando aos visitantes o que é possível criar.

### Alterações

| # | Arquivo | Alteração |
|---|---------|-----------|
| 1 | `src/components/PublicGallerySection.tsx` | **Novo** — Componente que busca `user_ai_generations` onde `public = true`, exibe grid masonry-like de imagens com nome do filtro e animação hover |
| 2 | `src/pages/Landing.tsx` | Importar e renderizar `PublicGallerySection` entre a seção de Coleções e Depoimentos |

### Detalhes do componente `PublicGallerySection`

- Query: `supabase.from("user_ai_generations").select("id, image_url, filter_name, generation_type").eq("public", true).order("created_at", { ascending: false }).limit(8)`
- Não renderiza se não houver gerações públicas (comportamento igual à seção de coleções)
- Grid responsivo: 2 colunas mobile, 4 colunas desktop
- Cada card: imagem com `aspect-square`, overlay com nome do filtro no hover, `object-cover`
- CTA ao final: "Crie a sua" → `/customize`
- Envolvido em `ScrollReveal` para animação de entrada
- Imagens com `loading="lazy"`

### Posição na landing

```text
... Coleções Exclusivas ...
▼ NOVA SEÇÃO: Galeria de Inspiração (gerações públicas)
... Depoimentos ...
```

