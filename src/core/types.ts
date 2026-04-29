import { CertificateProvider } from '@nfe/contracts/CertificateProvider';
import { SefazTransport } from '@nfe/contracts/SefazTransport';
import { XmlBuilder } from '@nfe/contracts/XmlBuilder';
import { XmlSigner } from '@nfe/contracts/XmlSigner';
import { SchemaValidator } from '@nfe/contracts/SchemaValidator';

export type NFeEnvironment = 'homologation' | 'production';

export type NFeConfig = {
  readonly certificate: CertificateProvider;
  readonly transport: SefazTransport;
  readonly environment: NFeEnvironment;
  readonly xmlBuilder?: XmlBuilder;
  readonly xmlSigner?: XmlSigner;
  readonly schemaValidator?: SchemaValidator;
};

export type TransmitResult = {
  readonly autorizada: boolean;
  readonly protocolo?: string;
  readonly chaveAcesso: string;
  readonly codigoStatus: string;
  readonly motivo: string;
  readonly xmlProtocolado?: string;
  readonly dataAutorizacao?: Date;
};

export type ConsultResult = {
  readonly codigoStatus: string;
  readonly motivo: string;
  readonly protocolo?: string;
  readonly dataAutorizacao?: Date;
};
