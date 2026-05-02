import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCancelamentoXml,
  buildCartaCorrecaoXml,
  buildInutilizacaoXml,
  wrapEventoSoapEnvelope,
  wrapInutilizacaoSoapEnvelope,
  parseEventoResponse,
  parseInutilizacaoResponse
} from '@nfe/infra/sefaz/evento-soap';

const CHAVE = '51240412345678000195550010000000011234567890';

describe('evento-soap', () => {
  describe('buildCancelamentoXml', () => {
    it('deve gerar XML de cancelamento com tpEvento 110111', () => {
      const xml = buildCancelamentoXml(
        CHAVE, '12345678000195', '51', '2',
        '151240000012345', 'Erro na emissao da nota fiscal', '2024-04-29T10:00:00-04:00'
      );

      assert.ok(xml.includes('<tpEvento>110111</tpEvento>'));
      assert.ok(xml.includes(`Id="ID110111${CHAVE}01"`));
      assert.ok(xml.includes('<descEvento>Cancelamento</descEvento>'));
      assert.ok(xml.includes('<nProt>151240000012345</nProt>'));
      assert.ok(xml.includes('<xJust>Erro na emissao da nota fiscal</xJust>'));
      assert.ok(xml.includes('<cOrgao>51</cOrgao>'));
    });
  });

  describe('buildCartaCorrecaoXml', () => {
    it('deve gerar XML de CC-e com tpEvento 110110', () => {
      const xml = buildCartaCorrecaoXml(
        CHAVE, '12345678000195', '51', '2',
        'Correcao do endereco do destinatario', 1, '2024-04-29T10:00:00-04:00'
      );

      assert.ok(xml.includes('<tpEvento>110110</tpEvento>'));
      assert.ok(xml.includes(`Id="ID110110${CHAVE}01"`));
      assert.ok(xml.includes('<descEvento>Carta de Correcao</descEvento>'));
      assert.ok(xml.includes('<xCorrecao>Correcao do endereco do destinatario</xCorrecao>'));
      assert.ok(xml.includes('<xCondUso>'));
      assert.ok(xml.includes('<nSeqEvento>1</nSeqEvento>'));
    });

    it('deve gerar Id com sequencia padded para sequencia > 1', () => {
      const xml = buildCartaCorrecaoXml(
        CHAVE, '12345678000195', '51', '2',
        'Segunda correcao do documento', 3, '2024-04-29T10:00:00-04:00'
      );

      assert.ok(xml.includes(`Id="ID110110${CHAVE}03"`));
      assert.ok(xml.includes('<nSeqEvento>3</nSeqEvento>'));
    });
  });

  describe('buildInutilizacaoXml', () => {
    it('deve gerar XML de inutilizacao', () => {
      const xml = buildInutilizacaoXml(
        '12345678000195', '51', '2', '24',
        '1', '10', '20', 'Numeracao pulada por erro no sistema'
      );

      assert.ok(xml.includes('<inutNFe versao="4.00"'));
      assert.ok(xml.includes('Id="ID51241234567800019555001000000010000000020"'));
      assert.ok(xml.includes('<xServ>INUTILIZAR</xServ>'));
      assert.ok(xml.includes('<mod>55</mod>'));
      assert.ok(xml.includes('<nNFIni>10</nNFIni>'));
      assert.ok(xml.includes('<nNFFin>20</nNFFin>'));
    });
  });

  describe('wrapEventoSoapEnvelope', () => {
    it('deve envolver evento assinado em SOAP', () => {
      const signedXml = '<evento versao="1.00"><infEvento>...</infEvento><Signature/></evento>';
      const envelope = wrapEventoSoapEnvelope(signedXml);

      assert.ok(envelope.includes('<soap:Envelope'));
      assert.ok(envelope.includes('<envEvento versao="1.00"'));
      assert.ok(envelope.includes('<idLote>1</idLote>'));
      assert.ok(envelope.includes('NFeRecepcaoEvento4'));
      assert.ok(envelope.includes('<evento versao="1.00">'));
    });
  });

  describe('wrapInutilizacaoSoapEnvelope', () => {
    it('deve envolver inutilizacao assinada em SOAP', () => {
      const signedXml = '<inutNFe versao="4.00"><infInut>...</infInut><Signature/></inutNFe>';
      const envelope = wrapInutilizacaoSoapEnvelope(signedXml);

      assert.ok(envelope.includes('<soap:Envelope'));
      assert.ok(envelope.includes('NFeInutilizacao4'));
      assert.ok(envelope.includes('<inutNFe versao="4.00">'));
    });
  });

  describe('parseEventoResponse', () => {
    it('deve parsear resposta de evento registrado (cStat 135)', () => {
      const body = [
        '<retEnvEvento>',
        '<retEvento versao="1.00">',
        '<infEvento>',
        '<cStat>135</cStat>',
        '<xMotivo>Evento registrado e vinculado a NF-e</xMotivo>',
        '<nProt>151240000012345</nProt>',
        `<chNFe>${CHAVE}</chNFe>`,
        '<tpEvento>110111</tpEvento>',
        '<dhRegEvento>2024-04-29T10:00:00-04:00</dhRegEvento>',
        '</infEvento>',
        '</retEvento>',
        '</retEnvEvento>'
      ].join('');

      const result = parseEventoResponse(body);
      assert.equal(result.cStat, '135');
      assert.equal(result.nProt, '151240000012345');
      assert.equal(result.tpEvento, '110111');
      assert.ok(result.dhRegEvento);
    });

    it('deve parsear rejeicao de evento', () => {
      const body = [
        '<retEnvEvento>',
        '<retEvento versao="1.00">',
        '<infEvento>',
        '<cStat>573</cStat>',
        '<xMotivo>Rejeicao: Duplicidade de evento</xMotivo>',
        '</infEvento>',
        '</retEvento>',
        '</retEnvEvento>'
      ].join('');

      const result = parseEventoResponse(body);
      assert.equal(result.cStat, '573');
    });

    it('deve lancar erro se resposta sem cStat', () => {
      assert.throws(
        () => parseEventoResponse('<retEnvEvento></retEnvEvento>'),
        { message: /sem cStat/ }
      );
    });
  });

  describe('parseInutilizacaoResponse', () => {
    it('deve parsear inutilizacao homologada (cStat 102)', () => {
      const body = [
        '<retInutNFe>',
        '<infInut>',
        '<cStat>102</cStat>',
        '<xMotivo>Inutilizacao de numero homologado</xMotivo>',
        '<nProt>151240000099999</nProt>',
        '<dhRecbto>2024-04-29T10:00:00-04:00</dhRecbto>',
        '</infInut>',
        '</retInutNFe>'
      ].join('');

      const result = parseInutilizacaoResponse(body);
      assert.equal(result.cStat, '102');
      assert.equal(result.nProt, '151240000099999');
      assert.ok(result.dhRecbto);
    });

    it('deve lancar erro se resposta sem cStat', () => {
      assert.throws(
        () => parseInutilizacaoResponse('<retInutNFe></retInutNFe>'),
        { message: /sem cStat/ }
      );
    });
  });
});
