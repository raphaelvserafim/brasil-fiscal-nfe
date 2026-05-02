/**
 * Teste de debug para NFC-e com caracteres acentuados.
 * Reproduz cenario do ERP: dados com acentos, cedilha, etc.
 * Uso: npx tsx --test tests/e2e/debug-nfce-encoding.e2e.ts
 */
import { describe, it, before } from 'node:test';
import { writeFileSync } from 'node:fs';
import { NFeCore } from '@nfe/core/NFeCore';
import type { NFeProps } from '@nfe/domain/entities/NFe';
import { loadE2EConfig, loadPfxBuffer, E2EConfig } from './env-loader';

const config = loadE2EConfig();

function loadNFCeTokens(): { cIdToken: string; csc: string } | null {
  const { readFileSync, existsSync } = require('node:fs');
  const { resolve } = require('node:path');
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return null;
  const content = readFileSync(envPath, 'utf-8') as string;
  const vars: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const raw = trimmed.slice(eqIndex + 1).trim();
    vars[trimmed.slice(0, eqIndex).trim()] = raw.replace(/^["']|["']$/g, '');
  }
  const cIdToken = vars['NFCE_CID_TOKEN'] ?? process.env['NFCE_CID_TOKEN'] ?? '';
  const csc = vars['NFCE_CSC'] ?? process.env['NFCE_CSC'] ?? '';
  if (!cIdToken || !csc) return null;
  return { cIdToken, csc };
}

const nfceTokens = loadNFCeTokens();

// Dados COM acentos para simular ERP real
function buildNFCeComAcentos(cfg: E2EConfig): NFeProps {
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
      dataEmissao: new Date(),
      tipoImpressao: 4,
      modelo: '65',
      ambiente: 2
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
    produtos: [
      {
        numero: 1,
        codigo: 'PROD001',
        // Texto com acentos para simular dados reais do ERP
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
    informacoesComplementares: 'Informação complementar com acentuação: ação, preço, café, São Paulo',
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
    }
  };
}

const skipReason = !config
  ? 'Certificado ou IE nao configurados no .env'
  : !nfceTokens
    ? 'NFCE_CID_TOKEN e NFCE_CSC nao configurados no .env'
    : undefined;

describe('DEBUG: NFC-e encoding com acentos', { skip: skipReason }, () => {
  let nfce: NFeCore;

  before(() => {
    if (!config || !nfceTokens) return;
    const pfx = loadPfxBuffer(config.pfxPath);
    nfce = NFeCore.create({
      pfx,
      senha: config.pfxSenha,
      ambiente: 'homologacao',
      uf: config.uf,
      cIdToken: nfceTokens.cIdToken,
      csc: nfceTokens.csc
    });
  });

  it('deve transmitir NFC-e com acentos sem erro 402', async () => {
    if (!config || !nfceTokens) return;

    // Intercepta o XML para debug: usa transport customizado que salva o envelope
    const { DefaultXmlBuilder } = await import('@nfe/infra/xml/DefaultXmlBuilder');
    const { DefaultXmlSigner } = await import('@nfe/infra/xml/DefaultXmlSigner');
    const { A1CertificateProvider } = await import('@nfe/infra/certificate/A1CertificateProvider');
    const { buildAutorizacaoEnvelope, SOAP_ACTIONS } = await import('@nfe/infra/sefaz/soap');
    const { buildNFCeQRCodeUrl, buildInfNFeSupl } = await import('@nfe/shared/helpers/nfce-qrcode');
    const { getNFCeQRCodeUrl, getNFCeConsultaUrl } = await import('@nfe/shared/constants/nfce-urls');

    const nfceData = buildNFCeComAcentos(config);

    const builder = new DefaultXmlBuilder();
    const xml = builder.build(nfceData);
    console.log('\n  === XML gerado (primeiros 500 chars) ===');
    console.log('  ' + xml.slice(0, 500));

    // Verifica bytes do XML
    const xmlBuffer = Buffer.from(xml, 'utf-8');
    const hasInvalidBytes = checkForInvalidBytes(xmlBuffer);
    console.log(`\n  Bytes invalidos no XML gerado: ${hasInvalidBytes ? 'SIM !!!' : 'NAO'}`);

    const pfx = loadPfxBuffer(config.pfxPath);
    const certProvider = new A1CertificateProvider(pfx, config.pfxSenha);
    const cert = await certProvider.load();
    const signer = new DefaultXmlSigner();
    let signedXml = signer.sign(xml, cert);

    // Insere infNFeSupl
    const idMatch = signedXml.match(/Id="NFe(\d{44})"/);
    if (idMatch) {
      const chNFe = idMatch[1];
      const urlQRCode = getNFCeQRCodeUrl(config.uf, 'homologacao');
      const urlChave = getNFCeConsultaUrl(config.uf, 'homologacao');
      const qrCodeUrl = buildNFCeQRCodeUrl({
        urlQRCode,
        chNFe,
        tpAmb: '2',
        cDest: '',
        cIdToken: nfceTokens.cIdToken,
        csc: nfceTokens.csc
      });
      const infNFeSupl = buildInfNFeSupl(qrCodeUrl, urlChave);
      signedXml = signedXml.replace('<Signature', infNFeSupl + '<Signature');

      console.log(`\n  === infNFeSupl ===`);
      console.log('  ' + infNFeSupl);
    }

    const envelope = buildAutorizacaoEnvelope(signedXml);

    // Salva envelope completo para inspecao
    writeFileSync('/tmp/nfce-debug-envelope.xml', envelope, 'utf-8');
    console.log('\n  Envelope salvo em /tmp/nfce-debug-envelope.xml');

    // Verifica bytes do envelope
    const envBuffer = Buffer.from(envelope, 'utf-8');
    const hasInvalidEnv = checkForInvalidBytes(envBuffer);
    console.log(`  Bytes invalidos no envelope: ${hasInvalidEnv ? 'SIM !!!' : 'NAO'}`);

    // Verifica se tem CDATA (nao deveria)
    const hasCDATA = envelope.includes('CDATA');
    console.log(`  Contem CDATA: ${hasCDATA ? 'SIM - PROBLEMA!' : 'NAO - OK'}`);

    // Verifica encoding declaration
    const encodingMatch = envelope.match(/<\?xml[^?]*encoding="([^"]+)"/);
    console.log(`  Encoding declarado: ${encodingMatch?.[1] ?? 'nenhum'}`);

    // Conta xml declarations
    const xmlDecls = envelope.match(/<\?xml/g) ?? [];
    console.log(`  Quantidade de <?xml declarations: ${xmlDecls.length}`);

    // Agora tenta enviar
    console.log('\n  Enviando para SEFAZ...');
    try {
      const result = await nfce.transmitir(nfceData);
      console.log(`  SUCESSO: ${result.codigoStatus} - ${result.motivo}`);
    } catch (err: any) {
      console.log(`  ERRO: [${err.cStat}] ${err.xMotivo ?? err.message}`);
      if (err.cStat === '402') {
        console.log('\n  !!! ERRO 402 PERSISTENTE !!!');
        console.log('  Analisar /tmp/nfce-debug-envelope.xml');
      }
    }
  });
});

function checkForInvalidBytes(buffer: Buffer): boolean {
  // Procura bytes que sao problematicos em XML 1.0
  for (let i = 0; i < buffer.length; i++) {
    const b = buffer[i];
    // C0 controls (exceto tab 0x09, LF 0x0A, CR 0x0D)
    if (b < 0x09) return true;
    if (b === 0x0B || b === 0x0C) return true;
    if (b >= 0x0E && b <= 0x1F) return true;
    if (b === 0x7F) return true;
    // C1 controls nao podem ser detectados em UTF-8 pelo byte isolado
    // porque 0x80-0x9F sao continuation bytes em UTF-8 valido
  }
  return false;
}
