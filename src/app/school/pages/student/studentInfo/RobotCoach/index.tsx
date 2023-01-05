import { Row } from 'antd';
import { useFetch, useOptions } from 'hooks';
import { useState } from 'react';
import LineTableTemplate from './LineTableTemplate';
import { _getMockExam, _geIndividualTraining, _geIndividualTrainingDetail } from './_api';

interface Props {
  userId?: string;
}

export type MockList = {
  examTime: string; // 训练日期
  examRate: string; // 单项项目通过率
};

export type Single = {
  itemType: string;
  singleRate: string;
  singleThrowNum: string;
  singleAllNum: number;
};

export type SingleDetail = {
  itemType: string; // 训考类型
  singlelRate: number; // 单项项目通过率
  trainTime: string; // 训练日期
};

export type ShowData = {
  // individualTrain(单项)
  throughNum: number; // 通过次数
  trainAllNum: number; // 项目练习总次数
  singleTermVo: Single[];
  // mockExam（模拟）
  examAll: number; // 模拟考试总次数
  examThrough: number; // 通过次数
  throughRateVo: MockList[];
  // common	（通用）
  throughRate: number; // 通过率
};

function RobotCoach({ userId }: Props) {
  const robotOptions = useOptions('robot_test_item_type');
  const [single, setSingleList] = useState<SingleDetail[]>([]);
  const [singleType, setSingleType] = useState('');
  const { data: individualTrainingList }: { data: Partial<ShowData> } = useFetch({
    request: _geIndividualTraining,
    query: {
      userId: userId,
    },
    depends: [userId],
    forceCancel: !userId,
  });

  const { data: mockExamList }: { data: Partial<ShowData> } = useFetch({
    request: _getMockExam,
    query: {
      userId: userId,
    },
    depends: [userId],
    forceCancel: !userId,
  });

  const getData = (itemType: string) => {
    setSingleType(itemType);
    if (itemType === '') {
      setSingleList([]);
    } else {
      _geIndividualTrainingDetail({ userId: userId as string, itemType })
        .then((data) => {
          setSingleList(data?.data);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  return (
    <Row style={{ justifyContent: 'space-around' }}>
      <LineTableTemplate
        data={individualTrainingList || []}
        singleList={single || []}
        title={'单项训练'}
        colSpan={11}
        // todo: 可控
        selectProject={getData}
        robotOptions={robotOptions}
        singleType={singleType}
      />
      <LineTableTemplate data={mockExamList || []} title={'模拟考试'} colSpan={11} singleList={[]} />
    </Row>
  );
}

export default RobotCoach;
