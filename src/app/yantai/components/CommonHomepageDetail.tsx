import { _get } from 'utils';
import { useHistory } from 'react-router-dom';
import { useFetch, useGoto } from 'hooks';
import { _getPortalArticleDetail } from 'app/yantai/_api';
import { Row, Typography, Empty } from 'antd';
import { IF, Loading } from 'components';
import 'quill/dist/quill.snow.css';
import { useContext, useEffect, useState } from 'react';
import GlobalContext from 'globalContext';
import ICON1 from 'statics/images/portal/iconDate.png';

export default function CommonDetail(props: any) {
  const { id, itemId } = props;

  const { _push } = useGoto();
  const { $openAPIToken } = useContext(GlobalContext);

  const { Paragraph } = Typography;
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getList() {
      setIsLoading(true);
      const res = await _getPortalArticleDetail({
        id,
      });
      setData(_get(res, 'data', []));
      setIsLoading(false);
    }
    if ($openAPIToken) {
      getList();
    }
  }, [$openAPIToken, id]);
  console.log(id, 'id1');
  return (
    <div>
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          _get(Object.keys(data), 'length', 0) > 0 ? (
            <div
              style={{ background: '#FFFFFF', height: 310, overflow: 'hidden' }}
              onClick={() => {
                _push(`cms/information/${itemId}/detail?id=${id}`);
              }}
            >
              <Typography>
                {_get(data, 'img.fileUrl') ? (
                  <img src={_get(data, 'img.fileUrl')} alt="" style={{ width: '100%', height: 200 }} />
                ) : (
                  <div></div>
                )}

                <div style={{ paddingTop: 10 }} className="bold">
                  {_get(data, 'title')}
                </div>
                <Row style={{ color: '#8CB6DE', fontSize: 8 }} className="mt10">
                  <img src={ICON1} style={{ height: 15, marginTop: 2, marginRight: 5 }} />
                  发布时间：{_get(data, 'createTime')}
                </Row>
                <Paragraph
                  style={{
                    // padding: 10,
                    color: '#666666',
                    fontSize: 12,
                  }}
                >
                  <div className="ql-snow">
                    <div className="ql-editor" dangerouslySetInnerHTML={{ __html: _get(data, 'content') }} />
                  </div>
                </Paragraph>
              </Typography>
            </div>
          ) : (
            <div className="p24 flex-box" style={{ background: '#FFFFFF' }}>
              该记录不存在
            </div>
          )
        }
      />
    </div>
  );
}
