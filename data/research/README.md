# Pesquisa colaborativa para a ampliação

Sete pesquisadores têm uma fonte principal cada. O trabalho acontece em rodadas, respeitando o limite de quatro agentes ativos incluindo o Orchestrator. Há um grupo separado para interface e lógica; os pesquisadores não alteram `src/`. Autoria, diálogo entre pares e revisão acadêmica independente são etapas distintas.

| Pesquisador | Fonte principal | Notas e diálogo |
| --- | --- | --- |
| research_sbd | Safety by Design Overview | [Plano e cobertura](article-d4b0c4f9d75f.md) |
| research_art48 | Art. 48 — Oficina | [Plano e cobertura](article-94e7a19d8878.md) |
| research_chip | Games Made Elsewhere, Harms Felt Here | [Plano e cobertura](article-eca18e5843e2.md) |
| research_agenda | From Understanding to Intervention | [Plano e cobertura](article-d0d500126a80.md) |
| research_radiant | Operationalizing Radiant Patterns | [Plano e cobertura](article-39adb0cfa84e.md) |
| research_hci | Beyond Dark Patterns in Games | [Plano e cobertura](article-e13c3cb65c28.md) |
| research_interact | It’s Like a Dark Patterns Paradise | [Plano e cobertura](article-48bdcebcffc6.md) |

Cada pesquisador prepara 50 novos candidatos com IDs de 09 a 58, incluindo conteúdo direto detalhado e sínteses com outras fontes. Os candidatos ficam em `data/candidates/expansion/`; ainda precisam de revisão independente para publicação. O arquivo de notas de cada pesquisador deve registrar o diálogo com os seis pares, suas críticas e decisões editoriais.

As fontes são exclusivamente os documentos locais de `artigos/`, com extrações e páginas físicas em `data/extracted/`. As correlações são análises comparativas fundamentadas nos trechos de cada documento, sem atribuir aos autores um estudo conjunto que não realizaram ou presumir efeitos causais não demonstrados.

`baseline.json` registra SHA-256 dos 56 cartões e respectivas revisões anteriores, além dos sete documentos, antes desta ampliação. O comando `node scripts/check-expansion.mjs` verifica, ao final, que esse conjunto permanece idêntico e que há 50 cartões novos por fonte principal.

Regras de schema, fontes adicionais, hashes e estatísticas: [contrato da ampliação](../../docs/expansion-contract.md). Decisões semânticas independentes: `data/reviews/`.

## Entrega e diálogo

Os sete pesquisadores foram executados de fato e entregaram 350 candidatos: 229 diretos e 121 sínteses, cobrindo os 21 pares possíveis de documentos. Cada pesquisador enviou e recebeu mensagens diretas dos seis pares e registrou o fechamento nas notas individuais. Uma interrupção por limite de uso ocorreu antes dos conjuntos HCI/Interact e do encerramento do diálogo; essas tarefas foram retomadas e concluídas.

A revisão independente foi concluída em três grupos separados da autoria: SbD/Art. 48/CHIP; Agenda/HCI; Operationalizing/Interact. Oito pedidos de correção foram aplicados pelos autores e aprovados em nova rodada. As 350 decisões atuais estão aprovadas, com hashes de todas as fontes. O publicador integrou 406 cartões, preservando exatamente os 56 anteriores e suas revisões; o [manifesto de publicação](../reviews/expansion/publication-manifest.json) registra o conjunto final. O sufixo numérico inicial do novo conjunto CHIP foi preservado como `-9`, sem zero à esquerda; os IDs dos cartões antigos não foram alterados.
