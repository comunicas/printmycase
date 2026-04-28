# Reorganizar nav do header (LP)

## Sequência da landing page atual

1. `#como-funciona` (Como funciona)
2. `TechQualitySection` (Impressão / qualidade) — **sem id ainda**
3. `#ia-em-acao` (Gerações IA)
4. `#destaques` (Coleções em destaque)

## Itens do header solicitados, na ordem da LP

`Coleções` → `Como funciona` → `Gerações IA` → `Impressão`

(O link "Modelos" será removido tanto do desktop quanto do mobile.)

## Mudanças

### 1. `src/components/home/TechQualitySection.tsx`
Adicionar `id="impressao"` e `scroll-mt-20` ao `<section>` raiz para servir de âncora com offset do header fixo.

### 2. `src/components/AppHeader.tsx`

**Helper genérico de scroll para âncoras** (substitui o atual `goHowItWorks`):
```ts
const goAnchor = (id: string) => {
  setMobileOpen(false);
  if (location.pathname !== "/") {
    navigate(`/#${id}`);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 150);
  } else {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }
};
```

**Nav central desktop (linhas 226-253)** — substituir os 3 botões atuais por 4, na ordem:
- Coleções → `navigate('/colecoes')` (mantém rota dedicada)
- Como funciona → `goAnchor('como-funciona')`
- Gerações IA → `goAnchor('ia-em-acao')`
- Impressão → `goAnchor('impressao')`

Remover o botão "Modelos".

**Mobile (`MOBILE_NAV_ITEMS` e drawer, linhas 22-27 e 148-171)** — substituir a lista atual por:
- Capas de Celular → `/capa-celular` (mantém)
- Coleções → `/colecoes` (mantém)
- Como funciona → âncora `#como-funciona`
- Gerações IA → âncora `#ia-em-acao`
- Impressão → âncora `#impressao`
- Contato → `/contato` (mantém)

Remover "Modelos". Como o `MOBILE_NAV_ITEMS` atual usa apenas `to`, vou tipar para suportar `{ label, to?, anchor? }` e renderizar `<button>` com `goAnchor` quando `anchor` estiver presente, mantendo `<Link>` para os itens com `to`.

### 3. Sem mudanças em rotas

A rota `/catalog` continua funcionando — apenas é removida do header. Os botões "Criar minha capa" / CTA primário do header (que também apontam para `/catalog`) ficam inalterados, pois o pedido é sobre os links de navegação, não sobre o CTA.

## Resultado

Header central (desktop) e drawer (mobile) passam a refletir a sequência da LP, com âncoras suaves para as três seções existentes (`#como-funciona`, `#ia-em-acao`, `#impressao`) e link de página para `Coleções`. "Modelos" sai do menu.