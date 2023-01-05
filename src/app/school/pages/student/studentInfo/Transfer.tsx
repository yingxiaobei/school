import { _getTransfer } from './_api';
import { useFetch } from 'hooks';
import { Modal, Button, Spin } from 'antd';
import { _get } from 'utils';

export default function Transfer(props: any) {
  const { onCancel, setStutransareatype, _switchTransferAddVisible, setName } = props;

  // 转入类型数据
  const { data = [], isLoading } = useFetch({
    request: _getTransfer,
  });

  return (
    <>
      <Modal getContainer={false} visible title={'选择转入类型'} onCancel={onCancel} footer={null}>
        <Spin spinning={isLoading}>
          {(data || []).map((item: any) => {
            return (
              <Button
                type="primary"
                className="mr20"
                key={_get(item, 'stutransareatype')}
                onClick={() => {
                  setName(item.transferName);
                  _switchTransferAddVisible();
                  setStutransareatype(_get(item, 'stutransareatype'));
                  onCancel();
                }}
              >
                {item.transferName}
              </Button>
            );
          })}
        </Spin>
      </Modal>
    </>
  );
}
