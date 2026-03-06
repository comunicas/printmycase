

## Trocar imagem do hero e ajustar textos

### Mudanças

1. **Copiar imagem** — `user-uploads://b7c4fa2c-a5a2-426e-be7e-e3afc87a5bc5.png` → `src/assets/hero-bg.jpg` (sobrescreve a atual)

2. **Ajustar headline e copy** em `src/pages/Landing.tsx` (linhas 69-76):
   - **Headline**: "Sua foto vira uma case **ÚNICA**." — mais direto, reforça personalização
   - **Copy**: "Envie sua imagem, escolha um estilo e receba uma capinha exclusiva com impressão profissional." — descreve o processo de forma clara e objetiva

Nenhuma outra alteração de código necessária — o componente já importa `heroBg` desse caminho.

