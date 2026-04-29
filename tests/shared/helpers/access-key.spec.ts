import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateAccessKey, generateNumericCode } from '@nfe/shared/helpers/access-key';

describe('Chave de Acesso', () => {
  describe('generateAccessKey', () => {
    it('deve gerar chave com 44 digitos', () => {
      const key = generateAccessKey({
        uf: '51', // MT
        dataEmissao: new Date('2026-04-28'),
        cnpj: '11222333000181',
        modelo: '55',
        serie: 1,
        numero: 1,
        tipoEmissao: 1,
        codigoNumerico: '12345678'
      });

      assert.strictEqual(key.length, 44);
    });

    it('deve iniciar com codigo da UF', () => {
      const key = generateAccessKey({
        uf: '51',
        dataEmissao: new Date('2026-04-28'),
        cnpj: '11222333000181',
        modelo: '55',
        serie: 1,
        numero: 1,
        tipoEmissao: 1,
        codigoNumerico: '12345678'
      });

      assert.strictEqual(key.substring(0, 2), '51');
    });

    it('deve conter AAMM correto na posicao 2-5', () => {
      const key = generateAccessKey({
        uf: '51',
        dataEmissao: new Date('2026-04-15'),
        cnpj: '11222333000181',
        modelo: '55',
        serie: 1,
        numero: 1,
        tipoEmissao: 1,
        codigoNumerico: '12345678'
      });

      assert.strictEqual(key.substring(2, 6), '2604');
    });

    it('deve conter CNPJ na posicao 6-19', () => {
      const key = generateAccessKey({
        uf: '51',
        dataEmissao: new Date('2026-04-28'),
        cnpj: '11222333000181',
        modelo: '55',
        serie: 1,
        numero: 1,
        tipoEmissao: 1,
        codigoNumerico: '12345678'
      });

      assert.strictEqual(key.substring(6, 20), '11222333000181');
    });

    it('deve conter apenas digitos', () => {
      const key = generateAccessKey({
        uf: '51',
        dataEmissao: new Date('2026-04-28'),
        cnpj: '11222333000181',
        modelo: '55',
        serie: 1,
        numero: 1,
        tipoEmissao: 1,
        codigoNumerico: '12345678'
      });

      assert.ok(/^\d{44}$/.test(key));
    });
  });

  describe('generateNumericCode', () => {
    it('deve gerar codigo com 8 digitos', () => {
      const code = generateNumericCode();
      assert.strictEqual(code.length, 8);
    });

    it('deve conter apenas digitos', () => {
      const code = generateNumericCode();
      assert.ok(/^\d{8}$/.test(code));
    });
  });
});
