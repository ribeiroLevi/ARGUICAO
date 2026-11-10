# Relatório de extração

Documentos inventariados: 7. Legíveis: 7. Falhas: 0.

| Arquivo | Identificador | Páginas | Caracteres | Resultado |
| --- | --- | ---: | ---: | --- |
| Art. 48 - Oficina.pdf | article-94e7a19d8878 | 5 | 8925 | ok |
| chiplaycompanion25-21.pdf | article-eca18e5843e2 | 5 | 26385 | ok |
| From Understanding to Intervention- Towards an Agenda for Countering Dark Patterns in Games.pdf | article-d0d500126a80 | 15 | 49488 | ok |
| HCI_IN_GAMES_2026.pdf | article-e13c3cb65c28 | 20 | 59943 | ok |
| Interact_2025___It_s_Like_a_Dark_Patterns_Paradise__New_Findings_from_Brazilian_Mobile_Apps_in_Light_of_International_Research___Camera_Ready (1).pdf | article-48bdcebcffc6 | 10 | 26695 | ok |
| Operationalizing Radiant Patterns- A Refined Definition and Pattern Structure to Mitigate Deceptive Game Design Practices.pdf | article-39adb0cfa84e | 20 | 59230 | ok |
| SBD - Overview May19.pdf | article-d4b0c4f9d75f | 48 | 146761 | ok |

## Rastreabilidade e limites

- Exclusivamente arquivos locais de artigos/. Nenhum conteúdo acadêmico consultado fora desses documentos.
- Cada JSON preserva arquivo, SHA-256 do original, título identificável, autores dos metadados quando disponíveis e texto por página física (PDF, numeração iniciando em 1). Metadados podem precisar de confirmação editorial.
- IDs derivam do caminho relativo do arquivo; o mesmo nome mantém o ID após mudança de conteúdo. Renomear um arquivo muda seu ID.
- Cache reaproveitado somente quando arquivo e SHA-256 coincidem. Use npm run extract -- --force para reextrair. O inventário atual é a lista canônica: extrações órfãs de arquivos removidos não são fontes válidas.
- PDFs: sem OCR. Colunas, fórmulas, hifenização, tabelas e cabeçalhos podem alterar a ordem de leitura. Páginas vazias são sinalizadas no JSON. Extração literal não substitui revisão semântica.
- TXT/Markdown exigem UTF-8; seções Markdown são preservadas. TXT, Markdown e DOCX não conservam paginação impressa: page=1 é unidade documental.
- DOCX usa mammoth para texto bruto; formatação e objetos incorporados não são preservados.
- Arquivos de formato não suportado e documentos ilegíveis ficam inventariados como error; nenhum conteúdo é inventado para cobrir falhas.
- Esta fase não produz perguntas nem aprova cartões.

## Conferências desta execução

- Comando: npm.cmd run extract. Em PowerShell com execução de scripts desabilitada, npm.cmd evita o bloqueio de npm.ps1.
- Total de páginas físicas: 123. Fontes reutilizadas após comparação SHA-256: 7.
- Títulos e autores da tabela editorial por hash foram confrontados com a página 1 dos sete PDFs originais. Art. 48 e Interact tiveram a acentuação e o apóstrofo restaurados somente nos metadados; o texto extraído por página permanece literal.
- Art. 48 contém ligaturas extraídas com espaços internos (por exemplo, "Classi fi cação"). Essa segmentação deve ser preservada na evidência literal ou conferida diretamente no PDF; não representa lacuna a completar.
- A legibilidade indica disponibilidade da camada de texto, não conferência visual integral de tabelas, imagens ou diagramas. Não foi executado OCR. O documento Art. 48 é tratado como arquivo local, sem verificação externa de vigência normativa.
