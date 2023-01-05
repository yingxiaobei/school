// 学员结业管理
import { useState, useContext } from 'react';
import {
  useSearch,
  useTablePagination,
  useFetch,
  useForceUpdate,
  useHash,
  useVisible,
  useOptions,
  useRequest,
} from 'hooks';
import { _getStudentFace, _getFileUrl, _upload, _exportGraduatesListBefore, _export } from './_api';
import { _getStudentList } from 'api';
import { message, Popover, Button } from 'antd';
import { AuthButton, ButtonContainer, CustomTable, Search } from 'components';
import Add from './Add';
import ReviewResult from './ReviewResult';
import { PRIMARY_COLOR } from 'constants/styleVariables';
import Details from '../studentInfo/StudentInfoDetail';
import GraduateReview from './GraduateReview';
import GraduateReset from './GraduateReset';
import { DownloadOutlined } from '@ant-design/icons';
import GlobalContext from 'globalContext';
import { useHistory } from 'react-router-dom';
import { downloadFile, _get, generateMenuMap, _handleIdCard } from 'utils';
import Appendix from './Appendix';

function StudentGraduate() {
  const [search, _handleSearch] = useSearch();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [ignore, forceUpdate] = useForceUpdate();
  const [visible, _switchVisible] = useVisible();
  const [graduateVisible, _switchGraduateVisible] = useVisible();
  const [resetVisible, _switchResetVisible] = useVisible();
  const [reviewVisible, _switchReviewVisible] = useVisible();
  const [currentRecord, setCurrentRecord] = useState({});
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const { $menuTree } = useContext(GlobalContext);
  const history = useHistory();
  const [sid, setSid] = useState('');
  const [appendixVisible, _switchAddEditVisible] = useVisible();

  const isApplyStuHAsh = useHash('isapply_stu');

  const { loading: uploadLoading, run: uploadRun } = useRequest(_upload, {
    onSuccess: () => {
      forceUpdate();
    },
  });
  const goRecord = () => {
    const allMenu: object = generateMenuMap($menuTree);
    if (Object.prototype.hasOwnProperty.call(allMenu, 'orderRecord')) {
      history.push('./orderRecord');
    } else {
      message.info('暂无权限，请联系系统管理员处理。');
    }
  };
  const columns = [
    {
      title: '学员姓名',
      dataIndex: 'name',
      render: (name: string, record: any) => {
        return (
          <span
            className="pointer"
            style={{ color: PRIMARY_COLOR }}
            onClick={() => {
              _switchDetailsVisible();
              setSid(_get(record, 'sid'));
              setCurrentRecord(record);
            }}
          >
            {name}
          </span>
        );
      },
      width: 80,
    },
    {
      title: '学员证件号',
      dataIndex: 'idcard',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    { title: '车型', dataIndex: 'traintype', width: 40 },
    { title: '申请人', dataIndex: 'applyname', width: 130 },
    { title: '申请时间', dataIndex: 'createtime', width: 150 },
    { title: '结业证号', dataIndex: 'JYZNUMCODE', width: 130 },
    {
      title: '核实说明',
      width: 130,
      dataIndex: 'respmsg',
      render: (respmsg: string) =>
        respmsg && (
          <Popover
            getPopupContainer={() => {
              return document.getElementById('pop') || document.body;
            }}
            content={
              respmsg === '学员有未完成的预约记录，请点击此处处理后再次操作' ? (
                <p>
                  {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                  学员有未完成的预约记录，请<a onClick={goRecord}>点击此处</a>
                  处理后再次操作。此处有跳转链接，可以跳转到预约记录。
                </p>
              ) : (
                <p>{respmsg}</p>
              )
            }
          >
            <Button type="link">原因</Button>
          </Popover>
        ),
    },
    { title: '核实状态', dataIndex: 'isapply', width: 120, render: (isapply: string) => isApplyStuHAsh[isapply] },
    {
      title: '操作',
      dataIndex: 'operate',
      width: 130,
      render: (_: void, record: any) => (
        <div>
          <AuthButton
            authId="student/studentGraduate:btn2"
            insertWhen={_get(record, 'isCertproclassOfZj') !== '1'}
            onClick={async () => {
              const res = await _getFileUrl({ id: _get(record, 'sid') });
              if (_get(res, 'code') === 200) {
                window.open(_get(res, 'data'));
              } else {
                message.error(_get(res, 'message'));
              }
            }}
            className="operation-button"
          >
            结业证查看
          </AuthButton>
          <AuthButton
            insertWhen={_get(record, 'isCertproclassOfZj') === '1'}
            authId="student/studentGraduate:btn2"
            onClick={() => {
              setSid(_get(record, 'sid'));
              _switchAddEditVisible();
            }}
            className="operation-button"
          >
            附件查看
          </AuthButton>
          {/*isapply:0 待审核 */}
          {_get(record, 'isapply') === '0' && (
            <AuthButton
              loading={_get(currentRecord, 'said') === _get(record, 'said') && uploadLoading}
              authId="student/studentGraduate:btn3"
              className="operation-button"
              onClick={() => {
                setCurrentRecord(record);
                uploadRun({ said: _get(record, 'said') });
              }}
            >
              上传
            </AuthButton>
          )}
        </div>
      ),
    },
  ];

  const { isLoading, data } = useFetch({
    request: _getStudentFace,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      sdate: _get(search, 'sdate'),
      edate: _get(search, 'edate'),
      idcard: _get(search, 'idcard'),
      name: _get(search, 'name'),
      isapply: _get(search, 'isapply'),
      sid: _get(search, 'sid'),
      traintype: _get(search, 'traintype'),
    },
    depends: [ignore, pagination.current, pagination.pageSize],
    callback: (data) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  function _handleOk() {
    _switchVisible();
    forceUpdate();
    setPagination({ ...pagination, current: 1 });
  }

  return (
    <div id="pop">
      {visible && <Add onCancel={_switchVisible} onOk={_handleOk} />}

      {appendixVisible && <Appendix onCancel={_switchAddEditVisible} sid={sid} />}

      {detailsVisible && <Details onCancel={_switchDetailsVisible} sid={sid} currentRecord={currentRecord} />}

      {/* 结业审核 */}
      {graduateVisible && <GraduateReview onCancel={_switchGraduateVisible} _forceUpdate={forceUpdate} />}

      {/* 重置结业 */}
      {resetVisible && (
        <GraduateReset
          onCancel={_switchResetVisible}
          onOk={() => {
            _switchResetVisible();
            forceUpdate();
          }}
        />
      )}

      {reviewVisible && (
        <ReviewResult
          onCancel={_switchReviewVisible}
          currentRecord={currentRecord}
          onOk={() => {
            _switchReviewVisible();
            forceUpdate();
            setPagination({ ...pagination, current: 1 });
          }}
        />
      )}

      <Search
        showSearchButton={false}
        loading={isLoading}
        filters={[
          {
            type: 'RangePicker',
            field: ['sdate', 'edate'],
            placeholder: ['申请日期开始', '申请日期结束'],
          },
          {
            type: 'SimpleSelectOfStudent',
            field: 'sid',
          },
          {
            type: 'Select',
            field: 'isapply',
            options: [{ value: '', label: '核实状态(全部)' }, ...useOptions('isapply_stu')],
          },
          {
            type: 'Select',
            field: 'traintype',
            options: [{ value: '', label: '培训车型(全部)' }, ...useOptions('business_scope')],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          setPagination({ ...pagination, current: 1 });
          forceUpdate();
        }}
        simpleStudentRequest={_getStudentList}
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
          authId="student/studentGraduate:btn1"
          type="primary"
          className="mr20 mb20"
          onClick={() => {
            _switchVisible();
          }}
        >
          结业申请
        </AuthButton>
        <AuthButton
          authId="student/studentGraduate:btn4"
          type="primary"
          className="mr20 mb20"
          onClick={() => {
            _switchGraduateVisible();
          }}
        >
          结业审核
        </AuthButton>
        <AuthButton
          authId="student/studentGraduate:btn5"
          className="mr20 mb20"
          icon={<DownloadOutlined />}
          onClick={async () => {
            const query = {
              sdate: _get(search, 'sdate'),
              edate: _get(search, 'edate'),
              idcard: _get(search, 'idcard'),
              name: _get(search, 'name'),
              isapply: _get(search, 'isapply'),
              sid: _get(search, 'sid'),
            };

            const res = await _exportGraduatesListBefore(query);

            if (_get(res, 'code') === 200) {
              _export(query).then((res: any) => {
                downloadFile(res, '结业名单', 'application/vnd.ms-excel', 'xlsx');
              });
            } else {
              message.error(_get(res, 'message'));
            }
          }}
        >
          导出
        </AuthButton>
        <AuthButton
          authId="student/studentGraduate:btn6"
          type="primary"
          onClick={() => {
            _switchResetVisible();
          }}
        >
          重置结业
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
    </div>
  );
}

export default StudentGraduate;
