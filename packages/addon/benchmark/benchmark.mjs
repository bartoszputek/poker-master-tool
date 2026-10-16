/* eslint-disable no-console */
// Benchmarks the native calculator with tinybench.
// Usage: node tests/benchmark.mjs [timePerTaskMs=2000] [minIterations=64]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Bench, hrtimeNowTimestampProvider } from 'tinybench';
import addon from '../index.js';

const [time = 2000, iterations = 64] = process.argv.slice(2).map(Number);

function scenarios() {
  const result = [];
  const players = [];

  for (let i = 0; i < 9; i += 1) {
    players.push([i + 1, i + 11]);
    result.push({ players: players.slice(), community: [], death: [] });
  }

  const community = [];
  for (let i = 0; i < 5; i += 1) {
    community.push(i + 20);
    result.push({ players, community: community.slice(), death: [] });
  }

  const death = [];
  for (let i = 0; i < 5; i += 1) {
    death.push(i + 20);
    result.push({ players, community: [], death: death.slice() });
  }

  return result;
}

await addon.initLookUpTable();

const bench = new Bench({ name: 'calculator', time, iterations, timestampProvider: hrtimeNowTimestampProvider, throws: true });

for (const { players, community, death } of scenarios()) {
  bench.add(
    `${players.length} players, ${community.length} communityCards, ${death.length} deathCards`,
    () => addon.calculate(players, community, death),
  );
}

await bench.run();

const fmt = (ms) => ms.toFixed(3);
const rows = bench.tasks.map(({ name, result }) => {
  const { latency, throughput } = result;
  return {
    scenario: name,
    samples: latency.samplesCount,
    'mean ms': fmt(latency.mean),
    'p50 ms': fmt(latency.p50),
    'p99 ms': fmt(latency.p99),
    'min ms': fmt(latency.min),
    'max ms': fmt(latency.max),
    'rme %': latency.rme.toFixed(2),
    'ops/s': throughput.mean.toFixed(1),
  };
});

console.table(rows);

const outDir = path.join(import.meta.dirname, 'results');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const env = `node ${process.version}, ${os.cpus()[0].model}, ${os.platform()} ${os.release()}, tinybench time=${time}ms minIterations=${iterations}`;
const headers = Object.keys(rows[0]);
const md = [
  `# tinybench ${stamp}`,
  '',
  env,
  '',
  `| ${headers.join(' | ')} |`,
  `|${headers.map(() => '---').join('|')}|`,
  ...rows.map((r) => `| ${headers.map((h) => r[h]).join(' | ')} |`),
  '',
].join('\n');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, `tinybench-${stamp}.md`), md);
fs.writeFileSync(path.join(outDir, `tinybench-${stamp}.json`), JSON.stringify({ env, rows }, null, 2));
console.log(`results: ${path.join(outDir, `tinybench-${stamp}.md`)}`);
