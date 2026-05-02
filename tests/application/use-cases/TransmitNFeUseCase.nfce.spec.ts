import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TransmitNFeUseCase } from '@nfe/application/use-cases/TransmitNFeUseCase';
import { NFeProps } from '@nfe/domain/entities/NFe';

const mockCert = {
  pfx: Buffer.from('mock'),
  password: 'mock',
  notAfter: new Date('2030-01-01'),
  privateKey: 'mock-key',
  certPem: 'mock-cert'
};

const sampleNFCe: NFeProps = {
  identificacao: {
    naturezaOperacao: 'Venda',
    tipoOperacao: 1,
    destinoOperacao: 1,
    finalidade: 1,
    consumidorFinal: 1,
    presencaComprador: 1,
    uf: 'MT',
    municipio: '5103403',
    serie: 1,
    numero: 1,
    modelo: '65',
    ambiente: 2
  },
  emitente: {
    cnpj: '11222333000181',
    razaoSocial: 'Empresa Teste',
    inscricaoEstadual: '131234567',
    regimeTributario: 1,
    endereco: {
      logradouro: 'Rua Teste', numero: '100', bairro: 'Centro',
      codigoMunicipio: '5103403', municipio: 'Cuiaba', uf: 'MT', cep: '78005000'
    }
  },
  produtos: [{
    numero: 1, codigo: '001', descricao: 'Produto', ncm: '61091000', cfop: '5102',
    unidade: 'UN', quantidade: 1, valorUnitario: 10.00, valorTotal: 10.00,
    icms: { origem: 0, csosn: '102' }, pis: { cst: '49' }, cofins: { cst: '49' }
  }],
  transporte: { modalidadeFrete: 9 },
  pagamento: { pagamentos: [{ formaPagamento: '01', valor: 10.00 }] }
};

function createMockTransport(captureUrl: (url: string) => void) {
  return {
    send: async (req: { url: string; soapAction: string; xml: string; pfx: Buffer; password: string }) => {
      captureUrl(req.url);
      return {
        xml: '<soap12:Envelope><soap12:Body>' +
          '<retEnviNFe><cStat>104</cStat><xMotivo>Lote processado</xMotivo>' +
          '<protNFe versao="4.00"><infProt>' +
          '<cStat>100</cStat><xMotivo>Autorizado</xMotivo>' +
          '<nProt>151</nProt>' +
          '<chNFe>51260411222333000181650010000000011123456780</chNFe>' +
          '<dhRecbto>2026-04-28T10:00:00-03:00</dhRecbto>' +
          '</infProt></protNFe></retEnviNFe>' +
          '</soap12:Body></soap12:Envelope>',
        statusCode: 200
      };
    }
  };
}

function createMockBuilder(modelo: string) {
  const mod = modelo;
  return {
    build: () =>
      '<NFe xmlns="http://www.portalfiscal.inf.br/nfe">' +
      `<infNFe versao="4.00" Id="NFe51260411222333000181${mod === '65' ? '65' : '55'}0010000000011123456780">` +
      `<ide><mod>${mod}</mod><dhEmi>2026-04-28T10:00:00-03:00</dhEmi></ide>` +
      '<total><ICMSTot><vNF>10.00</vNF><vICMS>0.00</vICMS></ICMSTot></total>' +
      '</infNFe></NFe>'
  };
}

function createMockSigner() {
  return {
    sign: (xml: string) => xml.replace(
      '</infNFe></NFe>',
      '</infNFe><Signature xmlns="http://www.w3.org/2000/09/xmldsig#">' +
      '<SignedInfo><DigestMethod/></SignedInfo>' +
      '<SignatureValue>dGVzdA==</SignatureValue>' +
      '<KeyInfo><X509Data><X509Certificate>Y2VydA==</X509Certificate></X509Data></KeyInfo>' +
      '</Signature></NFe>'
    ).replace(
      '</ide>',
      '</ide><DigestValue>aW1hZ2VtIGRlIHRlc3Rl</DigestValue>'
    )
  };
}

describe('TransmitNFeUseCase - NFC-e', () => {
  it('deve usar URL NFCeAutorizacao para modelo 65', async () => {
    let capturedUrl = '';
    const useCase = new TransmitNFeUseCase({
      xmlBuilder: createMockBuilder('65'),
      xmlSigner: createMockSigner(),
      certificate: { load: async () => mockCert },
      transport: createMockTransport((url) => { capturedUrl = url; }),
      environment: 'homologation',
      uf: 'MT',
      cIdToken: '000001',
      csc: 'CSCTESTE123456'
    });

    const result = await useCase.execute(sampleNFCe);
    assert.ok(capturedUrl.includes('nfcews'), `Expected NFCe URL, got: ${capturedUrl}`);
    assert.strictEqual(result.autorizada, true);
  });

  it('deve usar URL NFeAutorizacao para modelo 55 (default)', async () => {
    let capturedUrl = '';
    const nfe55: NFeProps = {
      ...sampleNFCe,
      identificacao: { ...sampleNFCe.identificacao, modelo: undefined }
    };
    const useCase = new TransmitNFeUseCase({
      xmlBuilder: createMockBuilder('55'),
      xmlSigner: createMockSigner(),
      certificate: { load: async () => mockCert },
      transport: createMockTransport((url) => { capturedUrl = url; }),
      environment: 'homologation',
      uf: 'MT'
    });

    const result = await useCase.execute(nfe55);
    assert.ok(!capturedUrl.includes('nfcews'), `Expected NFe URL, got: ${capturedUrl}`);
    assert.strictEqual(result.autorizada, true);
  });

  it('deve incluir infNFeSupl no XML protocolado para modelo 65', async () => {
    const useCase = new TransmitNFeUseCase({
      xmlBuilder: createMockBuilder('65'),
      xmlSigner: createMockSigner(),
      certificate: { load: async () => mockCert },
      transport: createMockTransport(() => {}),
      environment: 'homologation',
      uf: 'MT',
      cIdToken: '000001',
      csc: 'CSCTESTE123456'
    });

    const result = await useCase.execute(sampleNFCe);
    assert.ok(result.xmlProtocolado?.includes('<infNFeSupl>'));
    assert.ok(result.xmlProtocolado?.includes('<qrCode>'));
    assert.ok(result.xmlProtocolado?.includes('<urlChave>'));
  });

  it('nao deve incluir infNFeSupl para modelo 55', async () => {
    const nfe55: NFeProps = {
      ...sampleNFCe,
      identificacao: { ...sampleNFCe.identificacao, modelo: undefined }
    };
    const useCase = new TransmitNFeUseCase({
      xmlBuilder: createMockBuilder('55'),
      xmlSigner: createMockSigner(),
      certificate: { load: async () => mockCert },
      transport: createMockTransport(() => {}),
      environment: 'homologation',
      uf: 'MT'
    });

    const result = await useCase.execute(nfe55);
    assert.ok(!result.xmlProtocolado?.includes('<infNFeSupl>'));
  });
});
