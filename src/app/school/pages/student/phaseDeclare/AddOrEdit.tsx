import React, { useState } from 'react';
import { Drawer, Row, Input, Select, Form, Button, message } from 'antd';
import { Search, Title, ItemCol, Loading, CustomTable } from 'components';
import { _getStudyDetail, _submit, _editSubmit, _getOtherInfoGroupid } from './_api';
import { _getStudentInfo, _getStudentList } from 'api';
import { useFetch, useHash, useOptions, useRequest, useTablePro } from 'hooks';
import { _get, _handleIdCard } from 'utils';
import { isEmpty } from 'lodash';
import ImportFile from './ImportFile';
import { RULES } from 'constants/rules';

export default function AddOrEdit(props: any) {
  const { onCancel, isEdit, currentRecord, onOk, isDetail = false } = props;
  const [form] = Form.useForm();
  const { tableProps, search, _handleSearch, _refreshTable } = useTablePro({
    request: _getStudentInfo,
    extraParams: {
      traintimeApplyQueryType: '2', //查询类型
      trainTimeApplyStatus: '0', //学时未申报
      studenttype: '1', //转入学员
      trainTimeApply: '1', //需要学时申报
      // isotherprovince: '1', //外省转入  去掉：因为以前只有外省转入的数据
    },
  });

  const [wellFileId, setWellFileId] = useState(''); // 交警技能证明id
  const [latestTrainFile, setLatestTrainFile] = useState(''); // 最近一次培训记录
  const [subjectOneExamDateFile, setSubjectOneExamDateFile] = useState(''); // 第一部分约考凭证
  const [subjectOneExamResultFile, setSubjectOneExamResultFile] = useState(''); // 第一部分考试成绩
  const [subjectTwoExamDateFile, setSubjectTwoExamDateFile] = useState(''); // 第二部分约考凭证
  const [subjectTwoExamResultFile, setSubjectTwoExamResultFile] = useState(''); // 第二部分考试成绩
  const [subjectThreeExamDateFile, setSubjectThreeExamDateFile] = useState(''); //第三部分约考凭证
  const [subjectThreeExamResultFile, setSubjectThreeExamResultFile] = useState(''); // 第三部分考试成绩

  const [sid, setSid] = useState(isEdit ? _get(currentRecord, 'sid', '') : '');

  const cardTypeHash = useHash('gd_card_type'); // 证件类型
  const stuDrivetrainStatusHash = useHash('stu_drivetrain_status'); // 学员状态
  const examResultTypeOptions = useOptions('exam_result_type'); // 考核结果
  const trainFinishFlagOptions = useOptions('train_finish_flag'); // 培训情况

  // 获取学时详情
  const { data: detailsData = {} } = useFetch({
    request: _getStudyDetail,
    query: {
      sid,
    },
    requiredFields: ['sid'],
  });

  // 获取其他材料显示内容组ID
  const { data: getOtherInfoGroupid } = useFetch({
    request: _getOtherInfoGroupid,
  });

  // form的展示，新增和编辑且获取到detailsData数据的时候正常展示 编辑的时候获取到detailsData之前loading展示
  const isFormLoading = !isEdit || !isEmpty(detailsData);

  const columns = [
    { title: '学号', dataIndex: 'studentnum' },
    { title: '学员姓名', dataIndex: 'name' },
    { title: '证件类型', dataIndex: 'cardtype', render: (cardtype: any) => cardTypeHash[cardtype] },
    { title: '证件号码', dataIndex: 'idcard', render: (value: any, record: any) => _handleIdCard({ value, record }) },
    { title: '学员状态', dataIndex: 'status', render: (status: any) => stuDrivetrainStatusHash[status] },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[]) => {
      setSid(_get(selectedRowKeys, '0'));
    },
  };

  const layout = { labelCol: { span: 10 }, wrapperCol: { span: 14 } };

  const { loading, run } = useRequest(isEdit ? _editSubmit : _submit, {
    onSuccess: () => {
      onOk();
    },
  });

  return (
    <Drawer
      title={isDetail ? '学时申报详情' : '学时申报编辑'}
      closable={true}
      onClose={onCancel}
      visible
      width={1200}
      destroyOnClose
      footerStyle={{ display: 'flex', justifyContent: 'flex-end' }}
      footer={
        !isDetail && (
          <>
            <Button className="mr20" onClick={onCancel}>
              取消
            </Button>
            <Button
              type="primary"
              loading={loading}
              onClick={() => {
                form.validateFields().then(async (values: any) => {
                  // getOtherInfoGroupid:后台配置三组内容，根据项目实际情况配置显示某组内容：
                  ///getOtherInfoGroupid:1、无内容
                  //getOtherInfoGroupid:2、交警技能证明（温州应用）
                  //getOtherInfoGroupid:3、原注册地市、原培训学校、原档案号、已完成培训科目勾选、已考科目勾选、最近一次培训记录图片、各科目约考凭证图片、考试成绩图片（海口应用）
                  if (!isEdit && getOtherInfoGroupid === '2' && !wellFileId) {
                    message.error('请上传交警证明');
                    return;
                  }
                  if (!isEdit && getOtherInfoGroupid === '3' && !latestTrainFile) {
                    message.error('请上传最近一次培训记录');
                    return;
                  }
                  if (!sid) {
                    message.error('请选择学员');
                    return;
                  }
                  const query = {
                    ...values,
                    subjectTwoMileage: _get(values, 'subjectTwoMileage', 0),
                    subjectThreeMileage: _get(values, 'subjectThreeMileage', 0),
                    sid,
                    wellFileId,
                    latestTrainFile,
                    subjectOneExamDateFile,
                    subjectOneExamResultFile,
                    subjectTwoExamDateFile,
                    subjectTwoExamResultFile,
                    subjectThreeExamDateFile,
                    subjectThreeExamResultFile,
                  };
                  run(query);
                });
              }}
              disabled={false}
            >
              提交申报
            </Button>
          </>
        )
      }
    >
      {!isFormLoading && <Loading />}
      {isFormLoading && (
        <>
          {!isEdit && (
            <>
              <Search
                loading={tableProps.loading}
                filters={[
                  {
                    type: 'SimpleSelectOfStudent',
                    field: 'sid',
                  },
                ]}
                search={search}
                _handleSearch={_handleSearch}
                refreshTable={_refreshTable}
                simpleStudentRequest={_getStudentList}
              />
              <CustomTable
                columns={columns}
                {...tableProps}
                rowKey="sid"
                rowSelection={{
                  type: 'radio',
                  ...rowSelection,
                }}
              />
            </>
          )}
          {isEdit && (
            <Row>
              <ItemCol span={8} {...layout} label="学员姓名">
                {_get(currentRecord, 'name', '')}
              </ItemCol>
              <ItemCol span={8} {...layout} label="证件号码">
                {_get(currentRecord, 'idcard', '')}
              </ItemCol>
            </Row>
          )}
          <Form
            form={form}
            {...layout}
            autoComplete="off"
            initialValues={{
              ...detailsData,
            }}
          >
            <Title>学时信息</Title>
            <Row>
              <ItemCol
                span={8}
                label="第一部分课堂理论"
                name="subjectOneClassroomTime"
                rules={[{ required: true }, RULES.STUDENT_INFO]}
              >
                <Input className="w200" addonAfter={'分钟'} disabled={isDetail} />
              </ItemCol>
              <ItemCol
                span={8}
                label="第一部分网络理论"
                name="subjectOneNetworkTime"
                rules={[{ required: true }, RULES.STUDENT_INFO]}
              >
                <Input className="w200" addonAfter={'分钟'} disabled={isDetail} />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol
                span={8}
                label="第二部分实操"
                name="subjectTwoVehicleTime"
                rules={[{ required: true }, RULES.STUDENT_INFO]}
              >
                <Input className="w200" addonAfter={'分钟'} disabled={isDetail} />
              </ItemCol>
              <ItemCol
                span={8}
                label="第二部分模拟"
                name="subjectTwoSimulatorTime"
                rules={[{ required: true }, RULES.STUDENT_INFO]}
              >
                <Input className="w200" addonAfter={'分钟'} disabled={isDetail} />
              </ItemCol>
              <ItemCol span={8} label="第二部分里程" name="subjectTwoMileage" rules={[RULES.STUDENT_INFO]}>
                <Input className="w200" addonAfter={'公里'} disabled={isDetail} />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol
                span={8}
                label="第三部分实操"
                name="subjectThreeVehicleTime"
                rules={[{ required: true }, RULES.STUDENT_INFO]}
              >
                <Input className="w200" addonAfter={'分钟'} disabled={isDetail} />
              </ItemCol>
              <ItemCol
                span={8}
                label="第三部分模拟"
                name="subjectThreeSimulatorTime"
                rules={[{ required: true }, RULES.STUDENT_INFO]}
              >
                <Input className="w200" addonAfter={'分钟'} disabled={isDetail} />
              </ItemCol>
              <ItemCol span={8} label="第三部分里程" name="subjectThreeMileage" rules={[RULES.STUDENT_INFO]}>
                <Input className="w200" addonAfter={'公里'} disabled={isDetail} />
              </ItemCol>
            </Row>
            <Row>
              <ItemCol
                span={8}
                label="第四部分课堂理论"
                name="subjectFourClassroomTime"
                rules={[{ required: true }, RULES.STUDENT_INFO]}
              >
                <Input className="w200" addonAfter={'分钟'} disabled={isDetail} />
              </ItemCol>
              <ItemCol
                span={8}
                label="第四部分网络理论"
                name="subjectFourNetworkTime"
                rules={[{ required: true }, RULES.STUDENT_INFO]}
              >
                <Input className="w200" addonAfter={'分钟'} disabled={isDetail} />
              </ItemCol>
            </Row>
            <Title>考核信息</Title>
            <Row>
              <ItemCol span={8} label="第一部分考核结果" name="subjectOneExamResult" rules={[{ required: true }]}>
                <Select options={examResultTypeOptions} disabled={isDetail} />
              </ItemCol>
              <ItemCol span={8} label="第二部分考核结果" name="subjectTwoExamResult" rules={[{ required: true }]}>
                <Select options={examResultTypeOptions} disabled={isDetail} />
              </ItemCol>
              <ItemCol span={8} label="第三部分考核结果" name="subjectThreeExamResult" rules={[{ required: true }]}>
                <Select options={examResultTypeOptions} disabled={isDetail} />
              </ItemCol>
              <ItemCol span={8} label="第四部分考核结果" name="subjectFourExamResult" rules={[{ required: true }]}>
                <Select options={examResultTypeOptions} disabled={isDetail} />
              </ItemCol>
            </Row>
            {(getOtherInfoGroupid === '2' || getOtherInfoGroupid === '3') && <Title>其他材料</Title>}
            {getOtherInfoGroupid === '2' && (
              <ItemCol span={8} label="交警技能证明" required>
                <ImportFile
                  hasFileId={_get(detailsData, 'wellFileId', '')}
                  fileId={wellFileId}
                  setFileId={setWellFileId}
                />
              </ItemCol>
            )}
            {getOtherInfoGroupid === '3' && (
              <>
                <Row>
                  <ItemCol
                    span={8}
                    label="第一部分培训情况"
                    name="subjectOneTrainFinishFlag"
                    rules={[{ required: true }]}
                  >
                    <Select options={trainFinishFlagOptions} disabled={isDetail} />
                  </ItemCol>
                  <ItemCol
                    span={8}
                    label="第二部分培训情况"
                    name="subjectTwoTrainFinishFlag"
                    rules={[{ required: true }]}
                  >
                    <Select options={trainFinishFlagOptions} disabled={isDetail} />
                  </ItemCol>
                  <ItemCol
                    span={8}
                    label="第三部分培训情况"
                    name="subjectThreeTrainFinishFlag"
                    rules={[{ required: true }]}
                  >
                    <Select options={trainFinishFlagOptions} disabled={isDetail} />
                  </ItemCol>
                </Row>
                <Row>
                  <ItemCol
                    span={8}
                    label="原注册地市"
                    name="jumpFromArea"
                    rules={[{ required: true }, RULES.REGISTERED_ADDRESS]}
                  >
                    <Input disabled={isDetail} />
                  </ItemCol>
                  <ItemCol
                    span={8}
                    label="原培训驾校"
                    name="extSchoolid"
                    rules={[{ required: true }, RULES.TRAIN_SCHOOL]}
                  >
                    <Input disabled={isDetail} />
                  </ItemCol>
                  <ItemCol
                    span={8}
                    label="原档案号"
                    name="extFileNumber"
                    rules={[{ required: true }, RULES.FILE_NUMBER]}
                  >
                    <Input disabled={isDetail} />
                  </ItemCol>
                </Row>
                <Row>
                  <ItemCol span={8} label="最近一次培训记录" name="latestTrainFile" required>
                    <ImportFile
                      hasFileId={_get(detailsData, 'latestTrainFile', '')}
                      fileId={latestTrainFile}
                      setFileId={setLatestTrainFile}
                    />
                  </ItemCol>
                  <ItemCol span={8} label="第一部分约考凭证" name="subjectOneExamDateFile">
                    <ImportFile
                      hasFileId={_get(detailsData, 'subjectOneExamDateFile', '')}
                      fileId={subjectOneExamDateFile}
                      setFileId={setSubjectOneExamDateFile}
                    />
                  </ItemCol>
                  <ItemCol span={8} label="第一部分考试成绩" name="subjectOneExamResultFile">
                    <ImportFile
                      hasFileId={_get(detailsData, 'subjectOneExamResultFile', '')}
                      fileId={subjectOneExamResultFile}
                      setFileId={setSubjectOneExamResultFile}
                    />
                  </ItemCol>
                </Row>
                <Row>
                  <ItemCol span={8} label="第二部分约考凭证" name="subjectTwoExamDateFile">
                    <ImportFile
                      hasFileId={_get(detailsData, 'subjectTwoExamDateFile', '')}
                      fileId={subjectTwoExamDateFile}
                      setFileId={setSubjectTwoExamDateFile}
                    />
                  </ItemCol>
                  <ItemCol span={8} label="第二部分考试成绩" name="subjectTwoExamResultFile">
                    <ImportFile
                      hasFileId={_get(detailsData, 'subjectTwoExamResultFile', '')}
                      fileId={subjectTwoExamResultFile}
                      setFileId={setSubjectTwoExamResultFile}
                    />
                  </ItemCol>
                  <ItemCol span={8} label="第三部分约考凭证" name="subjectThreeExamDateFile">
                    <ImportFile
                      hasFileId={_get(detailsData, 'subjectThreeExamDateFile', '')}
                      fileId={subjectThreeExamDateFile}
                      setFileId={setSubjectThreeExamDateFile}
                    />
                  </ItemCol>
                </Row>
                <Row>
                  <ItemCol span={8} label="第三部分考试成绩" name="subjectThreeExamResultFile">
                    <ImportFile
                      hasFileId={_get(detailsData, 'subjectThreeExamResultFile', '')}
                      fileId={subjectThreeExamResultFile}
                      setFileId={setSubjectThreeExamResultFile}
                    />
                  </ItemCol>
                </Row>
              </>
            )}
          </Form>
        </>
      )}
    </Drawer>
  );
}
