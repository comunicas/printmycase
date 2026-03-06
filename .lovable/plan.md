

## Animação de snap ao soltar o dedo

### O que muda

Quando o usuário solta o dedo após arrastar a imagem, a camada de imagem faz uma transição suave (ease-out) em vez de parar abruptamente. Isso dá uma sensação de "snap" polida.

### Implementação

**src/components/PhonePreview.tsx**:

1. Adicionar estado `isSnapping` (boolean) — controla se a transição CSS está ativa na camada da imagem.

2. Quando `isDragging` muda de `true` para `false` (soltar o dedo):
   - Setar `isSnapping = true`
   - Após 200ms (duração da transição), setar `isSnapping = false`

3. Na `div` da imagem (linha 165-168), adicionar `transition: background-position 0.2s ease-out` condicionalmente quando `isSnapping` é `true`. Importante: **não** aplicar durante o drag, senão o movimento fica com lag.

```tsx
// Estado
const [isSnapping, setIsSnapping] = useState(false);

// Detectar fim do drag
useEffect(() => {
  if (!isDragging && image) {
    setIsSnapping(true);
    const t = setTimeout(() => setIsSnapping(false), 200);
    return () => clearTimeout(t);
  }
}, [isDragging, image]);

// Na div da imagem, adicionar ao style:
style={{
  ...imageLayerStyle,
  transition: isSnapping ? 'background-position 0.2s ease-out' : 'none',
}}
```

Isso cria um efeito sutil de desaceleração natural ao soltar, sem afetar a responsividade durante o arraste.

