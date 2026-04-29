import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { InutilizaNFeUseCase } from '@nfe/application/use-cases/InutilizaNFeUseCase';
import { SefazRejectError } from '@nfe/shared/errors/SefazRejectError';
import { NFeError } from '@nfe/shared/errors/NFeError';
import type { CertificateData } from '@nfe/contracts/CertificateProvider';

const fakeCert: CertificateData = {
  pfx: Buffer.from('fake-pfx'),
  password: 'test',
  notAfter: new Date('2030-01-01'),
  privateKey: 'fake-key',
  certPem: 'fake-cert'
};

function buildSoapInutResponse(cStat: string, xMotivo: string, nProt?: string): string {
  return [
    '<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">',
    '<soap12:Body>',
    '<retInutNFe><infInut>',
    `<cStat>${cStat}</cStat>`,
    `<xMotivo>${xMotivo}</xMotivo>`,
    nProt ? `<nProt>${nProt}</nProt>` : '',
    '</infInut></retInutNFe>',
    '</soap12:Body>',
    '</soap12:Envelope>'
  ].join('');
}

function createUseCase(soapResponse: string): InutilizaNFeUseCase {
  return new InutilizaNFeUseCase({
    certificate: { load: async () => fakeCert },
    transport: { send: async () => ({ xml: soapResponse, statusCode: 200 }) },
    xmlSigner: { sign: (xml: string) => xml },
    environment: 'homologation'
  });
}

const validInput = {
  cnpj: '12345678000195',
  uf: 'MT',
  ano: 2024,
  serie: 1,
  numeroInicial: 10,
  numeroFinal: 20,
  justificativa: 'Numeracao pulada por erro no sistema emissor'
};

describe('InutilizaNFeUseCase', () => {
  it('deve retornar InutilizacaoResult quando cStat 102', async () => {
    const response = buildSoapInutResponse('102', 'Inutilizacao homologada', '151240000099999');
    const useCase = createUseCase(response);

    const result = await useCase.execute(validInput);

    assert.equal(result.cStat, '102');
    assert.equal(result.nProt, '151240000099999');
  });

  it('deve lancar SefazRejectError quando cStat diferente de 102', async () => {
    const response = buildSoapInutResponse('206', 'Inutilizacao ja homologada');
    const useCase = createUseCase(response);

    await assert.rejects(
      () => useCase.execute(validInput),
      (err: unknown) => {
        assert.ok(err instanceof SefazRejectError);
        assert.equal(err.cStat, '206');
        return true;
      }
    );
  });

  it('deve lancar NFeError para justificativa curta', async () => {
    const useCase = createUseCase('');

    await assert.rejects(
      () => useCase.execute({ ...validInput, justificativa: 'curta' }),
      (err: unknown) => {
        assert.ok(err instanceof NFeError);
        assert.ok(err.message.includes('15 caracteres'));
        return true;
      }
    );
  });

  it('deve lancar NFeError para numero inicial maior que final', async () => {
    const useCase = createUseCase('');

    await assert.rejects(
      () => useCase.execute({ ...validInput, numeroInicial: 20, numeroFinal: 10 }),
      (err: unknown) => {
        assert.ok(err instanceof NFeError);
        assert.ok(err.message.includes('menor ou igual'));
        return true;
      }
    );
  });

  it('deve lancar NFeError para UF desconhecida', async () => {
    const useCase = createUseCase('');

    await assert.rejects(
      () => useCase.execute({ ...validInput, uf: 'XX' }),
      (err: unknown) => {
        assert.ok(err instanceof NFeError);
        assert.ok(err.message.includes('UF desconhecida'));
        return true;
      }
    );
  });
});
