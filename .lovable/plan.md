

## Simplificar a imagem Final — print de referência para produção

### Abordagem
Concordo — o objetivo da imagem "Final" é servir como **referência visual de posicionamento** para a produção da case, não um mockup realista. A solução mais prática é renderizar apenas a área da "tela" do celular (sem frame/borda) com a imagem posicionada exatamente como o usuário escolheu. Isso gera uma imagem limpa e direta que mostra o enquadramento correto.

### Mudança em `src/lib/image-utils.ts`

Simplificar `renderSnapshot`:
- **Canvas**: Usar apenas `PHONE_W × PHONE_H` (260×532) — sem frame, sem borda
- **Fundo**: Branco sólido para clareza
- **Imagem**: Manter a lógica de posicionamento CSS (oversize, bgSize, position%) que já está correta
- **Rotação**: Manter se aplicável
- **Remover**: Constantes `FRAME_BORDER`, `FRAME_RADIUS`, `FRAME_COLOR`, `SCREEN_BG` e todo o código de desenho do frame
- **Output**: PNG para qualidade

Resultado: uma imagem retangular simples mostrando exatamente o recorte/posição que o usuário definiu, perfeita como guia de produção.

### Arquivo
- `src/lib/image-utils.ts` — simplificar `renderSnapshot`

