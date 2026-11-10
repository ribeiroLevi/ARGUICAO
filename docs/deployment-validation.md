# Validação local da publicação

Data: **2026-11-10, America/Sao_Paulo**. Responsável: agente QA, separado das alterações de configuração, Git, release e implantação. Esta rodada verifica o artefato para o caminho de projeto **/ARGUICAO/**. Não comprova implantação remota nem execução do GitHub Actions.

## Resultado

**Artefato local aprovado:** typecheck, 84 testes unitários, preservação acadêmica e build com prefixo passaram. O Microsoft Edge carregou a compilação real em `http://127.0.0.1:4180/ARGUICAO/`, mostrou os 406 cartões e executou o smoke funcional sem erros de console, runtime ou requisições após a correção do favicon implícito. Os dois recursos de aplicação, JavaScript e CSS, responderam HTTP 200 sob o prefixo correto e com MIME correto.

O QA alterou somente este relatório. As correções de configuração e do HTML foram feitas pelo Orchestrator. Aplicação, dados acadêmicos e testes anteriores não foram modificados pelo QA. Os dez testes extensos da rodada anterior não foram repetidos nesta rodada de publicação.

## Comandos e resultados reais

Ambiente: Windows/PowerShell, Node.js v24.16.0 e Microsoft Edge instalado, executado sem interface pelo Playwright.

| Comando/verificação | Resultado observado |
| --- | --- |
| `npm.cmd run typecheck` | Aprovado, sem diagnósticos. |
| `npm.cmd test` | Cinco arquivos, **84 testes aprovados**, em 9,08 segundos. |
| `node scripts/check-expansion.mjs` | 406 cartões; 56 anteriores idênticos; 350 novos, 50 por documento; 121 sínteses. Revisões anteriores e fontes preservadas. |
| `$env:VITE_BASE_PATH = '/ARGUICAO/'; npm.cmd run build` | Aprovado. O build executou validação dos 406 cartões e typecheck antes de compilar. A variável foi restaurada ao valor anterior após cada comando de build. |
| Mesmo build após a correção do favicon em `index.html` | Aprovado; artefato final permanece com base `/ARGUICAO/`. |
| `$env:VITE_BASE_PATH = '/ARGUICAO/'; node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4180 --strictPort` | Preview próprio iniciado sob `/ARGUICAO/` para o ensaio. |
| Script ES Module por `node --input-type=module`, com Playwright/Edge e asserções | Smoke final aprovado, código de saída 0, carregamento HTTP 200 e listas de erros/requisições falhas vazias. |

O artefato final gerado contém:

- `dist/index.html`: 0,63 kB, 0,39 kB com gzip.
- `dist/assets/index--Y1j8hqx.css`: 8,22 kB, 2,28 kB com gzip.
- `dist/assets/index-BRqZo1bK.js`: **2.343,33 kB**, **589,62 kB com gzip**.

O aviso real do Vite sobre chunk maior que 500 kB permanece visível. Não houve alteração do limite nem remoção de conteúdo para ocultá-lo.

## Caminhos e recursos

`vite.config.ts` usa `process.env.VITE_BASE_PATH || '/'`. A execução local comum continua configurada para `/`; a compilação de publicação usa `/ARGUICAO/`, conforme a variável definida no workflow. O HTML final contém referências a:

| Caminho solicitado | HTTP em carga nova/GET direto | MIME |
| --- | --- | --- |
| `/ARGUICAO/` | 200 | HTML |
| `/ARGUICAO/assets/index-BRqZo1bK.js` | 200 | `text/javascript` |
| `/ARGUICAO/assets/index--Y1j8hqx.css` | 200 | `text/css` |

O recarregamento da mesma página produziu HTTP **304** para JavaScript e CSS por revalidação de cache; isso foi registrado separadamente do HTTP 200 da carga inicial e dos GETs diretos, sem tratar 304 como recurso ausente. Todas as URLs de recursos de aplicação permaneceram sob `/ARGUICAO/assets/`.

## Smoke funcional da compilação

O navegador recebeu `dist/` pelo preview de produção, sem servidor de desenvolvimento ou substituição de cartões. Foram confirmados:

- Título ARGUIÇÃO., contador `01 / 406`, oito filtros incluindo TODOS e total geral de estatísticas igual a 406.
- D avançando para `02 / 406`, Espaço mostrando resposta/citações e A retornando à pergunta e ao primeiro cartão.
- Um filtro real com 74 questões, incluindo relações entre fontes, e retorno a TODOS.
- Menu, submenu de estatísticas e modal de nova questão pessoal.
- Digitação de texto com A/D/Espaço no modal, Escape fechando o modal e devolvendo o foco ao menu.
- Recarregamento correto sob `/ARGUICAO/`, com contador novamente em 406.
- Zero erros de console/runtime e zero requisições falhas na execução final.

Este smoke é focado em publicação e caminhos. Não percorreu novamente os 406 cartões nem repetiu o salvamento pessoal completo: esses comportamentos já foram executados nos dez casos da rodada final anterior, documentados em `docs/validation-report.md`.

## Ocorrências encontradas e corrigidas

O ensaio encontrou um erro real de console: o Edge tentava buscar o favicon implícito em `/favicon.ico`, fora do prefixo, e recebia 404. A URL foi identificada pela localização da mensagem de console. O Orchestrator declarou um favicon vazio embutido (`href="data:,"`) no HTML. Após novo build prefixado, o smoke final não registrou erros; não foi criada imagem de interface nem recurso externo de favicon.

A primeira versão do script enviado pela entrada padrão do PowerShell sofreu conversão de acentos para `?`; o título recebido do site estava correto. O ensaio passou a usar saída UTF-8 explícita. Também foi corrigida uma asserção do próprio ensaio que exigia HTTP 200 após recarregamento com cache: cargas novas e GETs diretos exigem 200; revalidação da mesma página pode retornar 304. Nenhuma dessas duas correções de instrumentação alterou o aplicativo ou ignorou o 404 real.

## Revisão estática do workflow e limites

Foi lido `.github/workflows/pages.yml`: build em `ubuntu-latest`, Node 24, `npm ci`, validação acadêmica, preservação da expansão, testes e build com `/ARGUICAO/`; upload de `dist/` seguido de deploy do artefato Pages. O job de deploy recebe `pages: write` e `id-token: write`. O workflow dispara por push em `main` ou manualmente; criar somente uma tag não o dispara.

Os comandos usados pelo workflow não dependem de sintaxe de PowerShell. O lockfile inclui o binding Rolldown Linux x64 GNU. Os imports locais examinados usam a capitalização dos arquivos reais. Os testes de navegador com Edge não são exigidos nesse job Ubuntu; a verificação de publicação foi executada localmente. Essa revisão estática não substitui a instalação e execução reais no runner Linux.

Permanecem fora da aprovação deste relatório: autenticação e permissões da conta GitHub, existência/configuração efetiva de Pages no repositório, aceitação da execução remota, URL publicada e disponibilidade da release. Esses estados precisam ser confirmados pela orquestração após autenticação; não foram presumidos aprovados.

O preview de QA da porta 4180 foi encerrado após as verificações. O processo do preview existente da porta 4173 não foi encerrado nem reconfigurado. `dist/` foi deixado com base **/ARGUICAO/** para os artefatos de release; previews que usem esse diretório devem ser iniciados com a mesma base.
