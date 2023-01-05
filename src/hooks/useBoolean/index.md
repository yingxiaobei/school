# useBoolean

> 管理 `boolean` 值

## API

```js
const [isTruthy, { _switch, _setTruthy, _setFalsy }] = useBoolean(true);
```

### Params

| 参数         | 说明                     | 类型                 | 默认值 |
| ------------ | ------------------------ | -------------------- | ------ |
| defaultValue | 可选项，传入默认的状态值 | boolean \| undefined | false  |

### Result

| 参数    | 说明     | 类型    |
| ------- | -------- | ------- |
| state   | 状态值   | boolean |
| actions | 操作集合 | object  |

### Actions

| 参数        | 说明               | 类型                  |
| ----------- | ------------------ | --------------------- |
| \_switch    | 触发状态更改的函数 | (value?: any) => void |
| \_setTruthy | 设置状态值为 true  | () => void            |
| \_setFalsy  | 设置状态值为 false | () => void            |
