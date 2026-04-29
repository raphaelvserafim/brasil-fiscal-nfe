import { z } from 'zod/v4';

export const transporteSchema = z.object({
  modalidadeFrete: z.literal(0).or(z.literal(1)).or(z.literal(2)).or(z.literal(3)).or(z.literal(4)).or(z.literal(9)),
  cnpjTransportadora: z.string().length(14).optional(),
  nomeTransportadora: z.string().max(60).optional(),
  inscricaoEstadual: z.string().max(14).optional(),
  endereco: z.string().max(60).optional(),
  municipio: z.string().max(60).optional(),
  uf: z.string().length(2).optional()
});
