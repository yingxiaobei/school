# useFetch

> 精简的请求管理工具

## API

```js
  // 请求数据详情
  const { data, isLoading } = useFetch({
    request: fetchDetailData,
    query: {
      id: currentId,
    },
    depends:[currentId]
    requiredFields: ['id'],
  });
```

```js
// 用来处理数据
const [accName, setAccName] = useState('');
useFetch({
  query: {
    id: schoolId,
  },
  request: _getBaseInfo,
  callback: (data) => {
    setAccName(_get(data, 'name', ''));
  },
});
```

```js
// 替代生命周期
const { data: schoolData = [] } = useFetch({
  request: _getListAssociated,
});
```

### Params

| 参数           | 说明                             | 类型                                          | 默认值   |
| -------------- | -------------------------------- | --------------------------------------------- | -------- |
| request        | 必填，promise axios 请求         | (AxiosResponse \| undefined \| void)=>Promise | -        |
| query          | 可选项，promise axios 请求参数   | object                                        | {}       |
| depends        | 可选项，依靠项                   | any[]                                         | []       |
| callback       | 可选项，回调                     | (data: any): void                             | () => {} |
| requiredFields | 可选项，请求必带参数，否则不请求 | string[]                                      | []       |
| forceCancel    | 可选项，是否取消请求             | (data: any): void                             | false    |

### Result

| 参数      | 说明                                     | 类型    |
| --------- | ---------------------------------------- | ------- |
| res       | 请求数据 status 为成功后的 response.data | any     |
| isLoading | 是否正在请求中                           | boolean |
| finished  | 请求是否完成                             | boolean |
| isError   | 是否请求错误                             | boolean |
| data      | 请求数据 res.data                        | any     |
