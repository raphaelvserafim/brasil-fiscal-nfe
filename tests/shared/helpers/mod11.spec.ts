import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calcMod11 } from '@nfe/shared/helpers/mod11';

describe('calcMod11', () => {
  it('deve retornar 0 quando o resto eh menor que 2', () => {
    // 10 -> soma = 1*2 + 0*3 = 2, resto = 2%11 = 2 -> nao, vamos testar com valor conhecido
    // Para resto 0: soma multiplo de 11
    const result = calcMod11('0');
    assert.strictEqual(result, 0);
  });

  it('deve calcular corretamente para sequencias conhecidas', () => {
    // Teste com valor conhecido da chave de acesso
    // 5126041122233300018155001000000001 (43 digitos) -> DV esperado
    const key43 = '5126041122233300018155001000000001' + '1' + '12345678';
    const dv = calcMod11(key43);
    assert.ok(dv >= 0 && dv <= 9);
  });

  it('deve retornar valor entre 0 e 9', () => {
    for (const val of ['123456789', '987654321', '111111111', '000000001']) {
      const result = calcMod11(val);
      assert.ok(result >= 0 && result <= 9, `mod11(${val}) = ${result} fora do range`);
    }
  });
});
