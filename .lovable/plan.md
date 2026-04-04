

## Debug do Estado Atual + Plano de Redesign do Admin

### Problemas Identificados

**Estrutura atual — 10 tabs de primeiro nível + sub-tabs aninhadas:**

```text
┌─ TabsList (10 items, flex-wrap) ──────────────────────────┐
│ Produtos │ Pedidos │ Usuários │ Coleções │ Base Conhec.  │
│ Solicitações │ Filtros IA │ Moedas │ Galeria │ Legal      │
└───────────────────────────────────────────────────────────┘
         ↓ (4 tabs têm sub-tabs)
   Coleções → [Coleções, Designs]
   KB → [Categorias, Artigos, FAQ]
   Filtros IA → [Filtros, Categorias]
   Moedas → [Transações, Pacotes]
   Galeria → [Ilustrativas, Gerações, Custom, Gerações Usuários]
```

**Problemas:**
1. 10 tabs quebrando em 2 linhas — difícil escanear e encontrar o que precisa
2. Sub-tabs aninhadas criam confusão de contexto (tabs dentro de tabs)
3. Não há agrupamento lógico visual — itens relacionados ficam distantes
4. Console warnings: `Pagination` e `ConfirmDialog` em `ModelRequestsManager` não usam `forwardRef`
5. Botão "Otimizar Imagens" solto no header sem contexto

### Plano de Redesign: Sidebar com Grupos

Substituir o layout atual de tabs horizontais por uma **sidebar lateral** usando o componente Shadcn Sidebar, com grupos lógicos colapsáveis.

**Nova organização:**

```text
┌──────────────────┬──────────────────────────────┐
│  SIDEBAR         │  CONTEÚDO                    │
│                  │                              │
│  OPERAÇÕES       │                              │
│  ├ Pedidos       │  (manager ativo)             │
│  ├ Usuários      │                              │
│  └ Solicitações  │                              │
│                  │                              │
│  CATÁLOGO        │                              │
│  ├ Produtos      │                              │
│  ├ Coleções      │                              │
│  └ Designs       │                              │
│                  │                              │
│  IA & GALERIA    │                              │
│  ├ Filtros IA    │                              │
│  ├ Categorias IA │                              │
│  ├ Ilustrativas  │                              │
│  ├ Galerias      │                              │
│  ├ Gerações IA   │                              │
│  └ Gerações Usu. │                              │
│                  │                              │
│  FINANCEIRO      │                              │
│  ├ Transações    │                              │
│  └ Pacotes       │                              │
│                  │                              │
│  CONTEÚDO        │                              │
│  ├ KB Categorias │                              │
│  ├ KB Artigos    │                              │
│  ├ FAQ Home      │                              │
│  └ Legal         │                              │
│                  │                              │
│  ⚡ Otimizar     │                              │
└──────────────────┴──────────────────────────────┘
```

**Benefícios:**
- Elimina tabs aninhadas — cada item é um link direto
- Grupos lógicos claros com labels
- Sidebar colapsável (modo ícone) para mais espaço
- Todos os 18 managers acessíveis em 1 clique (sem sub-tabs)
- Botão "Otimizar Imagens" fica na sidebar como ação utilitária

### Arquivos

1. **Criar** `src/components/admin/AdminSidebar.tsx` — sidebar com grupos e itens de navegação
2. **Reescrever** `src/pages/Admin.tsx` — substituir Tabs por SidebarProvider + state `activeSection` que renderiza o manager correspondente
3. **Corrigir** `src/components/admin/Pagination.tsx` — adicionar `forwardRef` para eliminar warning do console
4. **Corrigir** `src/components/admin/ConfirmDialog.tsx` — adicionar `forwardRef` para eliminar warning do console

### Detalhes técnicos
- Usar `useState("orders")` para controlar a seção ativa (sem rotas — manter single-page)
- Sidebar com `collapsible="icon"` para modo mini com ícones
- Grupos usam `SidebarGroup` + `SidebarGroupLabel` com `defaultOpen`
- Cada `SidebarMenuButton` seta o `activeSection` via `onClick`
- Renderização condicional no painel principal com switch/map simples
- Manter `max-w-5xl` no conteúdo principal para consistência

