

## Exigir aceite de termos a cada novo upload de imagem

### Problema
Atualmente o aceite é salvo no `localStorage` (`pmc_terms_accepted`) e mostrado apenas uma vez. Após aceitar, o usuário nunca mais vê os termos, mesmo em customizações futuras.

### Solução
Remover a persistência no `localStorage` e usar estado local do hook (`termsAcceptedThisSession`) que reseta a cada nova sessão de customização (cada vez que o componente monta).

### Alterações em `src/hooks/useCustomize.tsx`

1. **Linha 255**: Remover check do `localStorage` — sempre mostrar o dialog na primeira foto de cada sessão de customização
2. **Linha 264**: Remover `localStorage.setItem` — usar apenas estado local (`termsAccepted` ref/state) que vale só para aquela sessão
3. Adicionar `const termsAccepted = useRef(false)` — reseta quando o usuário entra em `/customize/...` novamente
4. `handleImageUpload`: checar `termsAccepted.current` em vez do localStorage
5. `handleTermsAccept`: setar `termsAccepted.current = true` em vez de gravar no localStorage

### Resultado
- Cada vez que o usuário entra na página de customização e envia uma foto, verá os termos
- Após aceitar naquela sessão, pode trocar a foto sem ver novamente
- Ao sair e voltar (nova customização), terá que aceitar novamente

