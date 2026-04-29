/**
 * Valida um CPF (11 digitos, sem formatacao).
 */
export function isValidCpf(cpf: string): boolean {
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calc = (digits: string, length: number): number => {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += parseInt(digits[i]) * (length + 1 - i);
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const d1 = calc(cpf, 9);
  const d2 = calc(cpf, 10);

  return parseInt(cpf[9]) === d1 && parseInt(cpf[10]) === d2;
}

/**
 * Formata um CPF: 12345678901 -> 123.456.789-01
 */
export function formatCpf(cpf: string): string {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

/**
 * Remove formatacao do CPF: 123.456.789-01 -> 12345678901
 */
export function cleanCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}
