

## Plano: Opção B — Área de segurança + correção de proporção

### Mudanças em `src/components/PhonePreview.tsx`

**1. Corrigir proporção do frame (linha 196)**
- Remover `width: 200` fixo e corrigir `aspectRatio` para `260/532`

**2. Substituir módulo de câmera fake por zona de segurança (linhas 256-266)**
- Remover os 3 círculos de lente + flash
- Adicionar overlay sutil no canto superior esquerdo: retângulo arredondado com borda tracejada (`border-dashed border-foreground/15`), ícone `Camera` pequeno e texto "Câmera" em `text-[8px]`
- Dimensões: `w-[30%] h-[14%]`, posicionado `top-2 left-2`
- `pointer-events-none`, `z-20`
- Visível apenas quando há imagem (`{image && ...}`)

### Resultado
- Frame sem distorção em qualquer viewport
- Guia visual genérico que funciona para qualquer modelo de celular
- Sem manutenção por modelo

