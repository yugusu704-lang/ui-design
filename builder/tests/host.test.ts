import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildApp} from '../server/app.ts';
test('reject non-local Host even on read-only project endpoints',async()=>{
  const dataDir=await mkdtemp(join(tmpdir(),'atelier-host-'));
  const app=await buildApp({dataDir});
  try{
    assert.equal((await app.inject({url:'/api/projects',headers:{host:'attacker.example:4310'}})).statusCode,403);
    assert.equal((await app.inject({url:'/api/projects',headers:{host:'127.0.0.1:4310'}})).statusCode,200);
  }finally{await app.close();await rm(dataDir,{recursive:true,force:true});}
});
