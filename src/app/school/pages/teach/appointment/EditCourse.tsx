// 编辑课程

import NetworkInfo from './components/NetworkInfo';
import EditCourseTable from '../components/EditCourseTable';

export default function EditCourse(props: any) {
  const { networkInfo, _switchEditCourseVisible, courseList, selectedDate } = props;

  return (
    <EditCourseTable
      _switchEditCourseVisible={_switchEditCourseVisible}
      courseList={courseList}
      selectedDate={selectedDate}
    >
      <NetworkInfo networkInfo={networkInfo} />
    </EditCourseTable>
  );
}
