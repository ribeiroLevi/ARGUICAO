# ARGUIÇÃO

Aplicação React + TypeScript + Vite, CSS puro. Conteúdo acadêmico EXCLUSIVAMENTE de artigos/. Nunca pesquisar conteúdo acadêmico na internet nem completar lacunas com conhecimento do modelo. Nenhum cartão fictício ou sem evidência pode ser publicado.

## Orquestração e delegação
O agente principal é o Orchestrator: define contratos, atribui arquivos exclusivos, verifica resultados e integra. Limite de quatro agentes ativos incluindo o principal. Não editar simultaneamente arquivos de outro agente. Os agentes herdam o modelo e permissões da sessão.
1. source_extractor: inventário, extração por página, hashes e relatório; não escreve cartões.
2. card_author: usa somente extrações; escreve candidatos em data/candidates/ com evidência literal e localização.
3. academic_reviewer: confronta fontes originais e candidatos semanticamente; registra approved, revision_required ou rejected em data/reviews/. Exige correção e nova revisão quando necessário.
4. frontend_developer: implementa src/ sem conteúdo fictício, consumindo somente src/data/cards.json aprovado.
5. qa_engineer: testes funcionais e integridade; registra comandos e resultados reais.
Fluxo obrigatório: extrair → gerar candidatos → revisão semântica independente → publicar aprovados → validar → QA. Frontend pode acontecer em paralelo à extração. Somente o revisor publica cartões aprovados. Validação literal não substitui revisão semântica.

## Contrato
Cartão: {id, articleId, question, answer, source:{file,title,pages:number[],sections:string[],evidence:string[]}}. Destaques usam [[texto]]. Arquivo relativo a artigos/. Artefatos de extração em data/extracted/. Decisões por cartão em data/reviews/. Preservar IDs e cartões de artigos inalterados; comparar SHA-256 antes de reutilizar. Nunca publicar dados com revisão desatualizada.

## Interface e qualidade
Título ARGUIÇÃO., filtros automáticos por artigo e TODOS. Um cartão de até 720px, borda preta 2px. Branco #FFFFFF, preto #111111, amarelo #FFE35B. Sem sombras, gradientes, imagens ou arredondamento. Exatamente três controles principais: ← ANTERIOR, VIRAR, PRÓXIMO →. Reset da frente ao navegar/filtrar, limites desabilitados. TODOS embaralha uma vez por sequência, sem repetição e preserva ordem no retorno. Renderizar como texto seguro, nunca HTML bruto. Responsividade e foco visível obrigatórios. Sem Tailwind, UI frameworks, backend, autenticação ou IA em runtime.

## Comandos
npm install; npm run dev; npm run extract; npm run validate; npm run typecheck; npm test; npm run build.
Não declarar testes aprovados sem executá-los. Documentar arquivos ilegíveis e limitações. Novos agentes TOML podem exigir reinício da sessão para descoberta; distinguir configuração de execução real. Documentação de configuração: https://learn.chatgpt.com/docs/agent-configuration/subagents (consultada em 2026-11-09).

## Ampliação solicitada pelo usuário
O pedido de ampliação adiciona 50 questões por documento, sete pesquisadores em rodadas com diálogo registrado, correlações entre fontes e um grupo separado para interface. O contrato compatível, arquivos exclusivos e regras de rastreabilidade estão em docs/expansion-contract.md. `kind` e `relatedSources` são opcionais; os cartões antigos permanecem idênticos. Autoavaliação no verso e menu de estatísticas são controles adicionais autorizados; verde/vermelho/amarelo identificam acerto/erro/incompleto. Todos os filtros usam a nova ordem aleatória de cada carregamento e preservam essa ordem na sessão.
No escopo final, o usuário autorizou autoria humana imediata em um baralho pessoal local, separado do JSON acadêmico revisado, e atalhos A/D/Espaço. Essa exceção vale somente para questões pessoais criadas pelo usuário; a produção por agentes continua sujeita a revisão independente. Concluir o escopo, validar e parar o desenvolvimento.
