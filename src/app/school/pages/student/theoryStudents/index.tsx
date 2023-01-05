import { Button, message, Modal, Space, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Search, CustomTable, AuthButton, UpdatePlugin, ButtonContainer } from 'components';
import { useFetch, useHash, useOptions, useTablePro, useVisible } from 'hooks';
import { useCallback, useContext, useState } from 'react';
import { Auth, downloadFile, getIdCardInfo, isForceUpdatePlugin, _get, _handleIdCard, _handlePhone } from 'utils';
import {
  isFreezingModeStudent,
  showNetworkTimeButton,
  _getIsOpenRobot,
  _getStatisticTheoryClassRecord,
  _getAllCardMoney,
} from '../studentInfo/_api';
import { _exportExcel, _exportExcelBefore, _getPageList, _getSchoolNameList, _checkStatus } from './_api';
import Details from '../studentInfo/StudentInfoDetail';
import { _getMenuTreeAboutExam } from '_api';
import BindIdCard from '../studentInfo/BindIdCard';
import NoCardSoftWare from '../studentInfo/NoCardSoftWare';
import { previewTheoryLog } from '../studentInfo/_printUtils';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import moment from 'moment';
import styles from './index.module.css';
import GlobalContext from 'globalContext';
import bindCardCommon from 'utils/bindCard';
import ReadIdCard from 'components/ReadIdCard';
import { FiltersType } from 'components/Search';

const { confirm } = Modal;

function TheoryStudents() {
  const [schoolNameOptions, setSchoolNameOptions] = useState<any>([]);
  const [isFrozenStudent, setIsFrozenStudent] = useState(false); //是否是一次性冻结、预约冻结的学员
  const [showBtn, setShowBtn] = useState(false); //是否显示获取远程教育学时按钮
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [idLoading, setIdLoading] = useState(false);
  const [updatePluginVisible, setUpdatePluginVisible] = useVisible();
  const [idCardId, setIdCardId] = useState(); //身份证物理卡号
  const [certNum, setCertNum] = useState(); //身份证号
  const [bindIdCardVisible, setBindIdCardVisible] = useVisible();
  const [loading, setLoading] = useState(false);
  const [noSoftWareVisible, setNoSoftWareVisible] = useVisible();
  const [info, setInfo] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [printLoading, setPrintLoading] = useState(false);
  const [noSoftwareVisible, setNoSoftwareVisible] = useVisible();
  const [selectedRows, setSelectedRows] = useState([]);
  const { $isForceUpdatePlugin } = useContext(GlobalContext);

  const { search, _handleSearch, tableProps, _refreshTable, currentRecord, setCurrentRecord } = useTablePro({
    request: _getPageList,
    initPageSizeOptions: [10, 20, 50, 100, 200], //增加显示200条选项
    customHeader: {
      customSchoolId: '',
    },
  });

  const stuStatusHash = useHash('stu_drivetrain_status'); // 学员状态
  const studentTypeHash = useHash('student_type'); // 学员类型
  const contractflagHash = useHash('stu_contract_status'); // 合同签订状态
  const recordStatusTypeHash = useHash('stu_record_status_type'); // 学员备案状态
  const registeredNationalFlagHash = useHash('registered_national_flag'); // 统一编码

  const businessTypeHash = useHash('businessType', false, '-1', [], {
    query: { customHeader: { customSchoolId: '' } },
    depends: [''],
    forceUpdate: true,
  }); // 业务类型

  const approStatusHash = useHash('stu_theory_check_status'); // 审核状态
  const subjectcodeHash = useHash('trans_part_type'); // 培训阶段
  const traincodeHash = useHash('subject_type'); // 课程方式
  // 驾校(名称)相关的下拉框
  useFetch({
    request: _getSchoolNameList as any,
    callback(data: any[]) {
      const schoolNameOptions = data.map((item) => {
        return {
          value: item.id,
          label: item.name,
        };
      });
      setSchoolNameOptions(schoolNameOptions);
    },
    customHeader: {
      customSchoolId: '',
    },
  });

  const { data: robotInfo } = useFetch({
    request: _getIsOpenRobot,
    query: {
      id: Auth.get('schoolId'),
    },
    depends: [],
  });

  const { data: examRes } = useFetch({
    request: _getMenuTreeAboutExam,
    depends: [],
  });

  const setIsOpenExamInfoTab: () => boolean = useCallback(() => {
    if (examRes) {
      return (examRes as any[]).some((exam) => exam.code === 'StuAppointment');
    }
    return false;
  }, [examRes]);

  //是否是一次性冻结、预约冻结的学员
  const getIsFrozenStudent = async (id: any, schoolId: string) => {
    const res = await isFreezingModeStudent({ sid: id }, { customSchoolId: schoolId });

    setIsFrozenStudent(_get(res, 'data', false));
  };

  //是否显示获取远程教育学时按钮
  const showDistanceLearnBtn = async (schoolId: string) => {
    const res = await showNetworkTimeButton({}, { customSchoolId: schoolId });
    setShowBtn(_get(res, 'data', false));
  };

  // 查询所有的余额点卡
  const { data: allCardMoney } = useFetch({
    request: _getAllCardMoney,
    query: {
      accountType: '00',
    },
  });

  const filters: FiltersType = [
    { type: 'Select', field: 'schoolid', options: [{ label: '驾校名称(全部)', value: '' }, ...schoolNameOptions] },
    { type: 'Input', field: 'name', placeholder: '学员姓名' },
    { type: 'Input', field: 'idcard', placeholder: '证件号码' },
    {
      type: 'RangePicker',
      field: ['applydatebegin', 'applydateend'],
      placeholder: ['报名日期起', '报名日期止'],
    },
    {
      type: 'Select',
      field: 'learnStage',
      options: [{ label: '培训阶段(全部)', value: '' }, ...useOptions('trans_part_type')],
    },
    // { type: 'DatePickerJ', field: 'periodYear', placeholder: '入学年份', otherProps: { picker: 'year' } }, // todo: 直接输入 后期还是用 dataPick
    { type: 'Input', field: 'periodYear', placeholder: '入学年份' },
    { type: 'Input', field: 'periodId', placeholder: '期数' },
    { type: 'Input', field: 'periodNum', placeholder: '期数学号' },
    {
      type: 'Select',
      field: 'theoryCenterCheckStatus',
      options: [{ label: '模拟中心审核状态(全部)', value: '' }, ...useOptions('stu_theory_check_status')],
    },
  ];
  async function bindCard() {
    setBindIdCardVisible();
    if ($isForceUpdatePlugin) {
      setInfo('无法进行绑定二代证');
      return setUpdatePluginVisible();
    }
    setLoading(true);
    const result = await bindCardCommon();
    setLoading(false);
    if (result === 'update') {
      setInfo('无法进行绑定二代证');
      return setUpdatePluginVisible();
    }

    setIdCardId(_get(result, 'cardNo', '')); //物理卡号
    setCertNum(_get(result, 'data.idNo', '')); //身份证号
  }

  const columns: ColumnsType<any> = [
    {
      title: '驾校名称',
      dataIndex: 'schoolname',
      fixed: 'left',
      width: 150,
      ellipsis: true,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      fixed: 'left',
      width: 100,
    },
    {
      title: '证件号',
      dataIndex: 'idcard',
      fixed: 'left',
      width: 200,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
      // ellipsis: true,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      width: 100,
      render: (value: any, record: any) => _handlePhone(value),
    },
    {
      title: '学车教练',
      dataIndex: 'coachname',
      width: 90,
    },
    {
      title: '培训车型',
      dataIndex: 'traintype',
      width: 90,
    },
    {
      title: '业务类型',
      dataIndex: 'busitype',
      render(text: string) {
        return businessTypeHash[text];
      },
      width: 100,
    },
    {
      title: '报名日期',
      dataIndex: 'applydate',
      width: 100,
    },
    {
      title: '学员状态',
      dataIndex: 'status',
      render: (status: any) => stuStatusHash[status],
      width: 90,
    },
    {
      title: '学员类型',
      dataIndex: 'studenttype',
      render(text: string) {
        return studentTypeHash[text];
      },
      width: 90,
    },
    // {
    //   title: '合同签订状态',
    //   dataIndex: 'contractflag',
    //   // hide: type === 'studentSearch',
    //   // width: 100,
    //   render: (contractflag: any, record: any) => {
    //     if (contractflag === '0') {
    //       return contractflagHash[contractflag];
    //     } else {
    //       return (
    //         <div
    //           style={{ color: PRIMARY_COLOR }}
    //           className="pointer"
    //           onClick={() => {
    //             _previewContractFile(
    //               {
    //                 sid: _get(record, 'sid'),
    //               },
    //               { customSchoolId: '' },
    //             ).then((res) => {
    //               window.open(_get(res, 'data'));
    //             });
    //           }}
    //         >
    //           {contractflagHash[contractflag]}
    //         </div>
    //       );
    //     }
    //   },
    // },
    {
      title: '备案状态',
      dataIndex: 'registered_Flag',
      // hide: type === 'studentSearch',
      render: (registered_Flag: string, record: any) => {
        if (registered_Flag === '2') {
          return (
            // TODO: 11-10 备案失败效果
            <Tooltip title={record['message']}>
              <span style={{ color: PRIMARY_COLOR }}>{recordStatusTypeHash[registered_Flag]}</span>
            </Tooltip>
          );
        }
        return recordStatusTypeHash[registered_Flag];
      },
      width: 90,
    },
    {
      title: '统一编码',
      dataIndex: 'registered_NationalFlag',
      // hide: type === 'studentSearch',
      render: (registered_NationalFlag: any) => registeredNationalFlagHash[registered_NationalFlag],
      width: 90,
    },
    // {
    //   title: '学员来源', // todo: 本期不做
    // },
    {
      title: '培训阶段',
      dataIndex: 'learnStage',
      render(text: string) {
        return <div>{subjectcodeHash[text]}</div>;
      },
      width: 100,
    },
    {
      title: '入学年份',
      dataIndex: 'periodYear',
      width: 100,
    },
    {
      title: '期数',
      dataIndex: 'periodId',
      width: 90,
    },
    {
      title: '期数学号',
      dataIndex: 'periodNum',
      width: 90,
    },
    {
      title: '模拟中心审核状态',
      dataIndex: 'theoryCenterCheckStatus',
      width: 150,
      render(text: string) {
        return <div>{approStatusHash[text]}</div>;
      },
    },
    {
      title: '操作',
      fixed: 'right',
      width: 220,
      render(text: any, record) {
        return (
          <div>
            <AuthButton
              authId="student/theoryStudents:btn4"
              className="operation-button"
              onClick={() => {
                getIsFrozenStudent(_get(record, 'sid', ''), _get(record, 'practicalSchoolId'));
                showDistanceLearnBtn(_get(record, 'practicalSchoolId'));
                _switchDetailsVisible();
                setCurrentRecord(record);
                Auth.set('practicalSchoolId', _get(record, 'practicalSchoolId'));
              }}
            >
              详情
            </AuthButton>
            <AuthButton
              insertWhen={_get(record, 'status') === '01' && _get(record, 'registered_Flag') === '1'}
              authId="student/theoryStudents:btn5"
              className="operation-button"
              onClick={async () => {
                Auth.set('practicalSchoolId', _get(record, 'practicalSchoolId'));
                setCurrentRecord(record);
                bindCard();
              }}
            >
              绑定二代证
            </AuthButton>
          </div>
        );
      },
    },
  ];

  async function exportExcel(query: any) {
    try {
      const res = await _exportExcelBefore(query, { customSchoolId: '' });
      if (_get(res, 'code') === 200) {
        const res = await _exportExcel(query, { customSchoolId: '' });
        downloadFile(res, '理论学员档案', 'application/vnd.ms-excel', 'xlsx');
      } else {
        message.error(_get(res, 'message'));
      }
    } catch (e) {
      message.error(e as string);
    }
  }
  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
    selectedRowKeys,
  };

  //批量打印 理论教学日志
  async function getBatchPrint(index: any, isPrint = false) {
    if (index > selectedRowKeys.length) {
      setPrintLoading(false);
      return;
    }

    if (index === selectedRowKeys.length) {
      setPrintLoading(false);
      return;
    }

    let res: any = {};

    res = await _getStatisticTheoryClassRecord({
      sid: selectedRowKeys[index],
      customSchoolId: _get(selectedRows[index], 'practicalSchoolId', ''),
    });
    if (_get(res, 'code') !== 200) {
      setPrintLoading(false);
      index < selectedRowKeys.length && getBatchPrint(index + 1, isPrint);
    } else {
      if (Object.keys(_get(res, 'data', {})).length === 0) {
        message.info('暂无信息');
        index < selectedRowKeys.length && getBatchPrint(index + 1, isPrint);
        return;
      }

      const printRes = await previewTheoryLog(_get(res, 'data', {}), isPrint, subjectcodeHash, traincodeHash);
      if (printRes === 'NO_SOFTWARE') {
        setNoSoftwareVisible();
      }
      index < selectedRowKeys.length && getBatchPrint(index + 1, isPrint);
    }
  }
  const tableHeight = () => {
    return (
      document.body.clientHeight -
      112 - //search组件两行的高度
      Number(document.querySelector('.ant-tabs-nav')?.clientHeight || 0) -
      Number(document.querySelector('.ant-layout-header')?.clientHeight || 0) -
      175
    );
  };

  const columnsSort = columns.map((x: any) => {
    if (x.title === '操作') {
      return x;
    }
    const dataIndex = x.dataIndex;
    return {
      ...x,
      sorter: (a: any, b: any) => {
        if (!a[dataIndex]) {
          a[dataIndex] = '';
        }
        if (!b[dataIndex]) {
          b[dataIndex] = '';
        }
        let cReg = /^[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/;
        if (!cReg.test(a[dataIndex]) || !cReg.test(b[dataIndex])) {
          return a[dataIndex].localeCompare(b[dataIndex]);
        } else {
          return a[dataIndex].localeCompare(b[dataIndex], 'zh');
        }
      },
      sortDirections: ['ascend', 'descend'],
    };
  });

  const handleAppro = () => {
    if (!selectedRows.length) {
      setSelectedRows([]);
      setSelectedRowKeys([]);
      return message.info('请选择未审核的学员');
    }
    let unapproList = selectedRows
      .filter(({ theoryCenterCheckStatus }) => theoryCenterCheckStatus == '0')
      .map((item: any) => item.sid);
    if (!unapproList.length) {
      setSelectedRows([]);
      setSelectedRowKeys([]);
      return message.info('请选择未审核的学员');
    }

    if (Number(_get(allCardMoney, 'subAccounts[0].accountBalance')) < unapproList.length) {
      Modal.info({
        title: (
          <p>
            理论点卡余额不足，请<a href="./financial/wellcomeWallet">点击此处</a>去充值
          </p>
        ),
        onOk() {},
      });
    } else {
      _checkStatus({ sids: unapproList.join(','), schoolId: Auth.get('schoolId') })?.then((res: any) => {
        if (res && res.code === 200) {
          message.success('审核成功');
          _refreshTable();
          setSelectedRows([]);
          setSelectedRowKeys([]);
        } else {
          message.error(res.message);
        }
      });
    }
  };
  return (
    <div>
      {noSoftwareVisible && (
        <UpdatePlugin onCancel={setNoSoftwareVisible} info="无法调用打印程序" plugin="print_package.zip" />
      )}
      {updatePluginVisible && <UpdatePlugin onCancel={setUpdatePluginVisible} info={info} />}
      {bindIdCardVisible && (
        <BindIdCard
          onCancel={setBindIdCardVisible}
          onOk={() => {
            setBindIdCardVisible();
            _refreshTable();
          }}
          currentRecord={currentRecord}
          idCardId={idCardId}
          certNum={certNum}
          setNoSoftWareVisible={setNoSoftWareVisible}
          loading={loading}
          customSchoolId={''}
          isTheory
          practicalSchoolId={_get(currentRecord, 'practicalSchoolId')}
        />
      )}
      {noSoftWareVisible && <NoCardSoftWare onCancel={setNoSoftWareVisible} />}
      {detailsVisible && (
        <Details
          onCancel={_switchDetailsVisible}
          sid={_get(currentRecord, 'sid')}
          idcard={_get(currentRecord, 'idcard')}
          isFrozenStudent={isFrozenStudent}
          showBtn={showBtn}
          currentRecord={currentRecord}
          customSchoolId={''}
          type={'studentInfo'}
          isShowRobot={_get(robotInfo, 'robotCoachTeach') === '1'}
          isShowExamInfo={setIsOpenExamInfoTab()}
          userId={_get(currentRecord, 'userid', '')}
          // 与原来的学员档案中的详情操作的区别
          isTheory
          practicalSchoolId={_get(currentRecord, 'practicalSchoolId')}
        />
      )}

      <div id="operate">
        <Search
          loading={tableProps.loading}
          filters={filters}
          search={search}
          _handleSearch={_handleSearch}
          refreshTable={() => {
            _refreshTable();
          }}
          showSearchButton={false}
        />
      </div>
      <ButtonContainer showSearchButton={true} refreshTable={_refreshTable} loading={tableProps.loading} id="search">
        <AuthButton
          authId="student/theoryStudents:btn1"
          style={{ margin: '0 20px 20px 0' }}
          type="primary"
          loading={printLoading}
          onClick={async () => {
            if (selectedRowKeys.length < 1) {
              message.error('请选中需要打印的数据');
              return;
            }
            setPrintLoading(true);
            let isPrint = selectedRowKeys.length !== 1; //选中单条时预览，选中多条时直接打印
            if (isPrint) {
              confirm({
                title: `请确认是否批量打印学员教学日志？`,
                content: '',
                okText: '确定',
                okType: 'danger',
                cancelText: '取消',
                async onOk() {
                  getBatchPrint(0, isPrint);
                },
                onCancel() {
                  setPrintLoading(false);
                },
              });
            } else {
              getBatchPrint(0, isPrint);
            }
          }}
        >
          理论教学日志打印
        </AuthButton>

        <ReadIdCard
          authId="student/theoryStudents:btn2"
          setInfo={setInfo}
          setUpdatePluginVisible={setUpdatePluginVisible}
          _handleSearch={_handleSearch}
          _refreshTable={_refreshTable}
        />
        <AuthButton
          authId="student/theoryStudents:btn3"
          onClick={() => {
            exportExcel(search);
          }}
          style={{ margin: '0 20px 20px 0' }}
          // className="mb20"
          type="primary"
        >
          导出
        </AuthButton>
        <AuthButton
          authId="student/theoryStudents:btn6"
          onClick={() => {
            handleAppro();
          }}
          className="mb20"
          type="primary"
        >
          模拟中心审核
        </AuthButton>
      </ButtonContainer>
      <CustomTable
        rowKey="sid"
        rowSelection={{
          type: 'checkbox',
          ...rowSelection,
        }}
        scroll={{ x: 1600, y: tableHeight() }}
        columns={columnsSort}
        className={styles.wrapper}
        {...tableProps}
      />
    </div>
  );
}

export default TheoryStudents;
