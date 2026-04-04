
## CTA "Seja um Licenciado" abaixo do mapa de lojas

### O que muda

**1 arquivo editado: `src/components/StoreLocator.tsx`**

Adicionar um bloco de CTA após o grid (mapa + lista), ainda dentro da `section#lojas`, com:

- Texto: "Torne-se um licenciado PrintMyCase e leve para sua região uma operação moderna, escalável e conectada ao varejo físico."
- Botão "Seja um Licenciado" com link para `https://wa.me/5511994824122`, abrindo em nova aba
- Estilo consistente com o design da landing: texto centralizado em `text-muted-foreground`, botão primário com ícone WhatsApp (MessageCircle do Lucide, já que não há ícone WhatsApp nativo)

### Posição no código

Após a linha 277 (fechamento do `</div>` do grid), antes do fechamento do `</div>` do `max-w-5xl`:

```tsx
{/* CTA Licenciado */}
<div className="mt-10 text-center">
  <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
    Torne-se um licenciado PrintMyCase e leve para sua região uma operação moderna, escalável e conectada ao varejo físico.
  </p>
  <a
    href="https://wa.me/5511994824122"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium px-6 py-3 rounded-full hover:bg-primary/90 transition-colors"
  >
    <MessageCircle className="w-4 h-4" />
    Seja um Licenciado
  </a>
</div>
```

Importar `MessageCircle` do Lucide (já disponível no projeto).
