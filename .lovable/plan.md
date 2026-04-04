

## Melhorar Navegação Mobile — Barra de Trigger Fixa

### Situação Atual
- A sidebar no mobile já funciona como overlay (painel deslizante com backdrop escuro)
- Já fecha automaticamente ao selecionar uma seção (`if (isMobile) toggleSidebar()`)
- O problema: a barra com o `SidebarTrigger` + "Painel Admin" rola junto com o conteúdo, dificultando a navegação

### Solução

**1 arquivo editado: `src/pages/Admin.tsx`**

Tornar a barra do trigger fixa (sticky) para que fique sempre visível no topo, mesmo ao rolar o conteúdo:

- Adicionar `sticky top-0 z-40 bg-background` na div que contém o `SidebarTrigger` + título
- Isso garante que o botão de abrir a sidebar esteja sempre acessível no mobile
- No desktop, o sticky também funciona bem (a sidebar já é fixa por padrão)

```text
Antes:
┌─ Header (sticky) ─────────────┐
│  Logo  │  Coleções │  Menu    │
├─ Trigger bar (scrolls away) ──┤
│  ☰ Painel Admin               │
├────────────────────────────────┤
│  ... conteúdo rola ...         │

Depois:
┌─ Header (sticky top-0) ───────┐
│  Logo  │  Coleções │  Menu    │
├─ Trigger bar (sticky below) ──┤
│  ☰ Painel Admin               │
├────────────────────────────────┤
│  ... conteúdo rola ...         │
│  (trigger bar sempre visível)  │
```

### Mudança específica

Na div da linha 80:
```tsx
// De:
<div className="flex items-center gap-2 border-b px-4 h-10">

// Para:
<div className="sticky top-0 z-40 flex items-center gap-2 border-b px-4 h-10 bg-background">
```

Obs: o `AppHeader` também é sticky (`sticky top-0 z-50`), então o trigger bar precisa de um `top` que considere a altura do header. Vou calcular isso com `top-[var(--header-height)]` ou um valor fixo baseado na altura do header (~56-64px).

Alternativa mais robusta: remover o `AppHeader` da página admin no mobile (já que a sidebar fornece navegação completa) e manter apenas o trigger bar sticky. Mas isso seria uma mudança maior — a abordagem com sticky na barra do trigger é suficiente e segura.

