/**
 * CST — Codigo de Situacao Tributaria do ICMS.
 * Usado por empresas no regime normal (Lucro Real / Lucro Presumido).
 */
export const CST_ICMS: Record<string, string> = {
  '00': 'Tributada integralmente',
  '10': 'Tributada e com cobranca do ICMS por substituicao tributaria',
  '20': 'Com reducao de base de calculo',
  '30': 'Isenta ou nao tributada e com cobranca do ICMS por substituicao tributaria',
  '40': 'Isenta',
  '41': 'Nao tributada',
  '50': 'Suspensao',
  '51': 'Diferimento',
  '60': 'ICMS cobrado anteriormente por substituicao tributaria',
  '70': 'Com reducao de base de calculo e cobranca do ICMS por substituicao tributaria',
  '90': 'Outros'
};

/**
 * CSOSN — Codigo de Situacao da Operacao do Simples Nacional.
 * Usado por empresas optantes pelo Simples Nacional.
 */
export const CSOSN: Record<string, string> = {
  '101': 'Tributada pelo Simples Nacional com permissao de credito',
  '102': 'Tributada pelo Simples Nacional sem permissao de credito',
  '103': 'Isencao do ICMS no Simples Nacional para faixa de receita bruta',
  '201': 'Tributada pelo Simples Nacional com permissao de credito e com cobranca do ICMS por substituicao tributaria',
  '202': 'Tributada pelo Simples Nacional sem permissao de credito e com cobranca do ICMS por substituicao tributaria',
  '203': 'Isencao do ICMS no Simples Nacional para faixa de receita bruta e com cobranca do ICMS por substituicao tributaria',
  '300': 'Imune',
  '400': 'Nao tributada pelo Simples Nacional',
  '500': 'ICMS cobrado anteriormente por substituicao tributaria ou por antecipacao',
  '900': 'Outros'
};

/**
 * CST do PIS/COFINS.
 */
export const CST_PIS_COFINS: Record<string, string> = {
  '01': 'Operacao tributavel com aliquota basica',
  '02': 'Operacao tributavel com aliquota diferenciada',
  '03': 'Operacao tributavel com aliquota por unidade de medida de produto',
  '04': 'Operacao tributavel monofasica — revenda a aliquota zero',
  '05': 'Operacao tributavel por substituicao tributaria',
  '06': 'Operacao tributavel a aliquota zero',
  '07': 'Operacao isenta da contribuicao',
  '08': 'Operacao sem incidencia da contribuicao',
  '09': 'Operacao com suspensao da contribuicao',
  '49': 'Outras operacoes de saida',
  '50': 'Operacao com direito a credito — vinculada exclusivamente a receita tributada no mercado interno',
  '51': 'Operacao com direito a credito — vinculada exclusivamente a receita nao tributada no mercado interno',
  '52': 'Operacao com direito a credito — vinculada exclusivamente a receita de exportacao',
  '53': 'Operacao com direito a credito — vinculada a receitas tributadas e nao tributadas no mercado interno',
  '54': 'Operacao com direito a credito — vinculada a receitas tributadas no mercado interno e de exportacao',
  '55': 'Operacao com direito a credito — vinculada a receitas nao tributadas no mercado interno e de exportacao',
  '56': 'Operacao com direito a credito — vinculada a receitas tributadas e nao tributadas no mercado interno e de exportacao',
  '60': 'Credito presumido — operacao de aquisicao vinculada exclusivamente a receita tributada no mercado interno',
  '61': 'Credito presumido — operacao de aquisicao vinculada exclusivamente a receita nao tributada no mercado interno',
  '62': 'Credito presumido — operacao de aquisicao vinculada exclusivamente a receita de exportacao',
  '63': 'Credito presumido — operacao de aquisicao vinculada a receitas tributadas e nao tributadas no mercado interno',
  '64': 'Credito presumido — operacao de aquisicao vinculada a receitas tributadas no mercado interno e de exportacao',
  '65': 'Credito presumido — operacao de aquisicao vinculada a receitas nao tributadas no mercado interno e de exportacao',
  '66': 'Credito presumido — operacao de aquisicao vinculada a receitas tributadas e nao tributadas no mercado interno e de exportacao',
  '67': 'Credito presumido — outras operacoes',
  '70': 'Operacao de aquisicao sem direito a credito',
  '71': 'Operacao de aquisicao com isencao',
  '72': 'Operacao de aquisicao com suspensao',
  '73': 'Operacao de aquisicao a aliquota zero',
  '74': 'Operacao de aquisicao sem incidencia da contribuicao',
  '75': 'Operacao de aquisicao por substituicao tributaria',
  '98': 'Outras operacoes de entrada',
  '99': 'Outras operacoes'
};

/**
 * Formas de pagamento da NFe.
 */
export const FORMA_PAGAMENTO: Record<string, string> = {
  '01': 'Dinheiro',
  '02': 'Cheque',
  '03': 'Cartao de credito',
  '04': 'Cartao de debito',
  '05': 'Credito loja',
  '10': 'Vale alimentacao',
  '11': 'Vale refeicao',
  '12': 'Vale presente',
  '13': 'Vale combustivel',
  '14': 'Duplicata mercantil',
  '15': 'Boleto bancario',
  '16': 'Deposito bancario',
  '17': 'Pagamento instantaneo (PIX)',
  '18': 'Transferencia bancaria, carteira digital',
  '19': 'Programa de fidelidade, cashback, credito virtual',
  '90': 'Sem pagamento',
  '99': 'Outros'
};
