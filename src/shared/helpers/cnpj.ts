/**
 * Valida um CNPJ (14 digitos, sem formatacao).
 */
export function isValidCnpj(cnpj: string): boolean {
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calc = (digits: string, weights: number[]): number => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += parseInt(digits[i]) * weights[i];
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const d1 = calc(cnpj, w1);
  const d2 = calc(cnpj, w2);

  return parseInt(cnpj[12]) === d1 && parseInt(cnpj[13]) === d2;
}

/**
 * Formata um CNPJ: 11222333000181 -> 11.222.333/0001-81
 */
export function formatCnpj(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

/**
 * Remove formatacao do CNPJ: 11.222.333/0001-81 -> 11222333000181
 */
export function cleanCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}
