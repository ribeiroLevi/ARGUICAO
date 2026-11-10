import { promises as fs } from 'node:fs';
import { parse } from 'smol-toml';
const config = parse((await fs.readFile('.codex/config.toml', 'utf8')).replace(/^\uFEFF/, ''));
if (!config.agents.enabled || config.agents.max_concurrent_threads_per_session !== 3) throw Error('Concorrência inválida');
for (const file of await fs.readdir('.codex/agents')) {
  if (!file.endsWith('.toml')) continue;
  const agent = parse((await fs.readFile(`.codex/agents/${file}`, 'utf8')).replace(/^\uFEFF/, ''));
  for (const field of ['name', 'description', 'developer_instructions']) if (!agent[field]) throw Error(`${file}: ${field} ausente`);
  if (agent.model) throw Error(`${file}: não deve fixar modelo`);
  console.log(`${agent.name}: TOML válido`);
}
