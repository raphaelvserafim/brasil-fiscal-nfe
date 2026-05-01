import { XmlBuilder } from '@nfe/contracts/XmlBuilder';
import { XmlSigner } from '@nfe/contracts/XmlSigner';
import { CertificateProvider } from '@nfe/contracts/CertificateProvider';
import { SefazTransport } from '@nfe/contracts/SefazTransport';
import { NFeProps } from '@nfe/domain/entities/NFe';
import { TransmitResult, NFeEnvironment } from '@nfe/core/types';
import { SefazRejectError } from '@nfe/shared/errors/SefazRejectError';
import { getSefazUrl, SefazEnvironment } from '@nfe/shared/constants/sefaz-urls';
import { buildNFCeQRCodeUrl, buildInfNFeSupl } from '@nfe/shared/helpers/nfce-qrcode';
import { getNFCeQRCodeUrl, getNFCeConsultaUrl } from '@nfe/shared/constants/nfce-urls';
import {
  buildAutorizacaoEnvelope,
  extractSoapBody,
  parseAutorizacaoResponse,
  SOAP_ACTIONS
} from '@nfe/infra/sefaz/soap';

type TransmitDeps = {
  readonly xmlBuilder: XmlBuilder;
  readonly xmlSigner: XmlSigner;
  readonly certificate: CertificateProvider;
  readonly transport: SefazTransport;
  readonly environment: NFeEnvironment;
  readonly uf: string;
  readonly cIdToken?: string;
  readonly csc?: string;
};

function toSefazEnv(env: NFeEnvironment): SefazEnvironment {
  return env === 'homologation' ? 'homologacao' : 'producao';
}

export class TransmitNFeUseCase {
  constructor(private readonly deps: TransmitDeps) {}

  async execute(nfe: NFeProps): Promise<TransmitResult> {
    const { xmlBuilder, xmlSigner, certificate, transport, environment, uf, cIdToken, csc } =
      this.deps;

    const xml = xmlBuilder.build(nfe);
    const cert = await certificate.load();
    const signedXml = xmlSigner.sign(xml, cert);

    const sefazEnv = toSefazEnv(environment);
    const modelo = nfe.identificacao.modelo ?? '55';
    const service = modelo === '65' ? 'NFCeAutorizacao' : 'NFeAutorizacao';
    const url = getSefazUrl(uf, sefazEnv, service);
    const envelope = buildAutorizacaoEnvelope(signedXml);

    const response = await transport.send({
      url,
      soapAction: SOAP_ACTIONS.NFeAutorizacao4,
      xml: envelope,
      pfx: cert.pfx,
      password: cert.password
    });

    const body = extractSoapBody(response.xml);
    const result = parseAutorizacaoResponse(body);

    if (result.cStat === '100') {
      let nfeProc = this.buildNfeProc(signedXml, result.xmlProtocolado);

      if (modelo === '65' && nfeProc && cIdToken && csc) {
        nfeProc = this.insertInfNFeSupl(nfeProc, nfe, signedXml, sefazEnv, uf, cIdToken, csc);
      }

      return {
        autorizada: true,
        protocolo: result.nProt,
        chaveAcesso: result.chNFe ?? '',
        codigoStatus: result.cStat,
        motivo: result.xMotivo,
        xmlProtocolado: nfeProc,
        dataAutorizacao: result.dhRecbto ? new Date(result.dhRecbto) : undefined
      };
    }

    throw new SefazRejectError(result.cStat, result.xMotivo, uf);
  }

  private buildNfeProc(signedNFe: string, protNFe?: string): string | undefined {
    if (!protNFe) return undefined;
    const nfeContent = signedNFe.replace(/<\?xml[^?]*\?>\s*/g, '');
    return (
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">' +
      nfeContent +
      protNFe +
      '</nfeProc>'
    );
  }

  private insertInfNFeSupl(
    nfeProc: string,
    nfe: NFeProps,
    signedXml: string,
    sefazEnv: SefazEnvironment,
    uf: string,
    cIdToken: string,
    csc: string
  ): string {
    const chNFeMatch = nfeProc.match(/<chNFe>(\d{44})<\/chNFe>/);
    const digValMatch = signedXml.match(/<DigestValue>([^<]+)<\/DigestValue>/);
    if (!chNFeMatch || !digValMatch) return nfeProc;

    const tpAmb = String(nfe.identificacao.ambiente ?? 2) as '1' | '2';
    const urlQRCode = getNFCeQRCodeUrl(uf, sefazEnv);
    const urlChave = getNFCeConsultaUrl(uf, sefazEnv);

    const dest = nfe.destinatario;
    const cDest = dest?.cpf ?? dest?.cnpj ?? '';

    const dhEmi = signedXml.match(/<dhEmi>([^<]+)<\/dhEmi>/)?.[1] ?? '';
    const vNF = signedXml.match(/<vNF>([^<]+)<\/vNF>/)?.[1] ?? '0.00';
    const vICMS = signedXml.match(/<vICMS>([^<]+)<\/vICMS>/)?.[1] ?? '0.00';

    const qrCodeUrl = buildNFCeQRCodeUrl({
      urlQRCode,
      chNFe: chNFeMatch[1],
      tpAmb,
      cDest,
      dhEmi,
      vNF,
      vICMS,
      digVal: digValMatch[1],
      cIdToken,
      csc
    });

    const infNFeSupl = buildInfNFeSupl(qrCodeUrl, urlChave);
    return nfeProc.replace('</NFe>', infNFeSupl + '</NFe>');
  }
}
