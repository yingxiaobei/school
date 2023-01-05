import { useState } from 'react';
import { message, Button } from 'antd';
import { AuthButton, CustomTable, Search } from 'components';
import { _exportStudentBefore, _getList, _export, _cancelStudent } from './_api';
import { _getListAssociated, _getCoachList } from '../studentInfo/_api';
import { useTablePro, useHash, useOptions, useVisible, useFetch, useRequest, useConfirm } from 'hooks';
import AddOrEdit from '../studentInfo/AddOrEdit';
import Details from '../forecastReview/Details';
import { _getTeachInfo } from 'api';
import { UpdatePlugin, ButtonContainer } from 'components';
import { Auth, downloadFile, _get, _handleIdCard, _handlePhone } from 'utils';
import ReadIdCard from 'components/ReadIdCard';
import { FiltersType } from 'components/Search';

export default function ForecastExpected(props: any) {
  const { isChecked = false } = props; //是否预报名审核
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [confirmation, setConfirmation] = useState(false); // 是否转正

  const [updatePluginVisible, setUpdatePluginVisible] = useVisible();
  const [_showConfirm] = useConfirm();
  const {
    tableProps,
    search,
    _refreshTable,
    setCurrentRecord,
    currentRecord,
    _handleSearch,
    _handleAdd,
    isEdit,
    _handleEdit,
    isAddOrEditVisible,
    _switchIsAddOrEditVisible,
    _handleOk,
  } = useTablePro({
    request: _getList,
    extraParams: isChecked ? { checkerschoolid: Auth.get('schoolId') } : {},
  });
  const businessTypeHash = useHash('businessType'); // 业务类型
  const checkstatusSign = useHash('checkstatus_sign'); // 审核状态
  const [loading, setLoading] = useState(false);
  const checkstatusSignOptions = useOptions('checkstatus_sign');
  const businessScopeOptions = useOptions('business_scope');

  const { data: schoolData = [] } = useFetch({
    request: _getListAssociated,
  });
  const schoolOption = _get(schoolData, 'rows', []).map((x: any) => {
    return { label: x.text, value: x.value };
  });
  // 教学信息接口
  const { data: teachData, isLoading: teachLoading } = useFetch({
    request: _getTeachInfo,
    query: {
      id: Auth.get('schoolId'),
    },
  });
  const isTheoryCenter = _get(teachData, 'theoryCenter', false);
  const isPracticeSchool = _get(teachData, 'practice', false);

  const columns = [
    { title: isChecked ? '培训机构' : '驾校名称', dataIndex: 'applyerschoolname', width: 130 },
    { title: '姓名', dataIndex: 'name', width: 80 },
    {
      title: '联系电话',
      dataIndex: 'phone',
      hide: !isChecked,
      width: 130,
      render: (value: any, record: any) => _handlePhone(value),
    },
    {
      title: '证件号',
      dataIndex: 'idcard',
      width: 140,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '业务类型',
      dataIndex: 'busitype',
      width: 80,
      ellipsis: false,
      render: (busitype: any) => businessTypeHash[busitype],
    },
    {
      title: '培训车型',
      width: 80,
      ellipsis: false,
      dataIndex: 'traintype',
    },
    {
      title: '学车教练',
      width: 80,
      dataIndex: 'coachname',
      hide: isTheoryCenter,
    },
    {
      title: isChecked ? '申请日期' : '报名日期',
      width: 80,
      dataIndex: 'applydate',
    },
    {
      title: '申请来源',
      width: 100,
      dataIndex: 'schshortname',
      hide: !isChecked,
    },
    { title: '录入人', dataIndex: 'applyusername', width: 100, hide: isChecked },
    {
      title: '审核状态',
      dataIndex: 'checkstatus',
      width: 100,
      render: (checkstatus: any) => checkstatusSign[checkstatus],
    },
    { title: '审核日期', dataIndex: 'checktime', width: 130, hide: !isChecked },
    { title: '审核方', dataIndex: 'checkusername', width: 100, hide: !isChecked },
    { title: '备注', dataIndex: 'note', width: 100, hide: isChecked },
    {
      title: '操作',
      fixed: 'right',
      width: 150,
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <>
          <AuthButton
            authId="student/forecastExpected:btn1"
            onClick={() => {
              _switchDetailsVisible();
              setCurrentRecord(record);
            }}
            className="operation-button"
          >
            详情
          </AuthButton>
          <AuthButton
            insertWhen={
              !isChecked &&
              _get(record, 'checkstatus', '') !== '2' &&
              _get(record, 'checkstatus', '') !== '3' &&
              _get(record, 'checkstatus', '') !== '4'
            } //预报名受理页面显示  审核状态为待审核、审核不同意都可以修改，如果审核通过或者注销、删除就不可以修改。
            authId="student/forecastExpected:btn2"
            onClick={() => {
              _handleEdit(record, _get(record, 'sid', ''));
              setConfirmation(false);
            }}
            className="operation-button"
          >
            编辑
          </AuthButton>

          <AuthButton
            insertWhen={isChecked && _get(record, 'checkstatus', '') === '0'} //预报名审核页面 、未审核状态
            authId="student/forecastChecked:btn1"
            onClick={() => {
              _handleEdit(record, _get(record, 'sid', ''));
              setConfirmation(false);
            }}
            className="operation-button"
          >
            审核
          </AuthButton>

          <AuthButton
            insertWhen={
              isPracticeSchool &&
              !isChecked &&
              _get(record, 'checkstatus', '') === '2' &&
              !_get(record, 'package_id', '')
            } //转正 ：1、预报名受理页面 2、实操驾校3、没有班级 4、审核通过才显示
            authId="student/forecastExpected:btn3"
            onClick={() => {
              _handleEdit(record, _get(record, 'sid', ''));
              setConfirmation(true);
            }}
            className="operation-button"
          >
            转正
          </AuthButton>

          <AuthButton
            insertWhen={
              // 当审核状态为待审核或者审核通过 展示注销按钮
              !isChecked && (_get(record, 'checkstatus', '') === '0' || _get(record, 'checkstatus', '') === '2')
            }
            authId="student/forecastExpected:btn5"
            onClick={() => {
              _showConfirm({
                handleOk: () => {
                  run({ id: _get(record, 'sid', '') });
                },
                title: '确定要注销吗？',
              });
            }}
            className="operation-button"
          >
            注销
          </AuthButton>

          {/* 预报名受理的页面 只有当待处理的状态下 */}
        </>
      ),
    },
  ];
  const lastColumns: any = columns.filter((index: any) => {
    return index.hide !== true;
  });

  const { run } = useRequest(_cancelStudent, {
    onSuccess() {
      // 刷新页面
      _refreshTable();
    },
    onFail(err) {
      console.log(err);
    },
  });

  if (teachLoading) {
    return null;
  }

  // 理科中心-预报名受理、预报名审核 列表、查询都不加 ，实操驾校都展示
  const isCoach: FiltersType = isTheoryCenter
    ? []
    : [
        {
          type: 'SimpleSelectOfCoach',
          field: 'cid',
        },
      ];
  return (
    <>
      {detailsVisible && (
        <Details
          onCancel={_switchDetailsVisible}
          currentId={_get(currentRecord, 'sid', '')}
          isPreSignUpDetails={true}
          isChecked={isChecked}
        />
      )}
      {updatePluginVisible && <UpdatePlugin onCancel={setUpdatePluginVisible} info={'无法进行读二代证'} />}

      <Search
        loading={tableProps.loading}
        filters={[
          { type: 'Input', field: 'name', placeholder: '学员姓名' },
          { type: 'Input', field: 'idcard', placeholder: '证件号码' },
          {
            type: 'Select',
            field: 'checkstatus',
            options: [{ value: '', label: '审核状态(全部)' }, ...checkstatusSignOptions],
          },
          {
            type: 'Select',
            field: 'applyerschoolid',
            options: [{ value: '', label: '培训机构(全部)' }, ...schoolOption],
          },
          {
            type: 'RangePicker',
            field: ['applytimeStart', 'applytimeEnd'],
            placeholder: ['申请日期起', '申请日期止'],
          },
          {
            type: 'RangePicker',
            field: ['checktimeStart', 'checktimeEnd'],
            placeholder: ['审核日期起', '审核日期止'],
          },
          {
            type: 'Select',
            field: 'traintype',
            options: [{ value: '', label: '培训车型(全部)' }, ...businessScopeOptions],
          },
          ...isCoach,
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        showSearchButton={false}
        simpleCoachRequest={_getCoachList}
      />
      <ButtonContainer showSearchButton={true} refreshTable={_refreshTable} loading={tableProps.loading}>
        <div>
          {!isChecked && (
            <Button type="primary" className="mr20 mb20" onClick={_handleAdd}>
              新增
            </Button>
          )}
          <AuthButton
            authId={'student/forecastChecked:btn3'}
            insertWhen={isChecked}
            type="primary"
            loading={loading}
            className="mr20 mb20"
            onClick={async () => {
              // TODO: 11-10 解除导出 时间的限制
              const query = {
                checkerschoolid: Auth.get('schoolId'),
                name: _get(search, 'name', ''),
                idcard: _get(search, 'idcard', ''),
                checkstatus: _get(search, 'checkstatus', ''),
                applytimeStart: _get(search, 'applytimeStart', ''),
                applytimeEnd: _get(search, 'applytimeEnd', ''),
                checktimeStart: _get(search, 'checktimeStart', ''),
                checktimeEnd: _get(search, 'checktimeEnd', ''),
                traintype: _get(search, 'traintype', ''),
                cid: _get(search, 'cid', ''),
              };
              setLoading(true);
              const res = await _exportStudentBefore(query);
              if (_get(res, 'code') === 200) {
                _export(query).then((res: any) => {
                  setLoading(false);
                  downloadFile(res, '预报名审核', 'application/vnd.ms-excel', 'xlsx');
                });
              } else {
                setLoading(false);
                message.error(_get(res, 'message'));
              }
            }}
          >
            导出
          </AuthButton>
          <ReadIdCard
            authId={isChecked ? 'student/forecastChecked:btn2' : 'student/forecastExpected:btn4'}
            setUpdatePluginVisible={setUpdatePluginVisible}
            _handleSearch={_handleSearch}
            _refreshTable={_refreshTable}
          />
        </div>
      </ButtonContainer>
      <CustomTable
        {...tableProps}
        columns={lastColumns}
        rowKey="sid"
        sort
        scroll={{ x: 1500, y: document.body.clientHeight - 400 }}
      />

      {isAddOrEditVisible && (
        <AddOrEdit
          isPreSignUp={true}
          isChecked={isChecked}
          isTheoryCenter={isTheoryCenter}
          isEdit={isEdit}
          onCancel={_switchIsAddOrEditVisible}
          onOk={_handleOk}
          currentRecord={currentRecord}
          isConfirmation={confirmation}
          title={isEdit ? '编辑学员信息' : '新增学员信息'}
        />
      )}
    </>
  );
}
