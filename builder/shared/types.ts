export type ComponentType = 'stack'|'row'|'grid'|'card'|'divider'|'text'|'image'|'avatar'|'badge'|'button'|'input'|'textarea'|'checkbox'|'switch'|'select'|'progress'|'stat'|'task'|'habit'|'navbar'|'tabs'|'empty';
export interface Action { type: 'navigate'|'toast'|'toggle'|'submit'|'dialog'; target?: string; message?: string }
export interface BuilderNode { id:string; type:ComponentType; props:Record<string,string|number|boolean>; style:Record<string,string|number>; children?:BuilderNode[]; action?:Action }
export interface Page { id:string; name:string; nodes:BuilderNode[] }
export interface Project { version:1; id:string; name:string; theme:'nordic'|'editorial'|'dark'; pages:Page[] }
export interface ModelConfig { baseUrl:string; model:string; apiKey?:string }
export interface DraftRequest { project:Project; prompt:string; selectedNodeId?:string; pageId?:string }
