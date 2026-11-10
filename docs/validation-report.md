# Relatório final de validação e QA

Data: **2026-11-10, America/Sao_Paulo**. Responsável: agente qa_engineer, executado realmente por colaboração, separado da autoria acadêmica e da interface.

**Escopo concluído:** 406 cartões acadêmicos e 406 aprovações atuais. Os 56 cartões anteriores e suas revisões permanecem idênticos; foram adicionados 350 cartões, 50 por documento, incluindo 121 sínteses. Validação, typecheck, 84 testes unitários, build e dez testes de navegador passaram. Nenhum caso de navegador foi omitido. Não há falha funcional aberta nem desenvolvimento adicional previsto neste escopo.

## Ambiente e comandos executados

Windows, PowerShell, Node.js v24.16.0, Microsoft Edge instalado executado sem interface pelo Playwright. npm.cmd evita o bloqueio de npm.ps1 pela política do PowerShell. Não foram baixados navegadores nem consultadas fontes acadêmicas externas.

Os comandos definitivos foram executados após a confirmação da publicação congelada dos 406 cartões.

| Comando | Resultado real |
| --- | --- |
| npm.cmd run extract | Sete PDFs legíveis; 123 páginas; sete caches reutilizados após comparação SHA-256. |
| npm.cmd run validate | 406 cartões válidos: fontes, títulos, páginas, evidências e aprovações atuais conferidos. |
| node scripts/check-expansion.mjs | 56 cartões e revisões anteriores idênticos; fontes preservadas; 350 novos, 50 por documento; 121 sínteses. |
| npm.cmd run typecheck | Aprovado, sem diagnósticos. |
| npm.cmd test | Cinco arquivos e **84 testes aprovados**, em 8,82 segundos. |
| npm.cmd run build | Aprovado; reexecutou validação/typecheck e gerou dist/, com o aviso de tamanho descrito abaixo. |
| npm.cmd run test:browser -- --reporter=line | **Dez testes aprovados, nenhum omitido**, saída final “10 passed (6.0m)”, código 0. O tempo inclui a espera pelo encerramento do servidor do ensaio. |
| node scripts/validate-agents.mjs | Cinco TOML sintaticamente válidos; não comprova descoberta automática de agentes. |
| node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173 --strictPort | Preview de produção mantido em http://127.0.0.1:4173/; resposta HTTP 200 conferida. |

O build informou um chunk JavaScript de **2.343,33 kB**, **589,62 kB com gzip**, acima do limite de aviso de 500 kB. O aviso não impediu a compilação e foi mantido; não foram alterados o limite nem as citações para ocultá-lo. O CSS gerado tem 8,22 kB, 2,28 kB com gzip. Não foi medida a velocidade de carregamento em dispositivos físicos.

## Integridade acadêmica e preservação

O comando de expansão comparou SHA-256 com data/research/baseline.json, incluindo os 56 cartões antigos, suas 56 revisões e os sete documentos originais. A validação conferiu hashes do cartão inteiro, da fonte principal e de cada fonte adicional, além de evidências nas páginas físicas citadas e aprovação atual por cartão. Os campos opcionais de síntese não alteraram os cartões antigos.

As fixtures dos testes de integridade ficam isoladas em diretórios temporários e nunca entram nos dados publicados. Foram executados casos negativos de ausência de aprovação atual, alteração posterior do cartão ou original, evidência inexistente, página inválida, travessia de diretório, IDs/perguntas duplicados, marcação inválida, decisões conflitantes, inventário inválido e problemas de fontes adicionais, inclusive falta de hashes atuais, duplicação e síntese sem segunda fonte. Os títulos dos dados reais também foram conferidos pelo comando validate; não há teste unitário negativo específico de título divergente.

A revisão semântica independente está registrada em data/reviews/, com manifesto final em data/reviews/expansion/publication-manifest.json. Os registros da produção e do diálogo dos sete pesquisadores ficam em data/research/. Sete pesquisadores, três grupos de revisão independente e o grupo separado de interface foram executados realmente, conforme registros da orquestração; autoria, diálogo e revisão são etapas distintas. Oito pedidos de correção foram atendidos e reavaliados antes da publicação. A análise sintática dos TOML não é apresentada como prova dessa execução.

## Cobertura funcional no navegador

Os dez casos executados verificaram:

1. Carregamento sem erros de runtime, título, filtros automáticos, exatamente três controles principais e limite inicial.
2. Percurso dos **406 cartões em TODOS**, sem repetição, igualdade com o conjunto publicado, limite final, reset da frente e repetição da mesma sequência integral após retornar de um filtro.
3. Os sete filtros e seus totais, incluindo fontes adicionais; resposta, referências, páginas/seções, destaques e **texto integral de cada trecho selecionado**, confrontados com o JSON; ativação de VIRAR por Enter.
4. Frente e verso em **320, 375, 768 e 1440px**, usando o cartão com maior soma de resposta e citações. Sem rolagem horizontal; cartão até 720px, borda de 2px, sem sombra/arredondamento e foco visível de 3px.
5. Axe com conjuntos **WCAG 2 A/AA e 2.1 A/AA**, sem violações encontradas na frente, no verso avaliado e no menu de estatísticas em 320px.
6. Avaliação somente no verso, cores reais verde/vermelho/amarelo, persistência, feedback oculto na frente e reavaliação substituindo o resultado anterior sem inflar contagens.
7. Síntese presente em cada filtro relacionado; estatísticas por tema com sobreposição fundamentada, sem duplicar o total geral nem a avaliação do mesmo ID.
8. Novo embaralhamento ao recarregar, conservando o conjunto de questões; ordem dos filtros estável durante a sessão.
9. Atalhos A/D/Espaço, limite inicial, reset ao navegar, comportamento nativo de Espaço em botão sem dupla ativação, suspensão no menu/modal e durante digitação, Escape e retorno de foco.
10. Modal pessoal com todos os campos, tentativa inválida com erro visível, preenchimento de duas fontes, axe sem violações no modal em 320px, ausência de excesso horizontal, salvamento imediato, identificação de autoria pessoal, citações literais, HTML como texto seguro, avaliação e persistência após recarregar. A questão criada apareceu nos filtros de ambas as fontes.

Os 84 testes unitários complementam o navegador com navegação, shuffle, progresso, estatísticas, dados pessoais, controle de foco, campos/citações múltiplos, validação e falhas de armazenamento. Dados pessoais ou progresso inválidos não quebraram a aplicação. Falha de gravação conserva o conteúdo em memória e mostra aviso, conforme os testes executados.

## Autoria pessoal autorizada

A dispensa de revisão prévia vale somente para questões humanas pessoais, por autorização expressa do usuário. Elas ficam em arguicao.personal-cards.v1, separado do JSON acadêmico, com identificação de autoria pessoal; o progresso fica em arguicao.progress.v1. A questão do ensaio foi criada apenas no contexto isolado do navegador de teste e não foi publicada em src/data/cards.json. A produção acadêmica dos agentes continua exigindo aprovação independente.

## Capturas e inspeção visual

Capturas reais da execução final em docs/qa/:

- Frente e verso completos: arguicao-320.png, arguicao-1440.png, arguicao-resposta-320.png, arguicao-resposta-1440.png.
- Viewports legíveis de resposta e citação em 320px: arguicao-resposta-viewport-320.png, arguicao-citacao-viewport-320.png.
- Menu/estatísticas: expansion-statistics-320.png, expansion-statistics-1440.png.
- Modal pessoal: personal-question-modal-320.png, personal-question-modal-1440.png.

QA inspecionou frente desktop, resposta/citação em viewport mobile, menu/estatísticas e modal em desktop/mobile. O Orchestrator também inspecionou frente desktop, resposta mobile e modal mobile. Texto, destaques, referências, bordas e campos estão legíveis, sem corte horizontal. As imagens de modal mostram o estado real após a tentativa inválida inicial; o mesmo caso depois concluiu o salvamento e a persistência. Capturas completas de citações longas exigem zoom; os viewports separados facilitam a leitura sem substituir as capturas integrais.

## Ocorrência no encerramento do ensaio

Depois dos dez casos, os processos do navegador e do worker já tinham encerrado, mas o runner permaneceu aguardando o fechamento do Vite iniciado pelo próprio Playwright. Não foi presumida aprovação durante essa espera. QA encerrou exclusivamente esse processo Vite de teste, PID 44744; imediatamente o runner retornou **“10 passed (6.0m)” e código 0**. Nenhum clique foi forçado nem falha de aplicação ignorada. O tempo final inclui essa espera. Em seguida foi iniciado um preview separado da compilação final, com HTTP 200 conferido.

## Limitações e encerramento

Os sete documentos têm camada de texto legível; nenhum arquivo foi classificado como ilegível. Não há OCR. Colunas, tabelas e ligaturas podem afetar a extração; o documento Art. 48 é tratado como fonte local, sem alegação externa de vigência. As limitações estão detalhadas no relatório de extração.

A integridade literal não substitui a revisão semântica independente. Axe e as larguras verificadas não equivalem a auditoria completa com leitores de tela ou dispositivos físicos. O ensaio de navegador foi realizado no Microsoft Edge instalado; outros motores não foram testados nesta rodada. O armazenamento pessoal e das avaliações permanece local a este navegador, sem sincronização.

O escopo solicitado está validado. O desenvolvimento foi encerrado, mantendo somente o preview local disponível.
