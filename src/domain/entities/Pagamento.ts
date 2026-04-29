export type FormaPagamentoProps = {
  readonly formaPagamento: string;
  readonly valor: number;
  readonly tipoIntegracao?: 1 | 2;
  readonly cnpjCredenciadora?: string;
  readonly bandeira?: string;
  readonly autorizacao?: string;
};

export type PagamentoProps = {
  readonly pagamentos: FormaPagamentoProps[];
  readonly troco?: number;
};
