# Revisão acadêmica independente

Revisor: agente `academic_reviewer`, execução independente do agente autor. Fontes acadêmicas usadas: exclusivamente os sete PDFs locais em `artigos/`. A conferência semântica confronta perguntas e respostas com páginas físicas dos PDFs, lidas diretamente com PDF.js, e com a extração em `data/extracted/`. A localização começa em 1 e pode diferir da numeração impressa.

`reviews.json` contém uma decisão atual por cartão, justificativa semântica, hash SHA-256 do cartão e do arquivo original. Somente cartões com decisão `approved` são publicados pelo revisor em `src/data/cards.json`. A checagem literal de evidências complementa a revisão; não a substitui.

## Cuidados identificados nos originais

- **Art. 48 - Oficina.pdf:** o documento local apresenta um resumo e um texto de Art. 48. A revisão não verifica publicação oficial ou vigência jurídica. Os cartões devem falar do que o documento apresenta, sem oferecer orientação jurídica ou afirmar vigência. A camada de texto contém espaços em ligaturas (`classi fi cação` etc.); as evidências preservam o texto extraído.
- **Games Made Elsewhere, Harms Felt Here:** trata-se de argumentação teórica com cenário de design especulativo. Helena, Ouroboros Seed e seu dashboard são artefatos imaginados, não observações empíricas ou produtos reais demonstrados pelo estudo.
- **From Understanding to Intervention:** é um position paper e agenda de pesquisa. Ferramentas, contramedidas e possíveis benefícios são propostas que requerem testes empíricos, não resultados de eficácia já demonstrados.
- **It’s Like a Dark Patterns Paradise:** os achados dizem respeito aos 100 aplicativos Android gratuitos e em alta selecionados no contexto brasileiro, observados por dez minutos em emulador. Não se generalizam automaticamente a todos os aplicativos ou a efeitos causais nos usuários. Os seis casos descritos são aplicações novas de padrões conhecidos. Na página física 6, a interpretação textual da comparação Nagging/Forced Action e o valor `p = 0.008` apresentado juntos são ambíguos; na página 7 há percentuais comparativos negativos de difícil interpretação. Essas comparações inferenciais não devem ser convertidas em conclusões categóricas nos cartões.
- **Operationalizing Radiant Patterns:** a definição e o template são propostas com exemplos de aplicação. O texto não apresenta avaliações com jogadores que validem efeitos diretos em bem-estar, nem demonstra viabilidade comercial concreta. Preservar necessidades psicológicas não equivale a eliminar toda experiência negativa ou desafio de jogo.
- **Beyond Dark Patterns in Games:** processo qualitativo em três fases, com nove participantes e amostra centrada em especialistas. A autoetnografia identifica instâncias e candidatos; recorrência e verificação colaborativa ainda são necessárias. Não há dados longitudinais nem validação do framework em desenvolvimento ativo. Na página física 12, o texto anuncia onze instâncias em Metroid Dread, mas enumera contagens 3 + 5 + 4, que somam doze. Esse total inconsistente não deve ser publicado como resultado seguro. L1–L3 formam uma base metodológica, não uma alegação de experiência universal.
- **Safety by Design Overview (May 2019):** orientações e consulta descritas na edição de maio de 2019. Os princípios são voluntários. Na página física 21, as notas de boas práticas são explicitamente ilustrativas e carecem de evidência robusta de eficácia e impacto; exemplos históricos não podem ser apresentados como estado atual dos serviços.

Nenhuma lacuna foi preenchida com pesquisa externa ou conhecimento do modelo. Ausência de OCR e possíveis ambiguidades de colunas, tabelas e fórmulas estão detalhadas em `docs/extraction-report.md`.

## Estado

Revisão concluída: 56 cartões aprovados e publicados, oito por documento. Cada pergunta e resposta foi examinada semanticamente em confronto com o original; números, limites, qualificações e distinções entre propostas, ficção e achados empíricos foram preservados. A auditoria literal adicional leu diretamente 44 páginas físicas dos sete PDFs e conferiu todas as evidências dos 56 cartões, sem divergências. `original-page-audit.json` registra hashes dos arquivos e do texto normalizado das páginas consultadas; não constitui, por si só, a aprovação semântica.

Três candidatos exigiram correção antes da aprovação: `article-94e7a19d8878-07` passou a explicitar o alcance do §12 a fornecedores que hospedem conteúdo de terceiros; `article-eca18e5843e2-03` recebeu evidência explícita sobre precariedade e letramento; `article-eca18e5843e2-05` recebeu evidência explícita sobre desequilíbrio de poder. O autor corrigiu os três, e o revisor os examinou novamente antes de publicá-los. As decisões iniciais `revision_required`, com snapshots e hashes das versões antigas, estão em `revision-history.json`; `reviews.json` contém somente a decisão atual `approved` de cada cartão e os hashes da versão publicada.

O conjunto é uma seleção inicial para arguição; não pretende esgotar os conteúdos dos documentos. Não houve publicação de candidatos sem aprovação nem uso dos números inconsistentes identificados acima.

## Ampliação — primeiro grupo de revisão independente

O mesmo revisor recebeu exclusivamente os 150 candidatos novos de Safety by Design, Art. 48 e Games Made Elsewhere, além da responsabilidade futura de integrar os resultados dos outros revisores. A primeira rodada está concluída em `data/reviews/expansion/review-<articleId>.json`: 145 decisões `approved` e cinco `revision_required`. Nenhum candidato da ampliação foi publicado nesta rodada.

Foram lidas individualmente todas as perguntas e respostas, confrontando seus escopos, qualificações, números, comparações e limites com os documentos originais. O mapa dos 18 subprincípios e respectivas notas de boas práticas do SbD foi conferido, assim como historicidade de maio de 2019, ausência de garantia de eficácia, caráter documental local do Art. 48 e natureza especulativa de Helena/Ouroboros Seed. As sínteses foram examinadas nas duas ou três frentes, sem tratar analogia como equivalência, causa ou avaliação integrada já realizada.

A auditoria literal complementar leu diretamente 51 páginas físicas únicas nos sete PDFs, cobrindo todas as evidências e fontes adicionais dos 150 candidatos. O relatório `expansion/audit-reviewer.json` registra hashes dos originais, páginas e candidatos. A auditoria não substitui as justificativas semânticas individuais.

Pedidos de correção da primeira rodada, com snapshots e hashes em `expansion/history-reviewer.json`:

- `article-d4b0c4f9d75f-50`: acrescentar a página 21 e seu trecho sobre notas ilustrativas à fonte SbD; a resposta fazia essa afirmação citando somente a página 32.
- `article-94e7a19d8878-34`: acrescentar a página 21 e seu trecho sobre voluntariedade à fonte SbD; a resposta citava somente a página 22 para esse aspecto.
- `article-eca18e5843e2-14`: retirar a expressão que sugere jogadores estudados em amostra empírica própria, ausente no artigo especulativo.
- `article-eca18e5843e2-26`: preservar a notação `$18`, pois a página 2 não explicita dólares dos Estados Unidos.
- `article-eca18e5843e2-28`: traduzir `peak desperation` como auge do desespero, preservando o estado descrito sem acrescentar a noção de desesperança.

Os autores foram avisados, e a correção exige nova revisão independente antes da publicação. Os 56 cartões e suas revisões anteriores permanecem preservados. A integração global só poderá ocorrer após os três grupos de revisão aprovarem os 350 candidatos com hashes atuais.

## Ampliação — revisão final e publicação

Os cinco pedidos acima foram corrigidos pelos respectivos autores e novamente confrontados com os PDFs originais. As cinco decisões atuais passaram para `approved` na segunda rodada, com novos hashes e páginas conferidas. Os outros 145 cartões deste grupo conservaram suas aprovações e hashes. O histórico mantém as versões anteriores e também registra as cinco decisões finais; `audit-reviewer-round1.json` preserva a auditoria anterior e `audit-reviewer.json` corresponde à versão final.

A integração global foi realizada pelo único publicador após confirmar os sete shards completos: 350 aprovações atuais dos três revisores independentes, 50 cartões novos de fonte principal por documento. Foram verificados os hashes do cartão inteiro, da fonte principal e de todas as fontes adicionais, a correspondência das citações às páginas e extrações, a ausência de IDs/perguntas duplicados e a preservação exata dos 56 cartões e 56 revisões anteriores contra `data/research/baseline.json`. Os shards dos outros revisores permaneceram inalterados. O identificador novo `article-eca18e5843e2-9` foi mantido conforme autorizado pelo Orchestrator.

O conjunto publicado contém **406 cartões: 56 anteriores e 350 novos**, incluindo **121 novas sínteses**. As sínteses são articulações analíticas com limites explicitados, não estudos integrados que os documentos tenham realizado. Não houve publicação parcial nem aprovação pelo próprio autor. Os registros individuais dos demais grupos e seus históricos permanecem em `expansion/`; o manifest `expansion/publication-manifest.json` identifica os três revisores, entradas, totais e hashes dos arquivos publicados.

Verificações executadas após a integração:

- `npm.cmd run validate`: 406 cartões válidos, com fontes, páginas, evidências e aprovações atuais conferidas.
- `node scripts/check-expansion.mjs`: 56 anteriores idênticos e 350 novos, 50 por documento, 121 sínteses; revisões anteriores e fontes preservadas.

Essas verificações são de integridade e rastreabilidade; o QA funcional da interface é registrado separadamente. Permanecem os limites dos originais descritos acima: documento jurídico local sem certificação de vigência, exemplos históricos de 2019, ficção especulativa, amostras delimitadas e ausência de validação longitudinal ou de eficácia em propostas que não a realizaram. A ampliação oferece seleção para estudo e comparação, sem atualização acadêmica externa e sem pretensão de esgotar os documentos.
