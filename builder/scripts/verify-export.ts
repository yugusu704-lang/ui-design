import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { exportProject } from '../shared/export.ts';
import { seedProject, createNode } from '../shared/model.ts';

async function main() {
  console.log('Verifying standalone export...');
  const project = structuredClone(seedProject);
  project.pages[0].nodes.push(createNode('accordion'), createNode('slider'), createNode('pricing'));
  Object.assign(project.pages[0].nodes[0].props, { editorLocked: true });
  Object.assign(project.pages[0].nodes[1].props, { offsetX: 20, offsetY: 30, animation: 'fade-in', animationDuration: 800 });

  const zip = Buffer.from(await exportProject(project));
  assert.equal(zip.readUInt32LE(0), 0x04034b50, 'Invalid zip header');

  // Use an isolated directory and only the exported dependency manifest.
  const temporaryRoot = path.resolve(tmpdir());
  const tempDir = await mkdtemp(path.join(temporaryRoot, 'atelier-export-'));

  try {
    let cursor = 0;
    const names: string[] = [];
    while (cursor + 30 <= zip.length && zip.readUInt32LE(cursor) === 0x04034b50) {
      const length = zip.readUInt32LE(cursor + 18);
      const nameLength = zip.readUInt16LE(cursor + 26);
      const extraLength = zip.readUInt16LE(cursor + 28);
      const name = zip.subarray(cursor + 30, cursor + 30 + nameLength).toString('utf8');
      const file = path.resolve(tempDir, name);
      if (!file.startsWith(tempDir + path.sep)) throw new Error('Unsafe archive path');
      const start = cursor + 30 + nameLength + extraLength;
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, zip.subarray(start, start + length));
      names.push(name);
      cursor = start + length;
    }

    // Verify exclusions
    assert.ok(!names.some(n => n.includes('.sqlite') || n.includes('data/') || n.includes('server/')), 'Export must not contain server or database files');
    const projectJson = zip.toString('utf8');
    assert.ok(!projectJson.includes('apiKey'), 'Export must exclude API credentials');
    assert.ok(!projectJson.includes('"editorLocked":true'), 'Export must strip editorLocked');

    // Verify required files
    const requiredFiles = [
      'package.json', 'index.html', 'tsconfig.json',
      'src/main.tsx', 'src/Renderer.tsx', 'src/runtime.css', 'src/project.json',
      'src/ExtendedNode.tsx', 'src/useCanvasDrag.ts',
      'shared/types.ts', 'shared/layout.ts', 'shared/position.ts', 'shared/motion.ts',
      'OPEN_SOURCE.md', 'README.md',
    ];
    for (const file of requiredFiles) {
      assert.ok(names.includes(file), `Missing expected file in export: ${file}`);
    }

    const npmCli = process.env.npm_execpath;
    assert.ok(npmCli, 'Run this verification through npm run check:export');
    console.log('Installing the exported project dependencies in isolation...');
    execFileSync(process.execPath, [npmCli, 'install', '--no-audit', '--no-fund'], { cwd: tempDir, stdio: 'inherit' });

    // Run TypeScript check using the freshly installed export dependencies.
    console.log('Running tsc --noEmit on exported project...');
    const tscCli = path.join(tempDir, 'node_modules/typescript/bin/tsc');
    execFileSync(process.execPath, [tscCli, '--noEmit'], { cwd: tempDir, stdio: 'inherit' });

    // Run Vite build
    console.log('Running vite build on exported project...');
    const viteCli = path.join(tempDir, 'node_modules/vite/bin/vite.js');
    execFileSync(process.execPath, [viteCli, 'build'], { cwd: tempDir, stdio: 'inherit' });

    console.log('Standalone export successfully passed typecheck and build!');
  } finally {
    assert.equal(path.dirname(tempDir), temporaryRoot);
    assert.ok(path.basename(tempDir).startsWith('atelier-export-'));
    await rm(tempDir, { recursive: true, force: true });
  }
}

main().catch(err => {
  console.error('Export verification failed:', err);
  process.exit(1);
});
