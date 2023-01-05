import { Button, message } from 'antd';
import { Auth, _get } from 'utils';
import { useFetch, useRequest, useForceUpdate, useHash, useAuth } from 'hooks';
import { _getStudentTrain, getStudentNetworkTime, _fixMinData, _getStatisticSum } from '../_api';
import { AuthButton } from 'components';
import { generateIdForDataSource, insertWhen } from 'utils';
import { CustomTable } from 'components';

export default function TrainInfo(props: { sid: string; showBtn: boolean; showSyncBtn: boolean }) {
  const { sid, showBtn, showSyncBtn } = props;
  const [ignore, forceUpdate] = useForceUpdate();
  const { isLoading, data } = useFetch({
    request: _getStudentTrain,
    query: {
      sid,
    },
    depends: [ignore],
  });

  const { loading: load, run: fixData } = useRequest(_fixMinData);

  const { loading, run } = useRequest(getStudentNetworkTime, {
    onSuccess: forceUpdate,
  });

  const { loading: sumLoading, run: sumRun } = useRequest(_getStatisticSum, {
    onSuccess: forceUpdate,
  });

  const transPartTypeHash = useHash('trans_part_type'); // 培训部分
  const subjectTypeHash = useHash('subject_type'); // 课程方式

  // 合并单元表格Number（额定学时/分钟-从业资格）（已训学时/分钟-从业资格）（可报审学时/分钟-从业资格）
  function setAddTableCellNumber(item: number, row: any, index: number, type: string) {
    const obj = {
      children: item || 0, // 如果没有数字就是空的
      props: { rowSpan: 1 }, // 当前行中对应单元列占位1 （0：不占位 1：占位1格子 2：占位2格子 以此类推）
    };

    const rows = _get(data, 'stuStagetrainningTimeVOList', []); //获取当前表格数据
    if (index !== 0 && _get(rows, `${index - 1}.subject`) === _get(rows, `${index}.subject`)) {
      // 如果当前行不为0时 获取当前行与上一行的「科目信息」 发现名称为一样的时候 当前行不占位不渲染
      obj.props.rowSpan = 0;
    } else {
      for (let i = index + 1; i < _get(rows, 'length'); i++) {
        // 否则判断下一行以后代码和本行之前的关系，取当前列表的长度和下一行的行数，
        if (_get(rows, `${i}.subject`) === _get(rows, `${index}.subject`)) {
          // 判断下一行如果和本行对应的科目名称相等则
          obj.props.rowSpan++; //此单元格向下占位自己+1 否则不等就退出
          obj.children += Number(_get(rows, `${i}.${type}`, 0)); //单元格没有数字就是空的但是单元格合并了
        } else {
          break;
        }
      }
    }

    return { ...obj, children: obj.children || null };
  }

  const columns = [
    {
      title: '培训部分',
      dataIndex: 'subject',
      render: (subject: any, row: any, index: number) => {
        const obj = {
          children: transPartTypeHash[subject],
          props: { rowSpan: 1 },
        };
        const rows = _get(data, 'stuStagetrainningTimeVOList', []); //获取当前表格数据
        if (index !== 0 && _get(rows, `${index - 1}.subject`) === _get(rows, `${index}.subject`)) {
          obj.props.rowSpan = 0;
        } else {
          for (let i = index + 1; i < _get(rows, 'length'); i++) {
            if (_get(rows, `${i}.subject`) === _get(rows, `${index}.subject`)) {
              obj.props.rowSpan++;
            } else {
              break;
            }
          }
        }
        return obj;
      },
    },
    {
      title: '课程方式',
      dataIndex: 'traincode',
      render: (traincode: any) => subjectTypeHash[traincode],
    },
    {
      title: '额定学时/分钟',
      dataIndex: 'periodTotaltime',
      render: (periodTotaltime: any, row: any, index: number): any => {
        // 如果发现当前行 mutualTimesFlag为1 则根据subject字段合并进行向下累加 否则不处理
        // （注意：setAddTableCellNumber方法不会判断下一行mutualTimesFlag为1,所以返回字段需要注意在每一条需要累加的数据中mutualTimesFlag为1 否则达不到预期值）
        if (Number(_get(row, 'mutualTimesFlag', 0)) === 1) {
          return setAddTableCellNumber(periodTotaltime, row, index, 'periodTotaltime');
        } else {
          return periodTotaltime || null;
        }
      },
    },
    {
      title: '额定里程/公里',
      dataIndex: 'periodMileage',
      render: (periodMileage: any) => periodMileage || null,
    },
    {
      title: '已训学时/分钟',
      dataIndex: 'totaltime',
      render: (totaltime: any) => totaltime || null,
    },
    {
      title: '可报审学时/分钟',
      dataIndex: 'validTotaltime',
      render: (validTotaltime: any) => validTotaltime || null,
    },
    {
      title: '已上传学时/分钟',
      dataIndex: 'uploadJgTotaltime',
      render: (uploadJgTotaltime: any) => uploadJgTotaltime || null,
    },
    {
      title: '已训里程/公里',
      dataIndex: 'mileage',
      render: (mileage: any) => mileage || null,
    },
    {
      title: '可报审里程数/公里',
      dataIndex: 'validMileage',
      render: (validMileage: any) => validMileage || null,
    },
    {
      title: '已上传里程数/公里',
      dataIndex: 'uploadJgMileage',
      render: (uploadJgMileage: any) => uploadJgMileage || null,
    },
    ...insertWhen(useAuth('student/studentInfo:periodCertTotaltime'), [
      {
        title: (
          <>
            <div>额定学时/分钟</div>
            <div>(从业资格)</div>
          </>
        ),
        dataIndex: 'periodCertTotaltime',
        render: (periodCertTotaltime: number, row: any, index: number) => {
          return setAddTableCellNumber(periodCertTotaltime, row, index, 'periodCertTotaltime');
        },
      },
    ]),
    ...insertWhen(useAuth('student/studentInfo:certTotaltime'), [
      {
        title: (
          <>
            <div>已训学时/分钟</div>
            <div>(从业资格)</div>
          </>
        ),
        dataIndex: 'certTotaltime',
        render: (certTotaltime: number, row: any, index: number) => {
          return setAddTableCellNumber(certTotaltime, row, index, 'certTotaltime');
        },
      },
    ]),
    ...insertWhen(useAuth('student/studentInfo:validCertTotaltime'), [
      {
        title: (
          <>
            <div>可报审学时/分钟</div>
            <div>(从业资格)</div>
          </>
        ),
        dataIndex: 'validCertTotaltime',
        render: (validCertTotaltime: number, row: any, index: number) => {
          return setAddTableCellNumber(validCertTotaltime, row, index, 'validCertTotaltime');
        },
      },
    ]),
    ...insertWhen(useAuth('student/studentInfo:upTime'), [
      {
        title: (
          <>
            <div>已上传学时/分钟</div>
            <div>(从业资格)</div>
          </>
        ),
        dataIndex: 'uploadJgCertTotaltime',
        render: (uploadJgCertTotaltime: number, row: any, index: number) => {
          return setAddTableCellNumber(uploadJgCertTotaltime, row, index, 'uploadJgCertTotaltime');
        },
      },
    ]),
    {
      title: '转入学时/分钟',
      dataIndex: 'extTotaltime',
    },
    {
      title: '转入里程/里程',
      dataIndex: 'extTotalmileage',
    },
  ];

  return (
    <>
      <div className="flex direction-row-reverse">
        {showBtn && (
          <Button
            type="primary"
            className="mb20 ml20"
            loading={loading}
            onClick={() => {
              run({ stuid: sid });
            }}
          >
            获取学员网络学时
          </Button>
        )}

        <AuthButton
          authId="student/studentInfo:btn39"
          type="primary"
          className="mb20 ml20"
          loading={sumLoading}
          onClick={() => {
            sumRun({ sid });
          }}
        >
          学时汇总
        </AuthButton>
        {showSyncBtn && (
          <AuthButton
            authId="student/studentInfo:btn32"
            type="primary"
            className="mb20  ml20"
            loading={load}
            onClick={async () => {
              await fixData({ subject: 2, sid: sid });
              await fixData({ subject: 3, sid: sid });
              forceUpdate();
            }}
          >
            同步监管学时（实操）
          </AuthButton>
        )}
      </div>
      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={generateIdForDataSource(_get(data, 'stuStagetrainningTimeVOList', []))}
        rowKey="id"
        pagination={false}
      />
    </>
  );
}
