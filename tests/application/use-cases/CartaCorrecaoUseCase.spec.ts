import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CartaCorrecaoUseCase } from '@nfe/application/use-cases/CartaCorrecaoUseCase';
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

const CHAVE = '51240412345678000195550010000000011234567890';

function buildSoapEventoResponse(cStat: string, xMotivo: string): string {
  return [
    '<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">',
    '<soap12:Body>',
    '<retEnvEvento><retEvento versao="1.00"><infEvento>',
    `<cStat>${cStat}</cStat>`,
    `<xMotivo>${xMotivo}</xMotivo>`,
    '<tpEvento>110110</tpEvento>',
    '</infEvento></retEvento></retEnvEvento>',
    '</soap12:Body>',
    '</soap12:Envelope>'
  ].join('');
}

function createUseCase(soapResponse: string): CartaCorrecaoUseCase {
  return new CartaCorrecaoUseCase({
    certificate: { load: async () => fakeCert },
    transport: { send: async () => ({ xml: soapResponse, statusCode: 200 }) },
    xmlSigner: { sign: (xml: string) => xml },
    environment: 'homologation'
  });
}

describe('CartaCorrecaoUseCase', () => {
  it('deve retornar EventoResult quando cStat 135', async () => {
    const response = buildSoapEventoResponse('135', 'Evento registrado');
    const useCase = createUseCase(response);

    const result = await useCase.execute({
      chaveAcesso: CHAVE,
      cnpj: '12345678000195',
      correcao: 'Correcao do endereco do destinatario para Rua ABC 123'
    });

    assert.equal(result.cStat, '135');
  });

  it('deve aceitar sequencia customizada', async () => {
    const response = buildSoapEventoResponse('135', 'Evento registrado');
    const useCase = createUseCase(response);

    const result = await useCase.execute({
      chaveAcesso: CHAVE,
      cnpj: '12345678000195',
      correcao: 'Segunda correcao do documento fiscal',
      sequencia: 2
    });

    assert.equal(result.cStat, '135');
  });

  it('deve lancar SefazRejectError quando cStat diferente de 135/136', async () => {
    const response = buildSoapEventoResponse('573', 'Duplicidade de evento');
    const useCase = createUseCase(response);

    await assert.rejects(
      () => useCase.execute({
        chaveAcesso: CHAVE,
        cnpj: '12345678000195',
        correcao: 'Correcao do endereco do destinatario para Rua ABC 123'
      }),
      (err: unknown) => {
        assert.ok(err instanceof SefazRejectError);
        return true;
      }
    );
  });

  it('deve lancar NFeError para correcao curta', async () => {
    const useCase = createUseCase('');

    await assert.rejects(
      () => useCase.execute({
        chaveAcesso: CHAVE,
        cnpj: '12345678000195',
        correcao: 'curta'
      }),
      (err: unknown) => {
        assert.ok(err instanceof NFeError);
        assert.ok(err.message.includes('15 caracteres'));
        return true;
      }
    );
  });

  it('deve lancar NFeError para sequencia invalida', async () => {
    const useCase = createUseCase('');

    await assert.rejects(
      () => useCase.execute({
        chaveAcesso: CHAVE,
        cnpj: '12345678000195',
        correcao: 'Correcao valida com mais de quinze caracteres',
        sequencia: 21
      }),
      (err: unknown) => {
        assert.ok(err instanceof NFeError);
        assert.ok(err.message.includes('1 e 20'));
        return true;
      }
    );
  });
});
