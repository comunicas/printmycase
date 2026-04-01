

## Intro Dialog — Slide de Boas-Vindas + Ilustrações SVG Inline

### Mudanças

**Arquivo: `src/components/customize/IntroDialog.tsx`**

1. **Novo slide 0 — Boas-vindas ao Studio PrintMyCase**
   - Logo do Studio (`/logo-printmycase-sm.webp`) + título "Bem-vindo ao Studio PrintMyCase"
   - Descrição: "Crie sua capinha personalizada em poucos passos"
   - Fundo com gradiente sutil da marca

2. **Substituir ícones Lucide por SVGs ilustrativos inline** em cada slide:
   - **Slide 1 (Upload)**: Ilustração SVG de mão segurando celular com seta de upload
   - **Slide 2 (Ajustar)**: SVG de celular com imagem sendo arrastada/redimensionada (setas de movimento)
   - **Slide 3 (Filtros IA)**: SVG de imagem com varinha mágica/estrelas de transformação
   - **Slide 4 (Galeria)**: SVG de grid de thumbnails com cursor selecionando uma
   - **Slide 5 (Compra)**: SVG de capinha finalizada com checkmark/carrinho

3. **Ajustes visuais**: Aumentar a área da ilustração para ~120x120px, manter o layout compacto do modal

### Detalhes técnicos
- Cada SVG é um componente React inline (sem arquivos externos)
- O slide de boas-vindas usa `<img src="/logo-printmycase-sm.webp">` já disponível em `/public/`
- Array `steps` passa de 5 para 6 itens; campo `illustration` substitui `icon`
- 1 arquivo editado

