import type { Project } from './types.ts';
import {readFile} from 'node:fs/promises';
import {validateProject} from './model.ts';
const table=Array.from({length:256},(_,i)=>{let c=i;for(let j=0;j<8;j++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc32(data:Buffer){let c=0xffffffff;for(const b of data)c=table[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
export function zipFiles(files:Record<string,string>):Uint8Array {
  const local:Buffer[]=[]; const central:Buffer[]=[];let offset=0;
  for(const [name,text]of Object.entries(files)){
    const filename=Buffer.from(name); const data=Buffer.from(text); const crc=crc32(data); const header=Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt32LE(crc,14);header.writeUInt32LE(data.length,18);header.writeUInt32LE(data.length,22);header.writeUInt16LE(filename.length,26);
    local.push(header,filename,data);
    const entry=Buffer.alloc(46);entry.writeUInt32LE(0x02014b50);entry.writeUInt16LE(20,4);entry.writeUInt16LE(20,6);entry.writeUInt16LE(0x800,8);entry.writeUInt32LE(crc,16);entry.writeUInt32LE(data.length,20);entry.writeUInt32LE(data.length,24);entry.writeUInt16LE(filename.length,28);entry.writeUInt32LE(offset,42);central.push(entry,filename);offset+=header.length+filename.length+data.length;
  }
  const directory=Buffer.concat(central);const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(central.length/2,8);end.writeUInt16LE(central.length/2,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...local,directory,end]);
}
export async function exportProject(project:Project):Promise<Uint8Array>{
  const p=validateProject(project);
  const read=(relative:string)=>readFile(new URL(relative,import.meta.url),'utf8');
  const [renderer,css,types,extended,componentsCss,motion,motionCss,position,layout,drag,credits]=await Promise.all([
    read('../src/Renderer.tsx'),read('../src/runtime.css'),read('./types.ts'),
    read('../src/ExtendedNode.tsx'),read('../src/components.css'),read('./motion.ts'),
    read('../src/motion.css'),read('./position.ts'),read('./layout.ts'),read('../src/useCanvasDrag.ts'),read('../OPEN_SOURCE.md'),
  ]);
  const portableProject=structuredClone(p);
  const stripEditorState=(nodes:Project['pages'][number]['nodes'])=>nodes.forEach(node=>{
    delete node.props.editorLocked;
    if(node.children)stripEditorState(node.children);
  });
  portableProject.pages.forEach(page=>stripEditorState(page.nodes));
  const files:Record<string,string>={
    'package.json':JSON.stringify({name:'atelier-demo',version:'1.0.0',private:true,type:'module',scripts:{dev:'vite --host 127.0.0.1',build:'tsc --noEmit && vite build',preview:'vite preview'},dependencies:{react:'^19.0.0','react-dom':'^19.0.0'},devDependencies:{vite:'^6.3.0',typescript:'^5.7.0','@types/react':'^19.0.0','@types/react-dom':'^19.0.0'}},null,2),
    'index.html':'<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Atelier Demo</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>',
    'tsconfig.json':JSON.stringify({compilerOptions:{target:'ES2022',lib:['ES2022','DOM','DOM.Iterable'],module:'ESNext',moduleResolution:'Bundler',jsx:'react-jsx',strict:true,skipLibCheck:true,esModuleInterop:true,resolveJsonModule:true,allowImportingTsExtensions:true,noEmit:true},include:['src','shared']},null,2),
    'src/Renderer.tsx':renderer,
    'src/runtime.css':[css,componentsCss,motionCss].join('\n'),
    'src/ExtendedNode.tsx':extended,
    'src/useCanvasDrag.ts':drag,
    'shared/position.ts':position,
    'shared/layout.ts':layout,
    'shared/motion.ts':motion,
    'OPEN_SOURCE.md':credits,
    'shared/types.ts':types.split('export interface ModelConfig')[0],
    'src/project.json':JSON.stringify(portableProject,null,2),
    'src/main.tsx':`import React, {useState} from 'react';\nimport {createRoot} from 'react-dom/client';\nimport {Renderer} from './Renderer';\nimport type {Project} from '../shared/types';\nimport project from './project.json';\nimport './runtime.css';\nconst data=project as Project;\nfunction App(){const [page,setPage]=useState(data.pages[0].id);return <main style={{maxWidth:430,margin:'0 auto',minHeight:'100vh'}}><Renderer project={data} pageId={page} editing={false} onNavigate={setPage}/></main>;}\ncreateRoot(document.getElementById('root')!).render(<App/>);\n`,
    'README.md':`# ${p.name}\n\n由 Atelier 本地页面工作室导出。\n\n运行环境：Node.js 22.12+ 或 24。\n\n安装并启动：\n\n\`\`\`sh\nnpm install\nnpm run dev\n\`\`\`\n\n构建：\`npm run build\`。页面数据在 src/project.json，组件在 src/Renderer.tsx，主题和样式在 src/runtime.css。\n\n此项目可脱离编辑器运行；交互使用浏览器内模拟数据，不包含真实业务 API。导出后源码修改不会同步回编辑器。\n`
  };
  return zipFiles(files);
}
