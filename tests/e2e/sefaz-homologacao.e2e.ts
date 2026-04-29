import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { NFeCore } from '@nfe/core/NFeCore';
import type { NFeProps } from '@nfe/domain/entities/NFe';
import { loadE2EConfig, loadPfxBuffer, E2EConfig } from './env-loader';

const config = loadE2EConfig();

function buildNFeHomologacao(cfg: E2EConfig): NFeProps {
  return {
    identificacao: {
      naturezaOperacao: 'VENDA DE MERCADORIA',
      tipoOperacao: 1,
      destinoOperacao: 1,
      finalidade: 1,
      consumidorFinal: 1,
      presencaComprador: 1,
      uf: cfg.uf,
      municipio: cfg.codMunicipio,
      serie: 1,
      numero: Math.floor(Math.random() * 999999) + 1,
      dataEmissao: new Date()
    },
    emitente: {
      cnpj: cfg.cnpj,
      razaoSocial: cfg.razaoSocial,
      inscricaoEstadual: cfg.ie,
      regimeTributario: 1,
      endereco: {
        logradouro: cfg.logradouro,
        numero: cfg.numero,
        bairro: cfg.bairro,
        codigoMunicipio: cfg.codMunicipio,
        municipio: cfg.municipio,
        uf: cfg.uf,
        cep: cfg.cep
      }
    },
    destinatario: {
      nome: 'NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL',
      cnpj: cfg.cnpj,
      indicadorIE: cfg.ie === 'ISENTO' ? 9 : 1,
      inscricaoEstadual: cfg.ie === 'ISENTO' ? undefined : cfg.ie,
      endereco: {
        logradouro: cfg.logradouro,
        numero: cfg.numero,
        bairro: cfg.bairro,
        codigoMunicipio: cfg.codMunicipio,
        municipio: cfg.municipio,
        uf: cfg.uf,
        cep: cfg.cep
      }
    },
    produtos: [
      {
        numero: 1,
        codigo: 'PROD001',
        descricao: 'NOTA FISCAL EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL',
        ncm: '94036000',
        cfop: '5102',
        unidade: 'UN',
        quantidade: 1,
        valorUnitario: 10.00,
        valorTotal: 10.00,
        icms: {
          origem: 0,
          csosn: '102'
        },
        pis: {
          cst: '49'
        },
        cofins: {
          cst: '49'
        }
      }
    ],
    transporte: {
      modalidadeFrete: 9
    },
    pagamento: {
      pagamentos: [
        {
          formaPagamento: '01',
          valor: 10.00
        }
      ]
    },
    informacoesComplementares: 'NOTA FISCAL EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL'
  };
}

describe('E2E: SEFAZ MT Homologacao', { skip: !config ? 'Certificado ou IE nao configurados no .env' : undefined }, () => {
  let nfe: NFeCore;

  before(() => {
    if (!config) return;
    const pfx = loadPfxBuffer(config.pfxPath);
    nfe = NFeCore.create({
      pfx,
      senha: config.pfxSenha,
      ambiente: 'homologacao',
      uf: config.uf
    });
  });

  it('deve transmitir NFe em homologacao', async () => {
    if (!config) return;

    const nfeData = buildNFeHomologacao(config);
    console.log(`\n  Transmitindo NFe numero ${nfeData.identificacao.numero} para SEFAZ MT homologacao...`);

    const result = await nfe.transmitir(nfeData);

    console.log(`  Status: ${result.codigoStatus} - ${result.motivo}`);
    console.log(`  Protocolo: ${result.protocolo}`);
    console.log(`  Chave: ${result.chaveAcesso}`);

    assert.equal(result.autorizada, true);
    assert.ok(result.protocolo);
    assert.ok(result.chaveAcesso);
    assert.equal(result.codigoStatus, '100');
  });

  it('deve consultar protocolo de NFe transmitida', async () => {
    if (!config) return;

    const nfeData = buildNFeHomologacao(config);
    const transmitResult = await nfe.transmitir(nfeData);
    assert.equal(transmitResult.autorizada, true);

    console.log(`\n  Consultando protocolo da chave ${transmitResult.chaveAcesso}...`);
    const consultResult = await nfe.consultarProtocolo(transmitResult.chaveAcesso);

    console.log(`  Status: ${consultResult.codigoStatus} - ${consultResult.motivo}`);

    assert.equal(consultResult.codigoStatus, '100');
    assert.ok(consultResult.protocolo);
  });

  it('deve cancelar NFe em homologacao', async () => {
    if (!config) return;

    const nfeData = buildNFeHomologacao(config);
    const transmitResult = await nfe.transmitir(nfeData);
    assert.equal(transmitResult.autorizada, true);

    console.log(`\n  Cancelando NFe ${transmitResult.chaveAcesso}...`);
    const cancelResult = await nfe.cancelar({
      chaveAcesso: transmitResult.chaveAcesso,
      cnpj: config.cnpj,
      protocolo: transmitResult.protocolo!,
      justificativa: 'Cancelamento de nota fiscal emitida em ambiente de homologacao para teste'
    });

    console.log(`  Status: ${cancelResult.cStat} - ${cancelResult.xMotivo}`);

    assert.equal(cancelResult.cStat, '135');
  });

  it('deve enviar carta de correcao em homologacao', async () => {
    if (!config) return;

    const nfeData = buildNFeHomologacao(config);
    const transmitResult = await nfe.transmitir(nfeData);
    assert.equal(transmitResult.autorizada, true);

    console.log(`\n  Enviando CC-e para NFe ${transmitResult.chaveAcesso}...`);
    const ccResult = await nfe.cartaCorrecao({
      chaveAcesso: transmitResult.chaveAcesso,
      cnpj: config.cnpj,
      correcao: 'Correcao do endereco do destinatario conforme nota de homologacao para teste de integracao'
    });

    console.log(`  Status: ${ccResult.cStat} - ${ccResult.xMotivo}`);

    assert.equal(ccResult.cStat, '135');
  });

  it('deve inutilizar numeracao em homologacao', async () => {
    if (!config) return;

    const numInicial = Math.floor(Math.random() * 900000) + 900001;
    console.log(`\n  Inutilizando numeracao ${numInicial}-${numInicial} serie 99...`);

    const result = await nfe.inutilizar({
      cnpj: config.cnpj,
      ano: new Date().getFullYear() % 100,
      serie: 99,
      numeroInicial: numInicial,
      numeroFinal: numInicial,
      justificativa: 'Inutilizacao de numeracao em ambiente de homologacao para teste de integracao'
    });

    console.log(`  Status: ${result.cStat} - ${result.xMotivo}`);

    assert.equal(result.cStat, '102');
  });
});
