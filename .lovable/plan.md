

## Modal de Destaque para Upload na Primeira Visita

### Ideia
Em vez de apenas estilizar a área de upload dentro do preview, criar uma **modal de destaque (spotlight)** que aparece automaticamente na primeira visita — sobreposta ao preview, com foco total no upload. Após o usuário enviar a primeira imagem, a modal fecha e ele vê o editor normalmente.

### Como funciona

1. **Modal de Upload** — aparece sobre o PhonePreview quando não há imagem e é a primeira interação
   - Fundo semi-transparente escuro (spotlight effect)
   - Card central com:
     - Ícone grande de upload animado
     - "Comece enviando sua foto" (título)
     - "Sua foto, do pet, da família… nós transformamos em arte!" (subtítulo)
     - **Botão grande "Escolher foto"** que abre o file picker
     - Link secundário discreto "Ou escolha da galeria"
   - Fecha automaticamente quando o usuário faz upload ou seleciona da galeria

2. **Tab padrão muda para "Ajustes"** — em vez de abrir na galeria quando não há imagem, abre em ajustes (desabilitado visualmente) para reforçar o fluxo: upload → ajustes → filtros

### Mudanças

**1. Novo componente: `src/components/customize/UploadSpotlight.tsx`**
- Modal overlay com backdrop blur
- Botão de upload que dispara o file picker do PhonePreview
- Link "escolha da galeria" que abre o GalleryPicker
- Controlado por prop `open` / `onOpenChange`
- Aparece apenas quando: sem imagem + primeira visita (localStorage `customize_upload_seen`)

**2. `src/components/customize/ImageControls.tsx`**
- Linha 48: trocar `defaultValue={hasImage ? "ajustes" : "galeria"}` por `defaultValue="ajustes"` — sempre abre em Ajustes

**3. `src/pages/Customize.tsx`**
- Adicionar estado `showUploadSpotlight` (true se não há imagem + localStorage não tem `customize_upload_seen`)
- Renderizar `<UploadSpotlight>` passando callbacks de upload e galeria
- Marcar localStorage ao fechar

### Resultado
- 1 arquivo novo, 2 editados
- Foco total no upload na primeira visita
- Galeria deixa de ser tab padrão
- Modal fecha sozinha após upload — zero fricção extra para usuários recorrentes

