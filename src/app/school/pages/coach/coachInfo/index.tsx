// 教练信息管理
import { useEffect, useState, useContext, useMemo, useCallback } from 'react';
import {
  useOptions,
  useSearch,
  useTablePagination,
  useFetch,
  useForceUpdate,
  useVisible,
  useConfirm,
  useHash,
  useRequest,
} from 'hooks';
import {
  _getInfo,
  _logoutPerson,
  _record,
  _changeStatus,
  _updateCoaIdauth,
  _exportBefore,
  _export,
  _recordDeleteCoach,
} from './_api';
import { message, Tooltip } from 'antd';
import AddOrEdit from './AddOrEdit';
import Details from './Details';
import { AuthButton, Search, MoreOperation, CustomTable, ButtonContainer } from 'components';
import { Auth, _get, _handleIdCard, _handlePhone } from 'utils';
import { QuestionCircleOutlined } from '@ant-design/icons';
import BindIdCard from './BindIdCard';
import NoCardSoftWare from '../../student/studentInfo/NoCardSoftWare';
import { _clearDeviceCache, _getCoachExamineResult, _getCustomParam } from 'api';
import NoVerify from './NoVerify';
import moment from 'moment';
import { UpdatePlugin } from 'components';
import { isForceUpdatePlugin, downloadFile } from 'utils';
import { DownloadOutlined } from '@ant-design/icons';
import Simulate from './Simulate';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import GlobalContext from 'globalContext';
import bindCardCommon from 'utils/bindCard';
import SyncCoachInfo from './components/syncCoachInfo';
import { useMultipleChoice } from './hooks/useMultipleChoice';
import ChangeAppPhone from './ChangeAppPhone';
interface ICoachInfo {
  customSchoolId?: string;
  detailAuthId?: 'coach/coachInfo:btn1' | 'publicServicePlatform/coachSearch:btn1';
  type?: 'coachInfo' | 'coachSearch';
}

export default function CoachInfo(props: ICoachInfo) {
  const { customSchoolId = '', detailAuthId = 'coach/coachInfo:btn1', type = 'coachInfo' } = props;
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [currentId, setCurrentId] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [visible, _switchVisible] = useVisible();
  const [simulateVisible, _switchSimulateVisible] = useVisible();
  const [_showConfirm] = useConfirm();
  const [updatePluginVisible, setUpdatePluginVisible] = useVisible();
  const [devClearVisible, setDevClearVisible] = useVisible();

  const employStatusHash = useHash('coa_master_status'); // 供职状态
  const registeredExamFlagHash = useHash('registered_flag_type'); // 备案标记
  const coachtypeHash = useHash('coach_type'); // 教练类型
  const [changeAppPhoneVisible, setChangeAppPhoneVisible] = useVisible();
  const [noSoftWareVisible, setNoSoftWareVisible] = useVisible();
  const [idCardId, setIdCardId] = useState(); //身份证物理卡号
  const [certNum, setCertNum] = useState(); //身份证号
  const [bindIdCardVisible, setBindIdCardVisible] = useVisible();
  const [loading, setLoading] = useState(false);
  const [noVerifyVisible, setNoVerifyVisible] = useVisible();
  const isSupportMultipleChoice = useMultipleChoice();
  const [record, setRecord] = useState({});
  // 12-16 同步省监管信息 镇江特定功能
  const [syncInfoVisible, setSyncInfoVisible] = useState(false);

  const { $areaNum, $isForceUpdatePlugin } = useContext(GlobalContext);
  const { data: roleData } = useFetch({
    request: _getCustomParam, // 0：国交 1：至正 2 ：福建
    query: { paramCode: 'jg_request_platform_type', schoolId: Auth.get('schoolId') },
  });

  const isRecord = _get(roleData, 'paramValue') === '0';

  const { loading: deleteLoading, run: deleteRun } = useRequest(_logoutPerson, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  const { loading: registerLoading, run: registerRun } = useRequest(_record, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  // 停教
  const { loading: stopTeachLoading, run: stopTeachRun } = useRequest(_changeStatus, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  // 在教
  const { loading: startTeachLoading, run: startTeachRun } = useRequest(_changeStatus, {
    onSuccess: () => {
      setPagination({ ...pagination, current: 1 });
      forceUpdate();
    },
  });

  const { loading: resultLoading, run: resultRun } = useRequest(_getCoachExamineResult);

  const isHeNan = $areaNum === '01';

  async function bindCard() {
    setBindIdCardVisible();

    if ($isForceUpdatePlugin) {
      return setUpdatePluginVisible();
    }

    setLoading(true);
    const result = await bindCardCommon();
    setLoading(false);
    if (result === 'update') {
      return setNoSoftWareVisible();
    }
    setIdCardId(_get(result, 'cardNo', '')); //物理卡号
    setCertNum(_get(result, 'data.idNo', '')); //身份证号
  }

  // 同步省省监管信息
  const synchronizedInformation = useCallback(() => {
    setSyncInfoVisible(true);
  }, []);

  const columns = [
    {
      title: '姓名',
      width: 80,
      dataIndex: 'coachname',
    },
    {
      title: '身份证号',
      width: 150,
      dataIndex: 'idcard',
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '联系电话',
      width: 150,
      dataIndex: 'mobile',
      render: (value: any, record: any) => _handlePhone(value),
    },
    {
      title: '准教车型',
      width: 80,
      dataIndex: 'teachpermitted',
    },
    {
      title: '教练员类型',
      width: 90,
      dataIndex: 'coachtype',
      render: (coachtype: any) => coachtypeHash[coachtype],
    },
    {
      title: '供职状态',
      width: 80,
      dataIndex: 'employstatus',
      render: (employstatus: string, record: any) =>
        employstatus === '07' ? ( //禁训
          <Tooltip color={'#333'} className="mr20" placement="right" title={_get(record, 'forbidmsg', '')}>
            {employStatusHash[employstatus]} <QuestionCircleOutlined />
          </Tooltip>
        ) : (
          employStatusHash[employstatus]
        ),
    },
    {
      title: '备案状态',
      width: 80,
      dataIndex: 'registered_Flag',
      render: (registered_Flag: any, record: any) => {
        //  12-13 新增枚举 备案失败
        if (registered_Flag === '3' || registered_Flag === '5') {
          return (
            // 11-10 备案失败效果
            <Tooltip title={record['message']}>
              <span style={{ color: PRIMARY_COLOR }}>{registeredExamFlagHash[registered_Flag]}</span>
            </Tooltip>
          );
        }
        return registeredExamFlagHash[registered_Flag];
      },
    },
    {
      title: '统一编码',
      width: 80,
      dataIndex: 'coachnum',
    },
    {
      title: '继续教育到期时间',
      width: 80,
      dataIndex: 'continulearnenddate',
    },
    {
      title: '操作',
      width: 180,
      dataIndex: 'operate',
      render: (_: void, record: any) => {
        const idauthcloseddeadline = _get(record, 'idauthcloseddeadline');
        const isExpire = idauthcloseddeadline
          ? moment(moment().format('YYYY-MM-DD')).diff(moment(idauthcloseddeadline)) > 0
          : true;

        return (
          // "00":'注册','01':'在教','02':'停教','03':'转校',05':'注销','07':'禁训'
          // Note: 当教练的供职状态是转校的情况下 只支持查看详情
          <>
            <AuthButton
              authId={detailAuthId}
              onClick={() => {
                _switchDetailsVisible();
                setCurrentId(_get(record, 'cid'));
              }}
              className="operation-button"
            >
              详情
            </AuthButton>
            {/* 05注销 */}
            <AuthButton
              insertWhen={
                type === 'coachInfo' &&
                _get(record, 'employstatus') !== '05' &&
                _get(record, 'registered_Flag') !== '1' &&
                _get(record, 'employstatus') !== '07' &&
                _get(record, 'employstatus') !== '03'
              }
              authId="coach/coachInfo:btn2"
              onClick={() => {
                _switchVisible();
                setCurrentId(_get(record, 'cid'));
                setIsEdit(true);
              }}
              className="operation-button"
            >
              编辑
            </AuthButton>

            {type === 'coachInfo' && _get(record, 'employstatus') !== '03' && (
              <MoreOperation>
                <AuthButton
                  insertWhen={
                    _get(record, 'employstatus') !== '05' &&
                    _get(record, 'registered_Flag') !== '1' &&
                    _get(record, 'employstatus') !== '07'
                  }
                  loading={_get(currentRecord, 'cid') === _get(record, 'cid') && deleteLoading}
                  authId="coach/coachInfo:btn3"
                  onClick={() =>
                    _showConfirm({
                      title: '注销后，将不可操作该信息，如已备案，将删除已有备案信息，是否继续注销',
                      handleOk: async () => {
                        setCurrentRecord(record);
                        deleteRun({ cid: _get(record, 'cid'), type: '1' });
                      },
                    })
                  }
                  className="operation-button"
                  isInline
                >
                  注销
                </AuthButton>
                {/* 备案标记-  0 :未备案，1: 备案审核中   2: 备案同意启用 3: 备案不同意启用  4：编辑后待重新备案  5: 备案失败*/}
                <AuthButton
                  insertWhen={
                    (_get(record, 'registered_Flag') === '0' ||
                      _get(record, 'registered_Flag') === '4' ||
                      _get(record, 'registered_Flag') === '5') &&
                    _get(record, 'employstatus') !== '05' &&
                    _get(record, 'employstatus') !== '07'
                  }
                  loading={_get(currentRecord, 'cid') === _get(record, 'cid') && registerLoading}
                  authId="coach/coachInfo:btn4"
                  className="operation-button"
                  onClick={async () => {
                    setCurrentRecord(record);
                    registerRun({ id: _get(record, 'cid'), type: '1' });
                  }}
                  isInline
                >
                  备案
                </AuthButton>
                <AuthButton
                  insertWhen={
                    (_get(record, 'employstatus') === '00' && _get(record, 'registered_Flag') !== '3') ||
                    _get(record, 'employstatus') === '01'
                  }
                  authId="coach/coachInfo:btn5"
                  onClick={async () => {
                    setCurrentId(_get(record, 'cid'));
                    setCurrentRecord(record);
                    bindCard();
                  }}
                  className="operation-button"
                  isInline
                >
                  绑定二代证
                </AuthButton>
                {/* // "00":'注册','01':'在教','02':'停教','05':'注销', */}
                <AuthButton
                  insertWhen={_get(record, 'employstatus') === '02'}
                  authId="coach/coachInfo:btn7"
                  loading={_get(currentRecord, 'cid') === _get(record, 'cid') && startTeachLoading}
                  className="operation-button"
                  onClick={() => {
                    // '02':'停教'
                    if (_get(record, 'employstatus') === '02') {
                      _showConfirm({
                        title: '是否要恢复该教练为在教？',
                        handleOk: async () => {
                          setCurrentRecord(record);
                          startTeachRun(
                            { cid: _get(record, 'cid'), status: '01', type: '1' },
                            { menuId: 'coachInfo', elementId: 'coach/coachInfo:btn7' },
                          );
                        },
                      });
                    }
                  }}
                  isInline
                >
                  在教
                </AuthButton>
                <AuthButton
                  insertWhen={_get(record, 'employstatus') === '01'}
                  loading={_get(currentRecord, 'cid') === _get(record, 'cid') && stopTeachLoading}
                  authId="coach/coachInfo:btn8"
                  className="operation-button"
                  onClick={() =>
                    _showConfirm({
                      title: '停教后，教练不能签到，确认停教吗',
                      handleOk: async () => {
                        setCurrentRecord(record);
                        stopTeachRun(
                          { cid: _get(record, 'cid'), status: '02', type: '1' },
                          { menuId: 'coachInfo', elementId: 'coach/coachInfo:btn8' },
                        );
                      },
                    })
                  }
                  isInline
                >
                  停教
                </AuthButton>
                {/* 备案审核中才显示 */}
                <AuthButton
                  insertWhen={_get(record, 'registered_Flag', '') === '1' && _get(record, 'employstatus') !== '07'}
                  loading={_get(currentRecord, 'cid') === _get(record, 'cid') && resultLoading}
                  authId="coach/coachInfo:btn9"
                  className="operation-button"
                  onClick={async () => {
                    setCurrentRecord(record);
                    resultRun({ id: _get(record, 'cid', ''), type: 1 });
                  }}
                  isInline
                >
                  获取审核结果
                </AuthButton>
                <AuthButton
                  //判断免签日期过期则显示免签；身份认证关闭标志(免签)  0-开启, 1-关闭
                  insertWhen={
                    (isExpire || _get(record, 'idauthclosed', '') !== '1') && _get(record, 'employstatus') !== '07'
                  }
                  authId="coach/coachInfo:btn10"
                  className="operation-button"
                  onClick={() => {
                    setCurrentId(_get(record, 'cid'));
                    setNoVerifyVisible();
                  }}
                  isInline
                >
                  免签
                </AuthButton>
                <AuthButton
                  //身份认证关闭标志(免签)  0-开启, 1-关闭
                  insertWhen={
                    !isExpire && _get(record, 'idauthclosed', '') === '1' && _get(record, 'employstatus') !== '07'
                  }
                  authId="coach/coachInfo:btn11"
                  loading={_get(currentRecord, 'cid') === _get(record, 'cid') && cancelLoading}
                  className="operation-button"
                  onClick={() => {
                    setCurrentId(_get(record, 'cid'));
                    cancelRun({ cid: currentId, idauthclosed: '0' });
                  }}
                  isInline
                >
                  取消免签
                </AuthButton>
                <AuthButton
                  authId="coach/coachInfo:btn15"
                  className="operation-button"
                  insertWhen={
                    (_get(record, 'registered_Flag') === '2' || _get(record, 'registered_Flag') === '1') && isRecord
                  }
                  onClick={() => {
                    _showConfirm({
                      title: '确定要解除该备案？',
                      handleOk: async () => {
                        _recordDeleteCoach({ id: _get(record, 'cid'), type: '1' }).then((res: any) => {
                          if (res.code === 200) forceUpdate();
                        });
                      },
                    });
                  }}
                  isInline
                >
                  解除备案
                </AuthButton>
                <AuthButton
                  authId="coach/coachInfo:btn17"
                  loading={devClearVisible}
                  onClick={() => {
                    setDevClearVisible();
                    console.log(record);
                    _clearDeviceCache({
                      clearType: '1',
                      coachNum: _get(record, 'coachnum'),
                    })
                      .then((res: any) => {
                        if (res.code !== 200) {
                          setDevClearVisible();
                        } else {
                          forceUpdate();
                          setDevClearVisible();
                        }
                      })
                      .catch((res) => {
                        setDevClearVisible();
                      });
                  }}
                  className="operation-button"
                  isInline
                >
                  设备同步
                </AuthButton>
                <AuthButton
                  authId="coach/coachInfo:btn18"
                  onClick={() => {
                    setChangeAppPhoneVisible();
                    setCurrentId(_get(record, 'cid'));
                  }}
                  insertWhen={
                    //在教、停教、禁训展示修改手机号
                    _get(record, 'employstatus') === '01' ||
                    _get(record, 'employstatus') === '02' ||
                    _get(record, 'employstatus') === '07'
                  }
                  className="operation-button"
                  isInline
                >
                  修改APP登录手机号
                </AuthButton>
              </MoreOperation>
            )}
          </>
        );
      },
    },
  ];

  const { isLoading, data } = useFetch({
    request: _getInfo,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      type: '1',
      coachname: _get(search, 'coachname'),
      idcard: _get(search, 'idcard'),
      registeredFlag: _get(search, 'registeredFlag'),
      employstatus: _get(search, 'employstatus'),
      teachpermitted: _get(search, 'teachpermitted'),
      mobile: _get(search, 'mobile'),
    },
    customHeader: { customSchoolId },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  useEffect(() => {
    forceUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customSchoolId]);

  function _handleOk() {
    _switchVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  function _handleAdd() {
    setCurrentId(null);
    _switchVisible();
    setIsEdit(false);
  }

  const { loading: cancelLoading, run: cancelRun } = useRequest(_updateCoaIdauth, {
    onSuccess: forceUpdate,
  });

  return (
    <div style={{ width: '100%' }}>
      {/* 修改登录APP手机号 */}
      <ChangeAppPhone
        visible={changeAppPhoneVisible}
        handleCancel={() => {
          setChangeAppPhoneVisible();
          forceUpdate();
          setCurrentId(null);
        }}
        recordId={currentId}
      />
      {/* 优化动画交互 */}
      {/* 同步车辆信息 */}
      <SyncCoachInfo
        visible={syncInfoVisible}
        switchVisible={setSyncInfoVisible}
        onSuccess={() => {
          setPagination({ ...pagination, current: 1 });
          forceUpdate();
        }}
      />
      <Details
        visible={detailsVisible}
        onCancel={() => {
          _switchDetailsVisible();
          forceUpdate();
        }}
        currentId={currentId}
        customSchoolId={customSchoolId}
        isHeNan={isHeNan}
        isSupportMultipleChoice={isSupportMultipleChoice}
      />
      {visible && (
        <AddOrEdit
          onCancel={_switchVisible}
          onOk={_handleOk}
          currentId={currentId}
          isEdit={isEdit}
          title={isEdit ? '编辑教练' : '新增教练'}
          isHeNan={isHeNan}
          isSupportMultipleChoice={isSupportMultipleChoice}
        />
      )}
      {noVerifyVisible && (
        <NoVerify
          onCancel={setNoVerifyVisible}
          onOk={() => {
            setNoVerifyVisible();
            forceUpdate();
          }}
          currentId={currentId}
        />
      )}
      {simulateVisible && <Simulate onCancel={_switchSimulateVisible} />}
      <Search
        loading={isLoading}
        filters={[
          { type: 'Input', field: 'coachname', placeholder: '教练姓名' },
          { type: 'Input', field: 'idcard', placeholder: '证件号码' },
          { type: 'Input', field: 'mobile', placeholder: '联系电话' },
          {
            type: 'Select',
            field: 'registeredFlag',
            options: [{ value: '', label: '备案状态(全部)' }, ...useOptions('registered_flag_type')],
          }, //备案状态
          {
            type: 'Select',
            field: 'employstatus',
            options: [{ value: '', label: '供职状态(全部)' }, ...useOptions('coa_master_status')],
          }, //供职状态
          {
            type: 'Select',
            field: 'teachpermitted',
            options: [{ value: '', label: '准教车型(全部)' }, ...useOptions('trans_car_type')],
          }, //准教车型
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          if (type === 'coachSearch' && !customSchoolId) {
            return message.info('请先选择培训机构');
          }
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
        showSearchButton={false}
      />
      <ButtonContainer
        showSearchButton={true}
        refreshTable={() => {
          if (type === 'coachSearch' && !customSchoolId) {
            return message.info('请先选择培训机构');
          }
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
        loading={isLoading}
      >
        <AuthButton
          authId="coach/coachInfo:btn6"
          insertWhen={type === 'coachInfo'}
          type="primary"
          onClick={_handleAdd}
          className="mb20 mr20"
        >
          新增
        </AuthButton>

        <AuthButton
          authId="coach/coachInfo:btn12"
          className="mb20 mr20"
          icon={<DownloadOutlined />}
          onClick={async () => {
            const query = {
              type: '1',
              coachname: _get(search, 'coachname', ''),
              idcard: _get(search, 'idcard', ''),
              registeredFlag: _get(search, 'registeredFlag', ''),
              employstatus: _get(search, 'employstatus', ''),
              teachpermitted: _get(search, 'teachpermitted', ''),
              mobile: _get(search, 'mobile', ''),
            };

            const res = await _exportBefore(query);

            if (_get(res, 'code') === 200) {
              _export(query).then((res: any) => {
                downloadFile(res, '教练员名单', 'application/vnd.ms-excel', 'xlsx');
              });
            } else {
              message.error(_get(res, 'message'));
            }
          }}
        >
          导出
        </AuthButton>

        <AuthButton
          authId="coach/coachInfo:btn13"
          type="primary"
          onClick={_switchSimulateVisible}
          className="mb20 mr20"
        >
          模拟器教练员
        </AuthButton>

        {/*  12-16 同步省监管 */}
        <AuthButton
          authId="coach/coachInfo:btn16"
          type="primary"
          onClick={synchronizedInformation}
          className="mb20 mr20"
          // insertWhen={isZhenJiang}
        >
          同步省监管信息
        </AuthButton>
      </ButtonContainer>
      {updatePluginVisible && <UpdatePlugin onCancel={setUpdatePluginVisible} info="无法进行绑定身份证" />}
      {bindIdCardVisible && (
        <BindIdCard
          onCancel={setBindIdCardVisible}
          onOk={() => {
            setBindIdCardVisible();
            forceUpdate();
          }}
          currentId={currentId}
          currentRecord={currentRecord}
          idCardId={idCardId}
          certNum={certNum}
          setNoSoftWareVisible={setNoSoftWareVisible}
          loading={loading}
          type="1"
        />
      )}
      {noSoftWareVisible && <NoCardSoftWare onCancel={setNoSoftWareVisible} />}
      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record: any) => _get(record, 'cid')}
        pagination={tablePagination}
      />
    </div>
  );
}
