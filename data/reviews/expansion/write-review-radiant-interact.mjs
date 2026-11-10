import fs from 'node:fs/promises';
import { cardDigest } from '../../../scripts/validate-cards.mjs';

// Individual semantic decisions made after reading all 100 Q/As and the 47
// original PDF pages. This script records those decisions; it does not infer them.
const reasons = {
  'article-39adb0cfa84e': {
    9: 'Página 2 distingue princípios conceituais de implementações detalhadas e avaliadas; daily quests, compras e os dois tipos de objetivo constam do texto. Não afirma que o template resolveu a lacuna empírica.',
    10: 'Páginas 3–4 sustentam custo baixo, escala, vieses, captura e reprodução de estratégias de títulos comerciais. A resposta atribui a explicação ao artigo, sem criar uma medição causal própria.',
    11: 'Páginas 4 e14 distinguem letramento, percepção de frequência/UI e familiaridade sem compreensão das consequências. A resposta preserva variação de perfis e não equipara reconhecer a compreender.',
    12: 'Páginas 4–5 apresentam hedonia, eudaimonia e SDT nesses termos. A articulação entre prazer, significado e necessidades é fiel e não transforma diversão momentânea em medida total de bem-estar.',
    13: 'Páginas 4–5 condicionam a associação entre tempo de jogo e bem-estar às motivações e satisfação de necessidades. A ressalva de que horas isoladas não estabelecem causalidade delimita corretamente o argumento.',
    14: 'Página 6 explicita amplitude dos termos originais, desafios emocionais, verificabilidade e trade-offs entre necessidades. A resposta diferencia aspiração de critérios operacionais sem alegar validação concluída.',
    15: 'Definição refinada na página6 admite objetivos de desenvolvimento dentro de limites preventivos; World Creation na página12 admite monetização periférica. A resposta não generaliza essa admissão a toda compra ou rentabilidade.',
    16: 'Página7 apresenta recorrência, núcleo reutilizável e variação de realizações; páginas8–9 exigem contexto. A inferência de que padrão não é receita idêntica respeita essa fundamentação.',
    17: 'Campo Name na página9 permite palavra/frase e recomenda associação a autonomia/realização, com os exemplos citados. A ressalva de que nome positivo não prova adequação é coerente com o restante do template.',
    18: 'Páginas8–9 explicam Problem, situação recorrente e alternativas a respostas enganosas. A resposta preserva a relação problema–contexto–solução, sem inventar critério empírico.',
    19: 'Context nas páginas8–9 delimita cenários/estilos; página14 explicita variação de perfis. A resposta mantém condições de aplicação e necessidade de avaliação, sem prometer benefício universal.',
    20: 'Proposed Solution nas páginas8–9 liga problema, contexto e mecânica aos objetivos de desenvolvimento e bem-estar básico. A resposta não confunde descrição funcional com comprovação de efeitos.',
    21: 'Páginas6,8 e10 sustentam análise individual das três necessidades e cuidado com interferências entre elas. Rastreabilidade é uma interpretação documental adequada, sem pressupor experimento com jogadores.',
    22: 'Problem/Solution de World Creation nas páginas10–11 descrevem agência, expressão, mundo inerte e compartilhamento. Página16 confirma ausência de avaliação direta dos efeitos; a resposta preserva essa limitação.',
    23: 'Páginas10–11 trazem gêneros, interação e acesso a ferramentas, incluindo a tabela com núcleo livre de pagamento/grind excessivo. O alcance amplo é corretamente condicionado ao contexto.',
    24: 'Páginas11–12 conectam autonomia a controle criativo e ferramentas fundamentais; página16 impede tratar isso como resultado medido. A distinção entre opção cosmética e capacidade real é sustentada pelo exemplo.',
    25: 'Páginas11–12 sustentam aprendizado/domínio e a diferença entre habilidade e impedimentos da ferramenta. A resposta preserva a natureza argumentativa do exemplo e sua validação ainda ausente.',
    26: 'Páginas11–13 descrevem vínculo por compartilhar, colaborar e jogar criações; falhas de descoberta/restrição negam essa dimensão. A conclusão sobre editor isolado é limitada à estrutura efetiva do exemplo.',
    27: 'Watch For na página12 enumera ferramentas fundamentais, elementos básicos, salvamento e compartilhamento. A resposta conserva o recorte de núcleo criativo e não proíbe toda compra/progressão.',
    28: 'Páginas12–13 permitem melhorias opcionais, acesso à plataforma, ofertas comunitárias e peças extras, preservando o núcleo. A resposta não atribui rentabilidade demonstrada nem aceita apenas o rótulo opcional.',
    29: 'Página12 cita bugs, documentação, posicionamento preciso e undo, vinculando-os a autonomia/competência. A resposta distingue limitações do instrumento das habilidades, conforme o texto.',
    30: 'Páginas12–13 tratam restrições de circulação e descoberta como obstáculo ao vínculo e propõem conexão comunitária acessível. A resposta não infere resultados de avaliação social não realizados.',
    31: 'Insufficient Scaffolding na página12 e implementação compatível na13 sustentam orientação, tutoriais e apropriação gradual. A resposta distingue falta de apoio da complexidade criativa em si.',
    32: 'Páginas12–13 exigem núcleo robusto imediatamente acessível e admitem extras; página16 qualifica a ausência de validação com jogadores. A fronteira essencial/periférico está corretamente delimitada.',
    33: 'Páginas11 e13 descrevem aprender/dominar e ferramentas responsivas com feedback/tutoriais. A leitura de orientação como apoio, não substituição da atividade criativa, segue esses mecanismos.',
    34: 'Optional Unlocks na página13 admite cosméticos/peças/temas por participação variada, não centrada somente em grind. A resposta mantém centralidade/opcionalidade e não alega efeito psicológico ou comercial medido.',
    35: 'Páginas10 e13 apresentam os três exemplos para ilustrar a mecânica, enquanto16 registra ausência de avaliações. A resposta evita converter exemplos em auditoria ética do jogo inteiro.',
    36: 'Páginas15–16 identificam confundimento por componentes visuais, sonoros e narrativos e pedem métodos para atribuição. A pergunta e resposta não apresentam essa separação como problema já resolvido.',
    37: 'Página15 menciona PENS/IMI para necessidades/motivação e explicita falta de metodologia direta para atribuir bem-estar ao padrão. A resposta preserva a diferença entre construtos e causalidade.',
    38: 'Página15 diferencia consciência ética em trabalho anterior de efeitos reais ainda não investigados;16 reafirma ausência de avaliações com jogadores. A resposta não usa awareness como proxy de bem-estar.',
    39: 'Páginas14 e16 sustentam variação de perfis, letramento, exposição e interpretação. A resposta reconhece possibilidades divergentes sem reduzir eficácia a intenção preventiva ou prometer universalidade.',
    40: 'Páginas15–16 discutem rentabilidade de práticas enganosas e futuro estudo do retorno de alternativas, com viabilidade ainda não demonstrada. A resposta distingue ética e retorno sem declarar inviabilidade.',
    41: 'Páginas9 e16 propõem documentação padronizada e colaboração rumo a repositório aberto. A resposta mantém esse caráter propositivo e separa infraestrutura de prova de efeitos ou adoção.',
    42: 'Páginas8–10 exigem estrutura comum para comunicação/comparação e registram contexto e riscos. A resposta não confunde padronização documental com implementações idênticas ou eficácia empírica.',
    43: 'OP6/10 e SbD22/27 sustentam riscos psicológicos de mecânica e responsabilidades/avaliação organizacional, respectivamente. O nexo preventivo é analítico e diferencia escalas, necessidades e segurança geral.',
    44: 'OP11–12 sustenta controle criativo e acesso ao núcleo; SbD30 sustenta autonomia, ferramentas e defaults protetores. A resposta distingue finalidades e não substitui denúncia/privacidade por liberdade criativa.',
    45: 'OP15–16 trata atribuição dos efeitos; SbD36 distingue escala de atividade de métricas de eficácia. A síntese exige alinhamento da medida à pergunta sem imputar um protocolo conjunto validado.',
    46: 'OP12–13 delimita funções criativas e grind/pagamento; Art48p4 lista uso prolongado. A comparação não equipara fator classificatório a diagnóstico psicológico, nem afirma vigência normativa.',
    47: 'Art48p4–5 apresenta curadoria/controles/moderação e remissão aos Guias; OP9–12 exige análise situada de necessidades/ferramentas. A resposta preserva domínios diferentes e não inventa especificações dos Guias.',
    48: 'CHIP2 sustenta o cenário imaginado e OP11–12/16 os critérios e limites do exemplo. A síntese distingue aparência de progresso/comunidade de suporte às necessidades e explicita ficção e ausência de eficácia medida.',
    49: 'OP14/16 e CHIP1–3 sustentam perfis individuais e assimetrias estruturais como níveis distintos. A ponte contextual não homogeneíza populações nem afirma mecanismo causal conjunto comprovado.',
    50: 'OP8–10 documenta template e Agenda9–10 propõe suporte contextual em engines com testes/limites de adoção. A hipótese de alimentar sugestões é explicitamente analítica, sem confundir documentação com ferramenta validada.',
    51: 'OP15–16 declara viabilidade comercial não demonstrada; Agenda10 descreve KPIs e poder decisório superior. A síntese diferencia conhecer alternativas de poder adotá-las, sem justificar práticas nocivas.',
    52: 'OP15–16 e Agenda10–11 sustentam construtos, instrumentos e métodos mistos ainda a desenvolver. A resposta conserva diferenças entre necessidades, manipulação e engajamento, sem inventar protocolo causal validado.',
    53: 'OP9–11 e HCI8/10–11/15 sustentam contexto, renomeação Creative Suite, níveis e variantes. A resposta lê refinamento estrutural sem tratar níveis como experiência universal ou prova longitudinal.',
    54: 'OP9/16 propõe repositório; HCI13/15–16 descreve contribuições/governança e seus limites. A síntese não confunde maturidade documental, consenso e eficácia com jogadores.',
    55: 'OP10/13/16 exemplifica sem avaliação direta; HCI11/15–16 exige recorrência, coerência e verificação de candidatos. A separação observar–descrever–verificar–avaliar é sustentada, sem validar produção pelo título comercial.',
    56: 'Interact6/8 documenta barreiras e limites; OP12/14 documenta ferramentas opacas e letramento. A comparação sobre condições de ação distingue objetos e não transfere prevalência/taxonomia para jogos.',
    57: 'Interact6/8 descreve duas recompensas condicionadas; OP12–13 admite extras opcionais mantendo núcleo acessível. A distinção função/pressão/contexto é fiel, sem classificar toda recompensa como manipulação.',
    58: 'SbD22/27, OP6/10/15–16 e Agenda10–11 oferecem responsabilidades, documentação e avaliação. A articulação é apresentada como perguntas complementares e explicita que nenhuma camada resolve as outras ou foi validada conjuntamente.',
  },
  'article-48bdcebcffc6': {
    9: 'Página1 define escolhas de interface, decisões e interesses do serviço/usuário. A resposta separa fundamentação conceitual de efeitos individuais não medidos no estudo observacional.',
    10: 'Páginas1–2 discutem predomínio ocidental/anglocêntrico e caso japonês. A resposta questiona exaustividade contextual sem descartar taxonomias existentes ou atribuir universalidade inversa.',
    11: 'Páginas2/8 sustentam heterogeneidade brasileira e fatores como hipóteses contextuais. A resposta preserva possibilidade e não transforma nacionalidade ou educação em causa uniforme.',
    12: 'Páginas1–3 apresentam Linguistic Dead Ends e sua presença no piloto brasileiro. A resposta explica adaptação baseada no teste sem reivindicar autoria brasileira da classe ou classificar todo idioma estrangeiro.',
    13: 'Página2 explicita perguntas de frequência/tipos e comparação geográfica;8 limita o diagnóstico. A resposta não alarga o desenho para experimentos de dano ou representatividade universal.',
    14: 'Página3 relata Tools, nove categorias e100 versus240;8 recomenda ampliar corpus/Finance. A resposta preserva diferenças de desenho em vez de equiparar comparações agregadas.',
    15: 'Página3 descreve duas duplas/nove apps, dispositivos e razões para o emulador;8 reconhece limites. A resposta não converte detecção no piloto em equivalência geral de meios.',
    16: 'Página3 documenta tarefa de termos/política, rotação e regravação por outro pesquisador. A resposta qualifica essas medidas como redução de viés, não eliminação de subjetividade.',
    17: 'Páginas3/6 mostram incorporação de classe existente no piloto e seis casos de aplicação conhecidos. A resposta mantém categoria, caso e adaptação como contribuições distintas.',
    18: 'Página3 diferencia19/01/2025 no Google Play de22/01/2025 no Sensor Tower. A resposta preserva rastreabilidade temporal sem apresentar rankings históricos como estado atual.',
    19: 'Páginas3/8 sustentam16apps em cada categoria inicial, retirada de Finance pelo emulador e trabalho futuro. A resposta não interpreta exclusão como ausência de riscos financeiros.',
    20: 'Páginas3–4 apresentam os quatro critérios e tarefas comerciais. A resposta distingue download gratuito de ausência de monetização e conserva o recorte observado.',
    21: 'Lista de exclusões atravessa páginas3–4 e foi lida integralmente; a resposta inclui assinatura e identidade governamental. Não certifica os grupos excluídos como seguros nem generaliza o corpus.',
    22: 'Página4 documenta12 por categoria planejados e distribuição final12/11/9 que soma100. A resposta explica redução operacional sem inferir segurança relativa pela quantidade de apps.',
    23: 'Página4 sustenta BlueStacks5, GalaxyS22Ultra, capturaWindows, Gmail eSIM externo;8 descreve bloqueios/limites. A resposta não promete experiência idêntica à de usuários habituais.',
    24: 'Página4 contém oito tarefas condicionadas à disponibilidade e dez minutos;8 limita extrapolação. A resposta conserva a condição e não presume todos os fluxos em todo aplicativo.',
    25: 'Página4 afirma checkout e ausência de compras;8 delimita outros percursos possíveis. A resposta corretamente não deduz perdas financeiras ou experiência pós-transação.',
    26: 'Página4 descreve análise individual, discussão, desempate e kappa0,64, além do guia40casos. A resposta lê concordância como apoio à classificação, sem prova de objetividade absoluta ou efeito no usuário.',
    27: 'Páginas4–5 distinguem seis macroclasses, subclasses e casos, inclusive nomes usados em dois níveis. A resposta não inventa definições remetidas aos trabalhos não fornecidos.',
    28: 'Páginas4–5 explicitam guia40casos para reduzir subjetividade. A resposta distingue exemplos operacionais de categorias e ocorrências, sem completar o conteúdo ausente do guia por conhecimento externo.',
    29: 'Páginas4–5 registram não contar reaparições iniciais e8 limita duração. A resposta situa751 na convenção operacional e não os trata como toda exposição repetida ou dano acumulado.',
    30: 'Página5 apresenta13/41/46apps, média7,51 e desvio4,7. A resposta diferencia presença, média e distribuição e evita converter contagens em gravidade psicológica.',
    31: 'Página5 relata3,7macroclasses/desvio1,5 e4,4subclasses por app. A resposta distingue diversidade classificatória de751casos e não soma classes como grupos exclusivos de pessoas.',
    32: 'Página5 sustenta78%,201Nagging,62%macro/54%subForcedAction,115casos e75DisguisedAd. A resposta preserva níveis/unidades e não usa a inferência ambígua da página6.',
    33: 'Página5 registra NotíciasGlobais25casos/7subclasses e4apps sem registros;8 limita observação. A resposta não certifica ausência universal nem qualifica toda categoria de notícias por extremos.',
    34: 'Página6 descreve redirecionamento e fricção de acesso como Obstruction. A resposta atribui estresse/probabilidade de leitura ao texto, distinguindo a alegação de experimento de leitura não realizado.',
    35: 'Páginas6–7 definem cadeia temporal de subanúncios e múltiplas chamadas de atenção. A resposta identifica o mecanismo e não classifica toda publicidade ou inventa duração/efeito populacional.',
    36: 'Páginas6–7 descrevem missão além do fluxo e ações úteis ao desenvolvedor. A resposta não transforma toda meta em dark pattern nem afirma autonomia medida causalmente.',
    37: 'Páginas6–7 definem assistir anúncio para moedas/aceleradores/bônus. A resposta conserva condicionalidade e corpus sem generalizar a todos jogos ou alegar efeitos psicológicos medidos.',
    38: 'Páginas6–7 classificam linguagem/visuais apelativos como Toying with Emotions. A resposta descreve persuasão e distingue sua identificação de medição emocional ou dano clínico.',
    39: 'Páginas6–7 distinguem Untranslation de redirecionamento/Obstruction. A resposta separa compreensão e acesso e não promete eliminar dano apenas traduzindo ou reposicionando texto.',
    40: 'Páginas6–7 sustentam45+26+42+20+14+11=158, cerca21%de751. A resposta trata unidades como casos de padrões conhecidos, não seis novas macroclasses ou grupos de pessoas.',
    41: 'Páginas5/7–8 comparam médias7,51/7,4 e prevalências96/95, conservando diferenças de distribuição e contexto. A resposta evita os percentuais comparativos negativos e causalidade nacional.',
    42: 'Páginas2/7–8 sustentam influências socioeconômicas/educacionais/socioculturais como possibilidades. A resposta preserva hipótese e heterogeneidade, não um efeito isolado experimentalmente.',
    43: 'Páginas3/8 excluem Finance por limitação técnica e propõem expansão futura. A resposta não apresenta pesquisa financeira/longitudinal como concluída nem presume que só ampliar amostra resolva contexto.',
    44: 'Interact6–7 e SbD21/34–35 sustentam barreiras de acesso/compreensão e políticas claras/visíveis. A síntese distingue disponibilidade de compreensão e mantém notas2019 ilustrativas, sem eficácia conjunta.',
    45: 'Interact3–4/8 descreve auditoria curta; SbD21/27 pede avaliação documentada e exemplifica pré-lançamento. A resposta articula diagnóstico e prevenção sem atribuir essa avaliação às empresas auditadas.',
    46: 'Interact5/8 fornece descrição de casos; SbD21/36 pede métricas significativas de eficácia. A resposta não confunde baseline/atividade com redução causal de dano ou publicação de relatório com proteção.',
    47: 'Interact6–7 e Art48p4 sustentam idioma e o alcance restrito do§12. A resposta preserva hospedagem de terceiros, indicação etária e ausência de verificação de vigência, sem declarar infração.',
    48: 'Interact6–7 define anúncios/recompensas; Art48p3–4 enumera mecanismos e uso prolongado. A ponte não equipara toda publicidade/gamificação a padrão nem critério etário a medida de dano.',
    49: 'Interact6/8 e Art48p4–5 sustentam barreiras e fatores de curadoria/controles/moderação. A resposta não inventa Guias ausentes, comprovação dos controles ou eliminação de padrões por classificar.',
    50: 'Interact2/6/8 e CHIP1–2 sustentam barreiras linguísticas e lente estrutural distinta. A resposta evita causalidade entre divide e cada caso, homogeneização regional ou generalização de prevalência para jogos.',
    51: 'Interact4/8 limita observação a dez minutos; CHIP2 explicita ficção de Helena. A síntese distingue ocorrência, hipótese sistêmica e consequência imaginada sem completar empiricamente uma fonte com a outra.',
    52: 'Interact8 pede expansão do corpus/SulGlobal; CHIP2–3 pede parcerias e cocriação. A resposta diferencia cobertura de redistribuição de participação, sem declarar que ampliar amostra já comprova equidade.',
    53: 'Interact3–4 sustenta piloto/guia/discussão/desempate e Agenda7–8 propõe léxico/curadoria/versionamento. A resposta articula infraestrutura sem equiparar concordância a validação de alternativas ou bem-estar.',
    54: 'Interact6–8 identifica barreiras e Agenda9–10 propõe apoio contextual, agência e cuidados com fadiga/falsos positivos. A resposta separa requisitos investigativos de solução testada e não transfere toda responsabilidade ao usuário.',
    55: 'A correlação é sustentada por Interact6–7 e OP11–13, mas pergunta e resposta repetem substancialmente article-39adb0cfa84e-57, já existente nesta ampliação: as mesmas duas recompensas condicionadas versus desbloqueios opcionais. Requer um nexo distinto para entregar uma questão nova substantiva. Sugestão: contrastar Task-based Rewards com scaffolding/tutoriais e domínio gradual de ferramentas de World Creation, mantendo limites e evidências completas.',
    56: 'Interact6/8 descreve mecanismos observados e OP11–13 especifica WatchFor preventivo. A resposta distingue auditoria, condições de solução e efeitos, sem inferir radiância da ausência de casos.',
    57: 'Interact4/8 sustenta classificação dialogada e limites; HCI13/16 distingue candidatos/governança e ausência de dados longitudinais. A síntese não equipara acordo, recorrência e eficácia.',
    58: 'Interact3/8, HCI10–11/16 e SbD21/35 sustentam adaptação, invariantes/variantes e participação. A resposta explicita comparação metodológica sem alegar método universal validado conjuntamente.',
  },
};
const audit = JSON.parse(await fs.readFile('data/reviews/expansion/audit-radiant-interact.json', 'utf8'));
const reviewedHashes = JSON.parse(await fs.readFile('data/reviews/expansion/semantic-input-hashes-radiant-interact-round1.json', 'utf8'));
const inputGroups = {};
for (const articleId of Object.keys(reasons)) {
  inputGroups[articleId] = JSON.parse(await fs.readFile(`data/candidates/expansion/${articleId}.json`, 'utf8'));
  for (const card of inputGroups[articleId]) {
    if (cardDigest(card) !== reviewedHashes[card.id]) throw Error(`Candidate changed after round 1 semantic review: ${card.id}. A new independent review is required.`);
  }
}
for (const [articleId, decisions] of Object.entries(reasons)) {
  const cards = inputGroups[articleId];
  const reviews = cards.map(card => {
    const suffix = Number(card.id.slice(-2));
    if (!decisions[suffix]) throw Error(`Missing semantic decision: ${card.id}`);
    return {
      cardId: card.id,
      status: articleId === 'article-48bdcebcffc6' && suffix ===55 ? 'revision_required' : 'approved',
      reason: decisions[suffix],
      cardSha256: cardDigest(card), sourceSha256: audit.sourceHashes[articleId],
      ...(card.relatedSources?.length ? { relatedSourceSha256: Object.fromEntries(card.relatedSources.map(reference => [reference.articleId, audit.sourceHashes[reference.articleId]])) } : {}),
      reviewer: 'review_radiant_interact', independentFromAuthor: true, round: 1,
      pagesVerified: card.source.pages,
      ...(card.relatedSources?.length ? { relatedPagesVerified: Object.fromEntries(card.relatedSources.map(reference => [reference.articleId, reference.source.pages])) } : {}),
      reviewedAt: new Date().toISOString(),
    };
  });
  await fs.writeFile(`data/reviews/expansion/review-${articleId}.json`, JSON.stringify(reviews, null, 2) + '\n');
  const requested = cards.filter(card => articleId === 'article-48bdcebcffc6' && card.id.endsWith('-55'));
  if (requested.length) await fs.writeFile('data/reviews/expansion/history-radiant-interact.json', JSON.stringify(requested.map(card => ({ decision: reviews.find(review => review.cardId ===card.id), card })), null, 2) + '\n');
  console.log(`${articleId}: ${reviews.filter(review => review.status ==='approved').length} approved, ${reviews.filter(review => review.status ==='revision_required').length} revision_required`);
}
