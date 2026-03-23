

## Adicionar toast de confirmação no download

### Alteração

**`src/components/customize/ContinueBar.tsx`**

- Importar `toast` de `@/hooks/use-toast`
- No `handleDownload`, após chamar `onDownload()`, disparar toast de sucesso:
  ```
  toast({ title: "Imagem baixada", description: "A imagem foi salva com sucesso." })
  ```

### Arquivo afetado
- `src/components/customize/ContinueBar.tsx` — 2 linhas (import + chamada no handler)

