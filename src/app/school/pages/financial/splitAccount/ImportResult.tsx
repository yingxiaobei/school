import { Drawer } from 'antd';
import { _getCoachImport } from './_api';
import { Auth, _get } from 'utils';

interface IProps {
  onCancel(): void;
  resultData: object;
}

export default function ImportCoach(props: IProps) {
  const { onCancel, resultData } = props;

  return (
    <>
      <Drawer destroyOnClose visible width={800} title={'导入结果'} onClose={onCancel} footer={null}>
        <div>
          <div className="mt20">机构名称：{Auth.get('schoolName')}</div>
          <div className="mt20">申请导入：{_get(resultData, 'applyNum', 0)}</div>
          <div className="mt20">实际导入：{_get(resultData, 'successNum', 0)}</div>
          <div className="mt20">导入失败：{_get(resultData, 'failedNum', 0)}</div>
        </div>
        {/* 失败信息 */}
        <div style={{ maxHeight: 'calc(100% - 200px)', margin: '20px 0 0 64px', overflow: 'auto' }}>
          {_get(resultData, 'failCoaSplitRatioDtoVOS', []).map((item: object, index: number) => {
            return (
              <div style={{ lineHeight: '32px' }} key={index}>
                {_get(item, 'coachname')}，{_get(item, 'idcard')}，{_get(item, 'resion')}
              </div>
            );
          })}
        </div>
      </Drawer>
    </>
  );
}
