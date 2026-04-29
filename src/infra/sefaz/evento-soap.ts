import { NFeError } from '@nfe/shared/errors/NFeError';

const NFE_NAMESPACE = 'http://www.portalfiscal.inf.br/nfe';

export const EVENTO_SOAP_ACTION =
  `${NFE_NAMESPACE}/wsdl/NFeRecepcaoEvento4/nfeRecepcaoEvento`;

export const INUTILIZACAO_SOAP_ACTION =
  `${NFE_NAMESPACE}/wsdl/NFeInutilizacao4/nfeInutilizacaoNF`;

const COND_USO_CCE =
  'A Carta de Correcao e disciplinada pelo paragrafo 1o-A do art. 7o do Convenio S/N, ' +
  'de 15 de dezembro de 1970 e pode ser utilizada para regularizacao de erro ocorrido na ' +
  'emissao de documento fiscal, desde que o erro nao esteja relacionado com: I - as variaveis ' +
  'que determinam o valor do imposto tais como: base de calculo, aliquota, diferenca de preco, ' +
  'quantidade, valor da operacao ou da prestacao; II - a correcao de dados cadastrais que ' +
  'implique mudanca do remetente ou do destinatario; III - a data de emissao ou de saida.';

/**
 * Monta XML de evento de cancelamento (110111) — SEM envelope SOAP.
 * Precisa ser assinado antes de envolver no SOAP.
 */
export function buildCancelamentoXml(
  chNFe: string,
  cnpj: string,
  cOrgao: string,
  tpAmb: '1' | '2',
  nProt: string,
  xJust: string,
  dhEvento: string
): string {
  const id = `ID110111${chNFe}01`;

  return [
    `<evento versao="1.00" xmlns="${NFE_NAMESPACE}">`,
    `<infEvento Id="${id}">`,
    `<cOrgao>${cOrgao}</cOrgao>`,
    `<tpAmb>${tpAmb}</tpAmb>`,
    `<CNPJ>${cnpj}</CNPJ>`,
    `<chNFe>${chNFe}</chNFe>`,
    `<dhEvento>${dhEvento}</dhEvento>`,
    '<tpEvento>110111</tpEvento>',
    '<nSeqEvento>1</nSeqEvento>',
    '<verEvento>1.00</verEvento>',
    '<detEvento versao="1.00">',
    '<descEvento>Cancelamento</descEvento>',
    `<nProt>${nProt}</nProt>`,
    `<xJust>${xJust}</xJust>`,
    '</detEvento>',
    '</infEvento>',
    '</evento>'
  ].join('');
}

/**
 * Monta XML de Carta de Correcao (110110) — SEM envelope SOAP.
 * Precisa ser assinado antes de envolver no SOAP.
 */
export function buildCartaCorrecaoXml(
  chNFe: string,
  cnpj: string,
  cOrgao: string,
  tpAmb: '1' | '2',
  xCorrecao: string,
  nSeqEvento: number,
  dhEvento: string
): string {
  const seqStr = String(nSeqEvento).padStart(2, '0');
  const id = `ID110110${chNFe}${seqStr}`;

  return [
    `<evento versao="1.00" xmlns="${NFE_NAMESPACE}">`,
    `<infEvento Id="${id}">`,
    `<cOrgao>${cOrgao}</cOrgao>`,
    `<tpAmb>${tpAmb}</tpAmb>`,
    `<CNPJ>${cnpj}</CNPJ>`,
    `<chNFe>${chNFe}</chNFe>`,
    `<dhEvento>${dhEvento}</dhEvento>`,
    '<tpEvento>110110</tpEvento>',
    `<nSeqEvento>${nSeqEvento}</nSeqEvento>`,
    '<verEvento>1.00</verEvento>',
    '<detEvento versao="1.00">',
    '<descEvento>Carta de Correcao</descEvento>',
    `<xCorrecao>${xCorrecao}</xCorrecao>`,
    `<xCondUso>${COND_USO_CCE}</xCondUso>`,
    '</detEvento>',
    '</infEvento>',
    '</evento>'
  ].join('');
}

/**
 * Monta XML de inutilizacao — SEM envelope SOAP.
 * Precisa ser assinado antes de envolver no SOAP.
 */
export function buildInutilizacaoXml(
  cnpj: string,
  cUF: string,
  tpAmb: '1' | '2',
  ano: string,
  serie: string,
  nNFIni: string,
  nNFFin: string,
  xJust: string
): string {
  const id = `ID${cUF}${ano}${cnpj}55${serie.padStart(3, '0')}${nNFIni.padStart(9, '0')}${nNFFin.padStart(9, '0')}`;

  return [
    `<inutNFe versao="4.00" xmlns="${NFE_NAMESPACE}">`,
    `<infInut Id="${id}">`,
    `<tpAmb>${tpAmb}</tpAmb>`,
    '<xServ>INUTILIZAR</xServ>',
    `<cUF>${cUF}</cUF>`,
    `<ano>${ano}</ano>`,
    `<CNPJ>${cnpj}</CNPJ>`,
    '<mod>55</mod>',
    `<serie>${serie}</serie>`,
    `<nNFIni>${nNFIni}</nNFIni>`,
    `<nNFFin>${nNFFin}</nNFFin>`,
    `<xJust>${xJust}</xJust>`,
    '</infInut>',
    '</inutNFe>'
  ].join('');
}

/**
 * Envolve XML de evento assinado em envelope SOAP para RecepcaoEvento4.
 */
export function wrapEventoSoapEnvelope(signedEventoXml: string): string {
  const inner = signedEventoXml.replace(/<\?xml[^?]*\?>\s*/g, '');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">',
    '<soap12:Header/>',
    '<soap12:Body>',
    `<nfeDadosMsg xmlns="${NFE_NAMESPACE}/wsdl/NFeRecepcaoEvento4">`,
    `<envEvento versao="1.00" xmlns="${NFE_NAMESPACE}">`,
    '<idLote>1</idLote>',
    inner,
    '</envEvento>',
    '</nfeDadosMsg>',
    '</soap12:Body>',
    '</soap12:Envelope>'
  ].join('');
}

/**
 * Envolve XML de inutilizacao assinado em envelope SOAP para NFeInutilizacao4.
 */
export function wrapInutilizacaoSoapEnvelope(signedInutXml: string): string {
  const inner = signedInutXml.replace(/<\?xml[^?]*\?>\s*/g, '');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">',
    '<soap12:Header/>',
    '<soap12:Body>',
    `<nfeDadosMsg xmlns="${NFE_NAMESPACE}/wsdl/NFeInutilizacao4">`,
    inner,
    '</nfeDadosMsg>',
    '</soap12:Body>',
    '</soap12:Envelope>'
  ].join('');
}

export type EventoResult = {
  readonly cStat: string;
  readonly xMotivo: string;
  readonly nProt?: string;
  readonly chNFe?: string;
  readonly tpEvento?: string;
  readonly dhRegEvento?: string;
};

export type InutilizacaoResult = {
  readonly cStat: string;
  readonly xMotivo: string;
  readonly nProt?: string;
  readonly dhRecbto?: string;
};

/**
 * Parseia resposta de RecepcaoEvento4.
 */
export function parseEventoResponse(body: string): EventoResult {
  const retEvento = body.match(/<retEvento[^>]*>([\s\S]*?)<\/retEvento>/);
  const source = retEvento ? retEvento[1] : body;

  const cStat = extractTag(source, 'cStat');
  if (!cStat) {
    throw new NFeError('Resposta de evento sem cStat');
  }

  return {
    cStat,
    xMotivo: extractTag(source, 'xMotivo') ?? 'Motivo desconhecido',
    nProt: extractTag(source, 'nProt') ?? undefined,
    chNFe: extractTag(source, 'chNFe') ?? undefined,
    tpEvento: extractTag(source, 'tpEvento') ?? undefined,
    dhRegEvento: extractTag(source, 'dhRegEvento') ?? undefined
  };
}

/**
 * Parseia resposta de NFeInutilizacao4.
 */
export function parseInutilizacaoResponse(body: string): InutilizacaoResult {
  const infInut = body.match(/<infInut[^>]*>([\s\S]*?)<\/infInut>/);
  const source = infInut ? infInut[1] : body;

  const cStat = extractTag(source, 'cStat');
  if (!cStat) {
    throw new NFeError('Resposta de inutilizacao sem cStat');
  }

  return {
    cStat,
    xMotivo: extractTag(source, 'xMotivo') ?? 'Motivo desconhecido',
    nProt: extractTag(source, 'nProt') ?? undefined,
    dhRecbto: extractTag(source, 'dhRecbto') ?? undefined
  };
}

function extractTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  return match ? match[1] : null;
}
