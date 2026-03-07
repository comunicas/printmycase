

## Revisar sistema de notificações (toasts)

### Situação atual

O `ToastViewport` está posicionado:
- **Mobile**: topo da tela (centralizado)
- **Desktop (sm+)**: canto inferior direito (`sm:bottom-0 sm:right-0 sm:top-auto md:max-w-[420px]`)

Esse é o posicionamento padrão do shadcn/radix toast. O screenshot mostra o toast vermelho "Resolução muito baixa" aparecendo no canto inferior direito no desktop.

### Toasts e feedbacks existentes na aplicação

| Contexto | Mensagem | Variante |
|----------|----------|----------|
| **Customize** | "Resolução muito baixa" | destructive |
| **Customize** | "Resolução baixa" | default |
| **Customize** | "Imagem otimizada automaticamente" | default |
| **Customize** | "Rascunho restaurado" | default |
| **Customize** | "Imagem muito pequena" (filtros IA) | destructive |
| **Customize** | "Erro ao aplicar filtro" | destructive |
| **Customize** | "Moedas insuficientes" | destructive |
| **Checkout** | "Customização não encontrada" | destructive |
| **Checkout** | "Erro no checkout" | destructive |
| **Profile** | "Perfil atualizado!" | default |
| **Profile** | "Senha alterada!" | default |
| **Profile** | "Link copiado!" | default |
| **Profile** | Erros de validação | destructive |
| **Login/Signup** | Erros de autenticação | destructive |
| **Admin** | "Configurações salvas!" | default |
| **Admin** | Erros diversos | destructive |
| **RequestModel** | Erro/sucesso ao enviar | mixed |

### Proposta

Alterar o `ToastViewport` para ficar **centralizado no topo** em todas as resoluções, removendo o posicionamento inferior direito do desktop. Isso alinha com o padrão mobile-first da aplicação e mantém consistência visual.

**Arquivo**: `src/components/ui/toast.tsx` (linha 17)

**De:**
```
fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]
```

**Para:**
```
fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 md:max-w-[480px] md:left-1/2 md:-translate-x-1/2
```

Isso centraliza o toast no topo da tela em todos os breakpoints, com largura máxima contida.

