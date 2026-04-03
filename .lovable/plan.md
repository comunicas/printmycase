

## Reforçar CTA de Upload na Primeira Interação

### Situação Atual
Quando o usuário entra sem imagem, o PhonePreview mostra apenas um ícone discreto com "Envie sua foto" e a resolução recomendada — pouco chamativo e sem explicar que é a **foto dele**.

### Mudança

**Arquivo: `src/components/PhonePreview.tsx`** (linhas 247-275)

Melhorar o estado vazio (sem imagem) para ser mais convidativo e claro:

1. **Título mais direto**: trocar "Envie sua foto" por **"Envie sua foto aqui"** com texto de apoio **"Use uma foto sua, do pet, da família… a criatividade é sua!"**
2. **Animação de atenção**: adicionar uma pulsação sutil (`animate-pulse`) no ícone para atrair o olhar na primeira visita
3. **Botão de upload mais visível**: transformar a área clicável em um botão com borda tracejada e fundo mais destacado, estilo dropzone
4. **Remover resolução recomendada** do estado inicial (informação técnica que confunde) — mover para após o upload

### Resultado
- 1 arquivo editado
- Usuário entende imediatamente que deve enviar uma foto pessoal
- CTA mais visível e convidativo

