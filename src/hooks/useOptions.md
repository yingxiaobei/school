# useOptions

管理枚举类型

## Example

TODO:

## API

```ts
const options = useOptions(
  category: TCategory,
  pauseRequest: boolean = false,
  parentCodeKey: string = '-1',
  excludeCode: string[] = [],
)
```

### Params

| 参数          | 说明                                                | 类型     | 默认值 |
| ------------- | --------------------------------------------------- | -------- | ------ |
| category      | 必填项，枚举类型的 key 值                           | string   | -      |
| pauseRequest  | 可选项，如果值为 true，则直接采用前端定义的枚举类型 | boolean  | false  |
| parentCodeKey | 可选项，父级 codeKey                                | string   | -1     |
| excludeCode   | 可选项，需剔除的选项                                | string[] | -      |

### Result

| 参数    | 说明         | 类型      |
| ------- | ------------ | --------- |
| options | 枚举类型列表 | IOption[] |
