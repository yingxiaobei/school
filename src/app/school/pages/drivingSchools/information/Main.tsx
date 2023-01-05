import { memo } from 'react';
import { Divider } from 'antd';
import MainInfrastructure from './MainInfrastructure';
import MainAPPShowClass from './MainAPPShowClass';
import MainAPPShowLocation from './MainAPPShowLocation';
import { BaseInfo } from './_api';
import { _get } from 'utils';

interface Props {
  baseInfo: BaseInfo;
}

function Main({ baseInfo }: Props) {
  return (
    <>
      {/* 基础设施 */}
      <MainInfrastructure isInfrastructureOptions={_get(baseInfo, 'facilityInfo', {} as BaseInfo['facilityInfo'])} />
      <Divider></Divider>
      <MainAPPShowClass />
      <Divider></Divider>
      <MainAPPShowLocation />
    </>
  );
}

export default memo(Main);
