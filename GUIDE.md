### 1.初始化前端框架-react

```bash
npx create-react-app rainbow --template typescript
```

### 2.代码风格统一 prettier

[prettier](https://prettier.io/)

```bash
1. yarn add prettier -D
2. 配置 .prettierrc
```

### 3.Pre-commit Hook

```bash
1. yarn add pretty-quick husky -D
2. Add this to your package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "pretty-quick --staged"
    }
  }
}
```

### 4.normalize.css

```bash
1. yarn add normalize.css
2. 在根目录下引入
  import 'normalize.css';
```

### 5.支持路径绝对引用

```
在 tsconfig.ts 中添加
"baseUrl": "src",
```

### 6.引入 css 预处理器 scss

```
yarn add node-sass -D
```

### 7.css 模块化

index.module.scss

### 8.引入路由

```
yarn add react-router-dom
```

### 9.部署

Docker/docker-compose/nginx

### 10.引入 antd/webpack 可配置

antd/react-app-rewired/customize-cra/babel-plugin-import
