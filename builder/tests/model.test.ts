import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateProject } from '../shared/model.ts';
const project = {version:1,id:'test',name:'测试',theme:'nordic',pages:[{id:'home',name:'首页',nodes:[{id:'title',type:'text',props:{text:'Hello'},style:{}}]}]};
test('valid projects survive validation without losing user content', () => {
  assert.deepEqual(validateProject(project), project);
});
test('private model configuration cannot enter saved or exported project data', () => {
  assert.throws(() => validateProject({...project,apiKey:'private-editor-key'}));
  assert.throws(() => validateProject({...project,pages:[{...project.pages[0],apiKey:'private-key'}]}));
  assert.throws(() => validateProject({...project,pages:[{...project.pages[0],nodes:[{...project.pages[0].nodes[0],apiKey:'private-key'}]}]}));
});
test('submit can only navigate to an existing page',()=>{
  assert.throws(()=>validateProject({...project,pages:[{...project.pages[0],nodes:[{...project.pages[0].nodes[0],action:{type:'submit',target:'missing'}}]}]}));
});
test('dimension validation rejects numeric sizes outside canvas limits',()=>{
  assert.throws(()=>validateProject({...project,pages:[{...project.pages[0],nodes:[{...project.pages[0].nodes[0],style:{width:23}}]}]}));
  assert.throws(()=>validateProject({...project,pages:[{...project.pages[0],nodes:[{...project.pages[0].nodes[0],style:{height:2001}}]}]}));
});
test('editor locks are boolean and legacy width presets remain byte-for-byte intact',()=>{
  assert.throws(()=>validateProject({...project,pages:[{...project.pages[0],nodes:[{...project.pages[0].nodes[0],props:{editorLocked:'true'}}]}]}));
  const locked={...project,pages:[{...project.pages[0],nodes:[{...project.pages[0].nodes[0],props:{editorLocked:true},style:{width:'fit-content'}}]}]};
  assert.deepEqual(validateProject(locked),locked);
});
test('numeric canvas dimensions accept only the authored flex settings',()=>{
  const sized={...project,pages:[{...project.pages[0],nodes:[{...project.pages[0].nodes[0],style:{width:120,flexShrink:0,flexBasis:'auto'}}]}]};
  assert.deepEqual(validateProject(sized),sized);
  assert.throws(()=>validateProject({...project,pages:[{...project.pages[0],nodes:[{...project.pages[0].nodes[0],style:{width:120,flexShrink:2,flexBasis:'auto'}}]}]}));
  assert.throws(()=>validateProject({...project,pages:[{...project.pages[0],nodes:[{...project.pages[0].nodes[0],style:{width:120,flexShrink:0,flexBasis:'2fr'}}]}]}));
});
test('reject executable content and invalid navigation before AI drafts are applied', () => {
  assert.throws(() => validateProject({...project,pages:[{...project.pages[0],nodes:[{...project.pages[0].nodes[0],type:'script'}]}]}));
  assert.throws(() => validateProject({...project,pages:[{...project.pages[0],nodes:[{...project.pages[0].nodes[0],action:{type:'navigate',target:'missing'}}]}]}));
  assert.throws(() => validateProject({...project,pages:[{...project.pages[0],nodes:[{...project.pages[0].nodes[0],style:{background:'url(https://tracker.invalid)'}}]}]}));
});
