// 学员退学管理
import { useState, useContext } from 'react';
import {
  useOptions,
  useSearch,
  useTablePagination,
  useFetch,
  useForceUpdate,
  useConfirm,
  useHash,
  useVisible,
  useRequest,
  useInfo,
} from 'hooks';
import GlobalContext from 'globalContext';
import { useHistory } from 'react-router-dom';
import { _getInfo, _reviewStudentRetire, _cancelStuLation, _checkSbjectClassUploadInfo, _upReview } from './_api';
import { message, Modal, Tooltip, Drawer } from 'antd';
import { _checkAlreadySettlementAmount, _addSettlementAmount } from '../studentInfo/_api';
import { AuthButton, ButtonContainer, CustomTable, Search } from 'components';
import { _get, generateMenuMap, _handleIdCard } from 'utils';
import ApplyDropped from './ApplyDropped';
import SettlementRecords from '../../financial/settlementRecords';
import Details from '../studentInfo/StudentInfoDetail';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import promise from 'redux-promise';

function StudentDropped() {
  const { $menuTree } = useContext(GlobalContext);
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [_showDeleteConfirm] = useConfirm();
  const [_showConfirm] = useConfirm();
  const [visible, _switchVisible] = useVisible();
  const [agreeLoading, setAgreeLoading] = useState(false);
  const [refuseLoading, setRefuseLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const isapplyDropHash = useHash('isapply_drop'); // 申请状态
  const history = useHistory();
  const [currentRecord, setCurrentRecord] = useState(null);
  const [tipVisible, setTipVisible] = useState(false);
  const [detailsVisible, _switchDetailsVisible] = useVisible(); // 详情弹出框
  const [settlementRecordsVisible, setSettlementRecordsVisible] = useVisible(); // 结算记录

  const [_showInfo] = useInfo();

  const { loading: cancelationLoading, run } = useRequest(_cancelStuLation, {
    onSuccess: forceUpdate,
  });

  const { loading: upReviewLoading, run: upReviewRun } = useRequest(_upReview, {
    onSuccess: forceUpdate,
  });

  const goRecord = () => {
    const allMenu: object = generateMenuMap($menuTree);
    if (Object.prototype.hasOwnProperty.call(allMenu, 'orderRecord')) {
      history.push('./orderRecord');
      setTipVisible(false);
    } else {
      message.info('暂无权限，请联系系统管理员处理。');
    }
  };
  const columns = [
    { title: '学号', dataIndex: 'studentnum', width: 160 },
    { title: '学员姓名', dataIndex: 'name', width: 80 },
    {
      title: '证件号码',
      dataIndex: 'idcard',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    { title: '报名日期', dataIndex: 'stuApplyDate', width: 120 },
    { title: '申请日期', dataIndex: 'applytime', width: 160 },
    {
      title: '申请状态',
      dataIndex: 'isapply',
      render: (isapply: any, record: any) => {
        if (isapply === '3') {
          return (
            <Tooltip title={_get(record, 'respmsg', '').trim()}>
              <span style={{ color: PRIMARY_COLOR }}>{isapplyDropHash[isapply]}</span>
            </Tooltip>
          );
        }
        return isapplyDropHash[isapply];
      },
      width: 80,
    },
    { title: '退学理由', dataIndex: 'applymemo', width: 160 },
    { title: '经办人', dataIndex: 'applyname', width: 160 },
    { title: '核实时间', dataIndex: 'resptime1', width: 160 },
    { title: '审核人', dataIndex: 'checkname', width: 160 },
    {
      title: '操作',
      width: 280,
      dataIndex: 'operate',
      render: (_: void, record: any) => {
        const stuchargemode = _get(record, 'stuchargemode');
        /*
        学员收费模式
        0-线下收费
        1-托管一次性缴费
        2-托管分批缴费
        3-传统一笔冻结模式
        4-新支付监管模式(平安)
        5-传统多笔冻结模式
        */
        const isFundSettlement = ['1', '2', '3', '5']; //是否资金结算
        // eslint-disable-next-line no-lone-blocks
        {
          /* 申请状态为:
                0: "申请"
                1: "已提交"
                2: "同意"
                3: "拒绝"
                4: "撤销"
                5: "审核中"
                6: "待上报"
            */
        }
        return (
          <div>
            {_get(record, 'isapply') === '0' && (
              <AuthButton
                loading={_get(currentRecord, 'said') === _get(record, 'said') && agreeLoading}
                authId="student/studentDropped:btn2"
                onClick={async () => {
                  setCurrentRecord(record);

                  const tipShow = (
                    <div>
                      学员有待上传学时，
                      <div
                        onClick={_switchDetailsVisible}
                        style={{ color: 'red', display: 'inline-block', cursor: 'pointer' }}
                      >
                        点击此处
                      </div>
                      查看，退学后学时可能无法上传，请确认是否要先上传学时。
                    </div>
                  );
                  async function retire() {
                    setAgreeLoading(true);
                    const res1 = await _checkSbjectClassUploadInfo({ id: _get(record, 'said') });
                    if (_get(res1, 'code') === 9130) {
                      setAgreeLoading(false);
                      _showInfo({
                        title: '退学提醒',
                        content: tipShow,
                        okText: '知道了',
                        handleOk: () => {
                          retireCommon();
                        },
                      });
                      return;
                    }
                    await retireCommon();
                  }
                  async function retireCommon() {
                    const res = await _reviewStudentRetire(
                      { id: _get(record, 'said'), isapply: '2' },
                      { menuId: 'studentDropped', elementId: 'student/studentDropped:btn2' },
                    );
                    if (_get(res, 'code') === 200) {
                      message.success(_get(res, 'message'));
                    } else if (_get(res, 'code') === 9152) {
                      setTipVisible(true);
                    } else {
                      message.error(_get(res, 'message'));
                    }
                    setPagination({ ...pagination, current: 1 });
                    forceUpdate();
                    setAgreeLoading(false);
                  }

                  function contuidRetire() {
                    if (isFundSettlement.includes(stuchargemode) && _get(record, 'bankaccountflag') === '1') {
                      _showConfirm({
                        title: '退学前将先完成资金结算，并注销学员资金账户，是否继续？',
                        handleOk: retire,
                      });
                      return;
                    }

                    if (_get(record, 'stuchargemode') === '4' && _get(record, 'bankaccount')) {
                      _showConfirm({
                        title: '退学前将先完成资金结算，是否继续？',
                        handleOk: retire,
                      });
                      return;
                    }

                    retire();
                  }
                  const res = await _checkAlreadySettlementAmount({ sid: _get(record, 'sid') });
                  if (_get(res, 'code') === 200) {
                    _get(res, 'data') === false
                      ? Modal.info({
                          title: '温馨提醒',
                          closable: true,
                          okText: '确定',
                          content: (
                            <p>
                              该学员已结算资金总额与已学学时不一致，请
                              <div
                                onClick={setSettlementRecordsVisible}
                                style={{ color: 'red', display: 'inline-block', cursor: 'pointer' }}
                              >
                                点击此处
                              </div>
                              查看，确认仍要退学吗？
                            </p>
                          ),
                          async onOk() {
                            const resp = await _addSettlementAmount({
                              sid: _get(record, 'sid'),
                            });
                            if (_get(resp, 'code') !== 200) {
                              message.error(_get(resp, 'message'));
                              return;
                            }
                            contuidRetire();
                            return;
                          },
                        })
                      : contuidRetire();
                  }
                  if (_get(res, 'code') !== 200) {
                    message.error(_get(res, 'message'));
                    return;
                  }
                }}
                className="operation-button"
              >
                同意
              </AuthButton>
            )}
            {_get(record, 'isapply') === '0' && (
              <AuthButton
                loading={_get(currentRecord, 'said') === _get(record, 'said') && refuseLoading}
                authId="student/studentDropped:btn3"
                onClick={async () => {
                  setCurrentRecord(record);
                  setRefuseLoading(true);
                  const res = await _reviewStudentRetire(
                    { id: _get(record, 'said'), isapply: '3' },
                    { menuId: 'studentDropped', elementId: 'student/studentDropped:btn3' },
                  );
                  if (_get(res, 'code') === 200) {
                    setPagination({ ...pagination, current: 1 });
                    forceUpdate();
                  }

                  setRefuseLoading(false);
                }}
                className="operation-button"
              >
                拒绝
              </AuthButton>
            )}
            {/* 申请状态为申请0展示 */}
            <AuthButton
              insertWhen={_get(record, 'isapply') === '0'}
              loading={_get(currentRecord, 'said') === _get(record, 'said') && cancelLoading}
              authId="student/studentDropped:btn4"
              onClick={() =>
                _showDeleteConfirm({
                  handleOk: async () => {
                    setCurrentRecord(record);
                    setCancelLoading(true);
                    const res = await _reviewStudentRetire(
                      { id: _get(record, 'said'), isapply: '4' },
                      { menuId: 'studentDropped', elementId: 'student/studentDropped:btn4' },
                    );
                    if (_get(res, 'code') === 200) {
                      setPagination({ ...pagination, current: 1 });
                      forceUpdate();
                    }
                    setCancelLoading(false);
                  },
                })
              }
              className="operation-button"
            >
              撤销
            </AuthButton>

            <AuthButton
              insertWhen={
                _get(record, 'isapply') === '2' &&
                _get(record, 'unregisteredFlag') === '1' &&
                _get(record, 'interfaceType') !== '3'
              } //isapply=2 同意；unregisteredFlag监管是否删除1：未删除
              loading={_get(currentRecord, 'said') === _get(record, 'said') && cancelationLoading}
              authId="student/studentDropped:btn5"
              onClick={() => {
                const interfaceType = _get(record, 'interfaceType'); // 1-解除备案 2-注销 3-监管审核
                if (interfaceType === '0') {
                  return message.info('无需进行监管注销');
                }
                setCurrentRecord(record);
                _showConfirm({
                  title:
                    interfaceType === '1'
                      ? '监管平台将解除学员备案，学员跨驾校学习学时信息将被保留，确认继续吗？'
                      : '监管平台将删除学员信息，学员跨驾校学习学时信息将不被保留，确认继续吗？',
                  handleOk: () => {
                    run({ id: _get(record, 'said') });
                  },
                });
              }}
              className="operation-button"
            >
              监管注销
            </AuthButton>

            <AuthButton
              insertWhen={_get(record, 'isapply') === '0'}
              loading={_get(currentRecord, 'said') === _get(record, 'said') && upReviewLoading}
              authId="student/studentDropped:btn6"
              onClick={async () => {
                setCurrentRecord(record);
                const res = await _checkAlreadySettlementAmount({ sid: _get(record, 'sid') });
                if (_get(res, 'code') === 200) {
                  _get(res, 'data') === false
                    ? Modal.info({
                        title: '温馨提醒',
                        closable: true,
                        okText: '确定',
                        content: (
                          <p>
                            该学员已结算资金总额与已学学时不一致，请
                            <div
                              onClick={setSettlementRecordsVisible}
                              style={{ color: 'red', display: 'inline-block', cursor: 'pointer' }}
                            >
                              点击此处
                            </div>
                            查看，确认仍要退学吗？
                          </p>
                        ),
                        async onOk() {
                          const resp = await _addSettlementAmount({
                            sid: _get(record, 'sid'),
                          });
                          if (_get(resp, 'code') !== 200) {
                            message.error(_get(resp, 'message'));
                            return;
                          }
                          _showConfirm({
                            title: '此操作将向监管发起注销申请，审核通过后，学员学时将不被保留，确认仍要操作吗？',
                            handleOk() {
                              upReviewRun({
                                sid: record?.sid,
                                said: record?.said,
                                stunum: record?.stunum,
                                reason: record?.applymemo,
                              });
                            },
                          });
                          return;
                        },
                      })
                    : _showConfirm({
                        title: '此操作将向监管发起注销申请，审核通过后，学员学时将不被保留，确认仍要操作吗？',
                        handleOk() {
                          upReviewRun({
                            sid: record?.sid,
                            said: record?.said,
                            stunum: record?.stunum,
                            reason: record?.applymemo,
                          });
                        },
                      });
                }
                if (_get(res, 'code') !== 200) {
                  message.error(_get(res, 'message'));
                  return;
                }
              }}
              className="operation-button"
            >
              监管注销审核
            </AuthButton>
          </div>
        );
      },
    },
  ];

  // FIXME:wy
  const { isLoading, data } = useFetch<any>({
    request: _getInfo,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      applydatebegin: _get(search, 'applydatebegin'),
      applydateend: _get(search, 'applydateend'),
      name: _get(search, 'name'),
      idcard: _get(search, 'idcard'),
      isapply: _get(search, 'isapply'),
      stuApplyDateStart: _get(search, 'stuApplyDateStart'),
      stuApplyDateEnd: _get(search, 'stuApplyDateEnd'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });
  return (
    <>
      {visible && (
        <ApplyDropped
          onCancel={() => {
            _switchVisible();
          }}
          onOk={() => {
            _switchVisible();
            setPagination({ ...pagination, current: 1 });
            forceUpdate();
          }}
        />
      )}
      {settlementRecordsVisible && (
        <Drawer
          destroyOnClose
          visible
          width={900}
          title={'结算记录'}
          onClose={setSettlementRecordsVisible}
          maskClosable={false}
        >
          <SettlementRecords
            idcard={_get(currentRecord, 'idcard')}
            sid={_get(currentRecord, 'sid')}
            type="studentInfo"
          />
        </Drawer>
      )}
      {
        <Modal visible={tipVisible} footer={null} onCancel={() => setTipVisible(false)}>
          <p>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            学员有未完成的预约记录，请<a onClick={goRecord}>点击此处</a>处理后再次操作
          </p>
        </Modal>
      }

      {detailsVisible && (
        <Details
          onCancel={_switchDetailsVisible}
          currentRecord={currentRecord}
          sid={_get(currentRecord, 'sid', '')}
          defaultActiveKey={'2'}
        />
      )}

      <Search
        loading={isLoading}
        filters={[
          {
            type: 'RangePicker',
            field: ['applydatebegin', 'applydateend'],
            placeholder: ['申请日期起', '申请日期止'],
          },
          { type: 'Input', field: 'name', placeholder: '学员姓名' },
          { type: 'Input', field: 'idcard', placeholder: '证件号码' },
          {
            type: 'Select',
            field: 'isapply',
            options: [{ value: '', label: '审核状态(全部)' }, ...useOptions('isapply_drop', false, '-1', ['1'])], // 1:已提交，此处要排除已提交
          },
          {
            type: 'RangePicker',
            field: ['stuApplyDateStart', 'stuApplyDateEnd'],
            placeholder: ['报名日期起', '报名日期止'],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          setPagination({ ...pagination, current: 1 });
          forceUpdate();
        }}
        showSearchButton={false}
      />
      <ButtonContainer
        showSearchButton={true}
        refreshTable={() => {
          setPagination({ ...pagination, current: 1 });
          forceUpdate();
        }}
        loading={isLoading}
      >
        <AuthButton
          authId="student/studentDropped:btn1"
          type="primary"
          onClick={() => {
            _switchVisible();
          }}
          className="mb20"
        >
          退学申请
        </AuthButton>
      </ButtonContainer>

      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey={(record: any) => _get(record, 'said')}
        pagination={tablePagination}
      />
    </>
  );
}

export default StudentDropped;
