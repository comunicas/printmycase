

## Correção: Ícone "UserCircle" não mapeado

### Problema encontrado

A categoria "Conta e Perfil" foi inserida no banco com `icon = 'UserCircle'`, mas o `iconMap` em `KnowledgeBase.tsx` só mapeia `User` (não `UserCircle`). O ícone faz fallback para `HelpCircle`.

### Correção

Adicionar `UserCircle` ao import do lucide-react e ao `iconMap` em `KnowledgeBase.tsx`:

```typescript
import { HelpCircle, Package, Sparkles, CreditCard, User, UserCircle, Shield } from "lucide-react";

const iconMap = { HelpCircle, Package, Sparkles, CreditCard, User, UserCircle, Shield };
```

### Resultado

Todas as 5 categorias exibirão o ícone correto. Sem outros problemas detectados — console limpo, navegação funcional.

