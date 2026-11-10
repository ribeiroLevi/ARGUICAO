# Ampliação para arguição contextual

Pedido: 50 novos cartões por documento (350 novos; preservar os 56 existentes), com conteúdo direto detalhado e correlações fundamentadas entre os sete documentos locais.

## Contrato compatível

Os campos existentes de cartão e `source` permanecem. Campos opcionais novos:

```ts
kind?: 'direct' | 'synthesis';
relatedSources?: { articleId: string; source: {
  file: string; title: string; pages: number[];
  sections: string[]; evidence: string[];
}}[];
```

`articleId`/`source` identificam a fonte principal; `relatedSources` contém somente outras fontes, sem repetição. Um cartão de síntese precisa de ao menos uma fonte adicional, evidência de cada frente e explicação da relação, distinguindo análise comparativa de resultado demonstrado por um estudo. Filtros e estatísticas por tema incluem fonte principal e adicionais. TODOS contém cada ID uma vez. O total global conta cada cartão uma vez; totais por tema se sobrepõem quando um cartão participa de vários temas.

Revisões existentes permanecem idênticas. Novas revisões usam `sourceSha256` para a fonte principal e `relatedSourceSha256: Record<articleId, sha256>` para TODAS as fontes adicionais. `cardSha256` cobre o cartão inteiro, incluindo suas fontes. Somente o revisor publica. Citações devem ser trechos completos e semanticamente suficientes, preservados literalmente por página, sem reticências editoriais que apaguem qualificações. O verso exibe integralmente os trechos selecionados de todas as fontes; isso não significa reproduzir documentos inteiros.

## Organização real

Sete pesquisadores, um responsável principal por documento, trabalham em rodadas para respeitar quatro agentes ativos incluindo o Orchestrator. Cada um grava seus 50 candidatos em `data/candidates/expansion/<articleId>.json` e seu plano, propostas e respostas aos pares em `data/research/<articleId>.md`. O diálogo inicial ocorre por leitura das propostas já existentes; após a criação dos sete agentes, haverá mensagens diretas e uma rodada de revisão cruzada entre os sete, com registro dos acordos e diferenças. Autoria não equivale a aprovação independente.

O grupo de interface trabalha exclusivamente em `src/` (exceto dados publicados) e testes de interface. O Orchestrator mantém validador, testes de integridade e este contrato. Revisores independentes confrontam originais, pedem correções e publicam apenas aprovados. QA final verifica interface e rastreabilidade.

## Comportamento solicitado

Última autoavaliação por ID, salva em localStorage: acertei (verde), errei (vermelho), incompleto (amarelo). Controles e feedback do cartão aparecem somente no verso. Trocar a avaliação substitui a anterior, sem inflar contagens. Menu hamburguer com submenu de estatísticas gerais e por artigo. Estado inválido de armazenamento não deve quebrar a aplicação.

Uma nova ordem aleatória nasce a cada carregamento. Todos os filtros derivam dessa ordem e a preservam durante a sessão. Navegação/filtro mostram a frente, sem revelar avaliação anterior. Exibir citações originais completas e referências das várias fontes no verso. Preservar foco, responsividade, texto seguro e os três controles de navegação.

## Escopo final: teclado e autoria pessoal

O usuário acrescentou A para anterior, D para próximo e Espaço para virar, com suspensão durante digitação, menus e modal. Controles nativos focados mantêm seu comportamento de teclado, sem dupla ativação. Limites de navegação continuam válidos.

O menu abre um modal com todos os campos de uma questão e suas fontes, incluindo referências adicionais para sínteses. O usuário escolheu explicitamente que a autoria humana entre imediatamente no **baralho pessoal**, dispensando a revisão anterior somente para essas questões pessoais. Elas ficam em armazenamento local versionado e separado dos dados acadêmicos publicados (`arguicao.personal-cards.v1`), com identificação de questão pessoal. Isso não autoriza publicar cartões gerados por agentes sem revisão em `src/data/cards.json`.

Questões pessoais precisam de campos válidos, identificação única e evidências informadas pelo usuário. Participam de filtros, avaliações e estatísticas e sobrevivem ao recarregamento neste navegador. Não sobrescrevem cartões publicados. Conteúdo digitado é renderizado como texto seguro. O modal preserva foco e navegação por teclado; erros de validação ou armazenamento não podem descartar silenciosamente o trabalho.

Concluir os 350 cartões novos com revisão independente, a interface anterior e estas duas funcionalidades; executar QA final e encerrar o desenvolvimento, sem acrescentar funcionalidades fora desse escopo.
