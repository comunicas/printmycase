

## Disponibilizar imagens de customização nos cards de pedidos (Admin)

### Contexto

Cada pedido armazena em `customization_data` (JSON) os campos `original_image_url` e `edited_image_url` — que são **paths** no bucket `customizations` (ex: `userId/original_123.jpg`, `userId/edited_123.jpg`). Atualmente o card do admin não exibe essas imagens.

### Plano

**1. Criar componente `OrderImagesPreviewer`**

Novo componente em `src/components/admin/OrderImagesPreviewer.tsx` que:
- Recebe `customizationData: Record<string, any> | null`
- Extrai `original_image_url` e `edited_image_url` (paths)
- Gera signed URLs via `supabase.storage.from("customizations").createSignedUrl(path, 3600)`
- Exibe 3 thumbnails lado a lado com labels:
  - **Original** — imagem original enviada pelo usuário
  - **Editada** — imagem após ajustes/filtros IA
  - **Preview** — imagem editada renderizada dentro de um frame de celular (usando as dimensões `PHONE_W`/`PHONE_H` de `customize-types.ts`)
- Cada thumbnail é clicável e abre um Dialog com a imagem em tamanho maior
- Inclui botão de link externo para abrir a signed URL em nova aba
- Mostra skeleton/placeholder enquanto carrega as URLs

**2. Integrar no card de pedidos em `Admin.tsx`**

- Na seção de orders (linhas 363-418), adicionar `<OrderImagesPreviewer customizationData={order.customization_data} />` dentro de cada card, abaixo do header e acima do tracking input
- Tipar `customization_data` no `DbOrder` interface (já existe como `Json | null` na tabela)
- Adicionar `customization_data` ao select de orders no `fetchOrders`

**3. Preview com frame do celular**

- Reutilizar a lógica de `renderSnapshot` de `src/lib/image-utils.ts` para gerar o preview com frame
- Extrair `scale`, `position`, `rotation` do `customization_data` para renderizar fielmente
- Exibir o resultado dentro de um container com borda arredondada simulando o dispositivo

### Dados necessários do `customization_data`

```json
{
  "scale": 100,
  "rotation": 0,
  "position": { "x": 50, "y": 50 },
  "activeFilter": null,
  "original_image_url": "userId/original_123.jpg",  // path no bucket
  "edited_image_url": "userId/edited_123.jpg"        // path no bucket
}
```

### Arquivos modificados/criados

| Arquivo | Ação |
|---------|------|
| `src/components/admin/OrderImagesPreviewer.tsx` | Criar |
| `src/pages/Admin.tsx` | Adicionar campo `customization_data` ao DbOrder e integrar componente |

