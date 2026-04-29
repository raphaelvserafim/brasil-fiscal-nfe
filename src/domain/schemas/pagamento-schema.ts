import { z } from 'zod/v4';

export const formaPagamentoSchema = z.object({
  formaPagamento: z.string().length(2),
  valor: z.number().min(0),
  tipoIntegracao: z.literal(1).or(z.literal(2)).optional(),
  cnpjCredenciadora: z.string().length(14).optional(),
  bandeira: z.string().max(2).optional(),
  autorizacao: z.string().max(20).optional()
});

export const pagamentoSchema = z.object({
  pagamentos: z.array(formaPagamentoSchema).min(1),
  troco: z.number().min(0).optional()
});
