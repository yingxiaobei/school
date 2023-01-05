import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal, Tooltip } from 'antd';
import { useInfo } from 'hooks';
import { debounce, isUndefined } from 'lodash';
import { Auth, _get } from 'utils';
import { _addMessage } from '../../financial/wallet/_api';

const { warn } = Modal;

function ClassTimeRender(props: any) {
  const { cerreporttime, certproclass, data = {}, subject } = props;

  const isShowPractice = certproclass === '1' && !isUndefined(cerreporttime);

  return (
    <span className="flex direction-col" style={{ alignItems: 'start', margin: '6px 0px' }}>
      {Object.keys(data).map((x, index) => {
        if (x === 'mileage' && (subject === '1' || subject === '4')) {
          //科一科四不显示里程
          // eslint-disable-next-line array-callback-return
          return;
        }
        if (x === 'cerreporttime' && !isShowPractice) {
          //满足从业才显示从业
          // eslint-disable-next-line array-callback-return
          return;
        }
        return (
          !isUndefined(data[x]) && (
            <span key={index}>
              {classTimeMap[x]}：{Number(data[x]).toFixed(2)}
            </span>
          )
        );
      })}
    </span>
  );
}
const classTimeMap = {
  vehicletime: '实操',
  simulatortime: '模拟',
  mileage: '里程',
  classtime: '课堂',
  networktime: '网络',
  cerreporttime: '从业',
};

//学时展示组件
/**
 * 
 * status:
"0": "符合报审条件"
"1": "已递交报审"
"2": "报审通过"
"3": "审核未通过"
"5": "暂未配置大纲"
"6": "暂未开始培训"
"7": "已经开始训练"
 * @param props 
 * @returns 
 */
export function ClassTime(props: { record: any; subject: any }) {
  const { record = {}, subject = '' } = props;
  const renderValueArr = ['5', '6'];
  const firstPart = _get(record, 'firstPartDetail'); //科目一
  const secondPart = _get(record, 'secondPartDetail'); //科目二
  const thirdPart = _get(record, 'thirdPartDetail'); //科目三
  const forthPart = _get(record, 'fourthPartDetail'); //科目四

  const firstCerreporttime = _get(firstPart, 'cerreporttime'); //科一从业学时
  const secCerreporttime = _get(secondPart, 'cerreporttime'); //科二从业学时
  const thirdCerreporttime = _get(thirdPart, 'cerreporttime'); //科三从业学时
  const fourthCerreporttime = _get(forthPart, 'cerreporttime'); //科四从业学时

  const firstPartStatus = _get(record, 'firstPartStatus');
  const firstPartValue = _get(record, 'firstPartValue');
  const secondPartStatus = _get(record, 'secondPartStatus');
  const secondPartValue = _get(record, 'secondPartValue');
  const thirdPartStatus = _get(record, 'thirdPartStatus');
  const thirdPartValue = _get(record, 'thirdPartValue');
  const fourthPartStatus = _get(record, 'fourthPartStatus');
  const fourthPartValue = _get(record, 'fourthPartValue');

  // 需要参加从业资格课程   0-不需要  ； 1-需要
  const certproclass = _get(record, 'certproclass');

  if (subject === '1') {
    if (renderValueArr.includes(firstPartStatus)) {
      return <RenderValueFromInterface value={firstPartValue} />;
    }
    return (
      <ClassTimeRender
        certproclass={certproclass}
        cerreporttime={firstCerreporttime}
        data={firstPart}
        subject={subject}
      />
    );
  }
  if (subject === '4') {
    if (renderValueArr.includes(fourthPartStatus)) {
      return <RenderValueFromInterface value={fourthPartValue} />;
    }
    return (
      <ClassTimeRender
        certproclass={certproclass}
        cerreporttime={fourthCerreporttime}
        data={forthPart}
        subject={subject}
      />
    );
  }

  if (subject === '2') {
    if (renderValueArr.includes(secondPartStatus)) {
      return <RenderValueFromInterface value={secondPartValue} />;
    }
    return (
      <ClassTimeRender
        certproclass={certproclass}
        cerreporttime={secCerreporttime}
        data={secondPart}
        subject={subject}
      />
    );
  }
  if (subject === '3') {
    if (renderValueArr.includes(thirdPartStatus)) {
      return <RenderValueFromInterface value={thirdPartValue} />;
    }
    return (
      <ClassTimeRender
        certproclass={certproclass}
        cerreporttime={thirdCerreporttime}
        data={thirdPart}
        subject={subject}
      />
    );
  }
  return <div></div>;
}

export function scoreRender(sore: any, record: any, isOpenExamInfo: boolean, subject: string) {
  if (!isOpenExamInfo) {
    //若权限未开启，展示查看
    return (
      <span
        className="pointer color-primary"
        onClick={debounce(
          () => {
            _addMessage({
              sysType: '1',
              userInfo: Auth.get('schoolName') + '-' + Auth.get('operatorName'),
              mobile: Auth.get('mobilePhone') || '',
              productName: '5', //数据字典，代表“统计管理-培训项目”
              msgDesc: '学员考试成绩-点击查看',
            });

            console.log(11111);

            warn({
              title: '请联系服务工程师配置权限',
              maskClosable: false,
              okText: '确定',
              icon: <ExclamationCircleOutlined />,
            });
          },
          800,
          { leading: true },
        )}
      >
        查看
      </span>
    );
  }
  const firstPartTestDate = _get(record, 'firstPartTestDate');
  const firstPartTestCount = _get(record, 'firstPartTestCount');
  const firstPartTestResult = _get(record, 'firstPartTestResult');

  const secondPartTestDate = _get(record, 'secondPartTestDate');
  const secondPartTestCount = _get(record, 'secondPartTestCount');
  const secondPartTestResult = _get(record, 'secondPartTestResult');

  const thirdPartTestDate = _get(record, 'thirdPartTestDate'); //科三考试时间
  const thirdPartTestCount = _get(record, 'thirdPartTestCount'); //科三考试次数
  const thirdPartTestResult = _get(record, 'thirdPartTestResult'); //科三考试结果

  const fourthPartTestDate = _get(record, 'fourthPartTestDate');
  const fourthPartTestCount = _get(record, 'fourthPartTestCount');
  const fourthPartTestResult = _get(record, 'fourthPartTestResult');

  let score = <></>;
  if (subject === '1') {
    return <Score count={firstPartTestCount} time={firstPartTestDate} result={firstPartTestResult} />;
  }
  if (subject === '2') {
    return <Score count={secondPartTestCount} time={secondPartTestDate} result={secondPartTestResult} />;
  }
  if (subject === '3') {
    return <Score count={thirdPartTestCount} time={thirdPartTestDate} result={thirdPartTestResult} />;
  }
  if (subject === '4') {
    return <Score count={fourthPartTestCount} time={fourthPartTestDate} result={fourthPartTestResult} />;
  }
  return score;
}
//考试成绩展示：考试日期+合格状态（考试次数）
function Score(props: any) {
  const { count, time = '', result = '' } = props;
  let finalResult = result;
  if (!result) {
    finalResult = '待考';
  } else if (result === '补考') {
    finalResult = '不合格';
  }
  const components = (
    <span className="flex direction-col">
      <span>{time}</span>
      {time && <span>{!isUndefined(count) ? `${finalResult} (${count})` : finalResult}</span>}
    </span>
  );

  return <Tooltip title={components}>{components}</Tooltip>;
}

export const STATUS_ARR = ['0', '1', '2', '3']; //具体注释见COLORMAP

export const COLORMAP = {
  '0': { name: '符合报审条件', color: '#307EF2', background: '#F5F9FF' },
  '1': { name: '已递交审核', color: '#A38D00', background: '#FFFDF5' },
  '2': { name: '审核通过', color: '#7DA88B', background: '#F0FFF0' },
  '3': { name: '审核未通过', color: '#C74C3C', background: '#FFF0F0' },
};

export const SubjectTypeHash = {
  // 课程方式
  '1': '实操（大纲）',
  '2': '课堂（大纲）',
  '3': '模拟（大纲）',
  '4': '网络（大纲）',
  '5': '里程（大纲）',
  '6': '从业（大纲）',
  '7': '课堂里程（大纲）',
  '8': '模拟里程（大纲）',
  '9': '网络里程（大纲）',
};

/**
 * 获取当前科目大纲学时
 * @param subject :当前科目
 * @param subjectData ：所有科目的大纲
 * @param  isPractice 是否需要参加从业
 * @returns 当前科目大纲的展示
 */
export function getOutlineData(subject: any, subjectData: any, isPractice = false) {
  let customSubjectData = subjectData.filter((x: any) => x.subject === subject);
  const mileageData = customSubjectData
    .filter((x: any) => x.periodMileage != 0)
    .map((x: { traincode: string; periodMileage: any }) => {
      if (x.traincode === '1') {
        //实操里程（大纲）
        return { ...x, traincode: '5', periodTotaltime: x.periodMileage };
      }
      if (x.traincode === '2') {
        //课堂里程（大纲）
        return { ...x, traincode: '7', periodTotaltime: x.periodMileage };
      }
      if (x.traincode === '3') {
        //模拟里程（大纲）
        return { ...x, traincode: '8', periodTotaltime: x.periodMileage };
      }
      if (x.traincode === '4') {
        //网络里程（大纲）
        return { ...x, traincode: '9', periodTotaltime: x.periodMileage };
      }
      return x;
    });
  const practiceTime = customSubjectData.reduce((x: any, y: any) => {
    return x + y.periodCertTotaltime;
  }, 0);
  console.log(practiceTime, 'practiceTime');
  if ((subject === '2' || subject === '3') && mileageData.length > 0) {
    customSubjectData = [...customSubjectData, ...mileageData];
  }
  if (isPractice) {
    //从业的展示从业大纲
    customSubjectData = [...customSubjectData, { traincode: '6', periodTotaltime: practiceTime }];
  }
  if (customSubjectData.length > 0) {
    return customSubjectData.map((x: any, index: number) => {
      return (
        <div key={index} style={{ width: 200 }}>
          {SubjectTypeHash[x.traincode]}：{x.periodTotaltime.toFixed(2)}
          {['5', '7', '8', '9'].includes(x.traincode) ? '公里' : '分钟'}
        </div>
      );
    });
  } else {
    return <div>暂未配置大纲</div>;
  }
}

// 直接显示后端返回的数据
export function RenderValueFromInterface(props: { value: any }) {
  const { value } = props;
  return (
    // <Tooltip title={ClassTime}>
    <span style={{ margin: '5px 0px' }}>{value}</span>
    // </Tooltip>
  );
}

//颜色说明
export function ColorDescription(props: { status: string }) {
  const { status } = props;
  const colorMap = COLORMAP;
  return (
    <span
      style={{
        height: 30,
        lineHeight: '30px',
        margin: 'auto',
        color: `${colorMap[status].color}`,
        borderColor: `${colorMap[status].color}`,
        background: `${colorMap[status].background}`,
        border: '1px solid',
        padding: '0px 5px',
        borderRadius: 4,
        fontWeight: 550,
        width: 100,
      }}
      className="flex-box"
    >
      {colorMap[status].name}
    </span>
  );
}
