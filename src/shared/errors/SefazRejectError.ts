import { NFeError } from './NFeError';

export class SefazRejectError extends NFeError {
  constructor(
    public readonly cStat: string,
    public readonly xMotivo: string,
    public readonly uf?: string
  ) {
    super(`SEFAZ rejeitou a NFe: [${cStat}] ${xMotivo}`);
    this.name = 'SefazRejectError';
  }
}
