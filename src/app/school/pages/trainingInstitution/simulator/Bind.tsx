import { useState } from 'react';
import { Modal, Select, Alert } from 'antd';
import { _carSearch, _opt } from './_api';
import { useRequest } from 'hooks';
import { _get } from 'utils';

const { Option } = Select;

export default function Bind(props: any) {
  const { onCancel, onOk, currentId } = props;
  const [carList, setCarList] = useState([]);
  const [carId, setCarId] = useState();

  const { loading: confirmLoading, run } = useRequest(_opt, {
    onSuccess: onOk,
  });

  return (
    <Modal
      visible
      title={'模拟器绑定'}
      maskClosable={false}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText={'绑定'}
      width={500}
      onOk={() => {
        run({ id: currentId, licnum: carId, operateType: '2' });
      }}
    >
      <Alert
        style={{ width: 300, marginLeft: 70 }}
        message={'备案启用且未绑定模拟器的车辆才可以绑定，若搜索不到，请检查是否符合条件'}
        type="warning"
      />

      <div style={{ margin: '30px 70px 20px 70px' }}>
        车牌号：
        <Select
          style={{ width: 244 }}
          showSearch
          allowClear
          placeholder="请输入车牌号"
          onChange={(value: any) => {
            setCarId(value);
          }}
          onSearch={async (value: any) => {
            const res = await _carSearch({ licnum: value });
            setCarList(_get(res, 'data', []));
          }}
        >
          {carList.map((x: any, index: any) => {
            return (
              <Option key={index} value={x}>
                {x}
              </Option>
            );
          })}
        </Select>
      </div>
    </Modal>
  );
}
