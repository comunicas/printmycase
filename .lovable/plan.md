

# Adicionar logo ArtisCase nas páginas de Login e Signup

## O que será feito
Adicionar o logo ArtisCase centralizado acima do formulário nas páginas de Login e Signup, dando uma identidade visual mais forte às telas de autenticação. O logo no header (via AppHeader) já existe — este logo extra ficará dentro da área do formulário, acima do título.

## Arquivos afetados (2 arquivos)

### 1. `src/pages/Login.tsx`
- Importar o logo de `src/assets/logo-artiscase.png`
- Adicionar `<img>` centralizado acima do título "Entrar", com ~48px de altura

### 2. `src/pages/Signup.tsx`
- Mesma alteração: importar logo e exibir acima do título "Criar conta"
- Aplicar também na tela de confirmação de email

## Resultado visual
```text
[====== AppHeader com logo ======]

        [logo ArtisCase 48px]
            Entrar
   Acesse sua conta para continuar
   [    Entrar com Google     ]
            — ou —
   [        email            ]
   [        senha            ]
   [        Entrar           ]
```

