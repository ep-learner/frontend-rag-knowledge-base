# Webpack 核心原理与配置

## 核心知识点

### Webpack 概述

Webpack 是一个静态模块打包工具，它将现代 JavaScript 应用程序所需的各种资源（JS、CSS、图片等）打包成静态文件。

### Webpack 核心概念

1. **Entry**：入口起点，告诉 Webpack 从哪里开始打包
2. **Output**：输出配置，告诉 Webpack 打包后的文件输出到哪里
3. **Loader**：转换器，将非 JavaScript 文件转换为模块
4. **Plugin**：插件，扩展 Webpack 的功能
5. **Mode**：模式，development 或 production

### 工作原理

Webpack 的工作流程：
1. 解析配置文件
2. 从 Entry 开始构建依赖图
3. 遍历依赖图，应用 Loader 转换文件
4. 应用 Plugin 处理打包结果
5. 输出打包后的文件

## 代码示例

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: true
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    runtimeChunk: 'single'
  },
  devServer: {
    static: './dist',
    port: 3000,
    hot: true,
    open: true
  }
};
```

## 常见问题

### Q: Loader 和 Plugin 的区别是什么？

A: Loader 用于转换特定类型的文件，Plugin 用于扩展 Webpack 的功能。

### Q: 什么是 Tree Shaking？

A: Tree Shaking 是一种优化技术，移除未使用的代码。

## 参考链接

- [Webpack 官方文档](https://webpack.js.org/)
