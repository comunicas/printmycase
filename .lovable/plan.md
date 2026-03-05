

## Redesign: Header + Hero com Parallax Dark Mode

### Visão Geral

Transformar o header e hero da landing page em uma experiência visual premium, com fundo escuro (dark), efeito parallax em uma imagem de fundo, e elementos glassmorphism -- transmitindo identidade de startup moderna.

### Proposta de Design

**Header (apenas na Landing)**
- Header transparente sobre o hero, tornando-se opaco com blur ao fazer scroll (glassmorphism)
- Logo branco/claro sobre fundo escuro
- Links e botões com texto claro, transição suave ao scrollar
- Usar `IntersectionObserver` ou scroll listener para detectar quando o hero sai da viewport e trocar o estilo do header

**Hero Section**
- Fundo escuro com gradiente radial usando as cores da marca (violeta `265 83%` para azul/magenta)
- Imagem de fundo (capinha/mockup de celular) com efeito parallax via CSS `background-attachment: fixed` ou `transform: translateY()` controlado por scroll
- Overlay com gradiente escuro para garantir legibilidade do texto
- Texto em branco com destaque em violeta/primary para palavras-chave
- Badge social proof com fundo glass (backdrop-blur + borda semitransparente)
- Botão CTA principal com glow sutil na cor primária
- Partículas ou formas geométricas sutis animadas em CSS (opcional, sem lib extra)

### Estrutura Técnica

```text
┌─────────────────────────────────────────┐
│  Header (transparent → glass on scroll) │
├─────────────────────────────────────────┤
│                                         │
│   ░░░ Background Image (parallax) ░░░  │
│   ▓▓▓ Dark gradient overlay ▓▓▓        │
│                                         │
│        Sua Case Customizada             │
│          em 1 minuto.                   │
│                                         │
│   [Criar Minha Case]  [Ver Modelos]     │
│                                         │
│   ★★★★★  1.000+ Cases criadas          │
│                                         │
└─────────────────────────────────────────┘
```

### Arquivos Alterados

1. **`src/components/AppHeader.tsx`**
   - Aceitar nova prop `variant?: "transparent" | "default"`
   - Quando `transparent`: fundo transparente, texto claro, transição para glass on scroll via state + scroll listener
   - Quando `default`: comportamento atual (usado nas demais páginas)

2. **`src/pages/Landing.tsx`**
   - Passar `variant="transparent"` ao `AppHeader`
   - Reescrever a seção Hero com:
     - Container full-viewport-height com fundo escuro + gradiente radial nas cores da marca
     - Imagem de fundo com parallax (CSS `background-attachment: fixed`)
     - Overlay gradient
     - Texto branco, highlight na palavra "Customizada" em cor primary
     - Botões com estilos claros (CTA primário com glow, outline com borda clara)
     - Badge de social proof com glass effect

3. **`src/index.css`**
   - Adicionar classes utilitárias: `.glass` (backdrop-blur + bg semitransparente), `.glow-primary` (box-shadow com cor primária), `.parallax-bg`

### Sem Dependências Extras
Tudo implementado com CSS puro (gradientes, backdrop-filter, background-attachment, box-shadow) e React state para o scroll do header. Nenhuma biblioteca adicional necessária.

