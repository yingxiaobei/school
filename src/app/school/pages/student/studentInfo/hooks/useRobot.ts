import { useFetch } from 'hooks';
import { useState } from 'react';
import { Auth, _get } from 'utils';
import { _getIsOpenRobot, _getRobotCourse } from '../_api';

export const useRobot = () => {
  const [robotCourse, setRobotCourse] = useState([]);
  const [isShowRobot, setIsShowRobot] = useState(false);
  useFetch({
    request: _getIsOpenRobot,
    query: {
      id: Auth.get('schoolId'),
    },
    depends: [],
    callback(data) {
      if (_get(data, 'robotCoachTeach') === '1') {
        setIsShowRobot(true);
      }
    },
  });

  useFetch({
    request: _getRobotCourse,
    query: {
      id: Auth.get('schoolId'),
    },
    depends: [isShowRobot],
    forceCancel: !isShowRobot,
    callback(data) {
      setRobotCourse(data);
    },
  });

  return {
    isShowRobot,
    robotCourse,
  };
};
