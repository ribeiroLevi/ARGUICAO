import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const articlesDir = path.join(root, 'artigos');
const outputDir = path.join(root, 'data', 'extracted');
const force = process.argv.includes('--force');
const sha256 = value => createHash('sha256').update(value).digest('hex');
const clean = value => String(value ?? '').replace(/\u0000/g, '').replace(/\r\n?/g, '\n').trim();


// Titles and author lists verified from page 1 of these exact local PDFs.
// Hash keys prevent applying editorial metadata to a changed source file.
const verifiedMetadata = {
  '47a3e64adb53f00056a1e288e56231a4c590601e8791db80a8f60e1eee972e0d': { title: 'Da Classificação Indicativa de Aplicativos e Serviços Digitais', authors: [] },
  '3aa04fd044069c1a4a3bf743ad0e11f5aca98fe74f9eea43b8ca46d7e39811ce': { title: 'Games Made Elsewhere, Harms Felt Here: A Speculative Perspective of Deceptive Design Impact from the Global South', authors: ['Ticianne Darin'] },
  '9ce53cd6b1326ce26db9170f1cf0f97ae781bc9082bbc77cdad89401b975c258': { title: 'From Understanding to Intervention: Towards an Agenda for Countering Dark Patterns in Games', authors: ['Ticianne Darin', 'Nayana Carneiro'] },
  'df646ee88d7098010e0bd9bc407a0d3380d2524ed750c22d25edbf30ee23fbf8': { title: 'Beyond Dark Patterns in Games: A Radiant Framework for Sustainable Player Well-being', authors: ['Ticianne Darin', 'Luiz Santos Filho', 'Alairton Sousa Junior', 'Lia Aires', 'Caio Nunes', 'Nayana Carneiro'] },
  'eff38c0baeaee07fef082757b11daf650f7fc455520403c51270c442161dcf84': { title: 'It’s Like a Dark Patterns Paradise: New Findings from Brazilian Mobile Apps in Light of International Research', authors: ['Levi Ribeiro', 'Lucas Melo', 'Gabriel Lima', 'Amanda Coelho', 'Ticianne Darin'] },
  '86a50bd8996143b67ac85d1ef0beb6b40b26519253f682c8a4791427f4d8be41': { title: 'Operationalizing Radiant Patterns: A Refined Definition and Pattern Structure to Mitigate Deceptive Game Design Practices', authors: ['Luiz Santos Filho', 'Ticianne Darin'] },
  '96ce6e2cdc4c67fbf58c4deb2be5049c1ba279210cae91f0a3f823971d85a0b5': { title: 'Safety by Design Overview (May 2019)', authors: [] }
};

async function walk(dir, prefix = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a,b) => a.name.localeCompare(b.name))) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path.join(dir, entry.name), relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files;
}

function firstHeading(text) {
  return clean(text.split('\n').find(line => line.trim())?.replace(/^#+\s*/, '') ?? '');
}

function pdfText(items) {
  let result = '';
  let previous;
  for (const item of items) {
    if (typeof item.str !== 'string') continue;
    if (previous && Math.abs(item.transform[5] - previous.transform[5]) > 3 && !result.endsWith('\n')) result += '\n';
    else if (result && !/\s$/.test(result) && item.str && !/^\s/.test(item.str)) result += ' ';
    result += item.str;
    if (item.hasEOL) result += '\n';
    previous = item;
  }
  return clean(result);
}

async function extract(file, bytes, articleId, hash) {
  const extension = path.extname(file).toLowerCase();
  const document = { articleId, file, sha256: hash, title: '', authors: [], pages: [], sections: [], status: 'ok', warnings: [] };
  if (extension === '.pdf') {
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const loadingTask = getDocument({ data: new Uint8Array(bytes), useSystemFonts: true, isEvalSupported: false, verbosity: 0 });
    const pdf = await loadingTask.promise;
    try {
      const metadata = await pdf.getMetadata();
      document.metadata = { title: clean(metadata.info.Title), author: clean(metadata.info.Author) };
      if (document.metadata.author) document.authors = [document.metadata.author];
      for (let page = 1; page <= pdf.numPages; page++) {
        const pdfPage = await pdf.getPage(page);
        const content = await pdfPage.getTextContent();
        document.pages.push({ page, text: pdfText(content.items) });
        pdfPage.cleanup();
      }
      const metadataTitle = document.metadata.title;
      document.title = metadataTitle && !/^(untitled|microsoft word|template|paper)$/i.test(metadataTitle) ? metadataTitle : firstHeading(document.pages[0]?.text ?? '');
      document.warnings.push('PDF extraído da camada de texto, sem OCR; a ordem de leitura em colunas, fórmulas e tabelas pode exigir conferência visual.');
      const emptyPages = document.pages.filter(page => !page.text.trim()).map(page => page.page);
      if (emptyPages.length) document.warnings.push(`Páginas sem texto extraível: ${emptyPages.join(', ')}.`);
    } finally {
      await loadingTask.destroy();
    }
  } else if (extension === '.docx') {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer: bytes });
    document.pages = [{ page: 1, text: clean(result.value) }];
    document.title = firstHeading(result.value);
    document.warnings.push('DOCX sem paginação original; page=1 representa o documento completo, não uma página impressa.');
    document.warnings.push(...result.messages.map(message => message.message));
  } else if (['.txt', '.md', '.markdown'].includes(extension)) {
    const text = clean(new TextDecoder('utf-8', { fatal: true }).decode(bytes)).replace(/^\uFEFF/, '');
    document.pages = [{ page: 1, text }];
    document.title = firstHeading(text);
    document.warnings.push('Texto sem paginação original; page=1 representa o documento completo.');
    if (extension !== '.txt') document.sections = text.split('\n').filter(line => /^#{1,6}\s/.test(line)).map(line => line.replace(/^#+\s*/, '').trim());
  } else {
    throw new Error(`Formato não suportado: ${extension || '(sem extensão)'}`);
  }
  if (!document.pages.some(page => page.text.trim())) throw new Error('Documento sem texto legível extraído; OCR não disponível.');
  if (!document.title) document.title = path.basename(file, extension);
  if (verifiedMetadata[hash]) {
    Object.assign(document, verifiedMetadata[hash]);
    document.metadataVerifiedOnPage = 1;
  }
  return document;
}

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(path.join(root, 'docs'), { recursive: true });
let files = [];
try { files = await walk(articlesDir); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const inventory = [];
for (const file of files) {
  const bytes = await fs.readFile(path.join(articlesDir, file));
  const hash = sha256(bytes);
  const articleId = `article-${sha256(file).slice(0,12)}`;
  const outputFile = `${articleId}.json`;
  let document;
  let reused = false;
  if (!force) {
    try {
      const cached = JSON.parse(await fs.readFile(path.join(outputDir, outputFile), 'utf8'));
      if (cached.file === file && cached.sha256 === hash && cached.status === 'ok') { document = cached; reused = true; }
    } catch { /* No valid cache: extract again. */ }
  }
  if (!document) {
    try { document = await extract(file, bytes, articleId, hash); }
    catch (error) { document = { articleId, file, sha256: hash, title: path.basename(file, path.extname(file)), authors: [], pages: [], sections: [], status: 'error', error: error.message, warnings: [] }; }
    await fs.writeFile(path.join(outputDir, outputFile), JSON.stringify(document, null, 2) + '\n', 'utf8');
  }
  inventory.push({ articleId, file, sha256: hash, title: document.title, status: document.status, outputFile, pageCount: document.pages.length, characterCount: document.pages.reduce((sum,page) => sum + page.text.length, 0), reused, ...(document.error ? { error: document.error } : {}) });
  console.log(`${document.status.toUpperCase()} ${file}: ${document.pages.length} páginas${reused ? ' (cache SHA-256)' : ''}`);
}
await fs.writeFile(path.join(outputDir, 'inventory.json'), JSON.stringify(inventory, null, 2) + '\n', 'utf8');
const report = ['# Relatório de extração', '', `Documentos inventariados: ${inventory.length}. Legíveis: ${inventory.filter(item => item.status === 'ok').length}. Falhas: ${inventory.filter(item => item.status === 'error').length}.`, '', '| Arquivo | Identificador | Páginas | Caracteres | Resultado |', '| --- | --- | ---: | ---: | --- |', ...inventory.map(item => `| ${item.file.replace(/\|/g,'\\|')} | ${item.articleId} | ${item.pageCount} | ${item.characterCount} | ${item.status}${item.error ? ': ' + item.error : ''} |`), '', '## Rastreabilidade e limites', '', '- Exclusivamente arquivos locais de artigos/. Nenhum conteúdo acadêmico consultado fora desses documentos.', '- Cada JSON preserva arquivo, SHA-256 do original, título identificável, autores dos metadados quando disponíveis e texto por página física (PDF, numeração iniciando em 1). Metadados podem precisar de confirmação editorial.', '- IDs derivam do caminho relativo do arquivo; o mesmo nome mantém o ID após mudança de conteúdo. Renomear um arquivo muda seu ID.', '- Cache reaproveitado somente quando arquivo e SHA-256 coincidem. Use npm run extract -- --force para reextrair. O inventário atual é a lista canônica: extrações órfãs de arquivos removidos não são fontes válidas.', '- PDFs: sem OCR. Colunas, fórmulas, hifenização, tabelas e cabeçalhos podem alterar a ordem de leitura. Páginas vazias são sinalizadas no JSON. Extração literal não substitui revisão semântica.', '- TXT/Markdown exigem UTF-8; seções Markdown são preservadas. TXT, Markdown e DOCX não conservam paginação impressa: page=1 é unidade documental.', '- DOCX usa mammoth para texto bruto; formatação e objetos incorporados não são preservados.', '- Arquivos de formato não suportado e documentos ilegíveis ficam inventariados como error; nenhum conteúdo é inventado para cobrir falhas.', '- Esta fase não produz perguntas nem aprova cartões.', ''];
report.push('## Conferências desta execução', '',
  `- Comando: npm.cmd run extract${force ? ' -- --force' : ''}. Em PowerShell com execução de scripts desabilitada, npm.cmd evita o bloqueio de npm.ps1.`,
  `- Total de páginas físicas: ${inventory.reduce((sum, item) => sum + item.pageCount, 0)}. Fontes reutilizadas após comparação SHA-256: ${inventory.filter(item => item.reused).length}.`,
  '- Títulos e autores da tabela editorial por hash foram confrontados com a página 1 dos sete PDFs originais. Art. 48 e Interact tiveram a acentuação e o apóstrofo restaurados somente nos metadados; o texto extraído por página permanece literal.',
  '- Art. 48 contém ligaturas extraídas com espaços internos (por exemplo, "Classi fi cação"). Essa segmentação deve ser preservada na evidência literal ou conferida diretamente no PDF; não representa lacuna a completar.',
  '- A legibilidade indica disponibilidade da camada de texto, não conferência visual integral de tabelas, imagens ou diagramas. Não foi executado OCR. O documento Art. 48 é tratado como arquivo local, sem verificação externa de vigência normativa.', '');
await fs.writeFile(path.join(root, 'docs', 'extraction-report.md'), report.join('\n'), 'utf8');
if (inventory.some(item => item.status === 'error')) process.exitCode = 1;

