

## Remover FAQs Duplicados

### Duplicados identificados (5 pares)

| Pergunta | Manter (ID) | Motivo | Remover (ID) |
|---|---|---|---|
| De que material é feita a case? | c8bc55d5 | featured + kb_article_id | a89cdb79 |
| Qual a qualidade da impressão? | fed798bb | sort_order 1, original | 2c79af63 |
| O que é a tecnologia PrintMyCase? | 2d0c6e6f | featured + kb_article_id | 99464719 |
| A impressão desbota com o tempo? | f9275bf7 | sort_order 3, original | 43eec994 |
| Posso enviar qualquer imagem? | f97bd43e | resposta mais completa | e2f4e663 |
| Qual o prazo de produção e entrega? | fca11a71 | featured + kb_article_id | aa628dac |

### Implementação

Uma única operação DELETE para remover os 6 registros duplicados:

```sql
DELETE FROM faqs WHERE id IN (
  'a89cdb79-2928-4432-86fe-28d61dd32c4d',
  '2c79af63-bf0a-41fa-bd5e-29889f198ee0',
  '99464719-ff8c-4691-8a49-955d4383787f',
  '43eec994-cb9c-49ae-8a4c-6d2326f0e652',
  'e2f4e663-ab7f-4d5c-bd48-04a2fa3d7dc0',
  'aa628dac-3571-4a9d-8b5d-6bdb93a15093'
);
```

Após a remoção, reordenar os `sort_order` para manter sequência contínua. Nenhuma alteração de código necessária.

