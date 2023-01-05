import { _get } from 'utils';
import { useHistory } from 'react-router-dom';
import { useFetch } from 'hooks';
import { _getPortalArticleDetail } from 'app/yantai/_api';
import { Row, Typography } from 'antd';
import { IF, Loading } from 'components';
import 'quill/dist/quill.snow.css';
import { useContext, useEffect, useState } from 'react';
import GlobalContext from 'globalContext';

export default function CommonDetail() {
  const { $openAPIToken } = useContext(GlobalContext);
  const history = useHistory();
  const searchParams = _get(history, 'location.search', '');

  const tmpArr = searchParams.replace('?', '').split('=');
  const id = _get(tmpArr, '1', null);
  const { Title, Paragraph } = Typography;
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // const { data = {}, isLoading } = useFetch({
  //   request: _getPortalArticleDetail,
  //   requiredFields: ['id'],
  //   query: { id },
  // });

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
  console.log(data);
  return (
    <div>
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          _get(Object.keys(data), 'length', 0) > 0 ? (
            <div className="p24 " style={{ background: '#FFFFFF', paddingTop: 20 }}>
              <span
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  paddingBottom: 10,
                  color: '#B1B1B1',
                }}
                className="pointer"
                onClick={() => {
                  history.goBack();
                }}
              >
                {`<返回上一级`}
              </span>
              <Typography>
                <Title className="flex-box" level={3} style={{ borderTop: '2px solid #2775E4', paddingTop: 20 }}>
                  {_get(data, 'title')}
                </Title>
                <Row className="mt20 mb20" justify="center" style={{ color: '#B1B1B1' }}>
                  发布时间：{_get(data, 'createTime')}
                </Row>
                <Paragraph
                  style={{
                    borderTop: '1px solid #DCDCDC',
                    padding: 10,
                    color: '#666666',
                  }}
                >
                  <div className="ql-snow">
                    <div className="ql-editor" dangerouslySetInnerHTML={{ __html: _get(data, 'content') }} />
                  </div>
                </Paragraph>
                {/* <div className="mt20 flex-box">
                  <img src={_get(data, 'img.fileUrl')} alt="" style={{ width: 500 }} />标题图片不用在详情中展示
                </div> */}
                <div className="mt20">
                  {_get(data, 'attachments', []).map((x: any, index: any) => {
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          window.open(x.fileUrl);
                        }}
                        className="pointer"
                        style={{ color: '#0966FF', textDecoration: 'underline' }}
                      >
                        {x.fileName}
                      </div>
                    );
                  })}
                </div>
              </Typography>
            </div>
          ) : (
            <div className="p24 flex-box" style={{ background: '#FFFFFF', paddingTop: 20 }}>
              该记录不存在
            </div>
          )
        }
      />
    </div>
  );
}
