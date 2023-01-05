import { _getPortalArticleList } from 'app/yantai/_api';
import { useFetch, useGoto } from 'hooks';
import { PUBLIC_URL } from 'constants/env';
import { useHistory } from 'react-router-dom';
import { formatTime, _get } from 'utils';
import { Badge, List, Pagination, Tooltip } from 'antd';
import { IF, Loading } from 'components';
import { useContext, useEffect, useState } from 'react';
import GlobalContext from 'globalContext';

const LIMIT = 10;

export default function CommonPageList(props: any) {
  const history = useHistory();
  const { $openAPIToken, $publicMenuTreeData, $setPublicMenuTreeData } = useContext(GlobalContext);
  // const { title, detailAddress } = props;
  const [pageSize, setPageSize] = useState(LIMIT);
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const arr = _get(history, 'location.pathname', '').split('/publicPlatform/cms/information/');
  const type = _get(arr, '1', '');
  const flatTree = (data: any, childName = 'children') => {
    if (!Array.isArray(data)) {
      return [];
    }
    return data.reduce((prev: any, curt: any) => {
      const childs: any = curt[childName]?.length ? flatTree(curt[childName]) : [];
      return [...prev, curt, ...childs];
    }, []);
  };
  useEffect(() => {
    const res = flatTree($publicMenuTreeData);
    if (type) {
      const filter = res.filter((x: any) => {
        //从菜单树拉平，找到对应的itemid,拿到title
        return x.itemId === type;
      });
      setTitle(_get(filter, '0.name', ''));
    }
  }, [$publicMenuTreeData.length, type]);
  useEffect(() => {
    async function getList() {
      setIsLoading(true);
      const res = await _getPortalArticleList({
        limit: pageSize, //每页条数
        page: page, //前页
        isHomepageQuery: '2',
        type, //文章类型
      });
      setData(_get(res, 'data', []));
      setIsLoading(false);
    }
    if ($openAPIToken) {
      getList();
    }
  }, [$openAPIToken, pageSize, page, type, setIsLoading]);
  const total = _get(data, 'total', 0);
  const { _push } = useGoto();
  const onChange = (page: any, pageSize: any) => {
    setPage(page);
    setPageSize(pageSize);
  };

  console.log(history);

  return (
    <div style={{ background: '#FFFFFF', width: '100%', height: '100%' }} className="p24">
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <>
            <List
              className="demo-loadmore-list"
              header={
                <div className="bold" style={{ borderTop: '2px solid #2775E4', paddingTop: 10 }}>
                  {title}
                </div>
              }
              dataSource={_get(data, 'rows', [])}
              renderItem={(item: any) => (
                <List.Item
                  style={{ display: 'flex' }}
                  className="pointer"
                  onClick={() => {
                    history.push(`${history.location.pathname}/detail?id=${item.id}`);
                  }}
                >
                  <span style={{ flex: 1, display: 'flex' }}>
                    <Badge color="#098dff" />
                    <Tooltip placement="topLeft" arrowPointAtCenter color={'grey'} title={item.title}>
                      <div
                        style={{
                          width: 680,
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.title}
                      </div>
                    </Tooltip>
                  </span>
                  <span>{formatTime(item.createTime, 'DATE')}</span>
                </List.Item>
              )}
            />
            {total > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Pagination
                  total={total}
                  showSizeChanger
                  showQuickJumper
                  onChange={onChange}
                  showTotal={(total) => `共${total}条`}
                  current={page}
                  pageSize={pageSize}
                />
              </div>
            )}
          </>
        }
      />
    </div>
  );
}
