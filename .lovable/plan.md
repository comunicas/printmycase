

## Corrigir Tratamento de Erro no Checkout

### Problema
O `handleCheckout` em `Checkout.tsx` tem acesso inseguro a `err.message` no `catch` (linha 216), e não protege contra falha de `fetch` em URLs de imagem expiradas. Isso causou o erro de script que impediu o usuário de finalizar a compra da Capa Galaxy A15.

### Correções

**Arquivo: `src/pages/Checkout.tsx`**

**1. Proteger `err.message` no catch (linha 214-216)**
```typescript
// De:
} catch (err: any) {
  console.error("Checkout error:", err?.message);
  toast({ title: "Erro no checkout", description: err.message || "Tente novamente.", variant: "destructive" });

// Para:
} catch (err: any) {
  const msg = err?.message || "Tente novamente.";
  console.error("Checkout error:", msg);
  toast({ title: "Erro no checkout", description: msg, variant: "destructive" });
```

**2. Proteger upload de imagens com try/catch individual (linhas 146-171)**
Envolver cada bloco de upload em try/catch para dar mensagem específica ao usuário se uma imagem falhar, ao invés de crash genérico.

**3. Adicionar timeout no fetch de imagem**
Os `fetch(customization.image)` podem travar se a URL expirou. Adicionar `AbortController` com timeout de 15s.

### Resultado
- 1 arquivo modificado
- Checkout resiliente a erros de upload/rede
- Mensagens de erro claras ao usuário

