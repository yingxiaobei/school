// 编辑课程

import CoachInfo from './components/CoachInfo';
import EditCourseTable from '../components/EditCourseTable';

export default function EditCourse(props: any) {
  const { coachInfo, _switchEditCourseVisible, courseList, selectedDate } = props;

  return (
    <EditCourseTable
      _switchEditCourseVisible={_switchEditCourseVisible}
      courseList={courseList}
      selectedDate={selectedDate}
    >
      <CoachInfo coachInfo={coachInfo} />
    </EditCourseTable>
  );
}
