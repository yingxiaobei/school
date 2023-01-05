import { useEffect, useState, useContext } from 'react';
import { useFetch, useForceUpdate, useGoto, useHash, useSearch } from 'hooks';
import { _get } from 'utils';
import { Avatar, Button, List, Pagination, Row, Tag } from 'antd';
import { IF, Loading, Search } from 'components';
import { _getSuperviseList, _getAreaCodes, _getDicCode } from 'app/yantai/_api';
import { PORTAL_CITY_CODE } from 'constants/env';
import GlobalContext from 'globalContext';

export default function School() {
  const { _push } = useGoto();
  // const companyLevelHash = useHash('company_level', true); // 驾校等级

  const [search, _handleSearch] = useSearch();
  const { CheckableTag } = Tag;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [areaCode, setAreaCode] = useState('');
  const [checkedTag, setCheckedTag] = useState('');
  const [ignore, forceUpdate] = useForceUpdate();
  const [data, setData] = useState([]);
  const [componyLevel, setComponyLevel] = useState([]);
  const [areaData, setAreaData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { $openAPIToken } = useContext(GlobalContext);

  useEffect(() => {
    async function getList() {
      setIsLoading(true);
      const res = await _getSuperviseList({ areaCode, currentPage: page, pageSize, name: _get(search, 'name') });
      const res2 = await _getDicCode({ codeType: 'company_level', parentCodeKey: '-1' });
      const res3 = await _getAreaCodes({ parentCodeKey: PORTAL_CITY_CODE });
      setData(_get(res, 'data', []));
      setComponyLevel(_get(res2, 'data', []));
      setAreaData(_get(res3, 'data', []));
      setIsLoading(false);
    }
    if ($openAPIToken) {
      getList();
    }
  }, [pageSize, page, areaCode, ignore]);
  const companyLevelHash = componyLevel
    .map((x: any) => {
      return { label: x.text, value: x.value };
    })
    .reduce((acc: any, x: IOption) => Object.assign(acc, { [x.value]: x.label }), {});

  const total = _get(data, 'total', 0);
  const onChange = (page: any, pageSize: any) => {
    setPage(page);
    setPageSize(pageSize);
  };

  return (
    <div style={{ background: '#FFFFFF', width: '100%', padding: 20 }}>
      <div className=" mb20 flex p10" style={{ borderBottom: '2px solid #2775E4' }}>
        <span className="bold flex1">驾校排行</span>
        <span style={{ color: '#B1B1B1' }}>
          共计<span style={{ color: '#2775E4' }}>{total}</span>所驾培机构
        </span>
      </div>
      <Search
        filters={[{ type: 'Input', field: 'name', placeholder: '驾校名称', otherProps: { allowClear: true } }]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          forceUpdate();
          setPage(1);
        }}
      />
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <>
            {
              <div style={{ borderTop: '1px solid #DCDCDC', borderBottom: '1px solid #DCDCDC', padding: 15 }}>
                所属区域：
                <CheckableTag
                  checked={checkedTag === ''}
                  key="anything"
                  className="mr20"
                  onClick={() => {
                    setAreaCode('');
                    setCheckedTag('');
                    setPage(1);
                  }}
                >
                  不限
                </CheckableTag>
                {areaData.map((x: any) => {
                  return (
                    <CheckableTag
                      checked={checkedTag === x.codeKey}
                      className="mr20"
                      key={x.codeKey}
                      onClick={() => {
                        setCheckedTag(x.codeKey);
                        setAreaCode(x.codeKey);
                        setPage(1);
                      }}
                    >
                      {x.codeValue}
                    </CheckableTag>
                  );
                })}
              </div>
            }
            <List
              style={{ padding: 10 }}
              dataSource={_get(data, 'rows', [])}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar shape="square" size={100} src={_get(item, 'headImg')} />}
                    title={
                      <div style={{ display: 'flex' }}>
                        <span style={{ flex: 1, fontWeight: 'bold', fontSize: 16 }}>{item.name}</span>{' '}
                        <span style={{ paddingRight: 30 }}>{companyLevelHash[_get(item, 'schoolLevel', '')]}</span>
                      </div>
                    }
                    description={
                      <div style={{ paddingRight: 20 }}>
                        <Row>经营范围：{_get(item, 'busiScope')}</Row>
                        <Row>
                          <span className="mr20">教练员数：{_get(item, 'coachNumber')}</span>
                          <span className="ml20">教练车数：{_get(item, 'tracarNum')}</span>
                        </Row>
                        <Row style={{ display: 'flex' }}>
                          <span style={{ flex: 1 }}>地址：{_get(item, 'address')}</span>
                          <Button
                            type="primary"
                            onClick={() => {
                              _push(`rank/school/detail?id=${item.id}&total=${total}`);
                            }}
                          >
                            详情
                          </Button>
                        </Row>
                      </div>
                    }
                  />
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
