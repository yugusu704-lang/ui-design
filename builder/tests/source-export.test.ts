import {test} from 'node:test';
import assert from 'node:assert/strict';
import {exportProject} from '../shared/export.ts';
import {seedProject} from '../shared/model.ts';
test('export creates a portable React project and excludes editor credentials',async()=>{
  const zip=await exportProject(seedProject);
  assert.equal(Buffer.from(zip).readUInt32LE(0),0x04034b50);
  const body=Buffer.from(zip).toString('utf8');
  for(const name of ['package.json','src/Renderer.tsx','src/ExtendedNode.tsx','src/useCanvasDrag.ts','shared/position.ts','shared/motion.ts','src/runtime.css','src/project.json','src/main.tsx','OPEN_SOURCE.md'])assert.ok(body.includes(name),name);
  assert.ok(!body.includes('apiKey'));
});
