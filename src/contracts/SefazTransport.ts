export type SefazRequest = {
  readonly url: string;
  readonly soapAction: string;
  readonly xml: string;
  readonly pfx: Buffer;
  readonly password: string;
};

export type SefazResponse = {
  readonly xml: string;
  readonly statusCode: number;
};

export interface SefazTransport {
  send(request: SefazRequest): Promise<SefazResponse>;
}
