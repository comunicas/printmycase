

## Animação de Slide Horizontal na Intro

### Mudança

**Arquivo: `src/components/customize/IntroDialog.tsx`**

Envolver o conteúdo dos slides em um container com `overflow-hidden` e usar CSS `transform: translateX()` + `transition` para animar a troca entre passos:

- Container wrapper com `overflow-hidden` e `position: relative`
- Conteúdo do slide atual recebe `transform: translateX(0)` com `transition: transform 300ms ease-out`
- Ao avançar: slide sai para a esquerda (`-100%`), novo entra da direita (`+100%`)
- Ao voltar: slide sai para a direita (`+100%`), novo entra da esquerda (`-100%`)
- Usar state `direction` (`1` ou `-1`) atualizado nos handlers de navegação para determinar a direção
- Usar `key={step}` no conteúdo para forçar re-render com a animação correta

### Resultado
- 1 arquivo editado
- Transição suave de 300ms entre slides
- Direção da animação coerente com navegação (esquerda/direita)

