import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getNFCeConsultaUrl, getNFCeQRCodeUrl } from '@nfe/shared/constants/nfce-urls';

describe('nfce-urls', () => {
  describe('getNFCeQRCodeUrl', () => {
    it('deve retornar URL de QR Code para MT homologacao', () => {
      const url = getNFCeQRCodeUrl('MT', 'homologacao');
      assert.ok(url.includes('homologacao'));
      assert.ok(url.includes('nfce'));
    });

    it('deve retornar URL de QR Code para MT producao', () => {
      const url = getNFCeQRCodeUrl('MT', 'producao');
      assert.ok(!url.includes('homologacao'));
    });

    it('deve lancar erro para UF nao configurada', () => {
      assert.throws(
        () => getNFCeQRCodeUrl('XX', 'homologacao'),
        /UF/
      );
    });
  });

  describe('getNFCeConsultaUrl', () => {
    it('deve retornar URL de consulta para MT', () => {
      const url = getNFCeConsultaUrl('MT', 'homologacao');
      assert.ok(url.includes('nfce'));
    });
  });
});
