# Ajuste: fundo branco na Safe Zone da câmera

## Objetivo
Mudar o fundo do overlay da "Safe zone da câmera" de cinza escuro translúcido (atual `bg-foreground/40`) para **branco translúcido**, mantendo a borda exatamente como está. Aplicar para todos os modelos (a definição é única e compartilhada por todos os presets de device).

## Mudanças

### 1. `src/components/PhonePreview.tsx` (linha ~298)
No `<div>` do overlay da safe zone:
- Remover a classe `bg-foreground/40`.
- Adicionar `backgroundColor: "rgba(255, 255, 255, 0.55)"` no objeto `style` (translúcido para ainda permitir leve visualização da imagem por baixo, mantendo aspecto branco claro).
- Manter `border border-foreground`, `borderColor: "hsl(var(--foreground))"` e todos os demais valores (radius, posição, dimensões) inalterados.

### 2. `src/pages/AdminSafeZonePreview.tsx` (preview admin em nova aba)
Aplicar a mesma mudança para consistência:
- Remover `bg-foreground/20` da classe.
- Adicionar `backgroundColor: "rgba(255, 255, 255, 0.55)"` no `style`.
- Manter borda inalterada.

## Observações
- A mudança é puramente visual e aplica-se automaticamente a todos os modelos (iPhone 12/15/17 Pro/Pro Max/Air, Redmi Note 14 Pro, Poco X6 Pro), pois o overlay é único e usa os presets compartilhados.
- O toggle "Safe zone da câmera" continua funcionando como antes (mostrar/ocultar).
