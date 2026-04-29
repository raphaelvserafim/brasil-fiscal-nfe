import { calcMod11 } from './mod11';

export type AccessKeyParams = {
  readonly uf: string;
  readonly dataEmissao: Date;
  readonly cnpj: string;
  readonly modelo: string;
  readonly serie: number;
  readonly numero: number;
  readonly tipoEmissao: number;
  readonly codigoNumerico: string;
};

/**
 * Gera a chave de acesso da NFe com 44 digitos.
 *
 * Composicao:
 * - cUF (2): codigo IBGE da UF
 * - AAMM (4): ano e mes de emissao
 * - CNPJ (14): CNPJ do emitente
 * - mod (2): modelo do documento (55 = NFe)
 * - serie (3): serie da NFe
 * - nNF (9): numero da NFe
 * - tpEmis (1): tipo de emissao
 * - cNF (8): codigo numerico aleatorio
 * - cDV (1): digito verificador (mod11)
 */
export function generateAccessKey(params: AccessKeyParams): string {
  const aamm =
    String(params.dataEmissao.getFullYear()).slice(2) +
    String(params.dataEmissao.getMonth() + 1).padStart(2, '0');

  const keyWithoutDv =
    params.uf +
    aamm +
    params.cnpj +
    params.modelo +
    String(params.serie).padStart(3, '0') +
    String(params.numero).padStart(9, '0') +
    String(params.tipoEmissao) +
    params.codigoNumerico;

  const dv = calcMod11(keyWithoutDv);

  return keyWithoutDv + String(dv);
}

/**
 * Gera um codigo numerico aleatorio de 8 digitos para a chave de acesso.
 */
export function generateNumericCode(): string {
  return String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
}
