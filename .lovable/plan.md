

## Configurar preview_css nos filtros existentes + teste

### Situação atual
Dos 7 filtros ativos, apenas "3D mascot" tem `preview_css` configurado. Os outros 6 estão com `null`.

### 1. Atualizar preview_css via SQL (dados, não schema)

Valores CSS apropriados para cada filtro:

| Filtro | preview_css |
|--------|------------|
| 3D mascot | `grayscale(1) sepia(0.8) saturate(1.5)` (já configurado, mas com vírgula errada — corrigir) |
| Cyberpunk | `hue-rotate(180deg) contrast(1.3) saturate(1.8) brightness(1.1)` |
| Pixel Art | `contrast(1.5) saturate(0.6) brightness(1.1)` |
| Cartoon | `saturate(1.6) contrast(1.2) brightness(1.05)` |
| Foto Realista | `contrast(1.1) saturate(1.1)` |
| Anime | `saturate(1.4) contrast(1.15) hue-rotate(10deg)` |
| Desenho | `grayscale(0.7) contrast(1.3) brightness(1.1)` |

### 2. Teste do long-press

Para testar a funcionalidade:
1. Navegar até `/customize/{produto}` com uma imagem carregada
2. Ir na aba "Filtros IA"
3. **Segurar** um filtro por 300ms+ → verificar se o CSS filter aparece no PhonePreview
4. **Soltar** → verificar se volta ao normal
5. **Tap curto** → verificar se abre modal de confirmação

Isso precisa ser testado manualmente na preview após configurar os valores.

### Arquivos/ações
- UPDATE em `ai_filters` para definir `preview_css` nos 7 filtros
- Teste manual na preview

