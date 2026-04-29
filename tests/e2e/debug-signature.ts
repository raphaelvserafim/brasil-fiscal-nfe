import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { DefaultXmlBuilder } from '@nfe/infra/xml/DefaultXmlBuilder';
import { DefaultXmlSigner } from '@nfe/infra/xml/DefaultXmlSigner';
import { A1CertificateProvider } from '@nfe/infra/certificate/A1CertificateProvider';
import { canonicalize } from '@nfe/infra/xml/canonicalize';
import type { NFeProps } from '@nfe/domain/entities/NFe';
import { loadE2EConfig, loadPfxBuffer } from './env-loader';
import {
  buildAutorizacaoEnvelope
} from '@nfe/infra/sefaz/soap';

async function main(): Promise<void> {
  const config = loadE2EConfig();
  if (!config) {
    console.log('Config nao encontrada');
    return;
  }

  const nfeData: NFeProps = {
    identificacao: {
      naturezaOperacao: 'VENDA DE MERCADORIA',
      tipoOperacao: 1, destinoOperacao: 1, finalidade: 1,
      consumidorFinal: 1, presencaComprador: 1,
      uf: config.uf, municipio: config.codMunicipio,
      serie: 1, numero: 999999,
      dataEmissao: new Date('2026-04-29T12:00:00-03:00')
    },
    emitente: {
      cnpj: config.cnpj, razaoSocial: config.razaoSocial,
      inscricaoEstadual: config.ie, regimeTributario: 1,
      endereco: {
        logradouro: config.logradouro, numero: config.numero,
        bairro: config.bairro, codigoMunicipio: config.codMunicipio,
        municipio: config.municipio, uf: config.uf, cep: config.cep
      }
    },
    destinatario: {
      nome: 'NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL',
      cnpj: config.cnpj, indicadorIE: 9,
      endereco: {
        logradouro: config.logradouro, numero: config.numero,
        bairro: config.bairro, codigoMunicipio: config.codMunicipio,
        municipio: config.municipio, uf: config.uf, cep: config.cep
      }
    },
    produtos: [{
      numero: 1, codigo: 'PROD001',
      descricao: 'NOTA FISCAL EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL',
      ncm: '94036000', cfop: '5102', unidade: 'UN',
      quantidade: 1, valorUnitario: 10.00, valorTotal: 10.00,
      icms: { origem: 0, cst: '00', aliquota: 17, baseCalculo: 10.00, valor: 1.70 },
      pis: { cst: '49' }, cofins: { cst: '49' }
    }],
    transporte: { modalidadeFrete: 9 },
    pagamento: { pagamentos: [{ formaPagamento: '01', valor: 10.00 }] },
    informacoesComplementares: 'NOTA FISCAL EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL'
  };

  const builder = new DefaultXmlBuilder();
  const xml = builder.build(nfeData);

  const pfx = loadPfxBuffer(config.pfxPath);
  const certProvider = new A1CertificateProvider(pfx, config.pfxSenha);
  const cert = await certProvider.load();
  const signer = new DefaultXmlSigner();
  const signedXml = signer.sign(xml, cert);

  console.log('=== SIGNED XML (completo) ===');
  writeFileSync('/tmp/nfe-signed.xml', signedXml);
  console.log('Salvo em /tmp/nfe-signed.xml');

  // Envelope SOAP
  const envelope = buildAutorizacaoEnvelope(signedXml);
  writeFileSync('/tmp/nfe-envelope.xml', envelope);
  console.log('Envelope salvo em /tmp/nfe-envelope.xml');

  // Verificar com xmllint a assinatura
  console.log('\n=== VERIFICACAO MANUAL ===');

  // 1. Extrair infNFe do XML assinado (como a SEFAZ faria)
  const infNFeFromSigned = signedXml.match(/<infNFe[^>]*>[\s\S]*<\/infNFe>/);
  if (infNFeFromSigned) {
    console.log('\n1. infNFe tag abertura (no signed XML):');
    console.log(infNFeFromSigned[0].match(/<infNFe[^>]*>/)?.[0]);

    // A SEFAZ canonicalizaria infNFe no contexto de <NFe xmlns="...">
    // Para simular, precisamos adicionar o namespace herdado
    const infNFeWithNs = infNFeFromSigned[0].includes('xmlns=')
      ? infNFeFromSigned[0]
      : infNFeFromSigned[0].replace('<infNFe ', '<infNFe xmlns="http://www.portalfiscal.inf.br/nfe" ');

    const canonInfNFe = canonicalize(infNFeWithNs);
    const digestVerify = createHash('sha1').update(canonInfNFe).digest('base64');

    console.log('2. Digest recalculado (com ns):', digestVerify);

    const digestInXml = signedXml.match(/<DigestValue>([^<]+)<\/DigestValue>/);
    console.log('3. Digest no XML:', digestInXml?.[1]);
    console.log('4. Digests iguais?', digestVerify === digestInXml?.[1]);
  }

  // 2. Verificar SignedInfo
  console.log('\n=== SIGNED INFO ===');
  const signedInfoMatch = signedXml.match(/<SignedInfo[^>]*>[\s\S]*?<\/SignedInfo>/);
  if (signedInfoMatch) {
    console.log('SignedInfo:');
    console.log(signedInfoMatch[0]);

    // Canonicalizar como standalone (como nos calculamos)
    const canonStandalone = canonicalize(signedInfoMatch[0]);
    console.log('\nCanonicalizado (standalone):');
    console.log(canonStandalone);

    // Canonicalizar como seria no contexto (dentro de Signature xmlns="...")
    // Nesse caso, xmlns ja esta no SignedInfo, entao nao muda
    const signedInfoNoNs = signedInfoMatch[0].replace(/ xmlns="[^"]*"/, '');
    const canonInContext = canonicalize(signedInfoNoNs);
    console.log('\nCanonicalizado (sem xmlns - como SEFAZ faria em contexto):');
    console.log(canonInContext);

    console.log('\nSao iguais?', canonStandalone === canonInContext);
  }

  // 3. Verificar com xmllint --c14n no XML completo assinado
  try {
    const { execSync } = await import('node:child_process');

    // Salvar o NFe completo (sem envelope, com Signature)
    const nfeOnly = signedXml.replace(/<\?xml[^?]*\?>\s*/g, '');
    writeFileSync('/tmp/nfe-only.xml', '<?xml version="1.0" encoding="UTF-8"?>' + nfeOnly);

    // xmllint --c14n no NFe completo
    const c14nFull = execSync('xmllint --c14n /tmp/nfe-only.xml 2>&1').toString();
    writeFileSync('/tmp/nfe-c14n.xml', c14nFull);
    console.log('\n=== XMLLINT C14N (NFe completo) ===');
    console.log('Primeiros 300 chars:');
    console.log(c14nFull.slice(0, 300));
  } catch (e) {
    console.log('\nxmllint erro:', (e as Error).message?.slice(0, 200));
  }
}

main().catch(console.error);
