import { CertificateProvider } from '@nfe/contracts/CertificateProvider';
import { SefazTransport } from '@nfe/contracts/SefazTransport';
import { XmlSigner } from '@nfe/contracts/XmlSigner';
import { NFeEnvironment } from '@nfe/core/types';
import { NFeError } from '@nfe/shared/errors/NFeError';
import { SefazRejectError } from '@nfe/shared/errors/SefazRejectError';
import { getSefazUrl, SefazEnvironment } from '@nfe/shared/constants/sefaz-urls';
import { UF_CODES } from '@nfe/shared/constants/ibge-codes';
import { extractSoapBody } from '@nfe/infra/sefaz/soap';
import {
  buildInutilizacaoXml,
  wrapInutilizacaoSoapEnvelope,
  parseInutilizacaoResponse,
  INUTILIZACAO_SOAP_ACTION,
  InutilizacaoResult
} from '@nfe/infra/sefaz/evento-soap';

export type { InutilizacaoResult } from '@nfe/infra/sefaz/evento-soap';

type InutilizaDeps = {
  readonly certificate: CertificateProvider;
  readonly transport: SefazTransport;
  readonly xmlSigner: XmlSigner;
  readonly environment: NFeEnvironment;
};

type InutilizaInput = {
  readonly cnpj: string;
  readonly uf: string;
  readonly ano: number;
  readonly serie: number;
  readonly numeroInicial: number;
  readonly numeroFinal: number;
  readonly justificativa: string;
};

function toSefazEnv(env: NFeEnvironment): SefazEnvironment {
  return env === 'homologation' ? 'homologacao' : 'producao';
}

export class InutilizaNFeUseCase {
  constructor(private readonly deps: InutilizaDeps) {}

  async execute(input: InutilizaInput): Promise<InutilizacaoResult> {
    this.validate(input);

    const { certificate, transport, xmlSigner, environment } = this.deps;
    const cUF = UF_CODES[input.uf];
    if (!cUF) {
      throw new NFeError(`UF desconhecida: ${input.uf}`);
    }

    const tpAmb: '1' | '2' = environment === 'production' ? '1' : '2';
    const ano = String(input.ano).slice(-2);

    const inutXml = buildInutilizacaoXml(
      input.cnpj, cUF, tpAmb, ano,
      String(input.serie),
      String(input.numeroInicial),
      String(input.numeroFinal),
      input.justificativa
    );

    const cert = await certificate.load();
    const signedXml = xmlSigner.sign(inutXml, cert);
    const envelope = wrapInutilizacaoSoapEnvelope(signedXml);

    const sefazEnv = toSefazEnv(environment);
    const url = getSefazUrl(input.uf, sefazEnv, 'NFeInutilizacao');

    const response = await transport.send({
      url,
      soapAction: INUTILIZACAO_SOAP_ACTION,
      xml: envelope,
      pfx: cert.pfx,
      password: cert.password
    });

    const body = extractSoapBody(response.xml);
    const result = parseInutilizacaoResponse(body);

    if (result.cStat === '102') {
      return result;
    }

    throw new SefazRejectError(result.cStat, result.xMotivo, input.uf);
  }

  private validate(input: InutilizaInput): void {
    if (!/^\d{14}$/.test(input.cnpj)) {
      throw new NFeError('CNPJ invalido: deve ter 14 digitos numericos');
    }
    if (!input.justificativa || input.justificativa.length < 15) {
      throw new NFeError('Justificativa deve ter no minimo 15 caracteres');
    }
    if (input.numeroInicial > input.numeroFinal) {
      throw new NFeError('Numero inicial deve ser menor ou igual ao numero final');
    }
    if (input.numeroInicial < 1) {
      throw new NFeError('Numero inicial deve ser maior que zero');
    }
  }
}
