import { z } from 'zod/v4';
import { enderecoSchema } from './endereco-schema';

export const emitenteSchema = z.object({
  cnpj: z.string().length(14),
  razaoSocial: z.string().min(1).max(60),
  nomeFantasia: z.string().max(60).optional(),
  inscricaoEstadual: z.string().min(2).max(14),
  inscricaoMunicipal: z.string().max(15).optional(),
  regimeTributario: z.literal(1).or(z.literal(2)).or(z.literal(3)),
  cnae: z.string().length(7).optional(),
  endereco: enderecoSchema
});
