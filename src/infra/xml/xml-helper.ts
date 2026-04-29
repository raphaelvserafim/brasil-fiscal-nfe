/**
 * Helper para construir XML sem dependencias externas.
 * Gera strings XML validas com escape de caracteres especiais.
 */

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function tag(name: string, value: string | number | undefined, attrs?: string): string {
  if (value === undefined || value === null || value === '') return '';
  const escaped = typeof value === 'string' ? escapeXml(value) : String(value);
  const attrStr = attrs ? ` ${attrs}` : '';
  return `<${name}${attrStr}>${escaped}</${name}>`;
}

export function tagGroup(name: string, content: string, attrs?: string): string {
  if (!content) return '';
  const attrStr = attrs ? ` ${attrs}` : '';
  return `<${name}${attrStr}>${content}</${name}>`;
}

export function formatNumber(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

export function formatDate(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, '-03:00');
}

export function padLeft(value: number | string, length: number): string {
  return String(value).padStart(length, '0');
}
