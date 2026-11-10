// Second semantic review recording after the author corrected only Agenda 19/48.
import fs from 'node:fs/promises';
import { cardDigest, digest } from '../../../scripts/validate-cards.mjs';

const read = async file => JSON.parse((await fs.readFile(file, 'utf8')).replace(/^\uFEFF/, ''));
const history = await read('data/reviews/expansion/history-agenda-hci.json');
let finalVersion;
try { finalVersion = await read('data/reviews/expansion/recheck-agenda-hci.json'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const inventory = await read('data/extracted/inventory.json');
const audit = await read('data/reviews/expansion/audit-agenda-hci.json');
if (audit.failures.length) throw Error('Falha na auditoria das fontes originais.');
for (const entry of inventory) {
  if (digest(await fs.readFile(`artigos/${entry.file}`)) !== entry.sha256 || audit.sourceHashes[entry.articleId] !== entry.sha256) throw Error(`Fonte mudou: ${entry.articleId}`);
}
const corrected = {
  'article-d0d500126a80-19': {
    field: 'answer',
    reason: 'Segunda rodada: “grinding que explore o jogador” traduz inequivocamente exploitative grinding da página física 6. A resposta conserva esforço/recompensa, escolha informada versus urgência e a ausência de teste de eficácia; ID e evidência integral permaneceram idênticos.',
  },
  'article-d0d500126a80-48': {
    field: 'question',
    reason: 'Segunda rodada: a pergunta agora trata da indicação etária exibida e informada clara/acessivelmente nos termos dos fornecedores que hospedam conteúdo de terceiros, preservando o alcance específico do §12 local (p4) e §§5–6 (p2). A comparação com agência contextual da Agenda p9 não amplia a obrigação aos termos inteiros, não afirma vigência nem eficácia.',
  },
};
let unchanged = 0;
const allDecisions = [];
for (const articleId of ['article-d0d500126a80', 'article-e13c3cb65c28']) {
  const cards = await read(`data/candidates/expansion/${articleId}.json`);
  const decisions = await read(`data/reviews/expansion/review-${articleId}.json`);
  for (const decision of decisions) {
    const card = cards.find(item => item.id === decision.cardId);
    if (!card) throw Error(`Candidato ausente: ${decision.cardId}`);
    if (finalVersion && finalVersion.currentCandidateHashes[card.id] !== cardDigest(card)) throw Error(`Versão mudou após a revisão final; exige nova avaliação semântica: ${card.id}`);
    const correction = corrected[card.id];
    if (correction) {
      const old = history.find(item => item.cardId === card.id);
      if (!old || old.status !== 'revision_required' || old.cardSha256 !== cardDigest(old.candidateSnapshot)) throw Error('Histórico original inconsistente.');
      const expected = { ...old.candidateSnapshot, [correction.field]: card[correction.field] };
      if (cardDigest(expected) !== cardDigest(card) || old.cardSha256 === cardDigest(card)) throw Error(`Alteração inesperada ou ausente: ${card.id}`);
      decision.status = 'approved';
      decision.reason = correction.reason;
      decision.round = 2;
      decision.cardSha256 = cardDigest(card);
      decision.reviewedAt = new Date().toISOString();
      delete decision.requiredChanges;
    } else {
      if (decision.status !== 'approved' || decision.cardSha256 !== cardDigest(card)) throw Error(`Aprovação dos demais candidatos ficou desatualizada: ${card.id}`);
      unchanged++;
    }
    if (decision.sourceSha256 !== audit.sourceHashes[card.articleId]) throw Error('Hash da fonte principal divergente.');
    for (const ref of card.relatedSources ?? []) if (decision.relatedSourceSha256?.[ref.articleId] !== audit.sourceHashes[ref.articleId]) throw Error('Hash de fonte relacionada divergente.');
  }
  await fs.writeFile(`data/reviews/expansion/review-${articleId}.json`, JSON.stringify(decisions, null, 2) + '\n', 'utf8');
  allDecisions.push(...decisions);
}
await fs.writeFile('data/reviews/expansion/recheck-agenda-hci.json', JSON.stringify({
  reviewer: 'review_agenda_hci', semanticSecondRound: Object.keys(corrected),
  unchangedApprovalsVerified: unchanged, approvedCount: allDecisions.filter(item => item.status === 'approved').length,
  currentCandidateHashes: Object.fromEntries(allDecisions.map(item => [item.cardId, item.cardSha256])),
  sourceHashes: audit.sourceHashes, historyFile: 'history-agenda-hci.json',
  note: 'Semantic corrections individually rechecked against original pages; hashes/evidence audits complement this judgment. No publication by this shard reviewer.',
}, null, 2) + '\n', 'utf8');
console.log(`${allDecisions.length} aprovados atuais: 2 correções revisadas, ${unchanged} aprovações anteriores idênticas; originais preservados. Nenhuma publicação.`);
