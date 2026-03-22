

## Redesenhar seção "Como funciona" — inspirado na referência

### Análise da referência vs. atual

**Referência (imagem enviada):**
- 4 passos horizontais (4 colunas)
- Badges numerados em círculo colorido (teal/cyan)
- Títulos em uppercase bold
- Descrições curtas abaixo
- Ilustrações line-art grandes abaixo do texto (smartphone, capa, câmera, caminhão)
- CTA centralizado no final
- Fundo limpo, sem cards

**Atual:**
- 3 passos com grid 5 colunas (3 cards + 2 separadores chevron)
- Ícones Lucide pequenos dentro de círculos gradient
- Cards com background `bg-muted/30`
- Conectores dashed entre passos (visíveis só em desktop)

### Minha opinião

A referência é mais intuitiva por 3 motivos:
1. **Ilustrações grandes** tornam cada passo visualmente auto-explicativo — o usuário entende antes de ler
2. **Layout mais limpo** sem cards/backgrounds reduz ruído visual
3. **4 passos** detalham melhor o fluxo (escolher modelo → selecionar capa → enviar foto → receber)

Porém, recomendo **manter 3 passos** por consistência com o fluxo real da PrintMyCase (não temos etapa separada de "selecionar capa/material") e para evitar confusão. Os 3 passos atuais mapeiam exatamente o funil: modelo → foto com IA → entrega.

### Plano de implementação

**Mudanças no `Landing.tsx` — seção "Como funciona":**

1. **Remover cards** com background — usar layout aberto e limpo
2. **Aumentar ícones** — trocar de 14x14 para ilustrações maiores (ícones Lucide ~48px dentro de containers ~80px, com stroke fino para simular line-art)
3. **Badges numerados** no topo de cada passo (círculo primary com número)
4. **Títulos uppercase** em `font-bold tracking-wide`
5. **Separadores** entre passos: trocar chevrons dashed por linha com seta, ou remover (referência não tem)
6. **Grid simplificado**: `grid-cols-1 md:grid-cols-3` sem colunas de separadores
7. **CTA "Criar Minha Capinha"** centralizado abaixo dos passos (como na referência)
8. **Ícones line-art**: usar `strokeWidth={1}` ou `strokeWidth={1.5}` nos ícones Lucide para visual mais leve

**Sem novos assets** — uso dos ícones Lucide existentes (Smartphone, Upload/Camera, Package/Truck) com estilo line-art.

### Arquivo afetado
- `src/pages/Landing.tsx` — seção "Como funciona" (linhas 121-150) + constantes `steps`/`stepColors`

