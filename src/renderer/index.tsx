// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client'; // 使用 React 18 的新的 root API
import './index.css'; // 样式文件
import App from './App'; // 导入 App 组件

// 获取根节点元素
const container = document.getElementById('app');
if (!container) {
  throw new Error("根节点 'app' 未找到，请检查 HTML 文件。");
}

// 创建根节点并渲染应用
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
