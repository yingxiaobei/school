# useConfirm

精简的弹框工具

## Example

TODO:

## API

```js
const [_showConfirm] = useConfirm();

_showConfirm({
  title: 'title', // 选填，不填默认确定要删除这条数据吗？
  handleOk: () => {
    // todo something
  },
});
```

### Result

| 参数       | 说明                          | 类型      | 默认值                         |
| ---------- | ----------------------------- | --------- | ------------------------------ |
| title      | 可选项，弹框标题              | string    | 确定要删除这条数据吗？         |
| content    | 可选项，弹框内容              | ReactNode | -                              |
| icon       | 可选项，弹框 title 右侧图标   | ReactNode | \<ExclamationCircleOutlined /> |
| okText     | 可选项，confirm 按钮的文字    | string    | 确定                           |
| okType     | 可选项，confirm 按钮的样式    | danger    | danger                         |
| cancelText | 可选项，cancel 按钮的文字     | string    | 取消                           |
| handleOk   | 可选项，点击 confirm 执行事件 | function  | -                              |
