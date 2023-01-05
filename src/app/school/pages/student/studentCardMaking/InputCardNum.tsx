import { useContext, useState } from 'react';
import { Modal, Form, Input } from 'antd';
import { Auth, _get } from 'utils';
import GlobalContext from 'globalContext';

export default function InputCardNum(props: any) {
  const { onOk, onCancel, currentRecord, cardInfo, isReissue, isStudent, _func } = props;
  const [val, setVal] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);
  const { $userId } = useContext(GlobalContext);

  const [form] = Form.useForm();
  return (
    <Modal
      visible
      title="请输入IC卡号"
      okText={'制卡'}
      confirmLoading={btnLoading}
      onCancel={onCancel}
      getContainer={false}
      onOk={() => {
        form.validateFields().then(async (values) => {
          const studentQuery = {
            makeType: isReissue ? '2' : '1', //制卡类型 1：制卡 2：补卡
            sid: _get(currentRecord, 'sid'),
            operator_id: Auth.get('userId') ? Auth.get('userId') : $userId,
            stu_idcard: _get(currentRecord, 'idcard'),
            stu_name: _get(currentRecord, 'name'),
          };
          const coachQuery = {
            physicsStatus: isReissue ? '2' : '1', //制卡类型 1：制卡 2：补卡
            cid: _get(currentRecord, 'cid'),
            makeType: isReissue ? '2' : '1', //制卡类型 1：制卡 2：补卡
            type: '1',
          };
          const diffQuery = isStudent ? studentQuery : coachQuery;
          const query = {
            barcode: val, //手动输入的卡号
            cardData: undefined, //手动输入，该字段不能传，不可以传空字符串
            ...diffQuery,
          };
          setBtnLoading(true);
          let customHeader = isReissue
            ? { menuId: 'studentCardMaking', elementId: 'student/studentCardMaking:btn4' }
            : { menuId: 'studentCardMaking', elementId: 'student/studentCardMaking:btn3' };
          const res = await _func(query, customHeader);
          if (_get(res, 'code') === 200) {
            onOk();
          }
          setBtnLoading(false);
        });
      }}
    >
      <div style={{ background: '#fef4e4', color: '#E6A23C' }}>未读取到IC卡卡号，你可进行手动填写卡号</div>
      {<div style={{ fontSize: 30, height: 30, marginBottom: 20 }}>{val}</div>}

      <Form form={form} autoComplete="off">
        <Form.Item
          name="cardcode"
          label="IC卡号"
          rules={[{ whitespace: true, required: true, message: '请输入IC卡号' }]}
        >
          <Input
            placeholder="请输入IC卡号"
            onChange={(e) => {
              setVal(e.target.value);
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
