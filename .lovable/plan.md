

## Diagnóstico

O problema está na função `extractBrand` em `src/lib/utils.ts`. A regex para Motorola é `\bmoto\b` que exige "moto" como palavra isolada. Os nomes dos produtos usam "Motorola" (ex: "Capa Motorola G54"), onde "moto" não é uma palavra completa -- faz parte de "Motorola". Por isso a regex não encontra correspondência e os produtos são classificados como "Outro" em vez de "Motorola".

## Correção

Alterar a regex de `\bmoto\b` para `\b(motorola|moto)\b` no arquivo `src/lib/utils.ts` (linha 10). Isso faz match tanto com "Motorola" quanto com "Moto" (usado em nomes como "Moto G").

Alteração de uma única linha, sem efeitos colaterais.

