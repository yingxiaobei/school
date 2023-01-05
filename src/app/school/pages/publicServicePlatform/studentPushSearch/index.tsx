import { useState } from 'react';
import { Auth, _get } from 'utils';
import { _getBaseInfo, _getTreeData } from 'api';
import StudentPush from '../../pushManagement/studentPushRecord/index';
import { SuperviseTree } from 'components';

export default function StudentSearch() {
  const [customSchoolId, setCustomSchoolId] = useState(String(Auth.get('schoolId')));

  return (
    <div style={{ display: 'flex' }}>
      <SuperviseTree
        callback={(id: string) => {
          setCustomSchoolId(id);
        }}
        height={480}
        width={300}
      />
      <StudentPush
        customSchoolId={customSchoolId}
        detailAuthId="publicServicePlatform/studentPushSearch:btn1"
        type="studentPushSearch"
        menuId="publicServicePlatform/studentPushSearch"
      />
    </div>
  );
}
