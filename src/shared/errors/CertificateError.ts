import { NFeError } from './NFeError';

export class CertificateError extends NFeError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'CertificateError';
  }
}
