

## Plano: Tornar avisos de resolução minimalistas

### Problema
O toast de "Resolução muito baixa" usa `variant: "destructive"` — fundo vermelho grande e chamativo — quebrando o minimalismo da tela.

### Solução
Em `src/pages/Customize.tsx`, remover o `variant: "destructive"` do toast de resolução baixa, mantendo apenas o toast padrão (neutro) para ambos os casos. O badge "Baixa" no PhonePreview já comunica visualmente o problema.

### Alteração

**`src/pages/Customize.tsx` (linha 175)**:
- Trocar `variant: "destructive"` por nenhum variant (toast padrão neutro)
- Simplificar a mensagem para ser mais discreta

```typescript
// Antes
toast({ title: "Resolução muito baixa", description: `Sua imagem tem ${w}×${h}px. Para boa qualidade, envie no mínimo 827×1772px.`, variant: "destructive" });

// Depois
toast({ title: "Resolução baixa", description: `${w}×${h}px — recomendado 827×1772px.` });
```

