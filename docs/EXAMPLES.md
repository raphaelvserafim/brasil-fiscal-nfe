# Exemplos de Uso — @brasil-fiscal/nfe

Exemplos completos de como usar a lib. Todos os exemplos usam SEFAZ MT em homologacao.

---

## Uso recomendado: NFeCore

A forma mais simples de usar a lib. Configure uma vez, use em tudo:

```typescript
import { NFeCore } from '@brasil-fiscal/nfe';
import { readFileSync } from 'node:fs';

const nfe = NFeCore.create({
  pfx: readFileSync('./certificado.pfx'),
  senha: 'senha-do-certificado',
  ambiente: 'homologacao',
  uf: 'MT'
});

// Transmitir
const result = await nfe.transmitir(nfeData);

// Consultar
const status = await nfe.consultarProtocolo(result.chaveAcesso);

// Cancelar
await nfe.cancelar({
  chaveAcesso: result.chaveAcesso,
  cnpj: '12345678000195',
  protocolo: result.protocolo!,
  justificativa: 'Erro na emissao da nota fiscal eletronica'
});

// Carta de correcao
await nfe.cartaCorrecao({
  chaveAcesso: result.chaveAcesso,
  cnpj: '12345678000195',
  correcao: 'Correcao do endereco do destinatario para Rua ABC 123'
});

// Inutilizar numeracao
await nfe.inutilizar({
  cnpj: '12345678000195',
  ano: 2024,
  serie: 1,
  numeroInicial: 10,
  numeroFinal: 20,
  justificativa: 'Numeracao pulada por erro no sistema emissor'
});

// Distribuicao DFe
const docs = await nfe.distribuicaoPorNSU('12345678000195');
const doc = await nfe.distribuicaoPorChave('12345678000195', result.chaveAcesso);

// Manifestacao do destinatario
await nfe.manifestar.confirmar({ chaveAcesso: '...', cnpj: '12345678000195' });
await nfe.manifestar.ciencia({ chaveAcesso: '...', cnpj: '12345678000195' });
await nfe.manifestar.desconhecer({
  chaveAcesso: '...', cnpj: '12345678000195',
  justificativa: 'Nao reconheco esta operacao comercial'
});

// DANFE (requer pdfkit)
const pdf = await nfe.danfe(xmlAutorizado);
writeFileSync('danfe.pdf', pdf);
```

Providers customizados podem ser injetados na configuracao:

```typescript
const nfe = NFeCore.create({
  pfx: readFileSync('./certificado.pfx'),
  senha: 'senha',
  ambiente: 'producao',
  uf: 'MT',
  xmlBuilder: meuXmlBuilder,    // opcional
  xmlSigner: meuXmlSigner,      // opcional
  transport: meuTransport        // opcional
});
```

---

## NFC-e (Nota Fiscal de Consumidor Eletronica)

A mesma `NFeCore` emite NFe (modelo 55) e NFC-e (modelo 65). O modelo eh definido por nota, nao por instancia.

### Configuracao

Para NFC-e, voce precisa do `cIdToken` e `csc` (Codigo de Seguranca do Contribuinte), fornecidos pela SEFAZ do seu estado:

```typescript
import { NFeCore } from '@brasil-fiscal/nfe';
import { readFileSync } from 'node:fs';

const core = NFeCore.create({
  pfx: readFileSync('./certificado.pfx'),
  senha: 'senha-do-certificado',
  ambiente: 'homologacao',
  uf: 'MT',
  cIdToken: '000001',    // obrigatorio para NFC-e
  csc: 'SEU-CSC-AQUI'    // obrigatorio para NFC-e
});
```

### Emitir NFC-e (consumidor identificado)

```typescript
const result = await core.transmitir({
  identificacao: {
    naturezaOperacao: 'Venda de mercadoria',
    tipoOperacao: 1,
    destinoOperacao: 1,
    finalidade: 1,
    consumidorFinal: 1,
    presencaComprador: 1,  // 1 = presencial
    uf: 'MT',
    municipio: '5103403',
    serie: 1,
    numero: 1,
    modelo: '65',          // NFC-e
    tipoImpressao: 4       // 4 = DANFE NFC-e
  },
  emitente: {
    cnpj: '12345678000195',
    razaoSocial: 'Loja Teste Ltda',
    nomeFantasia: 'Loja Teste',
    inscricaoEstadual: '131234567',
    regimeTributario: 1,
    endereco: {
      logradouro: 'Rua das Flores',
      numero: '100',
      bairro: 'Centro',
      codigoMunicipio: '5103403',
      municipio: 'Cuiaba',
      uf: 'MT',
      cep: '78005000'
    }
  },
  destinatario: {
    cpf: '52998224725',
    nome: 'Maria da Silva',
    indicadorIE: 9
    // endereco eh opcional na NFC-e
  },
  produtos: [
    {
      numero: 1,
      codigo: '001',
      descricao: 'Camiseta Algodao P',
      ncm: '61091000',
      cfop: '5102',
      unidade: 'UN',
      quantidade: 2,
      valorUnitario: 49.90,
      valorTotal: 99.80,
      icms: { origem: 0, csosn: '102' },
      pis: { cst: '49' },
      cofins: { cst: '49' }
    }
  ],
  transporte: { modalidadeFrete: 9 },
  pagamento: {
    pagamentos: [{ formaPagamento: '01', valor: 99.80 }]
  }
});

console.log(result.autorizada);      // true
console.log(result.chaveAcesso);     // 44 digitos (modelo 65 na posicao 20-21)
console.log(result.xmlProtocolado);  // XML com <infNFeSupl> contendo qrCode e urlChave
```

### Emitir NFC-e (consumidor NAO identificado)

Para vendas de baixo valor, o destinatario pode ser omitido:

```typescript
const result = await core.transmitir({
  identificacao: {
    naturezaOperacao: 'Venda de mercadoria',
    tipoOperacao: 1,
    destinoOperacao: 1,
    finalidade: 1,
    consumidorFinal: 1,
    presencaComprador: 1,
    uf: 'MT',
    municipio: '5103403',
    serie: 1,
    numero: 2,
    modelo: '65',
    tipoImpressao: 4
  },
  emitente: {
    cnpj: '12345678000195',
    razaoSocial: 'Loja Teste Ltda',
    nomeFantasia: 'Loja Teste',
    inscricaoEstadual: '131234567',
    regimeTributario: 1,
    endereco: {
      logradouro: 'Rua das Flores',
      numero: '100',
      bairro: 'Centro',
      codigoMunicipio: '5103403',
      municipio: 'Cuiaba',
      uf: 'MT',
      cep: '78005000'
    }
  },
  // sem destinatario — consumidor nao identificado
  produtos: [
    {
      numero: 1,
      codigo: '002',
      descricao: 'Refrigerante 350ml',
      ncm: '22021000',
      cfop: '5102',
      unidade: 'UN',
      quantidade: 1,
      valorUnitario: 5.50,
      valorTotal: 5.50,
      icms: { origem: 0, csosn: '102' },
      pis: { cst: '49' },
      cofins: { cst: '49' }
    }
  ],
  transporte: { modalidadeFrete: 9 },
  pagamento: {
    pagamentos: [{ formaPagamento: '01', valor: 5.50 }]
  }
});
```

### Diferenças NFe vs NFC-e

| | NFe (modelo 55) | NFC-e (modelo 65) |
|---|---|---|
| `modelo` | `'55'` (default) | `'65'` |
| `tipoImpressao` | `1` (retrato A4) | `4` (DANFE NFC-e) |
| `destinatario` | obrigatorio | opcional |
| `cIdToken`/`csc` | nao precisa | obrigatorio no config |
| QR Code | nao tem | `<infNFeSupl>` com URL do QR Code |
| Impressao | DANFE A4 | Cupom termico 80mm (Fase 9b) |

### Usar QR Code manualmente

Se voce precisa gerar a URL do QR Code por conta propria:

```typescript
import { buildNFCeQRCodeUrl, getNFCeQRCodeUrl, getNFCeConsultaUrl } from '@brasil-fiscal/nfe';

const qrCodeUrl = buildNFCeQRCodeUrl({
  urlQRCode: getNFCeQRCodeUrl('MT', 'homologacao'),
  chNFe: '51260412345678000195650010000000021234567890',
  tpAmb: '2',
  cDest: '52998224725',       // CPF do consumidor (vazio se nao identificado)
  dhEmi: '2026-04-28T10:00:00-03:00',
  vNF: '99.80',
  vICMS: '0.00',
  digVal: 'base64DigestValue',
  cIdToken: '000001',
  csc: 'SEU-CSC-AQUI'
});

console.log(qrCodeUrl);
// https://homologacao.sefaz.mt.gov.br/nfce/consultanfce?p=5126041234...
```

---

## Uso avancado: providers e use cases individuais

Para controle total sobre cada etapa, use os providers e use cases diretamente.

### Setup comum

Todos os exemplos abaixo usam estes imports e configuracao:

```typescript
import { readFileSync } from 'node:fs';
import {
  A1CertificateProvider,
  DefaultXmlBuilder,
  DefaultXmlSigner,
  NodeHttpSefazTransport
} from '@brasil-fiscal/nfe';

// Certificado A1
const certificate = new A1CertificateProvider(
  readFileSync('./certificado.pfx'),
  'senha-do-certificado'
);

// Providers
const xmlBuilder = new DefaultXmlBuilder();
const xmlSigner = new DefaultXmlSigner();
const transport = new NodeHttpSefazTransport();
```

---

## 1. Gerar XML da NFe

```typescript
const nfeData = {
  identificacao: {
    naturezaOperacao: 'Venda de producao do estabelecimento',
    tipoOperacao: 1,       // 1 = saida
    destinoOperacao: 1,    // 1 = interna (mesmo estado)
    finalidade: 1,         // 1 = normal
    consumidorFinal: 1,    // 1 = sim
    presencaComprador: 1,  // 1 = presencial
    uf: 'MT',
    municipio: '5103403',  // Cuiaba (codigo IBGE)
    serie: 1,
    numero: 1
  },
  emitente: {
    cnpj: '12345678000195',
    razaoSocial: 'Empresa Teste Ltda',
    nomeFantasia: 'Empresa Teste',
    inscricaoEstadual: '131234567',
    regimeTributario: 1,   // 1 = Simples Nacional
    endereco: {
      logradouro: 'Rua das Flores',
      numero: '100',
      bairro: 'Centro',
      codigoMunicipio: '5103403',
      municipio: 'Cuiaba',
      uf: 'MT',
      cep: '78005000'
    }
  },
  destinatario: {
    cpf: '52998224725',
    nome: 'Joao da Silva',
    indicadorIE: 9,        // 9 = nao contribuinte
    endereco: {
      logradouro: 'Av Brasil',
      numero: '500',
      bairro: 'Centro',
      codigoMunicipio: '5103403',
      municipio: 'Cuiaba',
      uf: 'MT',
      cep: '78010100'
    }
  },
  produtos: [
    {
      numero: 1,
      codigo: 'PROD001',
      descricao: 'Camiseta Algodao P',
      ncm: '61091000',
      cfop: '5102',
      unidade: 'UN',
      quantidade: 2,
      valorUnitario: 49.90,
      valorTotal: 99.80,
      icms: {
        origem: 0,         // 0 = nacional
        csosn: '102'       // Simples Nacional sem credito
      },
      pis: { cst: '49' },
      cofins: { cst: '49' }
    }
  ],
  transporte: {
    modalidadeFrete: 9     // 9 = sem frete
  },
  pagamento: {
    pagamentos: [
      { formaPagamento: '01', valor: 99.80 }  // 01 = dinheiro
    ]
  }
};

const xml = xmlBuilder.build(nfeData);
```

---

## 2. Assinar XML

```typescript
const cert = await certificate.load();
const signedXml = xmlSigner.sign(xml, cert);
```

---

## 3. Transmitir para SEFAZ

```typescript
import { TransmitNFeUseCase } from '@brasil-fiscal/nfe';

const transmitir = new TransmitNFeUseCase({
  xmlBuilder,
  xmlSigner,
  certificate,
  transport,
  environment: 'homologation',
  uf: 'MT'
});

const result = await transmitir.execute(nfeData);

if (result.autorizada) {
  console.log('NFe autorizada!');
  console.log('Protocolo:', result.protocolo);
  console.log('Chave:', result.chaveAcesso);
}
```

---

## 4. Consultar protocolo

```typescript
import { ConsultProtocolUseCase } from '@brasil-fiscal/nfe';

const consultar = new ConsultProtocolUseCase({
  certificate,
  transport,
  environment: 'homologation'
});

// A UF eh extraida automaticamente da chave de acesso
const result = await consultar.execute('51240412345678000195550010000000011234567890');
console.log(result.codigoStatus); // '100' = autorizada
console.log(result.protocolo);
```

---

## 5. Cancelar NFe

```typescript
import { CancelaNFeUseCase } from '@brasil-fiscal/nfe';

const cancelar = new CancelaNFeUseCase({
  certificate,
  transport,
  xmlSigner,
  environment: 'homologation'
});

const result = await cancelar.execute({
  chaveAcesso: '51240412345678000195550010000000011234567890',
  cnpj: '12345678000195',
  protocolo: '151240000012345',
  justificativa: 'Erro na emissao da nota fiscal eletronica'  // minimo 15 caracteres
});

console.log(result.cStat); // '135' = evento registrado
```

---

## 6. Carta de Correcao (CC-e)

```typescript
import { CartaCorrecaoUseCase } from '@brasil-fiscal/nfe';

const corrigir = new CartaCorrecaoUseCase({
  certificate,
  transport,
  xmlSigner,
  environment: 'homologation'
});

// Primeira correcao
const result = await corrigir.execute({
  chaveAcesso: '51240412345678000195550010000000011234567890',
  cnpj: '12345678000195',
  correcao: 'Correcao do endereco do destinatario para Rua ABC 123'
});

// Segunda correcao na mesma NFe
const result2 = await corrigir.execute({
  chaveAcesso: '51240412345678000195550010000000011234567890',
  cnpj: '12345678000195',
  correcao: 'Correcao do nome do destinatario para Maria Silva',
  sequencia: 2
});
```

---

## 7. Inutilizar numeracao

```typescript
import { InutilizaNFeUseCase } from '@brasil-fiscal/nfe';

const inutilizar = new InutilizaNFeUseCase({
  certificate,
  transport,
  xmlSigner,
  environment: 'homologation'
});

const result = await inutilizar.execute({
  cnpj: '12345678000195',
  uf: 'MT',
  ano: 2024,
  serie: 1,
  numeroInicial: 10,
  numeroFinal: 20,
  justificativa: 'Numeracao pulada por erro no sistema emissor'
});

console.log(result.cStat); // '102' = inutilizacao homologada
```

---

## 8. Consultar NFes recebidas (Distribuicao DFe)

```typescript
import { DistribuicaoDFeUseCase } from '@brasil-fiscal/nfe';

const distribuicao = new DistribuicaoDFeUseCase({
  certificate,
  transport,
  environment: 'homologation'
});

// Consultar a partir do NSU 0 (inicio)
let ultNSU = '0';

const result = await distribuicao.consultarPorNSU('12345678000195', 'MT', ultNSU);

for (const doc of result.documentos) {
  console.log(`NSU: ${doc.nsu} | Schema: ${doc.schema}`);
  console.log(doc.xml); // XML descompactado (resNFe ou procNFe)
}

// Proxima pagina
ultNSU = result.ultNSU;
// Chamar consultarPorNSU novamente com o novo ultNSU

// Consultar por chave de acesso
const result2 = await distribuicao.consultarPorChave(
  '12345678000195',
  'MT',
  '51240412345678000195550010000000011234567890'
);
```

---

## 9. Manifestacao do Destinatario

```typescript
import { ManifestacaoUseCase } from '@brasil-fiscal/nfe';

const manifestacao = new ManifestacaoUseCase({
  certificate,
  transport,
  xmlSigner,
  environment: 'homologation'
});

const input = {
  chaveAcesso: '51240412345678000195550010000000011234567890',
  cnpj: '12345678000195'
};

// Ciencia da operacao (nao precisa de justificativa)
await manifestacao.ciencia(input);

// Confirmacao da operacao
await manifestacao.confirmar(input);

// Desconhecimento (precisa de justificativa, minimo 15 chars)
await manifestacao.desconhecer({
  ...input,
  justificativa: 'Nao reconheco esta operacao comercial'
});

// Operacao nao realizada (precisa de justificativa)
await manifestacao.naoRealizada({
  ...input,
  justificativa: 'Mercadoria devolvida ao remetente'
});
```

---

## 10. Gerar DANFE (PDF)

> Requer `pdfkit` instalado: `npm install pdfkit`

```typescript
import { GerarDanfeUseCase } from '@brasil-fiscal/nfe';
import { writeFileSync } from 'node:fs';

const danfe = new GerarDanfeUseCase();

// Aceita XML autorizado (com <protNFe>)
const pdf = await danfe.execute(xmlAutorizado);
writeFileSync('danfe.pdf', pdf);
```

---

## 11. Tratamento de erros

```typescript
import {
  SchemaValidationError,
  CertificateError,
  SefazRejectError,
  NFeError
} from '@brasil-fiscal/nfe';

try {
  const result = await transmitir.execute(nfeData);
} catch (error) {
  if (error instanceof CertificateError) {
    // Certificado expirado, senha incorreta, arquivo invalido
    console.error('Erro no certificado:', error.message);
  } else if (error instanceof SefazRejectError) {
    // SEFAZ rejeitou (ex: duplicidade, dados invalidos)
    console.error(`[${error.cStat}] ${error.xMotivo}`);
  } else if (error instanceof NFeError) {
    // Erro generico da lib (timeout, XML invalido, etc)
    console.error('Erro:', error.message);
  }
}
```

---

## Arquivos de exemplo

Veja a pasta [`examples/`](../examples/):
- `nfe-exemplo.xml` — XML de NFe gerado pelo DefaultXmlBuilder
- `danfe-exemplo.pdf` — DANFE em PDF

Para regenerar: `npx tsx scripts/generate-examples.ts`
