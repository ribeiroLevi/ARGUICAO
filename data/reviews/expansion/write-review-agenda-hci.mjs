// Review artifact: decisions below were individually derived from original local PDFs.
// This script records them; it does not infer semantic approval from literal matches.
import fs from 'node:fs/promises';
import { cardDigest, digest } from '../../../scripts/validate-cards.mjs';

const read = async file => JSON.parse((await fs.readFile(file, 'utf8')).replace(/^\uFEFF/, ''));
const inventory = await read('data/extracted/inventory.json');
for (const id of ['article-d0d500126a80', 'article-e13c3cb65c28']) {
  try {
    const existing = await read(`data/reviews/expansion/review-${id}.json`);
    if (existing.some(decision => decision.round > 1)) throw Error('Primeira rodada encerrada: não sobrescrever decisões posteriores.');
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const audit = await read('data/reviews/expansion/audit-agenda-hci.json');
if (audit.failures.length || audit.candidateCount !== 100) throw Error('A auditoria original não está íntegra.');
const reasons = {
  'article-d0d500126a80': [
    'A página 2 reconhece pressões econômicas e contesta o encerramento prematuro da investigação de contramedidas incorporáveis ao fluxo. A resposta preserva o caráter programático e não promete receita.',
    'A página 2 relata a literatura sobre Bélgica com conformidade, recursos/escala de fiscalização e evasão técnica. A resposta corretamente o delimita como exemplo contextual, sem alegar situação jurídica atual ou inutilidade de toda regulação.',
    'A página 4 contém 45% dos padrões conhecidos e a evolução manual/automatizada. A qualificação como resultado da literatura citada impede transformá-lo em acurácia universal ou contemporânea de qualquer detector.',
    'DPAF, 68 tipos e acréscimo de 20 sobre Gray constam na página 3; a continuidade na 4 delimita a taxonomia/detecção. A conclusão de que catalogação não demonstra contramedidas acompanha a lacuna argumentada no artigo.',
    'A página 3 relaciona plataformas tradicionais/AR/VR e vieses cognitivos à suscetibilidade. A resposta descreve essa revisão contextual e não atribui ao position paper um experimento próprio.',
    'As iniciativas curriculares e a responsabilidade profissional estão na página 4; a limitação de poder decisório e incentivos está na 10. A resposta articula os dois trechos sem apresentar educação como garantia organizacional.',
    'A página 4 contrapõe ferramentas estáticas a jogos sérios/persuasivos imersivos que espelham manipulação. A ressalva sobre resistência duradoura mantém a diferença entre promessa educacional e eficácia comprovada.',
    'A página 4 afirma que até usuários conscientes podem sentir-se incapazes de se opor. A resposta distingue reconhecimento e ação e não converte a insuficiência da educação isolada em dispensa da educação.',
    'A página 5 apresenta limites de execução ética, adaptação regulatória/jurisdições e transformação de achados de saúde em padrões exigíveis. A integração é corretamente formulada como direção de ação, não pacote testado.',
    'A enumeração de etnografia, playtesting, experimentos e experiência do jogador está na página 5, com autonomia/consentimento na 6. A resposta não afirma que esses estudos tenham sido executados pelo próprio position paper.',
    'A fonte na página 6 diz “without exploitative grinding”. “Grinding exploratório” é tradução ambígua que pode sugerir exploração investigativa ou do mundo do jogo. Substituir por “grinding que explore o jogador” ou expressão equivalente clara; as ofertas/urgência e o caráter propositivo estão adequados.',
    'A página 6 rejeita eliminar monetização/engajamento e propõe sustentabilidade, prazer, motivação intrínseca, controle de tempo/dados e divulgação de monetização. A resposta não transforma essa proposta em garantia comercial.',
    'Lealdade e atitudes da comunidade como potenciais ativos aparecem em modo hipotético na página 6. A resposta conserva esse modo e explicita a inexistência de demonstração de retorno comercial neste texto.',
    'A página 7 exige entendimento compartilhado, léxico e colaboração contínua antes de coleções cooperativas. A resposta distingue processo comunitário de mera armazenagem e mantém o foco na tradução pesquisa/prática.',
    'A página 7 sugere métodos padronizados/flexíveis, bem-estar e engajamento, e a System Darkness Scale como ponto inicial adaptável com métodos mistos. A resposta não inventa protocolo final ou validação de adaptação.',
    'As páginas 7–8 distinguem repositório dinâmico como meta de longo prazo e colaboração/disseminação como foco imediato, incluindo documentação além do layout. A resposta preserva essa prioridade e não atribui eficácia à infraestrutura.',
    'A página 8 explicita revisão por pares, curadoria comunitária incluindo desenvolvedores e versionamento para qualidade/integridade/evolução. A resposta os trata como requisitos de uma proposta, sem governança já avaliada.',
    'Coautoria, reconhecimento e comunidade de prática constam na página 8 como incentivos possíveis à participação inclusiva. A resposta não afirma comparação experimental de incentivos nem superação de desigualdades.',
    'A página 8 lista consórcios, universidades e fundações e ressalta engajamento e propriedade compartilhada continuados. A resposta representa sustentabilidade como tarefa permanente, sem pressupor suficiência de financiamento inicial.',
    'A página 8 descreve especialização por gênero, população e questão ética, coordenada em plataformas compartilhadas. A resposta conserva contexto e caráter potencial da descentralização, sem universalizar exemplos.',
    'A página 7 remete a Frommel/Mandryk para FOMO/sensação de tarefa e propõe desenvolver/testar alternativas. A resposta distingue achado citado e investigação futura e não condena toda recompensa diária.',
    'As páginas 8–10 fundamentam extensões/overlays, identificação contextual, explicação e possível ação alternativa, com testes e agência. A resposta não toma esse encadeamento proposto como detector pronto, preciso ou eficaz.',
    'A página 9 proíbe enganar o usuário para uma escolha considerada melhor e orienta apoio à agência sem ditar decisões. A resposta preserva o caráter normativo e não garante autonomia por mero aviso.',
    'A página 9 admite que jogadores avançados/plataformas contornem ou comprometam ferramentas; a 10 exige testes rigorosos. A resposta não torna a evasão inevitável nem transforma demonstração técnica em solução definitiva.',
    'A página 9 registra propostas práticas/contextuais, risco de notificações triviais e rejeição por criatividade, restrição ou finanças. A resposta descreve obstáculos propostos e não resultados de aceitação de um plugin implementado.',
    'A página 10 distingue incorporação cultural de princípios éticos de uma simples estratégia de eficácia da ferramenta. A resposta mantém requisitos empíricos e organizacionais sem equiparar instalação a transformação cultural.',
    'Surveys/entrevistas com mobile/live-ops e distribuição de conhecimento, agência e pressões estão explicitamente propostos na página 10. A resposta não os apresenta como pesquisa já realizada.',
    'KPIs comerciais estão na página 10 e instrumentos de autonomia/justiça/transparência/bem-estar na 11. O contraste é analítico e corretamente não presume equivalência nem incompatibilidade necessária entre os objetivos.',
    'A página 11 exige avaliar experiência positiva/prazer genuíno além da ausência de DPs. A resposta amplia a pergunta empírica sem afirmar que experiência positiva dispense investigar riscos.',
    'A página 11 propõe telemetria/análise comportamental integrada a dados qualitativos e instrumentos. A resposta preserva linguagem propositiva e não inventa sinal diagnóstico validado de manipulação.',
    'A página 11 exige padronização adaptável a gênero/monetização e combinação de avaliação especializada com automação eticamente apropriada. A resposta não anuncia protocolo universal nem substituição do contexto.',
    'O exemplo X/Y/Z na página 11 é ilustrativo de recomendação específica respaldada por medida. A resposta mantém os placeholders como argumento metodológico, sem inventar intervenção ou resultado.',
    'As quatro frentes da página 12 são reproduzidas com sentido correto e articuladas como perguntas abertas de teoria/aplicação, sem prescrição única para todos os jogos.',
    'As páginas 11–12 rejeitam solução universal e pedem profundidade qualitativa, rigor quantitativo e múltiplos papéis/países, explicitamente Sul Global. A resposta não atribui ao artigo um estudo intercultural próprio.',
    'As páginas 7–8 exigem princípios éticos, construtos psicológicos e validação além de layout/sequência, com revisão/curadoria/versionamento. A resposta distingue documentação convincente de comprovação de efeito.',
    'Agenda 9–10 propõe ferramentas e cultura; SbD 22/27 atribui responsabilidade ao serviço e exemplifica avaliação antes do lançamento. O nexo organizacional é explícito como análise, sem supor avaliação conjunta ou eficácia histórica em qualquer jogo.',
    'SbD 36 distingue escala de relatos de eficácia de regras e pede avaliação anual/métricas significativas; Agenda 11 pede indicadores éticos/psicológicos. A resposta compara objetivos sem equiparar denúncia, retenção e benefício.',
    'SbD 35–36 contém engajamento aberto/compartilhamento tecnológico e Agenda 8 fundamentos, curadoria/versionamento e sustentação comunitária. A síntese diferencia colaboração, consulta e validação empírica, sem efeito já demonstrado.',
    'O inciso XX local na página 4 lista funcionalidades de permanência prolongada; Agenda 6 discute prazer, agência e transparência. A resposta conserva o nexo como comparação de critérios/experiência, sem vigência ou diagnóstico causal pela presença da mecânica.',
    'A resposta delimita corretamente §§5–6 e o escopo do §12, mas a pergunta diz que o documento prevê “termos de uso acessíveis” como um todo. O §12 exige a indicação etária clara/acessível dentro dos termos dos fornecedores que hospedam conteúdo de terceiros. Estreitar a pergunta à indicação exibida e informada nos termos, sem ampliar a obrigação documental.',
    'Art.48 local 4–5 contém controle editorial/parental/moderação e remissão aos Guias; Agenda 10–11 exige medir impactos/eficácia. A resposta distingue classificação de evidência psicológica e não completa o conteúdo dos Guias nem a vigência.',
    'Agenda 4/9 diferencia consciência e agência; CHIP 1 apresenta vulnerabilidades sistêmicas/preexistentes e letramento. A relação é explicitamente analítica, não atribui incapacidade a todo jogador nem usa ficção como teste.',
    'Agenda 10 trata de KPIs/poder e CHIP 1–2 de automação indiferente e dashboard ficcional. A resposta desloca a pergunta para governança sem afirmar sistema observado ou mecanismo causal universal entre empresas.',
    'Agenda 12 inclui Sul Global e colaboração; CHIP 3 exige parceria equitativa e cocriação além de fontes de dados. A resposta distingue amostragem e poder e conserva ambos como chamadas à ação.',
    'Interact 4/8 documenta corpus, tarefas, dez minutos e emulador/limites; Agenda 10–11 demanda impacto. A síntese não generaliza cem aplicativos nem transforma classificação em medida de bem-estar/intervenção.',
    'Interact 6 descreve Untranslation e página externa nos termos; Agenda 4/9 problematiza consciência e agência. A comparação não presume consentimento efetivo, efeito causal de língua ou solução já validada.',
    'Agenda 7–8 requer documentação e validação; OP 9 fornece campos e OP 16 reconhece falta de avaliações/viabilidade. A resposta trata o template como hipótese explicitável/testável, sem anunciar conclusão da agenda.',
    'OP 7/15 diferencia preservação de necessidades, avaliação PENS/IMI e atribuição do efeito; Agenda 11 solicita construtos/medidas. A resposta separa satisfação/motivação, frustração e causalidade como pergunta analítica, sem protocolo definitivo.',
    'Agenda 7–8 exige léxico/curadoria e HCI 15–16 diferencia recorrência/verificação de efeito longitudinal. A resposta conecta infraestrutura e processo, preservando requisitos ainda futuros.',
    'Agenda 11–12 requer comparação com adaptação; HCI 11/15–16 explicita invariantes/variantes e níveis metodológicos não universais na experiência. A síntese não converte arquitetura em eficácia ou instrumento de medida validado.',
  ],
  'article-e13c3cb65c28': [
    'A página 1 distingue dark/deceptive e situa DPs em progressão, recompensa e monetização, além de diálogos. A resposta não torna toda recompensa/compra nociva e preserva o critério de agência.',
    'A página 3 nomeia as três necessidades e afirma que sistemas organizam condições sem garantir florescimento. A resposta mantém a separação estrutura/experiência e não promete uniformidade individual.',
    'Bright Patterns, onboarding/transparência e risco de paternalismo estão na página 3. A resposta conserva a tensão entre apoiar objetivos genuínos e ditar comportamentos considerados bons.',
    'A página 3 caracteriza Fair como informação/neutralidade em domínios regulados e RPs como estrutura intrínseca do gameplay/SDT. A resposta compara foco e alcance sem oposição exclusiva ou substituição.',
    'A página 4 registra escassez de validação e definições/critérios como unidades experimentais para pesquisa cumulativa. A resposta preserva a distinção entre condição metodológica e resultado de eficácia.',
    'As páginas 4–5 apontam seis exemplares, template insuficiente para derivação e julgamento ad hoc, propondo infraestrutura/metodologia colaborativa. A resposta não atribui efeito positivo automático às novas propostas.',
    'A página 5 informa P01–P05 e P01/P06–P09, total nove e seleção por expertise. A resposta resolve a sobreposição e não transforma teste de lógica em representatividade populacional.',
    'As páginas 5–6 registram apresentação, duas mesas/três padrões, trinta minutos e rotação. A resposta descreve corretamente o desenho colaborativo e limita o resultado a insumos qualitativos.',
    'Gravações/transcrições, planilha e análise temática reflexiva dedutiva constam na página 6. A resposta reproduz o encadeamento de questões, agrupamento e priorização sem convertê-lo em mensuração causal.',
    'As páginas 6–7 indicam atribuições, P09 com dois padrões, sessões de uma hora e desacordos revisitados com histórico. A resposta preserva consenso como base inicial para validação mais ampla.',
    'As páginas 7–8 enumeram os quatro campos dos diários, narrativas, memos e capturas. A resposta os qualifica como dados situados de pesquisadores, sem representatividade externa ou isolamento de efeito.',
    'A página 7 apresenta critérios de escolha/dez horas ou narrativa e a tabela dos seis jogos, com P07 em dois. A resposta conserva amostragem direcionada e não estima prevalência geral.',
    'As quatro regras de nomeação na página 9 foram traduzidas com seus sentidos funcional, genérico, de resultado e relacional. A resposta as vincula à identificação/extensibilidade sem reduzir o procedimento a estética nominal.',
    'A página 9 explica Free Exit→Open Gate por preservação de progresso, saída/retorno sem custo. A resposta evita reduzi-lo a botão de saída e não garante adequação só pelo nome.',
    'A página 10 amplia pet para Companion animal/humano/tecnológico/simbólico e papéis decorativos/narrativos/funcionais. A resposta preserva contextos e não presume necessidades iguais entre variantes.',
    'A página 10 desloca Item Evolution para progresso/percepção de realização; a 11 fornece critérios estruturais/níveis. A resposta não classifica automaticamente qualquer recompensa ou aumento numérico como RP.',
    'As páginas 8/10 diferenciam customização/criação e ampliam World Creation para Creative Suite. A resposta mantém as diferenças de interação e a necessidade de variantes/descrição, sem eficácia genérica do editor.',
    'A página 10 identifica a ambiguidade de Hint/tutorial e a ampliação além da cor para affordances visuais. A resposta delimita o papel sem transformar renomeação em demonstração de benefício.',
    'As páginas 8/10 justificam Adaptive Challenge manual/adaptativo e a dificuldade significativa de soulslike. A resposta não exige remover desafios nem presume experiência uniforme das adaptações.',
    'As páginas 10–11 definem Progressive Requirement Scaling e Environment-Based Subclassing, com companheiros e criação. A resposta distingue intensidade cumulativa e contexto, preservando identidade sem eficácia universal.',
    'As páginas 11/14 definem L1 como piso not-Dark e L2/L3 como apoio progressivo. A resposta corretamente diferencia fronteira ética mínima e aspiração, sem anunciar máximo bem-estar.',
    'A tabela da página 12 e o desacoplamento na 11 definem Target Actor, Goal e Developer Need como ator no desenvolvimento, objetivo e requisitos. A resposta evita confundir intenção técnica com efeito no jogador.',
    'A tabela da página 12 separa Player Problem de Negative Consequences; a 11 justifica desacoplar metas técnicas e experiência. A resposta não apresenta consequências previstas como medidas em participantes.',
    'A página 12 define Core Solution e necessidades apoiadas ou neutras; a 4 delimita não frustração. A resposta não exige intensificar todas as dimensões nem permite frustrar uma para ganhar em outra.',
    'Expected Outcomes na página 12 é antecipação; páginas 15–16 explicitam ausência longitudinal e uso em desenvolvimento ainda futuro. A resposta preserva resultado esperado versus medido.',
    'As páginas 11–12 registram o diário de Celeste e relatedness como prioridade futura. A resposta mantém a instância autoetnográfica situada, sem generalizar efeito de todo diálogo/companheiro.',
    'A página 12 descreve o puzzle de God of War como Companion funcional e Adaptive Challenge single-player. A resposta mantém a interconexão estrutural observada sem atribuir efeito universal em jogadores.',
    'As páginas 12/15 apresentam Make Your Path e Non-Playable Time como candidatos e exigem recorrência/coerência/discussão. A resposta preserva essa provisoriedade e a limitação de falso positivo/amostra.',
    'A página 12 cita Companion multiplayer/cosméticos e Adaptive Challenge Competitive Balance/Item Adaptation; a 15 exige verificação. A resposta conserva o status candidato e não presume radiância só pelo recurso.',
    'A página 13 descreve Construction Planning/Creation Preview em Minecraft e Safety/Competence; páginas 10/15 dão variantes e limites. A resposta apresenta hipótese estrutural e não efeito causal ou longitudinal comprovado.',
    'A página 13 explica filtros contextuais e Candidate/Finalized por maturidade de verificação. A resposta distingue processo de conhecimento de segurança/efeitos universais, mantendo limites documentais.',
    'Structured submissions e problem-based contributions estão na página 13, com todas inicialmente candidatas. A resposta distingue entradas de solução e problema sem dispensar revisão.',
    'A página 13 propõe especialistas/invariantes e devolução para refinamento iterativo; a 16 situa protocolo/validação futuros. A resposta não alega que a governança já tenha provado efeitos longos.',
    'A página 13 reconhece autosseleção/expertise e template como redução de gatekeeping; a 14 delimita nove especialistas. A resposta o qualifica como salvaguarda parcial, sem eliminar viés ou garantir representação.',
    'A página 15 distingue níveis como base metodológica e experiência variável entre sandbox/soulslike. A resposta preserva não frustração como denominador ético, não experiência psicológica uniforme.',
    'SbD 21–22 atribui responsabilidade preventiva e limites; HCI 11/14 define L1. A síntese conserva escalas distintas e não reduz a segurança do serviço a propriedades de uma mecânica.',
    'SbD 35 recomenda engajamento amplo e 21 qualifica notas ilustrativas; HCI 13 descreve candidatos/voluntários. A resposta não equipara especialistas a representação de usuários nem Finalized a eficácia.',
    'SbD 30 associa default seguro, controle e revisão de escolhas; HCI 3/11 trata de condições e níveis. A resposta articula proteção/agência e não equipara privacidade a competência/vínculo ou controle a florescimento.',
    'Art.48 local 4 lista inciso XX; HCI 9/11 descreve Open Gate. A resposta compara custos/pressões de interrupção e preserva diferenças entre classificação, estrutura, dano e vigência.',
    'Art.48 local 2/5 contém revisão §4 e especificações §15; HCI 10/15 contém contexto e limites. A síntese não equipara faixas etárias a níveis de RP nem revisão administrativa a validação psicológica.',
    'CHIP 2 fornece lente teórica e crítica WEIRD; HCI 15 delimita níveis e variantes. A resposta não presume que variantes já resolvam desigualdades materiais nem usa Helena como confirmação empírica.',
    'HCI 13–14 reconhece revisão voluntária/seleção; CHIP 3 exige parceria e cocriação. A resposta distingue abertura de participação e redistribuição de poder sem afirmar exclusão necessariamente ocorrida.',
    'Agenda 7–8 exige léxico/validação/curadoria/versionamento e HCI 13/15 fornece catálogo e limites. A resposta reconhece infraestrutura concreta sem confundir revisão com impacto longitudinal.',
    'HCI 4 associa definições a pesquisa cumulativa e Agenda 11–12 pede métodos adaptáveis/impacto. A resposta mantém complementaridade entre descrição estável e avaliação contextual, sem ensaio já realizado.',
    'HCI 14/16 delimita piso defensivo/apoio e falta de dados; Agenda 11 exige experiência positiva além da ausência de DPs. A síntese formula perguntas de avaliação, não etapas de eficácia comprovadas.',
    'OP 9–10 oferece problema/contexto/solução/necessidades/riscos e HCI 11–12 separa objetivos e problemas. A resposta interpreta refinamento de rastreabilidade sem invalidar o template anterior ou comprovar bem-estar.',
    'OP 9–10 define Context/Watch For e HCI 10/12 níveis/variantes/invariantes. A comparação mantém adequação e riscos como critérios, sem prometer eficácia ou viabilidade pela coerência técnica.',
    'OP 7/15 distingue radiância construtiva e neutralidade; HCI 12/14 descreve L1 not-Dark. A resposta explicita a tensão como interpretação comparativa possível, sem equivalência automática nem resolução atribuída aos autores.',
    'Interact 4/8 contém guia, discussão/desempate, corpus/janela/emulador; HCI 13/15 exige recorrência e verificação. A síntese diferencia objetos e inferências e não equipara concordância a efeito longitudinal.',
    'Interact 6 descreve Untranslation; HCI 3/15 define agência/léxico e SbD 34 pede informação visível/compreensível. A resposta distingue vocabulário profissional, acesso ao produto e agência sem inferir causalidade de perda de autonomia.',
  ],
};

const revisions = new Map([
  ['article-d0d500126a80-19', ['Substituir “grinding exploratório” por tradução inequívoca de exploitative grinding, como “grinding que explore o jogador”. Preservar ID e evidência original.']],
  ['article-d0d500126a80-48', ['Estreitar a pergunta à indicação etária exibida e informada claramente nos termos de uso; não atribuir ao §12 uma obrigação sobre a acessibilidade dos termos inteiros. A resposta já delimita corretamente o escopo.']],
]);
const snapshots = [];
for (const [articleId, articleReasons] of Object.entries(reasons)) {
  if (articleReasons.length !== 50) throw Error(`Faltam decisões individuais para ${articleId}: ${articleReasons.length}`);
  const cards = await read(`data/candidates/expansion/${articleId}.json`);
  if (cards.length !== 50) throw Error('Contagem de candidatos mudou.');
  const decisions = cards.map((card, index) => {
    if (card.id !== `${articleId}-${String(index + 9).padStart(2, '0')}`) throw Error(`Ordem de ID inesperada: ${card.id}`);
    const refs = [{ articleId: card.articleId, source: card.source }, ...(card.relatedSources ?? [])];
    for (const ref of refs) {
      const entry = inventory.find(item => item.articleId === ref.articleId);
      if (!entry || entry.file !== ref.source.file || entry.title !== ref.source.title || audit.sourceHashes[ref.articleId] !== entry.sha256) throw Error(`Metadados/hash mudaram: ${card.id}`);
    }
    const requiredChanges = revisions.get(card.id);
    const decision = {
      cardId: card.id,
      status: requiredChanges ? 'revision_required' : 'approved',
      reason: articleReasons[index],
      cardSha256: cardDigest(card),
      sourceSha256: audit.sourceHashes[card.articleId],
      ...(card.relatedSources?.length ? { relatedSourceSha256: Object.fromEntries(card.relatedSources.map(ref => [ref.articleId, audit.sourceHashes[ref.articleId]])) } : {}),
      reviewer: 'review_agenda_hci', independentFromAuthor: true, round: 1,
      pagesVerified: refs.map(ref => ({ articleId: ref.articleId, pages: ref.source.pages })),
      reviewedAt: new Date().toISOString(),
      ...(requiredChanges ? { requiredChanges } : {}),
    };
    if (requiredChanges) snapshots.push({ ...decision, candidateSnapshot: card, snapshotSha256: digest(JSON.stringify(card)) });
    return decision;
  });
  await fs.writeFile(`data/reviews/expansion/review-${articleId}.json`, JSON.stringify(decisions, null, 2) + '\n', 'utf8');
}
await fs.writeFile('data/reviews/expansion/history-agenda-hci.json', JSON.stringify(snapshots, null, 2) + '\n', 'utf8');
console.log(`100 decisões individuais: ${100 - revisions.size} approved, ${revisions.size} revision_required. Nenhuma publicação.`);
