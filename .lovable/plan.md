

## Corrigir Sidebar Aparecendo Abaixo do Header

### Problema
O `SidebarProvider` envolve apenas o conteúdo abaixo do `AppHeader`. Como o componente `Sidebar` usa posicionamento fixo/sticky relativo ao seu provider, ele começa abaixo do header em vez de ocupar a altura total da viewport.

### Solução

**1 arquivo editado: `src/pages/Admin.tsx`**

Mover o `SidebarProvider` para envolver tudo (incluindo o header), e ajustar o layout para que o header fique em cima (full-width) e o flex com sidebar + conteúdo fique abaixo:

```tsx
return (
  <SidebarProvider>
    <div className="min-h-screen bg-background flex w-full">
      <AdminSidebar ... />
      <div className="flex-1 flex flex-col min-h-screen">
        <AppHeader breadcrumbs={[{ label: "Admin" }]} />
        <div className="flex items-center gap-2 border-b px-4 h-10">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold">Painel Admin</h1>
        </div>
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-5 py-6">
            <ActiveManager />
          </div>
        </main>
      </div>
    </div>
  </SidebarProvider>
);
```

A mudança principal: `SidebarProvider` envolve tudo, a `Sidebar` fica como irmã direta do conteúdo principal dentro do flex container, e o `AppHeader` fica dentro da coluna de conteúdo (não acima do provider). Isso faz a sidebar ocupar a altura total da tela, alinhada ao topo.

