
User is asking to test via browser. This is an explicit testing request, so browser tools are appropriate. But I'm in plan mode (READ-ONLY) — I cannot execute browser tools here. Need to present a plan for the test execution.

## Plano de teste E2E — `/colecoes` mobile + desktop

Vou usar o browser automation para validar as 4 mudanças aprovadas anteriormente.

### Roteiro de teste

**Mobile (390x844)**
1. `navigate_to_sandbox` → `/colecoes` com viewport 390×844
2. Screenshot inicial — verificar:
   - Hero compacto (`py-6`, h1 `text-2xl`, subtítulo oculto)
   - Tags com contagem (`Brasil · N`, `Creative · N`)
   - Tag "Todas" ausente no mobile
   - Topo do primeiro produto visível na primeira dobra
3. Scroll para ~200px → screenshot — confirmar que o FAB **ainda não apareceu**
4. Scroll para ~600px → screenshot — confirmar:
   - FAB "Criar" visível no canto inferior direito
   - CtaCard "Personalize sua capinha" renderizado na 3ª posição do grid da 1ª coleção
5. Scroll até o rodapé (perto da CTA final) → screenshot — confirmar que o **FAB sumiu** (nearBottom < 600px)
6. Verificar ausência do botão "Ver todos os X designs" no rodapé das seções (mobile)

**Desktop (1366x768)**
7. `set_viewport_size` 1366×768 (preserva sessão)
8. Screenshot — verificar que desktop manteve:
   - Hero com padding maior (`md:py-12`)
   - Tag "Todas" presente (`hidden md:inline-flex`)
   - Subtítulo visível
   - Botão "Ver todos os N designs" visível abaixo das seções (`hidden md:block`)
   - FAB ausente (`lg:hidden`)

### Saída esperada
Resumo objetivo com checklist ✅/❌ de cada um dos pontos acima + observação de qualquer regressão visual encontrada. Se encontrar bug, paro e reporto antes de propor fix.

### Sem mudanças de código
Teste puro de validação visual e comportamental.
