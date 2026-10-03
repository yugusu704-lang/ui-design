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
2. 在画布中直接拖动组件调整位置；触屏先点选，再拖动。右侧「位置与样式」可输入 X/Y 偏移或复位。位移保留原布局空间，图层的上下排序按钮用于改变排列顺序。
3. 切换「预览」体验跳转、完成任务、习惯打卡、表单校验、提示及弹窗。交互为内存模拟，刷新会重置。
4. 点击「保存」写入本地 SQLite。浏览器会缓存当前草稿，撤销/重做记录保留在当前会话。
5. 点击「导出源码」下载独立 React + TypeScript + Vite 项目 ZIP。解压后运行 `npm install`、`npm run dev`。

画布顶部可选择紧凑（360 × 800）、标准（390 × 844）或大屏（430 × 932）手机视口，尺寸单位为 CSS 像素，不含外框边框。「适应窗口」会等比缩小显示，页面宽高保持不变；「原尺寸 1:1」按 100% 显示，可在画布中滚动查看。页面内容仍可在手机内部独立滚动。

组件库提供分类筛选和搜索，包含布局、内容、表单、导航、反馈和业务组合。选中容器时添加到容器；选中普通组件时添加到其后；取消选中后添加到页面末尾。添加后会自动滚动到组件。

右侧「动效」可选择淡入、位移、缩放、弹跳、翻转和强调等预设，配置时长、延迟、进入或悬停触发及循环。编辑时默认静止，可单独重播；预览与导出共用效果，并尊重系统的减少动态效果偏好。

快捷键：方向键移动 1px，Shift + 方向键移动 10px；Ctrl/⌘ + D 复制组件（包含子组件），Delete 删除，Ctrl/⌘ + Z 撤销，Ctrl/⌘ + Shift + Z 或 Ctrl + Y 重做，Ctrl/⌘ + S 保存。输入框内保留文本编辑快捷键。

三个主题和首页/列表/详情/创建/设置五页模板仍可使用。源码导出后可继续开发，不支持将外部代码修改同步回编辑器。新增组件的开源参考与实现方式见 [OPEN_SOURCE.md](OPEN_SOURCE.md)。

## AI

点击顶部「模型设置」配置 **OpenAI-compatible Chat Completions** 服务的 Base URL、模型名称与 API Key。Base URL 通常以 `/v1` 结尾，服务端追加 `/chat/completions`。原生 Anthropic Messages 接口不直接适用，需要兼容网关。

AI 可以生成全项目草稿，或在选定范围内润色。草稿经过结构校验，先预览，再应用；应用可撤销。没有配置模型时，组件编辑、保存和导出仍可使用。

生成请求会把页面结构、内容及提示词发送到你配置的服务。API Key 单独保存在 `data/config.json`，不会放进项目、浏览器缓存或导出 ZIP。该配置文件是本地文件存储，不是系统密钥保险库。

## 数据与实现

- `shared/types.ts`：页面、组件、动作契约。
- `shared/model.ts`：组件默认值、五页模板、校验与树操作。
- `src/App.tsx`：编辑工作台。
- `src/Renderer.tsx`、`runtime.css`：编辑预览和导出共用的运行时。
- `src/ExtendedNode.tsx`、`components.css`：扩展的语义化组件及其交互。
- `shared/catalog.ts`：组件分类、名称、提示和开源参考。
- `shared/position.ts`、`src/useCanvasDrag.ts`：缩放/滚动坐标换算和可取消的拖拽；拖拽结束只记一次撤销。
- `shared/motion.ts`、`src/motion.css`：受限动效配置及离线运行时。
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
