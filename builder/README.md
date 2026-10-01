# Atelier 本地页面工作室

以组件搭建为主、AI 辅助的移动端 Web demo 编辑器。米色工作台与 demo 主题相互独立。

## 启动

需要 Node.js 24 和 npm。仓库中旧的 `.runtime/node-v20` 不适用于此编辑器。

```powershell
cd builder
npm ci
npm run dev
```

打开 http://127.0.0.1:5173 。也可以双击 `start-builder.bat`；关闭终端会停止服务。

## 使用

1. 左侧选择组件或页面。选中布局容器后插入组件，会添加为该容器的子组件。
2. 在画布或图层中选择组件，用右侧面板修改内容、布局、样式和动作。
3. 切换「预览」体验跳转、完成任务、习惯打卡、表单校验、提示及弹窗。交互为内存模拟，刷新会重置。
4. 点击「保存」写入本地 SQLite。浏览器会缓存当前草稿，撤销/重做记录保留在当前会话。
5. 点击「导出源码」下载独立 React + TypeScript + Vite 项目 ZIP。解压后运行 `npm install`、`npm run dev`。

第一版包含 22 种组件、三个主题及首页/列表/详情/创建/设置五页模板。默认采用暖米色纸感与陶土色重点，另有北欧清简和夜间主题。源码导出后可继续开发，不支持将外部代码修改同步回编辑器。

## AI

点击顶部「模型设置」配置 **OpenAI-compatible Chat Completions** 服务的 Base URL、模型名称与 API Key。Base URL 通常以 `/v1` 结尾，服务端追加 `/chat/completions`。原生 Anthropic Messages 接口不直接适用，需要兼容网关。

AI 可以生成全项目草稿，或在选定范围内润色。草稿经过结构校验，先预览，再应用；应用可撤销。没有配置模型时，组件编辑、保存和导出仍可使用。

生成请求会把页面结构、内容及提示词发送到你配置的服务。API Key 单独保存在 `data/config.json`，不会放进项目、浏览器缓存或导出 ZIP。该配置文件是本地文件存储，不是系统密钥保险库。

## 数据与实现

- `shared/types.ts`：页面、组件、动作契约。
- `shared/model.ts`：组件默认值、五页模板、校验与树操作。
- `src/App.tsx`：编辑工作台。
- `src/Renderer.tsx`、`runtime.css`：编辑预览和导出共用的运行时。
- `server/app.ts`：Fastify API、SQLite、模型调用及导出。
- `shared/export.ts`：生成独立源码项目 ZIP。
- `data/projects.sqlite`：本地项目与保存修订；`data/` 已忽略，不纳入版本库。

本地 API 监听 `127.0.0.1:4310`。开发服务器将 `/api` 转发到此端口。当前不提供多人协作、任意脚本执行、真实业务 API 连接或源码反向导入。

## 验证与生产运行

```powershell
npm test
npm run build
npm start
```

构建后 `npm start` 在 http://127.0.0.1:4310 同时提供编辑器和 API。
