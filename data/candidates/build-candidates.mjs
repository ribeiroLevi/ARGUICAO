// Authoring artifact. Reads only local extractions and writes candidates, never approvals.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const out = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(out, '../..');
const inventory = JSON.parse(fs.readFileSync(path.join(root, 'data/extracted/inventory.json'), 'utf8'));
let doc, cards;
function article(id) {
  if (doc) save();
  const entry = inventory.find(x => x.articleId === `article-${id}`);
  doc = JSON.parse(fs.readFileSync(path.join(root, 'data/extracted', entry.outputFile), 'utf8'));
  cards = [];
}
function span(page, start, end) {
  const text = doc.pages.find(x => x.page === page).text;
  const from = text.indexOf(start);
  const to = text.indexOf(end, from);
  if (from < 0 || to < from) throw Error(`${doc.articleId} p${page}: ${start} / ${end}`);
  return { page, text: text.slice(from, to + end.length) };
}
function add(suffix, question, answer, sections, ...evidence) {
  cards.push({id: `${doc.articleId}-${suffix}`, articleId: doc.articleId, question, answer,
    source: {file: doc.file, title: doc.title, pages: [...new Set(evidence.map(x => x.page))], sections, evidence: evidence.map(x => x.text)}});
}
function save() {
  fs.writeFileSync(path.join(out, `${doc.articleId}.json`), JSON.stringify(cards, null, 2) + '\n', 'utf8');
  console.log(`${doc.articleId}: ${cards.length} candidatos`);
}

article('94e7a19d8878');
add('01', 'No documento local sobre o Art. 48, quais modelos de classificação são mencionados e qual é o alcance às versões web?',
  'O texto menciona [[autoclassificação pelo Sistema Iarc]] ou [[análise prévia]] para aplicativos gratuitos ou pagos em lojas digitais. O §1º estende o disposto no caput às [[versões web dos aplicativos]].',
  ['Art. 48, caput e §1º'],
  span(1, 'Art. 48. Serão', 'limitando a:'), span(2, '§1º Aplica-se', 'web dos aplicativos.'));
add('02', 'Como o §3º do Art. 48 apresentado trata os conteúdos produzidos por usuários?',
  'São [[elemento de referência]] para classificar os provedores, serviços e aplicativos que os hospedam ou disponibilizam. Segundo esse trecho, não são objeto de [[classificação individual, rotulagem dinâmica ou bloqueio por faixa etária]].',
  ['Art. 48, §3º'], span(2, '§3º Os conteúdos', 'III - bloqueio por faixa etária.'));
add('03', 'Segundo os §§5º e 6º do documento, onde devem aparecer a indicação etária e os descritores de conteúdo?',
  'Devem aparecer de forma [[clara e acessível]], no modelo brasileiro, tanto em aplicativos quanto na web. O §6º especifica as páginas de [[instalação, login e início de uso]].',
  ['Art. 48, §§5º e 6º'], span(2, '§5º Os sujeitos', 'instalação, login e início de uso.'));
add('04', 'Qual papel a publicidade e os links patrocinados têm na classificação descrita pelo documento do Art. 48?',
  'Publicidade e comunicação mercadológica que conduzam a conteúdos ilícitos, inadequados, impróprios ou destinados especificamente a adultos são [[elementos para atribuir a classificação]]. O §9º estende os §§7º e 8º a [[links e redirecionamentos patrocinados ou impulsionados]].',
  ['Art. 48, §§7º a 9º'], span(2, '§7º O conteúdo', 'atribuição da classi fi cação indicativa.'), span(3, '§9º Aplica-se', 'impulsionados.'));
add('05', 'Que funcionalidades ligadas ao uso prolongado aparecem no inciso XX do §10º apresentado?',
  'O texto inclui [[scroll infinito, notificações constantes, recompensas variáveis, algoritmos de recomendação, gamificação e autoplay]], além de seguidores, engajamento social, promoções e ofertas limitadas, como exemplos de funcionalidades que incentivam a permanência prolongada.',
  ['Art. 48, §10º, inciso XX'], span(4, 'XX – funcionalidades', 'entre outros;'));
add('06', 'Segundo o §4º do Art. 48 no arquivo local, quando a indicação etária pode ser revista?',
  'Pode ser revista quando os conteúdos apresentarem [[novas características ou conteúdos classificáveis]], conforme os critérios dos [[Guias Práticos de Classificação Indicativa]].',
  ['Art. 48, §4º'], span(2, '§4º A indicação', 'critérios estabelecidos nos Guias Práticos de Classi fi cação Indicativa.'));
add('07', 'O que o §12 exige dos termos de uso de fornecedores que hospedem conteúdo de terceiros, no documento local do Art. 48?',
  'Para esses fornecedores, o texto exige que os termos de uso informem de modo [[claro e acessível]] a indicação etária atribuída pela Coordenação-Geral de Política de Classificação Indicativa; na ausência desta, a atribuição realizada pelo [[Iarc ou outro modelo autorizado]].',
  ['Art. 48, §12'], span(4, '§12 Os termos', 'Iarc ou outro modelo autorizado.'));
add('08', 'Quais três aspectos adicionais o §14 do documento considera para a classificação final?',
  'O [[controle editorial e a curadoria]] do prestador; a existência de [[controle etário e controles parentais acessíveis]]; e políticas de [[moderação]] que restrinjam o acesso de menores a conteúdos sensíveis ou proíbam esses conteúdos, alinhadas ao Marco Civil da Internet, conforme o texto fornecido.',
  ['Art. 48, §14'], span(4, '§14 Para', 'serviços digitais sobre os conteúdos disponibilizados;'), span(5, 'II – a existência', 'de 2014).'));

article('eca18e5843e2');
add('01', 'Qual é a tese central de Games Made Elsewhere, Harms Felt Here?',
  'O artigo argumenta que padrões enganosos em jogos podem operar como [[instrumentos de exploração]], além da manipulação, quando encontram vulnerabilidades sistêmicas no Sul Global. Apresenta essa tese por meio de um [[cenário de design especulativo]].',
  ['Abstract'], span(1, 'This paper uses', 'emerging form of digital harm.'));
add('02', 'O que significa creator-consumer divide na proposta do artigo?',
  'É uma [[separação estrutural entre os contextos de criação e de consumo]] de jogos: vulnerabilidades preexistentes e sistêmicas podem ser aproveitadas por direcionamento deliberado ou por [[automação indiferente]].',
  ['2 The Creator-Consumer Divide as a Lens for Understanding Systemic Player Vulnerability'], span(1, 'This paper proposes', 'The\ndivide has two nuances.'));
add('03', 'Por que o contexto socioeconômico importa na primeira dimensão da divisão criador-consumidor?',
  'O artigo propõe que o caráter de entretenimento dos jogos pode [[reduzir a vigilância crítica]]. Esse efeito pode ser ampliado por vulnerabilidades sociais, como precariedade econômica e dificuldades de letramento, dificultando a defesa contra práticas manipulativas.',
  ['2 The Creator-Consumer Divide as a Lens for Understanding Systemic Player Vulnerability'], span(1, 'First, games as entertainment', 'Global South.'), span(1, 'The US poverty rate', 'literacy skills [19, 20].'), span(1, 'It\nsuggests', 'practices and discourses.'));
add('04', 'Como a arbitragem regulatória entra na segunda dimensão da divisão criador-consumidor?',
  'Na argumentação do artigo, o desequilíbrio também decorre de [[diferenças na força e na aplicação das proteções ao consumidor]]. Isso pode permitir a implantação de sistemas e modelos de monetização que enfrentariam [[maior escrutínio ou proibição]] em outras regiões.',
  ['2 The Creator-Consumer Divide as a Lens for Understanding Systemic Player Vulnerability'], span(2, 'Second, the power imbalance', 'video games.'));
add('05', 'Qual problema o artigo associa à concentração de pesquisas em contextos WEIRD?',
  'Ela pode [[limitar a validade externa]] dos resultados para a maioria global e deixar de considerar nuances socioeconômicas. Pela perspectiva decolonial adotada, essa concentração também expressa um [[desequilíbrio sistêmico de poder]].',
  ['2 The Creator-Consumer Divide as a Lens for Understanding Systemic Player Vulnerability'], span(2, 'This bias, mirrored', 'systemic issue.'), span(2, 'Still, it reflects', 'diverse global audiences.'));
add('06', 'Helena e Ouroboros Seed representam um estudo empírico de um jogo real?',
  'Não. São um [[cenário imaginado e um artefato de futuro]], construídos como extrapolação de design especulativo. O caso serve como [[provocação crítica]] sobre danos extremos possíveis da divisão criador-consumidor, e não como ocorrência observada.',
  ['3 A Speculative Perspective: Helena and The Gilded Cage of Ouroboros Seed'], span(2, 'This paper uses a speculative', 'civic integrity?'), span(2, 'Ouroboro’s speculative dystopia', 'potential extreme.'));
add('07', 'No cenário especulativo de Helena, quais duas formas de exploração são articuladas?',
  'A exploração financeira aparece na oferta de comprometer parte de um [[benefício social futuro]] para obter alívio no jogo. A narrativa também descreve a venda do [[perfil psicológico]] para campanhas políticas direcionarem desinformação. São elementos da ficção crítica do artigo.',
  ['3 A Speculative Perspective: Helena and The Gilded Cage of Ouroboros Seed'], span(2, 'But at an AI-calculated', 'in her gilded cage.'), span(2, 'But the exploitation', 'vulnerabilities the game monetized.'));
add('08', 'Que mudança de relação com comunidades do Sul Global o artigo reivindica para a pesquisa?',
  'Propõe avançar para [[parcerias equitativas]], com cocriação de agendas de pesquisa e paradigmas de design que construam [[resiliência]] e não aprofundem a precariedade das pessoas vulneráveis.',
  ['4 Toward a Decolonial Game and Play Research'], span(3, 'This compels us to ask', 'already vulner-\nable?'));

article('d0d500126a80');
add('01', 'Qual lacuna motiva From Understanding to Intervention?',
  'Apesar dos avanços em identificar e analisar padrões enganosos, faltam [[métodos robustos e empiricamente validados para enfrentá-los]]. O position paper propõe aproximar o conhecimento ético da [[prática de design]], enfrentando a lacuna de implementação.',
  ['Abstract'], span(1, 'Abstract. Human-Computer', 'design\n\npractice.'));
add('02', 'A agenda proposta substitui as pesquisas de identificação e análise de padrões enganosos?',
  'Não. As autoras pedem uma [[expansão sistemática]] da pesquisa em IHC e jogos: metodologias práticas e intervencionistas devem [[complementar]] o trabalho contínuo de identificar e analisar esses padrões.',
  ['1 Introduction'], span(3, 'Therefore, we call', 'and analyzing DPs in games.'));
add('03', 'Qual contribuição específica de IHC o artigo destaca no enfrentamento de padrões enganosos em jogos?',
  'Produzir [[estratégias e ferramentas concretas apoiadas em evidência empírica]], testando alternativas no nível da interface e do design da interação para reduzir danos e fortalecer a experiência do jogador.',
  ['3 A Call To Action: Why (and How) We Can (and Should) Go Beyond Our Current Efforts'], span(6, 'Therefore, our task', 'addressing DPs in games.'));
add('04', 'Como a documentação colaborativa pode tornar alternativas éticas mais aplicáveis?',
  'O artigo propõe [[projetar, prototipar e avaliar empiricamente]] exemplos em contextos específicos, compartilhando-os em canais acessíveis com evidências e justificativas claras. Isso busca aproximar conhecimento acadêmico e [[uso pela indústria]].',
  ['3.1 Collaboration to Document Positive Patterns and Share Working Examples of Ethical Game Design Elements'], span(7, 'To bridge this gap', 'general industry use.'));
add('05', 'Quais dois tipos de artefatos de software o position paper propõe investigar?',
  '[[Ferramentas de apoio ao jogador]], como extensões ou sobreposições que ofereçam orientação contextual sobre possíveis padrões enganosos; e [[ferramentas de apoio ao desenvolvimento]] integradas a engines, que ajudem a identificar decisões problemáticas e sugerir alternativas éticas. São propostas de pesquisa, não ferramentas cuja eficácia já foi demonstrada pelo artigo.',
  ['3.2 Development of Software Artifacts to Foster Real-Time Awareness on Users and Developers'], span(9, 'we propose a focused', 'from a validated repository.'), span(9, 'The second type', 'of positive design patterns.'));
add('06', 'Que cuidados devem orientar as ferramentas de conscientização em tempo real para jogadores?',
  'Devem apoiar [[agência e escolhas informadas]], sem ditar escolhas ou manipular o jogador para uma decisão considerada melhor. Precisam evitar [[fadiga de alertas, falsos positivos e intrusão]] na experiência.',
  ['3.2 Development of Software Artifacts to Foster Real-Time Awareness on Users and Developers'], span(9, 'However, these tools', 'for informed decision-making.'), span(9, 'There are specific concerns', 'positive gaming experience.'));
add('07', 'Por que ferramentas voltadas apenas a designers podem ter impacto limitado?',
  'O artigo destaca [[restrições organizacionais]]: decisões de monetização muitas vezes vêm de acionistas, executivos e equipes de produto ou monetização, orientados por indicadores de desempenho. Designers e desenvolvedores podem ter [[pouca autonomia]] para rejeitar práticas manipulativas.',
  ['3.2 Development of Software Artifacts to Foster Real-Time Awareness on Users and Developers'], span(10, 'It is important to note', 'ethical concerns surrounding DPs.'));
add('08', 'Que avanço na avaliação de impacto o artigo defende, além de identificar a presença de padrões enganosos?',
  'Defende métodos e medidas validados para avaliar efeitos de escolhas de design sobre [[autonomia, manipulação percebida e bem-estar psicológico]]. Questionários e métricas comportamentais devem captar, por exemplo, [[justiça, transparência e respeito percebido]], permitindo avaliar contramedidas.',
  ['3.3 Advancing Methods and Measures for Assessing Dark Pattern Prevalence and Player Experience, Including Well-Being'], span(10, 'we advocate for expanding', 'holistic psychological well-being.'), span(11, 'adapting specific player', 'Self-Determination Theory [ 33 , 34 ].'));

article('48bdcebcffc6');
add('01', 'Qual foi o objetivo do estudo brasileiro sobre padrões enganosos em aplicativos?',
  'Estabelecer dados de base sobre [[frequência e tipos de padrões enganosos]] em aplicativos populares no Brasil, comparando-os com pesquisas anteriores dos [[Estados Unidos e do Japão]].',
  ['1 Introduction'], span(2, 'We aim to present baseline', 'other geographical settings.'));
add('02', 'Qual corpus e qual procedimento de uso foram analisados no estudo brasileiro?',
  'Foram analisados [[100 aplicativos Android em alta no Brasil]], em nove categorias. Os pesquisadores gravaram os [[primeiros dez minutos de uso]], seguindo oito tarefas quando disponíveis, com o BlueStacks 5; não compraram produtos ou serviços.',
  ['2.2 Corpus Generation and Recording of Usage'], span(4, 'We approved 12 trending', 'We did\nnot purchase any products or services in the apps.'));
add('03', 'Como os pesquisadores organizaram a classificação dos padrões e trataram divergências?',
  'Trabalharam em [[duas duplas]], alternando gravação e análise. Primeiro analisavam individualmente e depois discutiam os vídeos. Registraram [[kappa ponderado de Cohen de 0,64]]; um terceiro pesquisador desempatava quando a dupla não chegava a acordo.',
  ['2.3 DPs Classification'], span(4, 'We organized ourselves', 'pair did not reach an agreement.'));
add('04', 'Quais foram os principais números de prevalência no corpus de 100 aplicativos?',
  '[[96%]] continham pelo menos um padrão enganoso. Foram encontrados [[751 padrões]], média de [[7,51 por aplicativo]], e [[46%]] dos aplicativos continham pelo menos sete. Esses números descrevem o corpus analisado.',
  ['3 Results'], span(5, 'Among the 100 studied', 'contained at least 7 DPs.'));
add('05', 'Quais macroclasses foram mais frequentes, e em que percentuais dos aplicativos?',
  '[[Nagging: 78%]], [[Interface Interference: 76%]] e [[Forced Action: 62%]]. Esses valores são das macroclasses; não devem ser confundidos com os percentuais das subclasses.',
  ['3 Results'], span(5, 'Between the six macro classes', 'as shown in Fig. 1.'));
add('06', 'O que caracteriza Terms/Policy in Another Language e por que esse caso é relevante?',
  'É um caso de [[Untranslation]]: termos de serviço ou política de privacidade aparecem em outro idioma mesmo quando o aplicativo está no idioma do usuário, criando uma barreira informacional. A subclasse Untranslation apareceu em [[45% dos aplicativos]] analisados.',
  ['3 Results', '4 Discussions'], span(6, '“ Terms/Policy\nin Another Language', 'the in-\nformation;'), span(7, 'Moreover, the fourth', '45% of the apps.'));
add('07', 'Os seis casos relatados como novos são seis novas macroclasses de padrões enganosos?',
  'Não. São [[novas aplicações de padrões conhecidos]]: Terms/Policy in Another Language, Terms/Policy Out of Bounds, Ads with Layers, Task-based Rewards, Ad-locked Rewards e Evoke Emotions to Take Action. Eles somaram [[158 ocorrências]], aproximadamente 21% dos 751 padrões encontrados.',
  ['3 Results'], span(6, 'Our findings also revealed', '751 DPs found'));
add('08', 'Quais limites impedem generalizar os resultados para todo uso de aplicativos no Brasil?',
  'O escopo foi de [[aplicativos gratuitos em alta na Google Play brasileira]] e dos dez primeiros minutos de uso. Uso prolongado pode revelar outros padrões, e o [[emulador]] pode impedir o acesso a aplicativos ou deixar de mostrar certos padrões.',
  ['5 Limitations'], span(8, 'Our scope contains', 'emulator as suspicious for usage.'));

article('39adb0cfa84e');
add('01', 'Quais são as duas contribuições centrais de Operationalizing Radiant Patterns?',
  'Uma [[definição refinada]] de Radiant Patterns fundamentada na Teoria da Autodeterminação e uma [[estrutura de documentação]] para definir, instanciar e compartilhar esses padrões. O artigo ilustra a aplicação com um exemplo detalhado.',
  ['Abstract'], span(1, 'First, we provide', 'an in-depth example of an RP.'));
add('02', 'Como a definição refinada caracteriza Radiant Game Design Patterns?',
  'São padrões de interação [[intencionalmente selecionados e implementados]] para permitir objetivos de desenvolvimento sem comprometer significativamente o bem-estar básico do jogador. Devem evitar diminuir [[autonomia, competência e vínculo]], minimizar riscos previsíveis de dano psicológico e evitar padrões que frustrem consistentemente essas necessidades.',
  ['4 Revisiting and Reshaping Game Radiant Patterns'], span(6, 'Radiant Game Design Patterns (RPs)', 'boundaries\nfor player experience.'));
add('03', 'Por que a definição refinada abandona a meta de evitar toda experiência negativa?',
  'Ela assume uma função [[preventiva mais específica]]: preservar a satisfação das necessidades contra prejuízos de design, minimizando riscos previsíveis de dano psicológico e evitando frustração consistente dessas necessidades. Não promete eliminar toda experiência negativa.',
  ['4 Revisiting and Reshaping Game Radiant Patterns'], span(7, 'Instead of “aiming to satisfy,”', 'established anti-patterns.'));
add('04', 'Como a equipe identificou e estruturou os padrões utilizados para construir o template?',
  'Os padrões vieram das [[experiências de jogo de dois estudantes]], um de graduação e outro de pós-graduação. Cada padrão foi estruturado e validado por [[um pesquisador experiente de IHC e jogos]]. Esse procedimento não equivale a validar efeitos sobre o bem-estar de jogadores.',
  ['5 Crafting Radiance: A Guide to Propose Radiant Patterns', '6.5 Study Limitations'], span(8, 'These patterns were identified', 'background in game research.'), span(16, 'Although a refined definition', 'direct effects of Radiant Patterns on well-being.'));
add('05', 'Quais componentes compõem o template de Radiant Patterns proposto nesse artigo?',
  '[[Nome, problema, contexto e solução proposta]]; descrição de como evitar a diminuição das necessidades da SDT; [[Watch For]] para riscos de má aplicação; exemplos de implementação que falham ou atendem aos critérios; e [[bons exemplos]] em jogos.',
  ['5.1 Radiant Pattern Structure', 'Table 1. Structural Template for Radiant Game Design Patterns (RPs)'], span(9, 'Template Component Brief Description', 'Illustrative games/features using the RP.'));
add('06', 'Por que Watch For e exemplos de falha são necessários no template?',
  'Um padrão pode perder sua eficácia se aplicado [[fora do contexto ou de forma inadequada]]. Watch For explicita riscos previsíveis e más aplicações; exemplos que falham e que atendem aos critérios ajudam a discutir [[estratégias de implementação e obstáculos]].',
  ['5.1 Radiant Pattern Structure'], span(10, 'Watch For. If implemented', 'help mitigate potential obstacles.'));
add('07', 'A ausência de dark patterns basta para um padrão ser considerado radiant?',
  'Não. O artigo admite padrões [[neutros]], nem enganosos nem particularmente radiantes. A orientação radiant exige [[escolhas conscientes e eticamente fundamentadas]] que considerem autonomia, competência e vínculo, preservando o bem-estar básico do jogador.',
  ['6.2 A Balance Between Deceptive and Radiant Patterns'], span(15, 'principles supporting foundational', 'merely existing as a negation of harmful practices.'));
add('08', 'Quais limitações de validação e adoção o artigo reconhece?',
  'Ainda [[não foram realizadas avaliações com jogadores]] para validar efeitos diretos no bem-estar; é difícil isolar padrões de gráficos, som e narrativa, e as percepções variam entre perfis. A [[viabilidade comercial concreta]] dos Radiant Patterns também ainda não foi demonstrada.',
  ['6.5 Study Limitations'], span(16, 'Although a refined definition', 'financial performance.'));

article('e13c3cb65c28');
add('01', 'Quais ferramentas práticas Beyond Dark Patterns in Games oferece para operacionalizar Radiant Patterns?',
  'Um [[léxico refinado]], um [[modelo de níveis e variantes]] e um [[template de documentação]]. O artigo também propõe a estrutura de um catálogo colaborativo com modelo de governança para crescimento futuro.',
  ['Abstract'], span(1, 'We provide three practical tools:', 'future community growth.'));
add('02', 'Quais foram as três fases e o perfil geral de participação da metodologia?',
  'Um processo qualitativo com [[workshop colaborativo, sessões de refinamento e autoetnografia exploratória]]. Nove participantes com experiência acadêmica e/ou profissional em jogos participaram no total. A seleção priorizou [[teste da lógica por especialistas]], não validação em larga escala.',
  ['3 Methodology'], span(5, 'To develop a refined', 'researcher diaries and memos.'), span(5, 'Nine participants', 'was technically sound.'));
add('03', 'Qual foi o papel da autoetnografia exploratória na terceira fase?',
  'Usou a [[experiência de jogo dos pesquisadores como dados]] para identificar configurações de Radiant Patterns e casos de fronteira. A seleção exigia ao menos dez horas de jogo ou conclusão narrativa, como [[amostragem direcionada]], não auditoria exaustiva de cada jogo.',
  ['3.3 Phase III: Exploratory Autoethnography'], span(7, 'In Phase III, we applied', 'rather than an exhaustive audit of entire game.'));
add('04', 'Como se diferenciam os níveis L1, L2 e L3 no framework refinado?',
  '[[L1]] estabelece o piso ético de não frustração; [[L2 e L3]] ampliam progressivamente a satisfação das necessidades. Em Open Gate, o exemplo é L1: salvamento automático; L2: parada intencional; L3: feedback visual que reforça a conquista.',
  ['4.2 Refined RPs Framework Established a Shared Lexicon'], span(11, 'Following progressive scaling', 'visual feedback reinforcing achievement).'));
add('05', 'Qual é a diferença entre invariantes e variantes no framework?',
  '[[Invariantes]] são propriedades essenciais que precisam permanecer em todos os níveis e adaptações para preservar a identidade do padrão. [[Variantes]] são adaptações contextuais entre gêneros, plataformas ou sistemas que mantêm essas propriedades.',
  ['Table 3. Final Structural Template for Radiant Game Design Patterns (RPs)'], span(12, 'RP Invariants', 'while preserving invariants.'));
add('06', 'Quais quatro regras pragmáticas orientam o template refinado?',
  '[[Separar objetivos do desenvolvedor dos problemas do jogador]]; explicitar atores e contexto; preservar a identidade pela relação [[invariante–variante]]; e mapear soluções aos níveis L1–L3 para tornar [[rastreável o apoio às necessidades psicológicas]].',
  ['An Updated Radiant Pattern Framework'], span(11, 'To ensure scalability', 'radiance through structural criteria.'));
add('07', 'Por que uma observação autoetnográfica não basta para confirmar um novo Radiant Pattern?',
  'Porque a identificação exige [[recorrência]], discussão e coerência com o framework. Uma instância isolada ou uma amostra de dez horas pode ser insuficiente; a observação por especialistas pode produzir [[falsos positivos]]. Por isso, o artigo trata novas ideias como candidatas para verificação colaborativa.',
  ['6 Discussion: Radiant Patterns and Industry Practice'], span(15, 'Besides, identifying these new mechanics', 'observed, analyzed, and discussed collectively.'));
add('08', 'Quais limites do framework o artigo reconhece ao apresentar suas conclusões?',
  'Faltam [[dados longitudinais]]; a amostra é pequena e centrada em especialistas; e o escopo não cobre questões sistêmicas como condições de trabalho e toxicidade online. A verificação na indústria e a avaliação do [[impacto de longo prazo]] permanecem trabalho futuro.',
  ['7 Final Remarks'], span(16, 'While this version lacks', 'future industry-led verification.'), span(16, 'Future work focuses', 'finalized\nstandards.'));

article('d4b0c4f9d75f');
add('01', 'Qual é a ideia central de Safety by Design no documento de maio de 2019?',
  'Incorporar [[direitos e segurança dos usuários]] ao design e à funcionalidade de produtos e serviços desde o desenvolvimento. A segurança constitui um [[terceiro pilar]], ao lado de privacidade e segurança da informação, e um imperativo de design do produto.',
  ['Summary'], span(37, 'At its core, SbD', 'Safety is a\n\nproduct design imperative.'));
add('02', 'Como o relatório descreve a consulta utilizada para desenvolver o framework?',
  'Uma consulta iniciada em junho de 2018 com [[indústria e organizações relacionadas, pais e cuidadores, e jovens de 14 a 17 anos]]. O objetivo era formular princípios significativos, práticos e alcançáveis, considerando pessoas que necessitam de proteção especial.',
  ['IV. Consultation process'], span(12, 'In June 2018', 'as well as parents and carers.'));
add('03', 'Qual foi a participação de pais e jovens na consulta descrita?',
  'O relatório registra pesquisa com [[3.520 pais e responsáveis]] por crianças de 2 a 17 anos, em julho e agosto de 2018. Depois, houve um [[fórum online estruturado de cinco dias com 123 jovens]], de 14 a 17 anos.',
  ['IV. Consultation process', 'Parents and guardians', 'Young people'], span(12, 'In July and August 2018', '(n=476).'), span(13, 'Following the findings', 'young people aged 14 to 17.'));
add('04', 'Quais são os três princípios gerais de Safety by Design no relatório?',
  '[[Responsabilidades do prestador do serviço]], [[empoderamento e autonomia do usuário]] e [[transparência e prestação de contas]]. Eles organizam orientações para considerar segurança no design, desenvolvimento e disponibilização dos serviços.',
  ['V. Safety by Design Principles'], span(22, 'Principle 1:', 'responsibilities'), span(30, 'Principle 2:', 'autonomy'), span(34, 'Principle 3:', 'accountability'), span(21, 'The principles set out', 'service. While voluntary,'));
add('05', 'Que responsabilidade do prestador o primeiro princípio enfatiza?',
  'Embora a segurança seja compartilhada, o ônus [[não deve recair apenas no usuário final]]. Nenhum serviço garante segurança completa, mas os danos conhecidos e previstos devem ser [[avaliados no design e na oferta do serviço]].',
  ['Principle 1: Service provider responsibilities'], span(22, 'This principle is based', 'provision of a service.'));
add('06', 'Como o princípio 2 relaciona configurações padrão e autonomia?',
  'O relatório defende funções que permitam ao usuário controlar sua experiência e recomenda [[configurações de privacidade e segurança no nível mais alto por padrão]], já no cadastro. Ressalta que muitos usuários mantêm as configurações iniciais.',
  ['Principle 2: User empowerment and autonomy', 'Principle 2.1'], span(30, 'Features and functionality', 'configured at on registration'));
add('07', 'Que retorno aos usuários o subprincípio 2.4 recomenda no tratamento de denúncias?',
  '[[Funções de suporte e ciclos de feedback]] que informem o estado das denúncias e os resultados das medidas adotadas, com [[oportunidade de recurso]]. A resposta deve também orientar para outras fontes de apoio, reconhecendo o bem-estar e as vulnerabilidades de quem denuncia.',
  ['Principle 2.4'], span(33, 'Principle 2.4:', 'feeling exposed or visible.'));
add('08', 'Qual cautela o relatório estabelece sobre a adoção dos princípios e as notas de boas práticas?',
  'A adoção dos princípios é [[voluntária]]. As notas de boas práticas são [[ilustrações orientadoras]]: o relatório afirma que não há evidência robusta sobre sua efetividade e seu impacto, portanto não devem ser tratadas como intervenções de eficácia comprovada.',
  ['V. Safety by Design Principles'], span(21, 'service. While voluntary,', 'products and services.'), span(21, 'Good practice notes', 'illustrations only, and act as a guide.'));
save();
