import { useState } from 'react';
import { Modal, Button, message, Row, Card } from 'antd';
import { useFetch } from 'hooks';
import { _getReportPdfidForZhenjiang } from '../studentInfo/_api';
import { _get } from 'utils';
export default function GraduateReset(props: any) {
  const { onCancel, sid } = props;

  const { data: cardList } = useFetch({
    query: {
      id: sid,
    },
    request: _getReportPdfidForZhenjiang,
  });

  const CARD_STYLE: { style: React.CSSProperties; bodyStyle: React.CSSProperties } = {
    style: { width: 290, textAlign: 'center', margin: '0 20px 20px 0', minHeight: 200 },
    bodyStyle: {
      height: 'calc(100% - 57px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  };

  const length = _get(cardList, 'stuStudentReportPdfs.length', '');

  return (
    <>
      <Modal visible width={1100} title={'查看附件'} maskClosable={false} onCancel={onCancel} footer={null}>
        {length === 0 && (
          <div style={{ textAlign: 'center', fontSize: 18, color: '#333', padding: 30 }}>您还未上传有效附件</div>
        )}
        {length !== 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {_get(cardList, 'stuStudentReportPdfs', []).map((item: any) => {
              return (
                <Card title={item.desc} {...CARD_STYLE} key={item.desc}>
                  <Button
                    className="mr20"
                    onClick={() => {
                      window.open(item.url);
                    }}
                  >
                    预览
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      window.open(item.url);
                    }}
                  >
                    下载
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </Modal>
    </>
  );
}
