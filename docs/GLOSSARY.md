# Glossary — Termos Fiscais

Este glossario explica os termos fiscais brasileiros usados neste projeto. Util para desenvolvedores que nao trabalham com fiscal no dia a dia e para AI agents que precisam de contexto.

---

## Documentos Fiscais

| Termo | Significado |
|-------|-------------|
| **NFe** | Nota Fiscal Eletronica — documento fiscal digital que registra operacoes de circulacao de mercadorias (modelo 55) |
| **NFCe** | Nota Fiscal de Consumidor Eletronica — versao simplificada da NFe para venda ao consumidor final (modelo 65) |
| **CTe** | Conhecimento de Transporte Eletronico — documento fiscal para prestacao de servico de transporte |
| **MDFe** | Manifesto Eletronico de Documentos Fiscais — vincula documentos fiscais a uma operacao de transporte |
| **DANFE** | Documento Auxiliar da Nota Fiscal Eletronica — representacao impressa simplificada da NFe |

## Entidades e Participantes

| Termo | Significado |
|-------|-------------|
| **Emitente** | Empresa que emite a NFe (quem vende/envia a mercadoria) |
| **Destinatario** | Pessoa ou empresa que recebe a mercadoria |
| **SEFAZ** | Secretaria da Fazenda — orgao estadual que autoriza e armazena NFe |
| **ENCAT** | Encontro Nacional de Coordenadores e Administradores Tributarios — define padroes tecnicos da NFe |

## Certificado Digital

| Termo | Significado |
|-------|-------------|
| **Certificado A1** | Certificado digital armazenado em arquivo (.pfx ou .p12), validade de 1 ano |
| **Certificado A3** | Certificado digital armazenado em smartcard ou token USB |
| **PFX / P12** | Formato de arquivo que contem o certificado + chave privada, protegido por senha |
| **ICP-Brasil** | Infraestrutura de Chaves Publicas Brasileira — cadeia de confianca dos certificados |

## XML e Assinatura

| Termo | Significado |
|-------|-------------|
| **XMLDSig** | XML Digital Signature — padrao W3C para assinatura digital de XML |
| **C14N** | Canonicalizacao — processo de normalizar XML antes de assinar (remove variacoes irrelevantes) |
| **RSA-SHA1** | Algoritmo de assinatura exigido pela SEFAZ |
| **Envelope SOAP** | Formato de mensagem XML usado para comunicacao com webservices da SEFAZ |
| **XSD** | XML Schema Definition — define a estrutura valida do XML da NFe |

## Codigos e Tabelas

| Termo | Significado |
|-------|-------------|
| **CNPJ** | Cadastro Nacional de Pessoa Juridica — identificador unico de empresas (14 digitos) |
| **CPF** | Cadastro de Pessoa Fisica — identificador unico de individuos (11 digitos) |
| **IE** | Inscricao Estadual — registro da empresa junto a SEFAZ estadual |
| **NCM** | Nomenclatura Comum do Mercosul — classifica mercadorias para tributacao (8 digitos) |
| **CFOP** | Codigo Fiscal de Operacoes e Prestacoes — define a natureza da operacao (entrada/saida, estadual/interestadual) |
| **CST** | Codigo de Situacao Tributaria — define como o ICMS incide sobre o produto |
| **CSOSN** | Codigo de Situacao da Operacao do Simples Nacional — CST para empresas do Simples |
| **IBGE** | Instituto Brasileiro de Geografia e Estatistica — fornece codigos de UF e municipios |
| **UF** | Unidade da Federacao — estado brasileiro (SP, RJ, MG, etc.) |

## Impostos

| Termo | Significado |
|-------|-------------|
| **ICMS** | Imposto sobre Circulacao de Mercadorias e Servicos — imposto estadual principal |
| **IPI** | Imposto sobre Produtos Industrializados — imposto federal sobre industrializacao |
| **PIS** | Programa de Integracao Social — contribuicao social federal |
| **COFINS** | Contribuicao para Financiamento da Seguridade Social — contribuicao social federal |
| **ISS** | Imposto Sobre Servicos — imposto municipal (nao aplicavel a NFe de mercadorias) |

## Operacoes e Status

| Termo | Significado |
|-------|-------------|
| **Autorizacao** | Processo de envio da NFe para SEFAZ e recebimento do protocolo de autorizacao |
| **Protocolo** | Numero unico retornado pela SEFAZ confirmando a autorizacao |
| **Chave de Acesso** | Identificador unico da NFe com 44 digitos (contem UF, data, CNPJ, modelo, serie, numero, etc.) |
| **Homologacao** | Ambiente de teste da SEFAZ (NFe nao tem validade fiscal) |
| **Producao** | Ambiente real da SEFAZ (NFe tem validade fiscal) |
| **Cancelamento** | Anulacao de uma NFe ja autorizada (prazo de 24h em geral) |
| **CC-e** | Carta de Correcao Eletronica — corrige dados de uma NFe autorizada (nao altera valores) |
| **Inutilizacao** | Inutilizacao de numeracao nao utilizada (ex.: serie 1, numeros 10 a 15) |
| **Contingencia** | Modo de operacao quando a SEFAZ esta indisponivel |
| **Rejeicao** | SEFAZ recusou a NFe — retorna codigo (cStat) e motivo (xMotivo) |
| **Denegacao** | SEFAZ negou a autorizacao por irregularidade do emitente ou destinatario |

## Campos da NFe

| Campo XML | Significado |
|-----------|-------------|
| `cUF` | Codigo da UF do emitente (IBGE) |
| `cNF` | Codigo numerico aleatorio da NFe (8 digitos) |
| `natOp` | Natureza da operacao (ex.: "Venda de producao") |
| `mod` | Modelo do documento fiscal (55 = NFe, 65 = NFCe) |
| `serie` | Serie da NFe (1-999) |
| `nNF` | Numero da NFe (1-999999999) |
| `dhEmi` | Data/hora de emissao |
| `tpNF` | Tipo da operacao (0 = entrada, 1 = saida) |
| `idDest` | Identificador de destino (1 = interna, 2 = interestadual, 3 = exterior) |
| `cMunFG` | Codigo do municipio de ocorrencia do fato gerador (IBGE) |
| `tpImp` | Formato de impressao do DANFE |
| `tpEmis` | Tipo de emissao (1 = normal, 2-9 = contingencia) |
| `cDV` | Digito verificador da chave de acesso |
| `tpAmb` | Tipo de ambiente (1 = producao, 2 = homologacao) |
| `finNFe` | Finalidade de emissao (1 = normal, 2 = complementar, 3 = ajuste, 4 = devolucao) |
| `indFinal` | Indica operacao com consumidor final (0 = nao, 1 = sim) |
| **indPres** | Indicador de presenca do comprador (0 = nao se aplica, 1 = presencial, etc.) |
| `procEmi` | Processo de emissao (0 = aplicativo do contribuinte) |
| `verProc` | Versao do processo de emissao |

## Webservices SEFAZ

| Servico | Descricao |
|---------|-----------|
| `NFeAutorizacao4` | Recepcao de lote de NFe para autorizacao |
| `NFeRetAutorizacao4` | Consulta resultado do lote enviado |
| `NFeConsultaProtocolo4` | Consulta situacao de uma NFe pela chave de acesso |
| `NFeStatusServico4` | Verifica se o webservice esta operacional |
| `NFeInutilizacao4` | Inutilizacao de numeracao |
| `RecepcaoEvento4` | Registro de eventos (cancelamento, CC-e) |
| `NFeDistribuicaoDFe` | Distribuicao de documentos fiscais (manifestacao) |
