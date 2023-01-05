import { useFetch } from 'hooks';
import { useState, useEffect } from 'react';
import { _getMenuTreeAboutExam } from '_api';

// 考试工具-学员约考信息菜单权限控制该项是否展示数据

export const useIsOpenExamInfo = () => {
  const [isOpenExamInfo, setIsOpenExamInfo] = useState(false);
  const { data: examRes } = useFetch({
    request: _getMenuTreeAboutExam,
    depends: [],
  });

  useEffect(() => {
    if (examRes) {
      const res = (examRes as any[]).some((exam) => exam.code === 'StuAppointment');
      setIsOpenExamInfo(res);
    }
    // setIsOpenExamInfo(false)
  }, [examRes]);

  return isOpenExamInfo;
};
