import { createHash } from 'node:crypto';

export type NFCeQRCodeParams = {
  readonly urlQRCode: string;
  readonly chNFe: string;
  readonly tpAmb: '1' | '2';
  readonly cDest: string;
  readonly dhEmi: string;
  readonly vNF: string;
  readonly vICMS: string;
  readonly digVal: string;
  readonly cIdToken: string;
  readonly csc: string;
};

/**
 * Gera a URL do QR Code v2 da NFC-e.
 *
 * Formato:
 * {urlQRCode}?p={chNFe}|{nVersao}|{tpAmb}|{cDest}|{dhEmi_hex}|{vNF}|{vICMS}|{digVal_hex}|{cIdToken}|{cHashQRCode}
 *
 * cHashQRCode = SHA1(chNFe|nVersao|tpAmb|cDest|dhEmi_hex|vNF|vICMS|digVal_hex|cIdToken|CSC)
 */
export function buildNFCeQRCodeUrl(params: NFCeQRCodeParams): string {
  const nVersao = '2';
  const dhEmiHex = toHex(params.dhEmi);
  const digValHex = toHex(params.digVal);

  const payload =
    params.chNFe + '|' +
    nVersao + '|' +
    params.tpAmb + '|' +
    params.cDest + '|' +
    dhEmiHex + '|' +
    params.vNF + '|' +
    params.vICMS + '|' +
    digValHex + '|' +
    params.cIdToken;

  const hashInput = payload + params.csc;
  const cHashQRCode = createHash('sha1').update(hashInput).digest('hex').toUpperCase();

  return params.urlQRCode + '?p=' + payload + '|' + cHashQRCode;
}

/**
 * Monta o bloco <infNFeSupl> com qrCode e urlChave.
 * Inserido apos </infNFe> e <Signature>, antes de </NFe>.
 */
export function buildInfNFeSupl(qrCodeUrl: string, urlChave: string): string {
  return (
    '<infNFeSupl>' +
    `<qrCode><![CDATA[${qrCodeUrl}]]></qrCode>` +
    `<urlChave>${urlChave}</urlChave>` +
    '</infNFeSupl>'
  );
}

function toHex(value: string): string {
  return Buffer.from(value, 'utf-8').toString('hex');
}
