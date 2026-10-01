import type { Project, BuilderNode, ComponentType } from './types.ts';
export const COMPONENT_TYPES: ComponentType[] = ['stack','row','grid','card','divider','text','image','avatar','badge','button','input','textarea','checkbox','switch','select','progress','stat','task','habit','navbar','tabs','empty'];
export const STYLE_KEYS = ['color','background','fontSize','fontWeight','padding','margin','borderRadius','gap','textAlign','alignItems','justifyContent','minHeight','width','height','opacity','gridTemplateColumns','flexDirection'];
export function validateProject(value: unknown): Project {
  const p = structuredClone(value) as Project;
  const fail = (message:string):never => {throw new Error(message);};
  const str = (v:unknown,max=20000):v is string => typeof v==='string' && v.length<=max;
  if (!p || typeof p!=='object' || p.version!==1 || !str(p.id,100) || !p.id || !str(p.name,100) || !['nordic','editorial','dark'].includes(p.theme) || !Array.isArray(p.pages) || p.pages.length<1 || p.pages.length>30) fail('项目格式或页面数量无效');
  if(Object.keys(p).some(key=>!['version','id','name','theme','pages'].includes(key)))fail('项目包含不受支持的字段');
  const pageIds = new Set<string>(); const ids = new Set<string>(); let count=0;
  for(const page of p.pages){if(!page||!str(page.id,100)||!page.id||pageIds.has(page.id)||!str(page.name,100)||!Array.isArray(page.nodes)||Object.keys(page).some(key=>!['id','name','nodes'].includes(key)))fail('页面格式或编号无效');pageIds.add(page.id);}
  const walk = (nodes:BuilderNode[],depth:number) => {
    if(depth>12)fail('组件嵌套最多12层');
    for(const n of nodes){
      if(++count>1200||!n||!str(n.id,100)||!n.id||ids.has(n.id)||!COMPONENT_TYPES.includes(n.type))fail('组件类型、编号或数量无效');ids.add(n.id);
      if(Object.keys(n).some(key=>!['id','type','props','style','children','action'].includes(key)))fail('组件包含不受支持的字段');
      if(!n.props||Array.isArray(n.props)||typeof n.props!=='object'||!n.style||Array.isArray(n.style)||typeof n.style!=='object')fail('组件属性格式无效');
      for(const [key,v] of Object.entries(n.props)){
        if(key.startsWith('on')||['__proto__','constructor','prototype','dangerouslySetInnerHTML'].includes(key)||key.length>80||!['string','number','boolean'].includes(typeof v)||typeof v==='number'&&!Number.isFinite(v)||typeof v==='string'&&!str(v,key==='src'?2_000_000:20000))fail('组件属性不受支持');
        if(key==='src'&&typeof v==='string'&&v&&!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(v)&&!/^https?:\/\//.test(v))fail('图片必须为HTTP地址或本地图片');
      }
      for(const [key,v] of Object.entries(n.style))if(!STYLE_KEYS.includes(key)||!['string','number'].includes(typeof v)||typeof v==='number'&&!Number.isFinite(v)||typeof v==='string'&&(v.length>150||/url\s*\(|expression\s*\(|[<>;{}]/i.test(v)))fail('样式不受支持');
      if(n.action){
        if(Object.keys(n.action).some(key=>!['type','target','message'].includes(key))||!['navigate','toast','toggle','submit','dialog'].includes(n.action.type)||n.action.message!==undefined&&!str(n.action.message,2000)||n.action.target!==undefined&&!str(n.action.target,100))fail('动作无效');
        if(n.action.type==='navigate'&&!pageIds.has(n.action.target||'')||n.action.type==='submit'&&n.action.target!==undefined&&!pageIds.has(n.action.target))fail('跳转目标页面不存在');
      }
      if(n.children!==undefined){if(!Array.isArray(n.children)||!['stack','row','grid','card'].includes(n.type))fail('只有布局组件可包含子组件');walk(n.children,depth+1);}
    }
  }; for(const page of p.pages)walk(page.nodes,0);return p;
}
export function findNode(nodes:BuilderNode[],id:string):BuilderNode|undefined {for(const n of nodes){if(n.id===id)return n;const child=findNode(n.children||[],id);if(child)return child;}}
export function updateNode(nodes:BuilderNode[],id:string,patch:Partial<BuilderNode>):BuilderNode[]{return nodes.map(n=>n.id===id?{...n,...patch}:n.children?{...n,children:updateNode(n.children,id,patch)}:n);}
export function removeNode(nodes:BuilderNode[],id:string):BuilderNode[]{return nodes.filter(n=>n.id!==id).map(n=>n.children?{...n,children:removeNode(n.children,id)}:n);}
export function insertNode(nodes:BuilderNode[],node:BuilderNode,parentId?:string):BuilderNode[]{if(!parentId)return [...nodes,node];return nodes.map(n=>n.id===parentId?{...n,children:[...(n.children||[]),node]}:n.children?{...n,children:insertNode(n.children,node,parentId)}:n);}
export function moveNode(nodes:BuilderNode[],id:string,direction:-1|1):BuilderNode[]{const idx=nodes.findIndex(n=>n.id===id);if(idx>=0){const next=[...nodes];const target=idx+direction;if(target>=0&&target<nodes.length)[next[idx],next[target]]=[next[target],next[idx]];return next;}return nodes.map(n=>n.children?{...n,children:moveNode(n.children,id,direction)}:n);}
export function createNode(type:ComponentType):BuilderNode {
  const props:Record<string,string|number|boolean> = {
    text:'新的文本', label:'新的组件', value:'', placeholder:'请输入内容', title:'新的标题', description:'补充描述，让信息更清晰。'
  };
  const defaults:Partial<Record<ComponentType,Record<string,string|number|boolean>>> = {
    text:{text:'把今天，过得更有条理。',variant:'body'},button:{label:'继续',variant:'primary'},input:{label:'任务名称',placeholder:'想完成什么？',required:true,name:'title'},textarea:{label:'备注',placeholder:'写下更多细节',name:'notes'},image:{src:'',alt:'图片',caption:'选择本地图片'},avatar:{text:'林'},badge:{text:'进行中'},checkbox:{label:'每天提醒',checked:false},switch:{label:'开启通知',checked:true},select:{label:'优先级',options:'普通,重要,紧急',name:'priority'},progress:{value:65,label:'本周完成'},stat:{value:'12',label:'已完成任务'},task:{title:'读书 20 分钟',description:'让注意力回到自己',checked:false},habit:{title:'晨间散步',description:'连续坚持 7 天',checked:false},navbar:{title:'页面标题',back:false},tabs:{options:'全部,进行中,已完成'},empty:{title:'留一点空间给新的计划',description:'创建你的第一个任务'},stack:{},row:{},grid:{},card:{},divider:{}
  };
  return {id:crypto.randomUUID(),type,props:defaults[type]||props,style:['stack','row','grid'].includes(type)?{gap:12}:['card'].includes(type)?{padding:18}: {},...(['stack','row','grid','card'].includes(type)?{children:[]}:{})};
}
const node=(id:string,type:ComponentType,props:BuilderNode['props']={},style:BuilderNode['style']={},children?:BuilderNode[],action?:BuilderNode['action']):BuilderNode=>({id,type,props,style,...(children?{children}:{}),...(action?{action}:{})});
export const seedProject:Project={version:1,id:'first-project',name:'日日 · 任务与习惯',theme:'editorial',pages:[
  {id:'home',name:'首页',nodes:[
    node('home-head','row',{}, {justifyContent:'space-between',alignItems:'center'},[node('home-date','text',{text:'星期四 · 新的一天',variant:'eyebrow'}),node('home-avatar','avatar',{text:'林'})]),
    node('home-title','text',{text:'留心生活，\n慢慢向前。',variant:'heading'}),
    node('home-intro','text',{text:'每一个小小的完成，都值得被看见。',variant:'muted'}),
    node('home-summary','card',{}, {padding:20},[node('home-badge','badge',{text:'本周小结'}),node('home-stats','row',{}, {justifyContent:'space-between'},[node('home-stat1','stat',{value:'12',label:'完成任务'}),node('home-stat2','stat',{value:'7',label:'连续打卡'})]),node('home-progress','progress',{value:68,label:'距离本周目标'})]),
    node('home-section','row',{}, {justifyContent:'space-between',alignItems:'center'},[node('home-label','text',{text:'今日计划',variant:'subheading'}),node('home-more','button',{label:'查看全部',variant:'ghost'},{},undefined,{type:'navigate',target:'tasks'})]),
    node('home-task1','task',{title:'整理本周灵感',description:'工作 · 10:00',checked:false},{},undefined,{type:'navigate',target:'detail'}),
    node('home-task2','task',{title:'读书 20 分钟',description:'个人 · 不急，慢慢来',checked:true}),
    node('home-habit','habit',{title:'给自己一次散步',description:'每天 15 分钟 · 已坚持 7 天'}),
    node('home-create','button',{label:'＋ 添加一个小目标'},{},undefined,{type:'navigate',target:'create'}),
    node('home-bottom','row',{}, {justifyContent:'space-between'},[node('home-bottom1','button',{label:'今日',variant:'ghost'},{},undefined,{type:'navigate',target:'home'}),node('home-bottom2','button',{label:'任务',variant:'ghost'},{},undefined,{type:'navigate',target:'tasks'}),node('home-bottom3','button',{label:'设置',variant:'ghost'},{},undefined,{type:'navigate',target:'settings'})])
  ]},
  {id:'tasks',name:'任务列表',nodes:[node('tasks-nav','navbar',{title:'我的任务',back:true},{},undefined,{type:'navigate',target:'home'}),node('tasks-title','text',{text:'专注眼前的事。',variant:'heading'}),node('tasks-tabs','tabs',{options:'全部,进行中,已完成'}),node('tasks-1','task',{title:'整理本周灵感',description:'工作 · 今天 10:00'},{},undefined,{type:'navigate',target:'detail'}),node('tasks-2','task',{title:'读书 20 分钟',description:'个人 · 今天',checked:true}),node('tasks-3','task',{title:'给植物浇水',description:'生活 · 今天'}),node('tasks-new','button',{label:'＋ 创建任务'},{},undefined,{type:'navigate',target:'create'})]},
  {id:'detail',name:'任务详情',nodes:[node('detail-nav','navbar',{title:'任务详情',back:true},{},undefined,{type:'navigate',target:'tasks'}),node('detail-badge','badge',{text:'工作 · 普通优先级'}),node('detail-title','text',{text:'整理本周灵感',variant:'heading'}),node('detail-desc','text',{text:'给零散的想法找一个家。整理阅读笔记、设计参考和那些突然出现的小念头。'}),node('detail-info','card',{}, {},[node('detail-date','text',{text:'计划时间',variant:'eyebrow'}),node('detail-time','text',{text:'今天 · 上午 10:00',variant:'subheading'}),node('detail-reminder','switch',{label:'开始前提醒我',checked:true})]),node('detail-check','checkbox',{label:'标记为已完成',checked:false}),node('detail-feedback','button',{label:'记录进展'},{},undefined,{type:'dialog',message:'今天又前进了一小步。继续保持自己的节奏。'})]},
  {id:'create',name:'创建任务',nodes:[node('create-nav','navbar',{title:'新的小目标',back:true},{},undefined,{type:'navigate',target:'tasks'}),node('create-title','text',{text:'从一个小计划开始。',variant:'heading'}),node('create-desc','text',{text:'不必一下做很多，先写下最想完成的那件事。',variant:'muted'}),node('create-input','input',{name:'title',label:'任务名称',placeholder:'例如：读书 20 分钟',required:true}),node('create-notes','textarea',{name:'notes',label:'备注',placeholder:'给未来的自己一些提示'}),node('create-select','select',{name:'priority',label:'优先级',options:'普通,重要,紧急'}),node('create-remind','switch',{label:'每天提醒',checked:false}),node('create-submit','button',{label:'保存小目标'},{},undefined,{type:'submit',target:'tasks',message:'任务已创建'})]},
  {id:'settings',name:'设置',nodes:[node('settings-nav','navbar',{title:'偏好设置',back:true},{},undefined,{type:'navigate',target:'home'}),node('settings-title','text',{text:'找到自己的节奏。',variant:'heading'}),node('settings-profile','card',{}, {},[node('settings-avatar','avatar',{text:'林'}),node('settings-name','text',{text:'林予 · 认真生活的人',variant:'subheading'}),node('settings-desc','text',{text:'每一天都可以是新的开始。',variant:'muted'})]),node('settings-switch1','switch',{label:'每日提醒',checked:true}),node('settings-switch2','switch',{label:'完成时触觉反馈',checked:true}),node('settings-divider','divider'),node('settings-note','text',{text:'这是本地交互演示，设置不会发送到外部服务。',variant:'muted'}),node('settings-reset','button',{label:'了解这个 demo',variant:'secondary'},{},undefined,{type:'dialog',message:'日日是一个关于专注与习惯的小应用。由 Atelier 组件工作室搭建。'})]}
]};
