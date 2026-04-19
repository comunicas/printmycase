/**
 * Normaliza string para uso em URLs (slug).
 * Remove acentos (NFD), converte para lowercase, troca não-alfanuméricos por hífen.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
