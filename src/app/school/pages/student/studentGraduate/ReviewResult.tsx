import { useState } from 'react';
import { Modal, Radio, Input, message } from 'antd';
import { _endReview } from './_api';
import { _get } from 'utils';
import { _checkAlreadySettlementAmount, _addSettlementAmount } from '../studentInfo/_api';
import { useConfirm } from 'hooks';

const { TextArea } = Input;

export default function ReviewResult(props: any) {
  const { onCancel, onOk, selectedRowKeys, selectedRow } = props;
  const [isapply, setIsapply] = useState('2') as any; // 2:通过
  const [respmsg, setRespmsg] = useState(''); //拒绝原因
  const [loading, setLoading] = useState(false);
  const [_showConfirm] = useConfirm();

  return (
    <>
      <Modal
        visible
        title={'结业审核'}
        maskClosable={false}
        confirmLoading={loading}
        onCancel={onCancel}
        onOk={async () => {
          let errCount = 0;
          let failName: any = [];
          let needVerify: any = [];
          let noneesVerify: any = [];
          for (let j = 0; j < selectedRow.length; j++) {
            const res = await _checkAlreadySettlementAmount({ sid: _get(selectedRow[j], 'sid') });
            if (_get(res, 'code') !== 200) {
              errCount++;
              failName.push(_get(selectedRow[j], 'name'));
              return;
            }
            if (_get(res, 'code') === 200) {
              _get(res, 'data') === false
                ? needVerify.push({
                    name: _get(selectedRow[j], 'name'),
                    idCard: _get(selectedRow[j], 'idcard'),
                    sid: _get(selectedRow[j], 'id'),
                    needVerify: true,
                    sidVerify: _get(selectedRow[j], 'sid'),
                    said: _get(selectedRow[j], 'said'),
                  })
                : noneesVerify.push({
                    name: _get(selectedRow[j], 'name'),
                    idCard: _get(selectedRow[j], 'idcard'),
                    sid: _get(selectedRow[j], 'id'),
                    said: _get(selectedRow[j], 'said'),
                  });
            }
          }
          needVerify.length
            ? Modal.confirm({
                title: '温馨提醒',
                closable: true,
                content: (
                  <>
                    <p>学员已结算资金总额与已学学时不一致，可到学员档案-详情-结算记录查看，确认仍要结业吗？</p>
                    {needVerify.map((item: any) => (
                      <p>{_get(item, 'name') + ' ' + _get(item, 'idCard')}</p>
                    ))}
                  </>
                ),
                onOk: () => {
                  verify([...needVerify, ...noneesVerify]);
                },
                onCancel() {
                  noneesVerify.length && verify([...noneesVerify]);
                },
              })
            : noneesVerify.length && verify([...noneesVerify]);
          async function verify(selectedRow: any) {
            setLoading(true);
            for (let i = 0; i < selectedRow.length; i++) {
              if (_get(selectedRow[i], 'needVerify')) {
                const resp = await _addSettlementAmount({
                  sid: _get(selectedRow[i], 'sidVerify'),
                });
                if (_get(resp, 'code') !== 200) {
                  message.error(_get(resp, 'message'));
                  continue;
                }
              }
              const res = await _endReview({
                saidList: [_get(selectedRow[i], 'said')],
                isapply,
                respmsg,
              });
              if (_get(res, 'code') !== 200) {
                failName.push(_get(selectedRow[i], 'name'));
                errCount++;
              }
            }
            setLoading(false);
            if (errCount === 0) {
              message.success('全部上传成功');
            } else {
              _showConfirm({
                title: '信息提示',
                content: (
                  <div>
                    学员: {[...failName]},{errCount}条记录上传失败,详情请查看核实说明。
                  </div>
                ),
              });
            }
            onOk();
          }
        }}
      >
        <Radio.Group
          onChange={(e) => {
            setIsapply(e.target.value);
          }}
          value={isapply}
        >
          <Radio value={'2'}>通过</Radio>
          <Radio value={'3'}>不通过</Radio>
        </Radio.Group>
        {/*isapply：3 不通过 */}
        {isapply === '3' && (
          <TextArea
            rows={4}
            className="mt20"
            onChange={(e) => {
              setRespmsg(e.target.value);
            }}
          />
        )}
      </Modal>
    </>
  );
}
