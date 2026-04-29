import { z } from 'zod/v4';
import { enderecoSchema } from './endereco-schema';

export const destinatarioSchema = z
  .object({
    cpf: z.string().length(11).optional(),
    cnpj: z.string().length(14).optional(),
    nome: z.string().min(1).max(60),
    email: z.string().email().max(60).optional(),
    inscricaoEstadual: z.string().max(14).optional(),
    indicadorIE: z.literal(1).or(z.literal(2)).or(z.literal(9)),
    endereco: enderecoSchema
  })
  .refine((data) => data.cpf || data.cnpj, {
    message: 'Destinatario deve ter CPF ou CNPJ'
  });
