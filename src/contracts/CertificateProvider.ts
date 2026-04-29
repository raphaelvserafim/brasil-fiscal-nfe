export type CertificateData = {
  readonly pfx: Buffer;
  readonly password: string;
  readonly notAfter: Date;
  readonly privateKey: string;
  readonly certPem: string;
};

export interface CertificateProvider {
  load(): Promise<CertificateData>;
}
