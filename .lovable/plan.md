# Plano — Corrigir breadcrumbs quebrados no header

## Contexto sobre o componente

Verifiquei o design system e o codebase:

- **Não existe** componente `Breadcrumb` em `src/components/ds/` (DS local) nem em `src/components/ui/` (shadcn não foi instalado).
- O breadcrumb é renderizado **inline dentro do `AppHeader.tsx`** (linhas 58–73), com um tipo local `Breadcrumb { label, to? }`.
- Todas as páginas (`BrandModelPage`, `BrandPage`, `CollectionPage`, `Product`, `Profile`, `Orders`, etc.) já consomem isso via `<AppHeader breadcrumbs={...} />`.

**Conclusão:** o `AppHeader` **é** o componente padrão de breadcrumb do projeto. Vamos consertar nele (uma única fonte de verdade), sem criar componente novo nem instalar dependências.

## Problema

No print do usuário, o header mostra os textos sobrepostos:
> "Capinhas Personalizadas para~~Samsung Galaxy~~ **Coleções** Galaxy ~~Como funciona~~ Galaxy A06 ~~Modelos~~"

Causas combinadas:

1. **Menu central absoluto** — em `AppHeader.tsx` linha 76, o menu "Coleções · Como funciona · Modelos" usa `absolute left-1/2 -translate-x-1/2`, ficando **por cima** do fluxo normal.
2. **Breadcrumbs sem teto de largura no `xl`** — o container tem `lg:max-w-[220px] xl:max-w-none`. A partir de 1280px o limite some e os crumbs invadem o menu central. A viewport do usuário (1336px) cai exatamente nesse breakpoint.
3. **Labels longos demais** — em `BrandModelPage.tsx`:
   - 2º crumb usa `brandSeo.h1` ("Capinhas Personalizadas para Samsung Galaxy") — texto enorme.
   - 3º crumb usa `product.name` cru ("Capa Galaxy A06") com prefixo "Capa" redundante.

## Mudanças

### 1. `src/components/AppHeader.tsx` (componente padrão)
Limitar a largura máxima do container de breadcrumbs em todos os breakpoints, garantindo que nunca invadam o menu central absoluto.

- Trocar `lg:max-w-[220px] xl:max-w-none` por `lg:max-w-[260px] xl:max-w-[360px] 2xl:max-w-[480px]`.
- O `truncate` por crumb já existe — mantém.

### 2. `src/pages/BrandModelPage.tsx`
Encurtar os labels visíveis (sem alterar o JSON-LD de SEO, que continua usando `brandSeo.h1` e `product.name` completos):

- 2º crumb: usar `brandDisplayName` (ex.: "Samsung") em vez de `brandSeo.h1`.
- 3º crumb: aplicar `product.name.replace(/^Capa\s+/i, "").trim()` para remover o prefixo redundante (ex.: "Galaxy A06").

## Resultado esperado

```text
[logo] › Capas de Celular › Samsung › Galaxy A06     Coleções  Como funciona  Modelos     [✦ Criar minha capa] [moedas] [user]
```

Sem sobreposição, sem prefixo "Capa" redundante, menu central preservado, e o componente padrão (`AppHeader`) continua sendo a única fonte de verdade para breadcrumbs.

## Arquivos editados

- `src/components/AppHeader.tsx`
- `src/pages/BrandModelPage.tsx`
