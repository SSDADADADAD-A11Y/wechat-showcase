# 视觉便签 · 官网展示站

「视觉便签」微信公众号的官方展示网站 —— 一个专注**原创微信红包封面设计**的团队。

站点用 [React 19](https://react.dev) + [Vite](https://vite.dev) 构建，包含品牌介绍、作品文章、二维码关注引导，以及一个由 [DeepSeek](https://www.deepseek.com) 驱动的在线客服聊天组件和一个网页互动小游戏。

## 功能

- **单页展示**：首屏、关于、文章、小游戏入口、公众号二维码、联系方式等模块（见 `src/components/`）。
- **AI 客服**：右下角聊天组件（`ChatWidget`）通过后端 `server.cjs` 调用 DeepSeek 接口回答访客提问，并按天记录对话日志。
- **后台日志**：`/admin` 页面可凭密码查看历史聊天记录。
- **互动小游戏**：基于 `@mediapipe/tasks-vision` 的网页小游戏（`src/game/`）。

## 本地开发

```bash
npm install      # 安装依赖
npm run dev      # 启动 Vite 开发服务器（前端）
npm run start    # 启动 Express 后端（聊天 API + 后台），默认端口 3001
```

其它脚本：

```bash
npm run build    # 构建生产版本到 dist/
npm run preview  # 本地预览构建产物
npm run lint     # 运行 ESLint
```

## 配置

聊天接口的密钥等敏感配置应通过环境变量提供，不要硬编码或提交到仓库。

## 部署

仓库内已包含 [Netlify](https://www.netlify.com)（`netlify.toml`）与 [Render](https://render.com)（`render.yaml`）的部署配置。

## 技术栈

React 19 · Vite · Express · DeepSeek API · MediaPipe Tasks Vision
