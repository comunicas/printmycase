# Plano — Reorganizar header em páginas internas

## Problema (UX)

Hoje o `AppHeader` em páginas internas mostra **três blocos de navegação simultâneos**:

1. **Breadcrumb** à esquerda (ex.: `Coleções › Brasil › Verde Brasil`) — navegação **contextual** (onde estou).
2. **Menu central absoluto** (`Coleções · Como funciona · Modelos`) — navegação **global** (para onde ir).
3. CTA + moedas + avatar à direita.

Conflitos:

- **Conflito semântico**: "Coleções" aparece nos dois lugares ao mesmo tempo. O usuário não distingue contexto vs. navegação.
- **Conflito visual**: o menu central é `position: absolute left-1/2`, então em larguras intermediárias ele encosta ou colide com o breadcrumb (visível no print).
- **Redundância**: "Modelos" no menu central duplica a função de "Capas de Celular" que aparece como primeiro crumb em quase toda página interna.
- **Mobile**: o menu central já está oculto (`hidden lg:flex`) e o breadcrumb também (`hidden sm:flex`), então **mobile não tem nenhum acesso à navegação global** a partir de páginas internas — só CTA + moedas + avatar. Isso é uma lacuna funcional.

## Princípio da solução

Aplicar o padrão clássico de e-commerce (Amazon, Shopify, Mercado Livre):

> **Em páginas internas, o menu global vira secundário e o breadcrumb assume o protagonismo.**

Concretamente: quando há `breadcrumbs`, o menu central no desktop é **escondido** (não compete pela atenção). Quando não há breadcrumbs (Landing, Catalog raiz, etc.), o menu central aparece normalmente. Isso é o que sites grandes fazem e elimina os 3 conflitos de uma vez.

Para mobile/tablet, adicionar um menu hambúrguer simples como ponto único de acesso à navegação global a partir de qualquer dispositivo.

## Mudanças

### 1. `src/components/AppHeader.tsx`

**a) Esconder menu central quando há breadcrumbs (desktop)**

Lógica nova:
```ts
const showCenterNav = !hideNav && (!breadcrumbs || breadcrumbs.length === 0);
```

O bloco `Coleções · Como funciona · Modelos` só renderiza quando `showCenterNav` é true. Isso elimina automaticamente todo o conflito visual e semântico em páginas internas (Brand, BrandModel, Collection, Design, Customize, Admin, Profile, Orders, Checkout, etc.).

**b) Liberar largura do breadcrumb no desktop**

Como o menu central some quando há breadcrumb, o breadcrumb ganha o espaço central e pode crescer:
- `lg:max-w-[260px] xl:max-w-[360px] 2xl:max-w-[480px]` → trocar para `lg:max-w-[480px] xl:max-w-[640px] 2xl:max-w-none`.
- Manter `sm:max-w-[180px] md:max-w-[240px]` em tablet (sem mudança).

**c) Adicionar botão hambúrguer mobile**

Adicionar um `<Sheet>` (shadcn já existe no projeto via Radix) acionado por um ícone `Menu` à esquerda do CoinBalance, visível apenas em `lg:hidden`. Conteúdo do drawer:
- Capas de Celular → `/capa-celular`
- Coleções → `/colecoes`
- Modelos (catálogo) → `/catalog`
- Como funciona → `/#como-funciona`
- Contato → `/contato`

Isso resolve a lacuna de acesso à navegação global em mobile/tablet sem nenhum custo visual.

### 2. Sem mudanças nas páginas

Nenhuma página precisa ser tocada — todas já passam `breadcrumbs={...}` para o `AppHeader`, e a nova lógica é centralizada nele.

## Resultado esperado

| Contexto | Mobile (<640px) | Tablet (sm–md) | Desktop (lg+) |
|---|---|---|---|
| **Página com breadcrumb** (Brand, Product, Collection, Design, etc.) | Logo · ☰ · CTA · moedas · avatar | Logo · breadcrumb truncado · CTA · moedas · avatar | Logo · breadcrumb amplo · CTA · moedas · avatar (**sem menu central**) |
| **Página raiz** (Landing, Catalog raiz) | Logo · ☰ · CTA · moedas · avatar | Logo · CTA · moedas · avatar | Logo · **menu central** · CTA · moedas · avatar |

Sem sobreposição em nenhuma viewport. Sem duplicação semântica de "Coleções". Mobile ganha acesso completo à navegação via hambúrguer.

## Arquivos editados

- `src/components/AppHeader.tsx` (única edição)
