# useAuth

> 判断权限是否存在

## API

```js
const isShowAccountInfo = useAuth('student/studentInfo:AccountInfo');
```

### Params

| 参数   | 说明                  | 类型   |
| ------ | --------------------- | ------ |
| authId | 必传值，传入权限 code | string |

### Result

| 参数        | 说明         | 类型    |
| ----------- | ------------ | ------- |
| isExistence | 权限是否存在 | boolean |
