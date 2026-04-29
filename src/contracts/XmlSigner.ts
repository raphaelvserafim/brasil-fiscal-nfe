import { CertificateData } from '@nfe/contracts/CertificateProvider';

export interface XmlSigner {
  sign(xml: string, certificate: CertificateData): string;
}
