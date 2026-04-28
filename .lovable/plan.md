# Ampliar o frame da preview no mobile

## Diagnóstico
No mobile, o frame do celular em `src/components/PhonePreview.tsx` (linha 228) está com altura limitada por:

```
h-[min(410px,50dvh)] aspect-[260/532]
```

- O cap de **50dvh** descarta metade da tela.
- O cap absoluto de **410px** trava o crescimento mesmo em telas mais altas (ex.: iPhone 14+ ≈ 844px).
- Com `aspect 260/532` (≈0.489), altura é o gargalo (não largura).

A estrutura ao redor (`Customize.tsx`) é `h-dvh` com flex-column: header (~56px) + `<main flex-1>` + tab bar (~110px). Em telas típicas (640–820 dvh) sobram **~470–650px** de espaço útil para o preview.

## Quanto dá pra ganhar

| Tela            | dvh  | Espaço útil estimado | Frame atual (50dvh, máx 410) | Frame proposto | Ganho |
|-----------------|------|----------------------|------------------------------|----------------|-------|
| 360×640 baixo   | 640  | ~470px               | 320px                        | ~440px         | +37%  |
| 390×844 padrão  | 844  | ~670px               | 410px (cap)                  | ~620px         | +51%  |
| 414×896 grande  | 896  | ~720px               | 410px (cap)                  | ~660px         | +61%  |

## Mudança proposta (uma linha)

Em `src/components/PhonePreview.tsx`, linha 228, trocar:

```
h-[min(410px,50dvh)] aspect-[260/532]
```

por uma fórmula que respeite o espaço real disponível:

```
h-[min(620px,calc(100dvh-220px))] aspect-[260/532]
```

Onde:
- `100dvh - 220px` reserva ~110px para o header + ~110px para a tab bar inferior (já é a soma real medida no layout atual).
- Cap superior de **620px** evita exagero em tablets em modo retrato.
- Mantém `aspect-[260/532]`, então a largura cresce proporcionalmente sem deformar.
- Não toca o desktop (`lg:h-[70vh] lg:w-auto lg:aspect-[260/532]` permanece intacto).

## Salvaguardas (sem mexer em mais nada)
- O container pai (`<main flex-1>` em `Customize.tsx`) já é `overflow-hidden` e centraliza, então nenhum scroll novo aparece.
- Em telas muito baixas (<540dvh), `calc(100dvh-220px)` cai abaixo de 320px e o preview ainda cabe sem cortar header/tab bar.
- A `safe zone`, controles de drag/pinch, overlay de upload e crossfade continuam funcionando — todos posicionam-se em % do frame.

## Arquivo afetado
- `src/components/PhonePreview.tsx` (apenas a classe `h-[…]` da linha 228)

## Fora do escopo
- Não altera desktop, header, tab bar, sidebar, padding ou aspect-ratio.
- Não mexe em safe-zone, presets de device ou lógica de imagem.
