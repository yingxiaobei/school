import { AuthButton, CustomTable } from 'components';
import { Button, Modal, Form, DatePicker, Spin } from 'antd';
import { useTablePro, useRequest } from 'hooks';
import { _saveCoaContinueedu, _getCoaContinueeduList } from './_api';
import moment from 'moment';
type IProps = {
  currentId: string | null;
};
function ContinuingEdu(props: IProps) {
  const { currentId } = props;
  const { tableProps, _handleAdd, isAddOrEditVisible, _switchIsAddOrEditVisible, _handleOk } = useTablePro({
    request: _getCoaContinueeduList,
    extraParams: {
      cid: currentId,
    },
  });
  const columns = [
    { title: '继续教育开始时间', dataIndex: 'starttime' },
    { title: '继续教育结束时间', dataIndex: 'endtime' },
    { title: '到期时间', dataIndex: 'continulearnenddate' },
    { title: '修改时间', dataIndex: 'createtime' },
  ];
  const { loading: confirmLoading, run: confirmRun } = useRequest(_saveCoaContinueedu, {
    onSuccess: _handleOk,
  });
  const [form] = Form.useForm();
  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      // const query = cloneDeep(values);
      confirmRun({
        cid: currentId,
        starttime: moment(values.starttime).format('YYYY-MM-DD'),
        endtime: moment(values.endtime).format('YYYY-MM-DD'),
      });
    });
  };
  return (
    <div>
      <AuthButton authId="coach/coachInfo:btn14" onClick={_handleAdd} className="mb20" type="primary">
        手动录入
      </AuthButton>
      <CustomTable {...tableProps} columns={columns} rowKey="id" />
      <Modal
        maskClosable={false}
        title="手动录入"
        width={400}
        visible={isAddOrEditVisible}
        onCancel={() => {
          _switchIsAddOrEditVisible();
        }}
        destroyOnClose
        footer={
          <>
            <Button
              className="mr20"
              onClick={() => {
                _switchIsAddOrEditVisible();
              }}
            >
              取消
            </Button>
            <Button type="primary" onClick={handleSubmit} disabled={confirmLoading}>
              确定
            </Button>
          </>
        }
      >
        <Spin spinning={confirmLoading}>
          <Form form={form} preserve={false}>
            <Form.Item
              label="继续教育开始时间"
              name="starttime"
              rules={[{ required: true, message: '请选择继续教育开始时间' }]}
            >
              <DatePicker
                disabledDate={(current) =>
                  current &&
                  form.getFieldValue('endtime') &&
                  current > moment(form.getFieldValue('endtime').startOf('day'))
                }
              />
            </Form.Item>
            <Form.Item
              label="继续教育结束时间"
              name="endtime"
              rules={[{ required: true, message: '请选择继续教育结束时间' }]}
            >
              <DatePicker
                disabledDate={(current) =>
                  current &&
                  form.getFieldValue('starttime') &&
                  current < moment(form.getFieldValue('starttime')).endOf('day')
                }
              />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
}

export default ContinuingEdu;
