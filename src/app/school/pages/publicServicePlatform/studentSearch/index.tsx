import { useState } from 'react';
import { Auth, _get } from 'utils';
import { _getBaseInfo, _getTreeData } from 'api';
import StudentInfo from '../../student/studentInfo/index';
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
        width={'15%'}
      />
      <div style={{ width: '85%' }}>
        <StudentInfo
          customSchoolId={customSchoolId}
          detailAuthId="publicServicePlatform/studentSearch:btn1"
          type="studentSearch"
        />
      </div>
    </div>
  );
}
