# Plano — Ajustar breadcrumbs em mobile/tablet

## Diagnóstico

Reli o `AppHeader.tsx`:

- **Mobile puro (<640px)**: o container de breadcrumbs usa `hidden sm:flex` — ou seja, **não é renderizado**. Não há sobreposição nem texto cortado em mobile real. Já está correto por design.
- **Tablet `sm`–`md` (640–1023px)**: o breadcrumb aparece, mas o teto de largura (`lg:max-w-[260px] xl:max-w-[360px] 2xl:max-w-[480px]`) só ativa a partir de `lg` (1024px). Entre 640–1023px o breadcrumb fica **sem max-width**, então pode crescer e comprimir o cluster da direita (botão "✦ Criar minha capa" + moedas + avatar), causando o efeito de "cortar texto ao redor do header".
- **Menu central** (`Coleções · Como funciona · Modelos`) só aparece em `lg+`, então abaixo de 1024px não há risco de sobreposição com ele.

## Mudança

Arquivo único: `src/components/AppHeader.tsx`, linha 59.

Adicionar tetos de largura também em `sm` e `md`, preservando os já existentes para `lg+`:

- Antes: `min-w-0 lg:max-w-[260px] xl:max-w-[360px] 2xl:max-w-[480px]`
- Depois: `min-w-0 max-w-[180px] md:max-w-[240px] lg:max-w-[260px] xl:max-w-[360px] 2xl:max-w-[480px]`

O `truncate` por crumb e o `min-w-0` continuam garantindo que cada item encolha com elipse sem nunca empurrar os elementos à direita.

## Resultado esperado

- Mobile (<640px): inalterado — breadcrumb continua oculto, sem qualquer interferência.
- Tablet `sm` (640–767px): breadcrumb limitado a 180px, com elipse; botão "Criar minha capa", moedas e avatar permanecem totalmente visíveis.
- Tablet `md` (768–1023px): breadcrumb limitado a 240px, com elipse.
- Desktop `lg+`: comportamento atual preservado (sem regressão).

## Arquivo editado

- `src/components/AppHeader.tsx` (apenas a classe do container de breadcrumbs)
