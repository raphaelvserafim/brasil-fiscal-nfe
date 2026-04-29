import { NFeProps } from '@nfe/domain/entities/NFe';

export interface XmlBuilder {
  build(nfe: NFeProps): string;
}
