import { useFetch, useForceUpdate } from 'hooks';
import { Divider } from 'antd';

import Header from './Header';
import Main from './Main';
import Footer from './Footer';

import { BaseInfo, _getSchoolDetail } from './_api';

function Information() {
  const [ignore, forceUpdate] = useForceUpdate();

  const { data }: { data: BaseInfo } = useFetch({
    request: _getSchoolDetail,
    depends: [ignore],
  });

  return (
    <>
      <Header baseInfo={data} changStatusCallback={forceUpdate} updateBaseInfoCallback={forceUpdate}></Header>
      <Divider />
      <Main baseInfo={data}></Main>
      <Divider />
      <Footer baseInfo={data}></Footer>
    </>
  );
}

export default Information;
