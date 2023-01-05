import { useState } from 'react';
import { isEmpty } from 'lodash';
import { Modal, Form, Input, Select, Row, Divider, message } from 'antd';
import { useFetch, useHash, useOptions, useRequest } from 'hooks';
import { _getRegionCourse, _getCourseTemplate, _addSchoolPackage, _getClassDetail, _updateSchoolPackage } from './_api';
import { CHARGE_MODE_TYPE, TRAIN_MODE_TYPE } from './constants';
import { Loading, ItemCol } from 'components';
import { RULES } from 'constants/rules';
import { _get } from 'utils';

export default function AddOrEdit(props: any) {
  const { onCancel, onOk, currentId, isEdit, title } = props;
  const [form] = Form.useForm();
  const [packid, setPackid] = useState('');
  const [traintype, setTraintype] = useState('');
  const [courseTemplates, setCourseTemplates] = useState<
    { chargemode: CHARGE_MODE_TYPE; trainningmode: TRAIN_MODE_TYPE; [key: string]: any }[]
  >([]);

  const businessScopeOptions = useOptions('business_scope', false, '-1', [], {
    forceUpdate: true,
  }); // 培训车型
  const stuType = useOptions('student_type');
  const payModeHash = useHash('pay_mode_type');
  const subjectTypeHash = useHash('subject_type');
  const subjectCodeHash = useHash('subject_code_class_type');
  const trainModeHash = useHash('train_study_type');

  const chargeModeStudyFirstHash = useHash('charge_mode_type', false, '1'); // 收费模式：先学后付，parentkey=1
  const chargeModePayFirstHash = useHash('charge_mode_type', false, '2'); // 收费模式：先付后学，parentkey=2
  const [stuTypeVisible, setStuTypeVisible] = useState(false);
  const [regionCourseOptions, setRegionCourseOptions] = useState([]);
  const [studentType, setStudentType] = useState('0');
  const [stuTypeOptions, setStuTypeOptions] = useState<any>([]);

  // 获取课程套餐
  const { data: regionCourse = [] } = useFetch({
    request: _getRegionCourse,
    query: { carType: traintype },
    requiredFields: ['carType'],
    depends: [traintype],
    callback: (data) => {
      if (!isEdit) {
        const stuTypeArr = data.map((x: any) => {
          return x.studentType;
        });
        setStuTypeOptions(
          stuType.filter((x) => {
            return stuTypeArr.includes(x.value); //班级分类显示的数据与课程套餐student_type一致
          }),
        );

        setStuTypeVisible(data.some((x: any) => String(x.studentType) === '1' || String(x.studentType) === '2')); //课程套餐有studentType=1或2即有转入学员时才显示班级分类

        if (data.every((x: any) => String(x.studentType) === '0')) {
          setRegionCourseOptions((data || []).map((x: any) => ({ value: x.packid, label: x.coursename })));
          setPackid(_get(data, '0.packid', ''));
        } else {
          if (isEmpty(studentType)) {
            setRegionCourseOptions([]);
            setPackid('');
          } else {
            const arr = (data || [])
              .filter((x: any) => String(x.studentType) === String(studentType))
              .map((x: any) => ({ value: x.packid, label: x.coursename }));
            setRegionCourseOptions(arr);
            setPackid(_get(arr, '0.value', ''));
          }
        }
      }
    },
  });

  // 获取课程模板
  useFetch({
    request: _getCourseTemplate,
    query: { packId: packid },
    depends: [packid],
    requiredFields: ['packId'],
    callback: (data) => {
      // 编辑时不再修改模板
      if (!isEdit) {
        setCourseTemplates(data);
      }
    },
  });

  // 根据id获取班级详情
  const { data: currentRecord, isLoading } = useFetch({
    request: _getClassDetail,
    query: { id: currentId },
    depends: ['id'],
    requiredFields: ['id'],
    callback: (data) => {
      setPackid(_get(data, 'packid'));
      setTraintype(_get(data, 'traintype'));
      setStudentType(_get(data, 'studenttype', '0'));
      const arr = _get(data, 'schChargeStandardDtoList', []).map((index: any) => {
        return { ...index, oldPrice: _get(index, 'price', 0) };
      });
      setCourseTemplates(arr);
    },
  });

  const { loading: confirmLoading, run } = useRequest(isEdit ? _updateSchoolPackage : _addSchoolPackage, {
    onSuccess: onOk,
  });

  return (
    <Modal
      visible
      width={800}
      title={title}
      maskClosable={false}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onOk={() => {
        if (!packid && !isEdit) {
          return message.error('请选择课程套餐');
        }
        if (stuTypeVisible && !studentType && !isEdit) {
          return message.error('请选择班级分类');
        }
        if (courseTemplates.some((x: any) => _get(x, 'price') > _get(x, 'priceUp'))) {
          message.error('价格不能高于最高价格');
          return;
        }

        if (courseTemplates.some((x: any) => _get(x, 'price') < _get(x, 'priceDown'))) {
          message.error('价格不能低于最低价格');
          return;
        }

        form.validateFields().then((values) => {
          const query = {
            note: _get(values, 'note'),
            packlabel: _get(values, 'packlabel'),
            traintype: _get(values, 'traintype'),
            studenttype: studentType,
            packid,
            status_cd: _get(currentRecord, 'status_cd', '1'), // 默认初始
            schChargeStandardDtoList: courseTemplates,
          };
          run(query);
        });
      }}
    >
      {isLoading && <Loading />}

      {!isLoading && (
        <Form
          form={form}
          autoComplete="off"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          initialValues={{
            packlabel: _get(currentRecord, 'packlabel'),
            traintype: _get(currentRecord, 'traintype'),
            note: _get(currentRecord, 'note'),
            packid: _get(currentRecord, 'packid'),
          }}
        >
          <Row>
            <ItemCol
              label="班级名称"
              name="packlabel"
              rules={[{ whitespace: true, required: true, message: '请输入班级名称' }, RULES.CLASS_TYPE_NAME_NEW]}
            >
              <Input />
            </ItemCol>
            <ItemCol label="培训车型" name="traintype" rules={[{ required: true, message: '请选择培训车型' }]}>
              <Select
                options={businessScopeOptions}
                value={traintype}
                disabled={isEdit}
                onChange={(value) => {
                  setTraintype(value);
                  setPackid('');
                  setCourseTemplates([]);
                  setRegionCourseOptions([]);
                  setStudentType('0');
                }}
              />
            </ItemCol>
          </Row>

          <Row>
            {/* 编辑时不显示课程套餐\班级分类 */}

            {!isEdit && stuTypeVisible && (
              <ItemCol label="班级分类" required>
                <Select
                  options={stuTypeOptions}
                  getPopupContainer={(triggerNode) => triggerNode.parentElement}
                  value={studentType}
                  disabled={isEdit}
                  onChange={(value: any) => {
                    setStudentType(value);
                    const arr = (regionCourse || [])
                      .filter((x: any) => String(x.studentType) === String(value))
                      .map((x: any) => ({ value: x.packid, label: x.coursename }));
                    setRegionCourseOptions(arr);
                    setPackid('');
                    setCourseTemplates([]);
                  }}
                />
              </ItemCol>
            )}
            {!isEdit && (
              <ItemCol label="课程套餐" required>
                <Select
                  options={regionCourseOptions}
                  getPopupContainer={(triggerNode) => triggerNode.parentElement}
                  value={packid}
                  onChange={(value) => {
                    setPackid(value);
                  }}
                />
              </ItemCol>
            )}
            <ItemCol label="备注" name="note" rules={[RULES.MEMO]}>
              <Input.TextArea style={{ width: '100%' }} />
            </ItemCol>
          </Row>

          <Divider />

          <div>
            {(courseTemplates || []).map((x, index) => {
              return (
                <div key={index}>
                  <Row>
                    <ItemCol label="课程类型">
                      {subjectCodeHash[_get(x, 'subjectcode')] + ' ' + subjectTypeHash[_get(x, 'traincode')]}
                    </ItemCol>
                  </Row>
                  <Row>
                    <ItemCol label="付费模式">{payModeHash[_get(x, 'paymode')]}</ItemCol>
                    <ItemCol label="收费模式">
                      <>
                        {_get(x, 'paymode') === '1' && chargeModeStudyFirstHash[_get(x, 'chargemode')]}
                        {_get(x, 'paymode') === '2' && chargeModePayFirstHash[_get(x, 'chargemode')]}
                      </>
                    </ItemCol>
                  </Row>
                  <Row>
                    <ItemCol label="学习方式">{trainModeHash[_get(x, 'trainningmode')]}</ItemCol>
                    <ItemCol label="定价区间">{_get(x, 'priceDown') + '-' + _get(x, 'priceUp')}</ItemCol>
                  </Row>
                  <Row>
                    <ItemCol label="课程价格">
                      <Input
                        value={_get(x, 'price')}
                        onChange={(e) => {
                          if (Number.isNaN(Number(e.target.value))) return;

                          courseTemplates[index].price = Number(e.target.value);
                          setCourseTemplates([...courseTemplates]);
                        }}
                      />
                    </ItemCol>
                  </Row>
                  <Divider />
                </div>
              );
            })}
          </div>
        </Form>
      )}
    </Modal>
  );
}
