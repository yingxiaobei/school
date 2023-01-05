import { memo } from 'react';
import { AuthButton } from 'components';
import { BaseInfo } from './_api';
import { _get } from 'utils';
import { useVisible } from 'hooks';
import SchoolBaseInfoEdit from './SchoolBaseInfoEdit';

interface Props {
  baseInfo: BaseInfo;
  updateBaseInfoCallback: () => void;
}

function HeaderRight({ baseInfo, updateBaseInfoCallback }: Props) {
  const [schoolBaseInfoVisible, setSchoolBaseInfoVisible] = useVisible();

  return (
    <>
      {schoolBaseInfoVisible && (
        <SchoolBaseInfoEdit
          baseInfo={baseInfo}
          switchVisible={setSchoolBaseInfoVisible}
          updateBaseInfoCallback={updateBaseInfoCallback}
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <AuthButton type="primary" authId="drivingSchools/information:btn1" onClick={setSchoolBaseInfoVisible}>
          编辑
        </AuthButton>
        {/* <div style={{ marginTop: '1rem', fontSize: '1.2rem', color: '#666', fontWeight: 700 }}>
          {_get(baseInfo, 'recordStatus', 0) === 0 ? '未备案' : '已备案'}
        </div> */}
      </div>
    </>
  );
}

export default memo(HeaderRight);
