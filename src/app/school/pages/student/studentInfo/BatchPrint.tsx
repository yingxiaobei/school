import { Alert, message, Modal, Select, Spin, Tabs, Tooltip } from 'antd';
import { UpdatePlugin } from 'components';
import { useAuth, useHash, useInfo, useOptions, useVisible } from 'hooks';
import { useContext, useEffect, useReducer, useState } from 'react';
import { _get } from 'utils';
import { _getStuStageReportStageTaoda, _getTrainClassReport, _trainExam } from './_api';
import style from './index.module.scss';
import {
  batchPrintFile,
  reducer,
  initialState,
  typeTextMap,
  typeTextTaoPrintMap,
  filterArray,
} from './_batchPrintUtil';
import { CheckCircleTwoTone } from '@ant-design/icons';
import { useDebounceFn } from 'ahooks';
import { isEmpty } from 'lodash';
import GlobalContext from 'globalContext';

const { TabPane } = Tabs;

export default function BatchPrint(props: any) {
  const { onCancel, selectedRows } = props;
  const [subject, setSubject] = useState('0');
  const [selected, setSelected] = useState('');
  const subjectcodeHash = useHash('trans_part_type'); // 培训部分
  const traincodeHash = useHash('subject_type'); // 课程方式
  const [state, dispatch] = useReducer(reducer, initialState);
  const subjectOptions = useOptions('trans_part_type');
  const [noSoftwareVisible, setNoSoftwareVisible] = useVisible();
  const [_showInfo] = useInfo();
  const { $elementAuthTable } = useContext(GlobalContext);
  const [activeKey, setActiveKey] = useState('1');
  const [info, setInfo] = useState('');

  console.log(selectedRows, state);

  const StatusCom = (props: { type: string }) => {
    const { type } = props;
    const len = selectedRows.length;
    const successCount = state[type].successCount;
    const printed = state[type].status === 'printed';
    return (
      <div className={style.status}>
        {(state[type].status === 'printing' || (printed && successCount !== len)) && (
          <Tooltip title={printed ? '执行完成' : '打印中'}>
            <span className={successCount === 0 ? '' : style.blue}>{successCount}</span>
            {`/${len}`}
          </Tooltip>
        )}
        {successCount === len && ( //打印成功数=打印总数时，展示打印完成
          <Tooltip title="执行成功">
            <CheckCircleTwoTone twoToneColor="#52c41a" />
          </Tooltip>
        )}
      </div>
    );
  };

  const FileComponent = (props: { type: string; selected: string; text: string }) => {
    const { type, selected, text } = props;
    return (
      // <Spin tip="处理中..." key={type} spinning={state[type].status === 'printing'}>
      <div
        className={selected === type ? style.selected : style.div1}
        key={type}
        onClick={() => {
          if (state[type].status === 'printed') {
            Modal.confirm({
              title: '打印命令已执行完成，确认仍要再次执行吗？',
              onOk: async () => {
                dispatch({ type, payLoad: { status: 'not-print', isInit: true } });
                setSelected(type);
              },
            });
            return;
          }
          setSelected(type);
        }}
      >
        <span className="pl20">{text}</span>
        {type === 'journal' && (
          <div>
            <Select
              value={subject}
              // size="small"
              options={[{ value: '0', label: '培训部分(全部)' }, ...subjectOptions]}
              onChange={(val: any) => {
                if (state[type].status === 'printed') {
                  return;
                }
                setSubject(val);
              }}
              className="text-center mt4 ml10"
              style={{ width: '80%' }}
            />
            <StatusCom type="journal" />
          </div>
        )}
        <StatusCom type={type} />
      </div>
      // </Spin>
    );
  };

  const { run } = useDebounceFn(batchPrintFile, {
    leading: true, //是否在延迟开始前调用函数
    wait: 1500,
  });
  useEffect(() => {
    if (state[selected]?.status === 'printed' && !isEmpty(state[selected]?.errorMsg)) {
      const errorMsg = state[selected].errorMsg;
      const msg = Object.keys(errorMsg).map(function (key) {
        return <div key={key}>{`${_get(errorMsg[key], 'msg')}: ${_get(errorMsg[key], 'total', 0)}条; `}</div>;
      });

      const successCount = state[selected].successCount;
      const len = selectedRows.length;
      _showInfo({
        content: (
          <div>
            <div>
              <div className="bold">
                本次共处理{selectedRows.length}条, 打印成功{successCount}条，打印失败{len - successCount}条
              </div>
            </div>
            {msg}
          </div>
        ),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state[selected]?.status, selected]);

  const isShowTrain_tao = useAuth('student/studentInfo:btn18');
  const isShowJournal_tao = useAuth('student/studentInfo:btn19');
  const isShowTabTaoDa = isShowTrain_tao || isShowJournal_tao; //是否显示套打tab页

  const AlertCom = () => {
    return (
      <div className="ml20">
        <Alert
          message={'学员若未生成对应电子档案，则实际打印数量和选中学员数量会不一致'}
          type="warning"
          showIcon
          className={style.alert}
        />
      </div>
    );
  };

  async function _handleOk() {
    const res = await run(selected, selectedRows, subject, subjectcodeHash, traincodeHash, dispatch);
    if (res === 'NO_SOFTWARE') {
      return setNoSoftwareVisible();
    }
    if (res === 'LOW_VERSION') {
      setInfo('打印插件版本较低，请更新');

      setNoSoftwareVisible();
      return;
    }
  }

  return (
    <Modal
      visible
      width={1100}
      title="学员档案批量打印"
      maskClosable={false}
      okText={'打印'}
      bodyStyle={{ padding: '0px 20px 0px 20px' }}
      onCancel={() => {
        onCancel();
        setSelected('');
      }}
      onOk={async () => {
        if (!selected) {
          return message.error('请选择需要打印的电子档案');
        }
        if (state[selected]?.status === 'printed') {
          Modal.confirm({
            title: '打印命令已执行完成，确认仍要再次执行吗？',
            onOk: async () => {
              dispatch({ type: selected, payLoad: { status: 'not-print', isInit: true } });
              _handleOk();
            },
          });
          return;
        }
        if (state[selected]?.status === 'printing') {
          message.info('正在执行中');
          return;
        }
        _handleOk();
      }}
      confirmLoading={state[selected]?.status === 'printing'}
    >
      {noSoftwareVisible && (
        <UpdatePlugin onCancel={setNoSoftwareVisible} info={info || '无法调用打印程序'} plugin="print_package.zip" />
      )}
      <Spin tip="处理中..." spinning={state[selected]?.status === 'printing' || false}>
        <Tabs
          defaultActiveKey="1"
          onChange={(value) => {
            if (state[selected]?.status === 'printing') {
              return message.info('正在执行中');
            }
            setActiveKey(value);
          }}
          activeKey={activeKey}
        >
          <TabPane tab="打印" key="1">
            <AlertCom />
            <div className={style.div0}>
              {filterArray(typeTextMap, $elementAuthTable).map((x: any) => {
                return <FileComponent type={x.type} selected={selected} text={x.text} key={x.type} />;
              })}
            </div>
          </TabPane>
          {isShowTabTaoDa && (
            <TabPane tab="套打" key="2">
              <AlertCom />
              <div className={style.div0}>
                {filterArray(typeTextTaoPrintMap, $elementAuthTable).map((x: any) => {
                  return <FileComponent type={x.type} selected={selected} text={x.text} key={x.type} />;
                })}
              </div>
            </TabPane>
          )}
        </Tabs>
      </Spin>
    </Modal>
  );
}
