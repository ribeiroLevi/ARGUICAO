# ARGUIÇÃO.

Flashcards para estudo e arguição oral, em React, TypeScript, Vite e CSS puro. O conteúdo acadêmico vem exclusivamente dos documentos locais em `artigos/`. A aplicação funciona no navegador, sem backend, autenticação ou IA em runtime.

O banco acadêmico contém 406 cartões revisados: 56 anteriores preservados e 350 novos, 50 de fonte principal por documento. Entre os novos, 121 questões correlacionam trabalhos; aparecem nos filtros de todas as fontes envolvidas.

## GitHub Pages e release

Destino de publicação: https://ribeirolevi.github.io/ARGUICAO/

O workflow `.github/workflows/pages.yml` valida os dados, confere a preservação dos cartões, executa os testes e compila/publica `dist/` ao receber um push em `main`. O build usa `VITE_BASE_PATH=/ARGUICAO/`, mantendo o desenvolvimento local no caminho `/`. No repositório, a origem do GitHub Pages deve ser **GitHub Actions**.

As notas da primeira release estão em [docs/releases/v1.0.0.md](docs/releases/v1.0.0.md). Questões pessoais e avaliações continuam restritas ao navegador e à origem em que foram criadas; dados de `localhost` não são enviados ao GitHub nem transferidos automaticamente ao site publicado.

## Executar

```sh
npm install
npm run dev
```

Abra o endereço local mostrado pelo Vite. No PowerShell, caso a política de execução bloqueie `npm.ps1`, use `npm.cmd` nos mesmos comandos.

Os filtros são derivados de todas as fontes dos cartões publicados. Uma questão que relaciona dois ou mais artigos aparece no filtro de cada um; em `TODOS`, seu ID aparece uma única vez. Cada carregamento cria uma nova sequência embaralhada. Todos os filtros derivam dessa sequência e conservam a ordem durante a sessão. Navegar ou filtrar sempre mostra a pergunta. A sequência não se repete nos limites; os botões correspondentes ficam desabilitados.

No verso, os trechos selecionados de todas as referências são exibidos integralmente, com arquivo, páginas e seções. Marque **Acertei** (verde), **Errei** (vermelho) ou **Incompleto** (amarelo). A última avaliação de cada cartão é salva neste navegador, em `localStorage`, e reaparece somente no verso. Reavaliar substitui o status anterior. Recarregar embaralha as perguntas e conserva as avaliações; limpar os dados do navegador remove esse progresso.

Abra **☰ MENU → Estatísticas** para consultar totais e resultados por artigo. O total geral conta cada cartão uma vez; totais por artigo podem se sobrepor nas questões compartilhadas. Cartões não avaliados também são informados.

Use **A** para voltar, **D** para avançar e **Espaço** para virar. Os atalhos respeitam os limites do baralho e ficam suspensos durante a digitação, no menu e no modal; controles nativos mantêm seu comportamento de teclado.

Em **☰ MENU → Nova questão**, preencha pergunta, resposta, identificação e referências. Questões de síntese aceitam várias fontes. Questões pessoais entram imediatamente no seu baralho, com identificação de autoria pessoal; ficam salvas neste navegador e participam dos filtros e estatísticas. Elas não sobrescrevem cartões publicados nem modificam o JSON acadêmico revisado. Recarregar preserva as questões pessoais e sorteia novamente o conjunto.

## Fontes e revisão

1. Adicione ou atualize documentos em `artigos/`.
2. Execute `npm run extract`. São aceitos PDF, DOCX, TXT e Markdown; PDFs usam a camada de texto, sem OCR. `npm run extract -- --force` ignora o cache.
3. O autor escreve candidatos em `data/candidates/`, utilizando apenas as extrações locais, com evidência literal e localização.
4. Um revisor independente confronta os candidatos com os documentos originais e registra as decisões em `data/reviews/`. Somente o revisor publica os aprovados em `src/data/cards.json`.
5. Execute a validação e o QA antes de usar a nova versão.

O contrato de cada cartão é `{id, articleId, question, answer, source: {file, title, pages, sections, evidence}}`. Cartões novos podem usar `kind: 'direct' | 'synthesis'`; sínteses incluem `relatedSources: [{articleId, source}]`, com evidência independente de cada fonte adicional. O arquivo da fonte é relativo a `artigos/`; páginas de PDF são físicas, iniciadas em 1. `[[texto]]` vira destaque amarelo e o restante continua sendo texto seguro.

Cada aprovação atual em `data/reviews/reviews.json` vincula o ID aos hashes SHA-256 do cartão e da fonte principal. Sínteses exigem também `relatedSourceSha256` com o hash de cada fonte adicional. Modificar o cartão ou qualquer documento exige nova revisão. A validação automática confere rastreabilidade e integridade; não substitui a avaliação semântica independente. Preserve IDs de documentos e cartões inalterados.

## Verificar e compilar

```sh
npm run extract
npm run validate
npm run typecheck
npm test
npm run build
```

O build executa validação e typecheck antes de gerar `dist/`. Para servir essa compilação localmente, execute `npm run preview`. Fixtures sintéticas dos testes ficam isoladas dos dados publicados.

`npm run test:browser` executa o QA com Playwright no Microsoft Edge instalado, inicia o Vite localmente na porta 4173 e verifica a interface e a acessibilidade com axe. As capturas geradas ficam em `docs/qa/`.

`node scripts/check-expansion.mjs` verifica a entrega de 50 cartões novos por documento e a preservação dos 56 cartões, revisões e fontes anteriores. A produção e o diálogo dos sete pesquisadores estão documentados em [data/research/](data/research/README.md).

Consulte [o relatório de extração](docs/extraction-report.md), [as decisões de revisão](data/reviews/reviews.json) e [o relatório de QA](docs/validation-report.md) para cobertura, resultados executados e limitações.

## Agentes

`AGENTS.md` define os papéis e a ordem obrigatória: extração → autoria → revisão independente → publicação → validação → QA. Os arquivos `.codex/agents/*.toml` descrevem os papéis; `node scripts/validate-agents.mjs` confere sua sintaxe e os campos esperados pelo projeto. Esse comando não comprova descoberta ou execução dos agentes pela aplicação hospedeira. Novas configurações podem exigir reinício da sessão.
