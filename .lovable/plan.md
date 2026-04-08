

## Adicionar link "Empresas" no rodapé

### O que muda

**1 arquivo editado: `src/pages/Landing.tsx`**

Na seção "Links Úteis" do footer (linha 307), adicionar após "Política de Compra e Devolução":

```tsx
<a href="https://empresas.printmycase.com.br/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors w-fit">Empresas</a>
```

Usa `<a>` em vez de `<Link>` por ser um domínio externo.

