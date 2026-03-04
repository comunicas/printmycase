

# Ajuste de Terminologia: Case / Capa / Capinha

Aplicar as regras de copy em toda a aplicação:

- **Case** → branding (hero, títulos de marca)
- **Capa** → produto/descrição (SEO, specs, labels)
- **Capinha** → comunicação leve/marketing (depoimentos, CTAs informais)

## Mudanças por arquivo

### Landing.tsx
| De | Para | Contexto |
|---|---|---|
| "Sua capa, sua identidade." | "Sua Case, sua identidade." | Hero (branding) |
| "capas de celular únicas" | "capinhas únicas" | Subtítulo (marketing leve) |
| "Criar Minha Capa" | "Criar Minha Case" | CTA principal (branding) |
| "Mais de 1.000 capas criadas" | "Mais de 1.000 cases criadas" | Social proof (branding) |
| "Cada capa é única como você" | "Cada capa é única como você" | Benefício (produto) — **manter** |
| "Pronto para criar sua capa única?" | "Pronto para criar sua Case?" | CTA final (branding) |
| "receba uma capa exclusiva" | "receba sua capinha exclusiva" | Texto leve (marketing) |
| Testimonial Ana: "Melhor capa que já tive" | "Melhor capinha que já tive" | Comunicação casual |

### SeoHead.tsx
| De | Para |
|---|---|
| "Capas Personalizadas para Celular" | "Capas Personalizadas para Celular" | **manter** (SEO = "capa") |
| "Crie capas de celular personalizadas" | **manter** (SEO) |
| "Capas para Celular" (JSON-LD) | **manter** |

### Catalog.tsx
| De | Para |
|---|---|
| "{n} capas disponíveis" | **manter** (produto/descrição) |

### ProductInfo.tsx
| De | Para |
|---|---|
| "Customizar Minha Capa" | "Customizar Minha Case" | CTA branding |

### Customize.tsx
| De | Para |
|---|---|
| `.replace("Capa ", "")` | **manter** (lógica de parsing) |

### Checkout.tsx
| De | Para |
|---|---|
| "personalize sua capa" | "personalize sua capinha" | Comunicação leve |

### Email templates (6 arquivos)
| De | Para |
|---|---|
| "ArtisCase — Capas personalizadas" | "ArtisCase — Cases personalizadas" | Brand tagline |
| signup: "personalizar sua capa" | "personalizar sua capinha" | Marketing |

### PhonePreview.tsx
Sem texto de copy com "capa" — sem mudanças.

### Orders.tsx / CheckoutSuccess.tsx
Sem ocorrências de "capa" em copy — sem mudanças.

## Arquivos afetados

| Arquivo | Tipo |
|---|---|
| `src/pages/Landing.tsx` | Editar |
| `src/components/ProductInfo.tsx` | Editar |
| `src/pages/Checkout.tsx` | Editar |
| `supabase/functions/_shared/email-templates/signup.tsx` | Editar |
| `supabase/functions/_shared/email-templates/recovery.tsx` | Editar |
| `supabase/functions/_shared/email-templates/email-change.tsx` | Editar |
| `supabase/functions/_shared/email-templates/reauthentication.tsx` | Editar |
| `supabase/functions/_shared/email-templates/invite.tsx` | Editar |
| `supabase/functions/_shared/email-templates/magic-link.tsx` | Editar |

