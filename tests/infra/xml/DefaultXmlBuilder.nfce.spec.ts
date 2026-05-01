import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DefaultXmlBuilder } from '@nfe/infra/xml/DefaultXmlBuilder';
import { NFeProps } from '@nfe/domain/entities/NFe';

const sampleNFCe: NFeProps = {
  identificacao: {
    naturezaOperacao: 'Venda de producao do estabelecimento',
    tipoOperacao: 1,
    destinoOperacao: 1,
    finalidade: 1,
    consumidorFinal: 1,
    presencaComprador: 1,
    uf: 'MT',
    municipio: '5103403',
    serie: 1,
    numero: 1,
    dataEmissao: new Date('2026-04-28T10:00:00'),
    tipoImpressao: 4,
    modelo: '65'
  },
  emitente: {
    cnpj: '11222333000181',
    razaoSocial: 'Empresa Teste Ltda',
    nomeFantasia: 'Teste',
    inscricaoEstadual: '131234567',
    regimeTributario: 1,
    endereco: {
      logradouro: 'Rua Teste',
      numero: '100',
      bairro: 'Centro',
      codigoMunicipio: '5103403',
      municipio: 'Cuiaba',
      uf: 'MT',
      cep: '78005000'
    }
  },
  produtos: [
    {
      numero: 1,
      codigo: 'PROD001',
      descricao: 'Produto Teste',
      ncm: '61091000',
      cfop: '5102',
      unidade: 'UN',
      quantidade: 1,
      valorUnitario: 10.00,
      valorTotal: 10.00,
      icms: { origem: 0, csosn: '102' },
      pis: { cst: '49' },
      cofins: { cst: '49' }
    }
  ],
  transporte: { modalidadeFrete: 9 },
  pagamento: {
    pagamentos: [{ formaPagamento: '01', valor: 10.00 }]
  }
};

describe('DefaultXmlBuilder - NFC-e (modelo 65)', () => {
  const builder = new DefaultXmlBuilder();

  it('deve gerar XML com mod 65', () => {
    const xml = builder.build(sampleNFCe);
    assert.ok(xml.includes('<mod>65</mod>'));
  });

  it('deve gerar chave de acesso com modelo 65 na posicao correta', () => {
    const xml = builder.build(sampleNFCe);
    const idMatch = xml.match(/Id="NFe(\d{44})"/);
    assert.ok(idMatch);
    assert.strictEqual(idMatch![1].substring(20, 22), '65');
  });

  it('deve gerar XML sem bloco dest quando destinatario nao informado', () => {
    const nfceSemDest: NFeProps = { ...sampleNFCe, destinatario: undefined };
    const xml = builder.build(nfceSemDest);
    assert.ok(!xml.includes('<dest>'));
  });

  it('deve gerar XML com dest quando destinatario informado', () => {
    const nfceComDest: NFeProps = {
      ...sampleNFCe,
      destinatario: {
        cpf: '52998224725',
        nome: 'Joao da Silva',
        indicadorIE: 9
      }
    };
    const xml = builder.build(nfceComDest);
    assert.ok(xml.includes('<dest>'));
    assert.ok(xml.includes('<CPF>52998224725</CPF>'));
  });

  it('deve manter modelo 55 como default quando nao informado', () => {
    const nfeSemModelo: NFeProps = {
      ...sampleNFCe,
      identificacao: { ...sampleNFCe.identificacao, modelo: undefined }
    };
    const xml = builder.build(nfeSemModelo);
    assert.ok(xml.includes('<mod>55</mod>'));
  });
});
