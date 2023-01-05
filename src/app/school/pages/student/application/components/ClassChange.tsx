// 更换班级
import { Form, Input, Select, Space, message, Row } from 'antd';
import { useEffect, useState } from 'react';
import { memo } from 'react';
import { PackInfo } from './AddOrEdit';
import { _get } from 'utils';
import { useFetch } from 'hooks';
import { ClassList, _getClassList } from '../../studentInfo/_api';
import { ItemCol } from 'components';
interface Props {
  applyMessage?: string;
  studentType?: string;
  setApplyMessage: (applyMessage: string) => void;
  packInfo: PackInfo;
  sid: string | null;
  setNewPackName: (newPackName: string) => void;
}

function ClassChange({ applyMessage, studentType, packInfo, sid, setApplyMessage, setNewPackName }: Props) {
  // const [reason, setReason] = useState(applyMessage || ''); // TODO: 不能放在子组件中
  const [classOptions, setClassOptions] = useState<{ label: string; value: string; price: number }[]>([]);
  // 学员班级要经过处理的 更换班级需要支持 转线上班级

  const { data }: { data: ClassList } = useFetch({
    request: _getClassList,
    query: {
      page: 1,
      limit: 100,
      isEffective: 1, // 包含已经注销的班级 (更换班级的手段 是控制在服务工程师中 不是在驾校手中 实际是为了那些 好像是有些线下班级在注册的时候是 无法选择的 但是到了更换班级的时候 服务工程师需要切换到这些线下班级)
      traintype: packInfo?.traintype,
      studenttype: studentType,
      isOnline: 2,
      isEnabled: 1,
    },
    depends: [packInfo, sid, studentType],
    requiredFields: ['traintype', 'studenttype'],
  });

  useEffect(() => {
    const classOptions = _get(data, 'rows', []).map((item) => {
      return { label: item.packlabel, value: item.packid, price: item.train_price_online };
    });
    // .filter((item) => !item.price); // 只能选择线下班级
    setClassOptions(classOptions);
  }, [data]);

  return (
    <>
      <Row>
        <ItemCol span={12} label="当前学员班级" wrapperCol={{ span: 16 }}>
          <Space>
            <span>{_get(packInfo, 'package_name')}</span>
            <span>{_get(packInfo, 'bankchannelname')}</span>
          </Space>
        </ItemCol>
      </Row>
      <Row>
        <ItemCol span={12} label="更换班级" name={'pack_id'} rules={[{ required: true }]}>
          <Select
            options={classOptions}
            onChange={(_, option) => {
              setNewPackName(_get(option, 'label', ''));
            }}
          />
        </ItemCol>
      </Row>
      <Row>
        <ItemCol span={12} label="更换原因">
          <Input.TextArea
            style={{ width: '240px' }}
            value={applyMessage}
            maxLength={201}
            showCount={{
              formatter: ({ count }) => {
                return `${count} / ${200}`;
              },
            }}
            onChange={function (e) {
              if (e.target.value.length > 200) {
                return message.warning('超过最大输入字符！');
              }
              setApplyMessage(e.target.value);
            }}
          />
        </ItemCol>
      </Row>
    </>
  );
}

export default memo(ClassChange);
