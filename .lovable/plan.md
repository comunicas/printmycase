
## Cache Headers para Assets Estáticos

### Análise

O audit aponta 572KB economizáveis aplicando `Cache-Control: max-age=31536000, immutable` nos assets `/assets/*` (JS/CSS/imagens com hash do Vite).

**Limitação importante**: Lovable hospeda o app em sua própria infraestrutura. **Não há acesso direto à configuração do servidor HTTP** (sem `vercel.json`, `netlify.toml`, `_headers`, nginx config, etc. — esses arquivos são ignorados pela hospedagem Lovable).

### Verificação

Vou confirmar checando se existe algum arquivo de configuração de hosting já presente no projeto e como os assets são servidos atualmente.

### Conclusão esperada

Como a hospedagem Lovable controla os headers HTTP e não expõe configuração customizável ao usuário, **esta otimização não pode ser implementada via código do projeto**. Os assets `/assets/*` do Vite já têm hash no nome (cache-busting seguro), então o ideal seria que a plataforma já enviasse `immutable` — mas isso depende do provedor.

### Recomendação

1. **No domínio customizado** (`studio.printmycase.com.br`): se estiver atrás de Cloudflare ou similar, criar uma Page Rule / Cache Rule para `/assets/*` com `Edge Cache TTL: 1 year` e `Browser Cache TTL: 1 year`. Isso é feito **no painel do Cloudflare**, não no código.

2. **Alternativa via Service Worker**: implementar um SW com estratégia `CacheFirst` para `/assets/*`. Funciona em qualquer hosting mas adiciona complexidade (registro, atualização, invalidação) e pode interferir em deploys. **Não recomendo** para este caso.

3. **Aceitar como limitação** documentada (similar às outras em `mem://constraints/seo-performance-limitations`).

### Próximo passo

Vou apresentar isto como análise — sem mudanças de código —, pois qualquer tentativa de adicionar `_headers`, `vercel.json` ou `netlify.toml` no repo seria código morto na hospedagem Lovable, e um Service Worker seria desproporcional ao ganho (e arriscado para o fluxo de checkout/auth).

**Recomendo**: configurar a regra de cache no Cloudflare do domínio `studio.printmycase.com.br` (se aplicável) e adicionar esta limitação à memória de constraints de SEO.
