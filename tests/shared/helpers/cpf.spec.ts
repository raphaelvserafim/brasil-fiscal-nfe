import { describe, it } from 'node:test';
import assert from 'node:assert';
import { isValidCpf, formatCpf, cleanCpf } from '@nfe/shared/helpers/cpf';

describe('CPF', () => {
  describe('isValidCpf', () => {
    it('deve validar CPF correto', () => {
      assert.strictEqual(isValidCpf('52998224725'), true);
    });

    it('deve rejeitar CPF com todos digitos iguais', () => {
      assert.strictEqual(isValidCpf('11111111111'), false);
      assert.strictEqual(isValidCpf('00000000000'), false);
    });

    it('deve rejeitar CPF com tamanho errado', () => {
      assert.strictEqual(isValidCpf('1234567890'), false);
      assert.strictEqual(isValidCpf('123456789012'), false);
    });

    it('deve rejeitar CPF com digito verificador invalido', () => {
      assert.strictEqual(isValidCpf('52998224726'), false);
    });
  });

  describe('formatCpf', () => {
    it('deve formatar CPF corretamente', () => {
      assert.strictEqual(formatCpf('52998224725'), '529.982.247-25');
    });
  });

  describe('cleanCpf', () => {
    it('deve remover formatacao do CPF', () => {
      assert.strictEqual(cleanCpf('529.982.247-25'), '52998224725');
    });
  });
});
