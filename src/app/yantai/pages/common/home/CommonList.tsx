import { useGoto } from 'hooks';
import { Badge, List, Row, Tooltip } from 'antd';
import { IF, Loading } from 'components';
import { formatTime, _get } from 'utils';
import { ForwardFilled } from '@ant-design/icons';
import ICON1 from 'statics/images/portal/iconDate.png';

export default function CommonList(props: any) {
  const { address, data, loading, isShowTime = false, itemId } = props;

  const { _push, _replace } = useGoto();

  return (
    <>
      <IF
        condition={loading}
        then={<Loading />}
        else={
          <List
            style={{ padding: '0 20px' }}
            dataSource={data}
            footer={
              _get(data, 'length', 0) > 0 && (
                <Row
                  justify="end"
                  className="pointer"
                  onClick={() => {
                    _push(address);
                  }}
                  style={{ color: '#098DFF' }}
                >
                  更多
                  <ForwardFilled style={{ alignSelf: 'center' }} />
                </Row>
              )
            }
            renderItem={(item: any) => (
              <List.Item>
                <span
                  style={{
                    color: '#666666',
                    fontSize: 16,
                    display: 'flex',
                  }}
                  className="pointer"
                  onClick={() => {
                    _push(`cms/information/${itemId}/detail?id=${item.id}`);
                  }}
                >
                  <span style={{ flex: 1, display: 'flex' }}>
                    <Badge color="#098dff" />
                    <Tooltip placement="topLeft" arrowPointAtCenter color={'grey'} title={item.title}>
                      <div
                        style={{
                          width: isShowTime ? 360 : 280,
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.title}
                      </div>
                    </Tooltip>
                  </span>
                  {isShowTime && (
                    <div style={{ color: '#8CB6DE' }}>
                      <img src={ICON1} className="mr10" />
                      {formatTime(item.createTime, 'DATE')}
                    </div>
                  )}
                </span>
              </List.Item>
            )}
          />
        }
      />
    </>
  );
}
