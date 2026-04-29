export type EnderecoProps = {
  readonly logradouro: string;
  readonly numero: string;
  readonly complemento?: string;
  readonly bairro: string;
  readonly codigoMunicipio: string;
  readonly municipio: string;
  readonly uf: string;
  readonly cep: string;
  readonly codigoPais?: string;
  readonly pais?: string;
  readonly telefone?: string;
};
