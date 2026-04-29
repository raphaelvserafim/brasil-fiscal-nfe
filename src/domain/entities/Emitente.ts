import { EnderecoProps } from './Endereco';

export type EmitenteProps = {
  readonly cnpj: string;
  readonly razaoSocial: string;
  readonly nomeFantasia?: string;
  readonly inscricaoEstadual: string;
  readonly inscricaoMunicipal?: string;
  readonly regimeTributario: 1 | 2 | 3;
  readonly cnae?: string;
  readonly endereco: EnderecoProps;
};
