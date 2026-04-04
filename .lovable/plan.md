

## Lazy Loading para Embeds do Instagram

### O que muda

**1 arquivo editado: `src/components/InstagramShowcase.tsx`**

Usar `IntersectionObserver` na seção inteira para adiar o carregamento dos embeds até que o usuário role até ela.

### Implementação

- Adicionar um estado `inView` (booleano, inicia `false`) no `InstagramShowcase`
- Observar a `section` com `IntersectionObserver` (rootMargin `200px` para iniciar antes de aparecer)
- Renderizar os `InstaEmbed` apenas quando `inView === true`; antes disso, mostrar placeholders com altura fixa (~480px) e fundo `bg-muted/30` animado
- Observer desconecta após primeira interseção (one-shot)
- Reutilizar o hook `useScrollAnimation` existente no projeto ou implementar inline para manter o componente auto-contido

### Resultado
- Os iframes do Instagram (pesados, ~1MB cada) só carregam quando o usuário se aproxima da seção
- Melhora LCP e tempo de carregamento inicial da landing page
- Sem mudança visual — o conteúdo aparece igual ao entrar no viewport

