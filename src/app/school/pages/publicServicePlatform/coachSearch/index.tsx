import { useState } from 'react';
import { Auth, _get } from 'utils';
import { _getBaseInfo, _getTreeData } from 'api';
import CoachInfo from '../../coach/coachInfo/index';
import { SuperviseTree } from 'components';

export default function CoachSearch() {
  const [customSchoolId, setCustomSchoolId] = useState(String(Auth.get('schoolId')));

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <SuperviseTree
        callback={(id: string) => {
          console.log(id);
          setCustomSchoolId(id);
        }}
        height={480}
        width={'15%'}
      />
      <div style={{ width: '85%' }}>
        <CoachInfo
          customSchoolId={customSchoolId}
          detailAuthId="publicServicePlatform/coachSearch:btn1"
          type="coachSearch"
        />
      </div>
    </div>
  );
}
