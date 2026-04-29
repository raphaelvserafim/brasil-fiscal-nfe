import { z } from 'zod/v4';

export const enderecoSchema = z.object({
  logradouro: z.string().min(1).max(60),
  numero: z.string().min(1).max(60),
  complemento: z.string().max(60).optional(),
  bairro: z.string().min(1).max(60),
  codigoMunicipio: z.string().length(7),
  municipio: z.string().min(1).max(60),
  uf: z.string().length(2),
  cep: z.string().length(8),
  codigoPais: z.string().default('1058'),
  pais: z.string().default('Brasil'),
  telefone: z.string().max(14).optional()
});
