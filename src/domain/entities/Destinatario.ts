import { EnderecoProps } from './Endereco';

export type DestinatarioProps = {
  readonly cpf?: string;
  readonly cnpj?: string;
  readonly nome: string;
  readonly email?: string;
  readonly inscricaoEstadual?: string;
  readonly indicadorIE: 1 | 2 | 9;
  readonly endereco?: EnderecoProps;
};
