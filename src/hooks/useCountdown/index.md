# useCountdown

> 只需关注数据的倒计时工具

## API

```js
const { isFirstCounting, count, isCounting, setIsCounting } = useCountdown(60);
```

### Params

| 参数    | 说明                            | 类型   | 默认值 |
| ------- | ------------------------------- | ------ | ------ |
| seconds | 可选项，传入倒数计时时间 单位秒 | number | 60     |

### Result

| 参数            | 说明               | 类型                         |
| --------------- | ------------------ | ---------------------------- |
| isFirstCounting | 是否是第一次倒计时 | boolean                      |
| count           | 倒计时实时时间     | number                       |
| isCounting      | 是否正在倒计时     | boolean                      |
| setIsCounting   | 设置是否开始倒计时 | function(isCounting:boolean) |
