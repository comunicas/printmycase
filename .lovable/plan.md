

## Melhorar UX do Card de Pedidos + Imagem Posição + Screenshot da Customização

### Problemas Identificados

1. **Label "Final" confuso** — deve ser renomeado para "Imagem Posição" (é o render da imagem posicionada no frame)
2. **Falta screenshot visual da customização** — o admin não vê como ficou a capinha no celular; apenas a imagem cortada. Precisamos salvar um "print" da página de customização (imagem com o mockup do celular) e disponibilizar para visualização e download
3. **Card de pedido pode melhorar** — adicionar informações do cliente (endereço resumido), melhorar layout das imagens com tamanhos maiores e botão de download

### Mudanças

**1. `src/components/admin/OrderImagesPreviewer.tsx`**
- Renomear label "Final" para "Imagem Posição"
- Adicionar 4a imagem: "Preview" (screenshot da capinha no mockup) — campo `preview_image_url` do `customization_data`
- Aumentar thumbnails de 56x80 para 64x96 para melhor visualização
- Adicionar botão de download em cada imagem no lightbox (além do link de nova aba já existente)
- No lightbox, mostrar a imagem maior com botão "Baixar" explícito

**2. `src/components/admin/OrdersManager.tsx`**
- Mostrar endereço resumido do cliente (cidade/estado do `shipping_address`)
- Mostrar nome do cliente (buscar do perfil via `user_id`)
- Layout mais organizado com seções claras

**3. `src/hooks/useCustomize.tsx` (handleContinue)**
- Após o `renderSnapshot`, gerar um segundo render que inclui o mockup do celular (o frame + a imagem posicionada) — uma "preview image"
- Upload como `pending_preview_{ts}.png` no storage
- Salvar o path como `preview_image_url` no `customization_data` do pending checkout

**4. `src/pages/Checkout.tsx` (handleCheckout)**
- Gerar o mesmo preview com mockup e fazer upload como `preview_{ts}.png`
- Incluir `preview_image_url` no payload do `create-checkout`

**5. `src/lib/image-utils.ts`**
- Nova função `renderPreviewWithMockup(imgSrc, deviceImage, scale, position, rotation)` que renderiza a imagem posicionada dentro de um frame visual do celular — simulando o que o usuário vê no `PhonePreview`
- Retorna um data URL PNG com a capinha completa

### Detalhes Técnicos

- A "Imagem Posição" já existe (é o `edited_image_url` / `renderSnapshot`) — apenas renomear o label
- O "Preview" é uma nova imagem que inclui o mockup do dispositivo como frame visual, criada via canvas
- A imagem do dispositivo (`device_image`) já está disponível no produto e é passada ao checkout
- No `OrderImagesPreviewer`, o campo `preview_image_url` será lido do `customization_data` JSON
- Download implementado com `<a download>` no lightbox
- Endereço do cliente vem do campo `shipping_address` (JSONB) já presente no order — sem queries adicionais

### Resultado
- 5 arquivos editados
- Admin vê 4 imagens: Original, Otimizada, Imagem Posição, Preview (mockup)
- Cada imagem com download direto
- Informações do cliente visíveis no card
- Labels claros e intuitivos

