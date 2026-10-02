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
test('export includes portable canvas helpers and removes inherited lock metadata from project data',async()=>{
  const project=structuredClone(seedProject);
  project.pages[0]!.nodes[0]!.props.editorLocked=true;
  const zip=Buffer.from(await exportProject(project));
  const names:string[]=[];
  let offset=0;
  let exportedProject='';
  while(offset+30<=zip.length&&zip.readUInt32LE(offset)===0x04034b50){
    const nameLength=zip.readUInt16LE(offset+26);
    const extraLength=zip.readUInt16LE(offset+28);
    const size=zip.readUInt32LE(offset+18);
    const name=zip.toString('utf8',offset+30,offset+30+nameLength);
    const dataStart=offset+30+nameLength+extraLength;
    names.push(name);
    if(name==='src/project.json')exportedProject=zip.toString('utf8',dataStart,dataStart+size);
    offset=dataStart+size;
  }
  assert.ok(names.includes('shared/layout.ts'));
  assert.ok(names.includes('src/useCanvasDrag.ts'));
  assert.ok(exportedProject);
  assert.equal(exportedProject.includes('editorLocked'),false);
});
