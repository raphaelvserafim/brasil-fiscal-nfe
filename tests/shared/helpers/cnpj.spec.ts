import { describe, it } from 'node:test';
import assert from 'node:assert';
import { isValidCnpj, formatCnpj, cleanCnpj } from '@nfe/shared/helpers/cnpj';

describe('CNPJ', () => {
  describe('isValidCnpj', () => {
    it('deve validar CNPJ correto', () => {
      assert.strictEqual(isValidCnpj('11222333000181'), true);
    });

    it('deve rejeitar CNPJ com todos digitos iguais', () => {
      assert.strictEqual(isValidCnpj('11111111111111'), false);
      assert.strictEqual(isValidCnpj('00000000000000'), false);
    });

    it('deve rejeitar CNPJ com tamanho errado', () => {
      assert.strictEqual(isValidCnpj('1122233300018'), false);
      assert.strictEqual(isValidCnpj('112223330001811'), false);
    });

    it('deve rejeitar CNPJ com digito verificador invalido', () => {
      assert.strictEqual(isValidCnpj('11222333000182'), false);
    });
  });

  describe('formatCnpj', () => {
    it('deve formatar CNPJ corretamente', () => {
      assert.strictEqual(formatCnpj('11222333000181'), '11.222.333/0001-81');
    });
  });

  describe('cleanCnpj', () => {
    it('deve remover formatacao do CNPJ', () => {
      assert.strictEqual(cleanCnpj('11.222.333/0001-81'), '11222333000181');
    });
  });
});
