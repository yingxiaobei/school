# 远方驾服新架构前端平台（大前端）

## 环境依赖

- node 12.x.x

## 开始

> 如果安装依赖过程中出错，可以尝试先执行 `npm cache clean`

```cmd
yarn | npm install | cnpm install // 安装依赖
yarn start | npm run start // 启动
```

### 打包流程

1. `git checkout feature/x.x.x`
1. `git pull`
1. `npm run build`
   > 打包完成后会生成 `build` 文件

### 解决冲突流程

1. `git pull feature/x.x.x`
1. `git checkout myBranch`
1. `git pull myBranch`
1. `git rebase feature/x.x.x`
1. 在 vscode 中解决冲突
1. 解决好后 `commit`
1. `git push -f`

### 调试方法

- console.log
- console.table
- debugger
- console.trace
- console.memory
- [CSS Overview Panel](https://umaar.com/dev-tips/240-css-overview-improved)
- 样式调试: document.designMode="on"
- 自定义 js 片段: Snippets
- [use-what-changed](https://github.com/simbathesailor/use-what-changed)
- [js-to-ts-converter](https://github.com/gregjacobs/js-to-ts-converter)

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`API_KEY`

`ANOTHER_API_KEY`

## Optimizations

What optimizations did you make in your code? E.g. refactors, performance improvements, accessibility

## Screenshots

![App Screenshot](https://via.placeholder.com/468x300?text=App+Screenshot+Here)

## Running Tests

To run tests, run the following command

```bash
  npm run test
```

### 配置文件使用说明

- .xx.env.production 运行 npm run build 时线上使用
- .xx.env.development 运行 npm start/yarn start 时本地使用
- public/env.js 文件配置后优先级会高于.xx.env.development 文件，用于上线后运维配置
- 如果有上下文路径，则需要修改 REACT_APP_PUBLIC_URL 和 PUBLIC_URL 两个配置项为对应上下文路径。
- 如没有上下文路径，则需要把 REACT_APP_PUBLIC_URL 和 PUBLIC_URL 两个配置项改为'/'；（如使用其他域名）

### 账号密码

- 开发环境 http://192.168.192.136:1444/school
  csjxm18057188516 | 877D72Cw
  sdysj18072795782 | LeAgF1aV
  jnjdj18606501017 | 123456
  sdysj18072795782 | LeAgF1aV

- 测试环境 https://test.welldriver.cn:1445/school
  sdjnl118606501017 | 609Vus22

- 生产环境 https://school.welldrive.cn/school
  济南三运驾驶员培训有限 jnsyj001 | 77dJP5Me

- 后台管理系统
  http://192.168.192.136:1444/sys
  admin | zgy@Admin2018

- 计时平台
  http://192.168.191.43:7002
  超管： Admin / wellcom@123
  驾校： 3305hzcs / 123456

### 相关技术

| --           | 选型              | 说明 |
| ------------ | ----------------- | ---- |
| 开发语言     | Typescript        | ---  |
| 格式规范     | prettier,eslint   | ---  |
| 构建         | webpack           | ---  |
| 包管理       | yarn              | ---  |
| 构建依赖包   | node              | ---  |
| Git hook     | lint-staged,husky | ---  |
| CSS 预处理器 | Sass              | ---  |
| web UI       | ant-design        | ---  |
| 动画         | ---               | ---  |
| 路由         | react-router-dom  | ---  |
| 应用状态管理 | ---               | ---  |
| 测试         | ---               | ---  |
| ---          | ---               | ---  |
| ---          | ---               | ---  |
| ---          | ---               | ---  |

### 代码风格

1. 命名规则: 布尔值或者返回值是布尔类型的函数，命名以 `is` `has` `should` 开头

```js
// Bad
const done = current >= goal;

// Good
const isComplete = current >= goal;
```

1. 两个函数之间需要空行隔开 | `return` 前面需要空行隔开

```js
// Bad
function _handleAdd() {}
function _handleOk() {}
return true;

// Good
function _handleAdd() {}

function _handleOk() {}

return true;
```

1. 注释 TODO:

### 原型

http://192.168.192.10/tsd-svn/tsd/jt2b/PJS-PNP20054_%E7%BB%B4%E5%B0%94%E9%A9%BE%E6%9C%8D%E6%96%B0%E6%9E%B6%E6%9E%84%E5%B9%B3%E5%8F%B0/01.%E5%BC%80%E5%8F%91%E5%BA%93/03-%E9%9C%80%E6%B1%82%E6%96%87%E6%A1%A3/html/20210311/index.html#g=1&p=%E4%BA%A7%E5%93%81%E6%A1%86%E5%9B%BE

### [js 转 ts](https://github.com/gregjacobs/js-to-ts-converter)

```bash
js-to-ts-converter src/fileName | npx js-to-ts-converter src/fileName
```

### [项目启动的问题]

[关于开发环境下 热更新出现 iframe 影响使用]（https://github.com/facebook/create-react-app/issues/11880）
[关于项目启动或者打包的时候 antd 组件的 Typescript 报错]（https://github.com/ant-design/ant-design/issues/34952）
[关于项目升级了 antd 组建之后 项目报错]

- 删除 yarn.lock
- 删除 node_modules
- 重新下载依赖项

### 上传组件

-[] 多选上传组件（主要考虑的是返回数据的格式问题）
