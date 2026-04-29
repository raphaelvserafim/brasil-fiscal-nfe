export type TransporteProps = {
  readonly modalidadeFrete: 0 | 1 | 2 | 3 | 4 | 9;
  readonly cnpjTransportadora?: string;
  readonly nomeTransportadora?: string;
  readonly inscricaoEstadual?: string;
  readonly endereco?: string;
  readonly municipio?: string;
  readonly uf?: string;
};
