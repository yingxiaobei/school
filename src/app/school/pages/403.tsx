import { Result, Button } from 'antd';
import { useHistory } from 'react-router-dom';
import { PUBLIC_URL } from 'constants/env';

export default function NotFoundPage() {
  const history = useHistory();

  return (
    <Result
      status="403"
      title="403"
      subTitle="您当前访问的页面暂无权限，请联系管理员"
      extra={
        <Button type="primary" onClick={() => history.replace(`${PUBLIC_URL}home`)}>
          返回工作台
        </Button>
      }
    />
  );
}