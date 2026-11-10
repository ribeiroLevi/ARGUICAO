# Candidatos à revisão acadêmica

Conjunto inicial de 56 candidatos, oito por documento local. Os IDs combinam o identificador estável do artigo com sufixos de 01 a 08. Não é uma cobertura exaustiva dos documentos.

| Documento | Cobertura selecionada |
| --- | --- |
| Art. 48 - Oficina.pdf | Modelos e alcance; conteúdo de usuários; exibição; publicidade; uso prolongado; revisão; termos de uso; critérios adicionais. |
| chiplaycompanion25-21.pdf | Tese especulativa; creator-consumer divide; vulnerabilidades; arbitragem regulatória; limites WEIRD; cenário ficcional; exploração no cenário; parcerias equitativas. |
| From Understanding to Intervention | Lacuna de implementação; expansão da pesquisa; contribuição de IHC; documentação colaborativa; ferramentas propostas; agência e alertas; restrições organizacionais; avaliação de impacto. |
| Interact 2025 | Objetivo; corpus e procedimento; classificação; prevalência; macroclasses; Untranslation; aplicações novas de padrões conhecidos; limitações. |
| Operationalizing Radiant Patterns | Contribuições; definição refinada; prevenção; identificação pela equipe; template; riscos de implementação; orientação positiva; limites de validação e adoção. |
| HCI_IN_GAMES_2026.pdf | Ferramentas; método em três fases; autoetnografia; níveis; invariantes e variantes; regras do template; verificação de candidatos; limites. |
| SBD - Overview May19.pdf | Conceito; consulta; participação; três princípios; responsabilidade do prestador; configuração padrão e autonomia; retorno às denúncias; caráter voluntário e limites das notas de boas práticas. |

As respostas estão em português; as evidências preservam literalmente o idioma e as quebras do texto extraído, com numeração física dos PDFs. Os títulos são os das extrações verificadas. Nenhum conteúdo acadêmico externo foi consultado.

Cuidados editoriais: o cenário de Helena é identificado como especulativo; o position paper contém propostas de pesquisa, não resultados de ferramentas implementadas; os estudos sobre Radiant Patterns mantêm limites de validação; Art. 48 é apresentado como documento local, sem alegação de vigência normativa. Não foram reproduzidas as interpretações estatísticas inconsistentes do parágrafo inferencial do Interact na página física 6 nem seus percentuais comparativos problemáticos na página 7.

`build-candidates.mjs` é um artefato autoral que lê exclusivamente `data/extracted/` e recria os sete arquivos de candidatos. Reexecutá-lo restaura a versão contida no script e pode exigir nova revisão semântica, inclusive após correções editoriais. Ele não aprova nem publica cartões. Somente o revisor pode gravar aprovados em `src/data/cards.json`.

Foi executada a conferência de títulos, SHA-256 dos originais e presença literal das evidências nas páginas citadas: 56 candidatos sem divergências. Essa conferência não constitui aprovação semântica; as decisões independentes pertencem a `data/reviews/`.
