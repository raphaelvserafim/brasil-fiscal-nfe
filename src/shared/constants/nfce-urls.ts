import { NFeError } from '@nfe/shared/errors/NFeError';

type NFCeUrlConfig = {
  readonly urlQRCode: { homologacao: string; producao: string };
  readonly urlChave: { homologacao: string; producao: string };
};

const NFCE_URLS: Record<string, NFCeUrlConfig> = {
  MT: {
    urlQRCode: {
      homologacao: 'https://homologacao.sefaz.mt.gov.br/nfce/consultanfce',
      producao: 'https://www.sefaz.mt.gov.br/nfce/consultanfce'
    },
    urlChave: {
      homologacao: 'https://homologacao.sefaz.mt.gov.br/nfce/consultanfce',
      producao: 'https://www.sefaz.mt.gov.br/nfce/consultanfce'
    }
  },
  SP: {
    urlQRCode: {
      homologacao:
        'https://homologacao.nfce.fazenda.sp.gov.br/NFCeConsultaPublica/Paginas/ConsultaQRCode.aspx',
      producao: 'https://www.nfce.fazenda.sp.gov.br/NFCeConsultaPublica/Paginas/ConsultaQRCode.aspx'
    },
    urlChave: {
      homologacao:
        'https://homologacao.nfce.fazenda.sp.gov.br/NFCeConsultaPublica/Paginas/ConsultaPublica.aspx',
      producao: 'https://www.nfce.fazenda.sp.gov.br/NFCeConsultaPublica/Paginas/ConsultaPublica.aspx'
    }
  },
  RS: {
    urlQRCode: {
      homologacao: 'https://www.sefaz.rs.gov.br/NFCE/NFCE-COM.aspx',
      producao: 'https://www.sefaz.rs.gov.br/NFCE/NFCE-COM.aspx'
    },
    urlChave: {
      homologacao: 'https://www.sefaz.rs.gov.br/NFCE/NFCE-COM.aspx',
      producao: 'https://www.sefaz.rs.gov.br/NFCE/NFCE-COM.aspx'
    }
  },
  PR: {
    urlQRCode: {
      homologacao: 'https://homologacao.nfce.sefa.pr.gov.br/nfce/qrcode',
      producao: 'https://www.fazenda.pr.gov.br/nfce/qrcode'
    },
    urlChave: {
      homologacao: 'https://homologacao.nfce.sefa.pr.gov.br/nfce/consulta',
      producao: 'https://www.fazenda.pr.gov.br/nfce/consulta'
    }
  }
};

export type NFCeEnvironment = 'homologacao' | 'producao';

export function getNFCeQRCodeUrl(uf: string, environment: NFCeEnvironment): string {
  const config = NFCE_URLS[uf];
  if (!config) {
    throw new NFeError(`URLs NFC-e nao configuradas para UF: ${uf}`);
  }
  return config.urlQRCode[environment];
}

export function getNFCeConsultaUrl(uf: string, environment: NFCeEnvironment): string {
  const config = NFCE_URLS[uf];
  if (!config) {
    throw new NFeError(`URLs NFC-e nao configuradas para UF: ${uf}`);
  }
  return config.urlChave[environment];
}
