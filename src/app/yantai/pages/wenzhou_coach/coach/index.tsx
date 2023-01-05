import { useEffect, useState, useContext } from 'react';
import { useFetch, useForceUpdate, useGoto, useHash, useSearch } from 'hooks';
import { _get } from 'utils';
import { Avatar, Button, List, Pagination, Row, Tag, Col } from 'antd';
import { IF, Loading, Search } from 'components';
import { _getSuperviseList, _getCoachList, _getAreaCodes, _getDicCode } from 'app/yantai/_api';
import { PORTAL_CITY_CODE } from 'constants/env';
import GlobalContext from 'globalContext';
import { handleDicCode } from './utils';

export default function Coach() {
  const { _push } = useGoto();

  const [search, _handleSearch] = useSearch();
  const { CheckableTag } = Tag;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [areaCode, setAreaCode] = useState('');
  const [checkedTag, setCheckedTag] = useState('');
  const [ignore, forceUpdate] = useForceUpdate();
  const [data, setData] = useState([]);
  const [areaData, setAreaData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { $openAPIToken } = useContext(GlobalContext);
  const [gender, setGender] = useState<any>([]);

  useEffect(() => {
    async function getList() {
      setIsLoading(true);
      const res = await _getCoachList({
        areaCode,
        page,
        limit: pageSize,
        coachname: _get(search, 'coachname'),
        teachpermitted: _get(search, 'teachpermitted'),
      });
      const res3 = await _getAreaCodes({ parentCodeKey: PORTAL_CITY_CODE });
      setData(_get(res, 'data', []));
      setAreaData(_get(res3, 'data', []));
      setIsLoading(false);
    }
    if ($openAPIToken) {
      getList();
    }
  }, [pageSize, page, areaCode, ignore]);

  const total = _get(data, 'total', 0);
  const onChange = (page: any, pageSize: any) => {
    setPage(page);
    setPageSize(pageSize);
  };

  useEffect(() => {
    async function getDic() {
      const resGender = await _getDicCode({
        codeType: 'gender_type',
        parentCodeKey: '-1',
      });
      setGender(_get(resGender, 'data', []));
    }
    getDic();
  }, []);

  const genderHash = handleDicCode(gender);
  return (
    <div style={{ background: '#FFFFFF', width: '100%', padding: 20 }}>
      <div className=" mb20 flex p10" style={{ borderBottom: '2px solid #2775E4' }}>
        <span className="bold flex1">找教练</span>
        <span style={{ color: '#B1B1B1' }}>
          共计<span style={{ color: '#2775E4' }}>{total}</span>人教练员
        </span>
      </div>
      <Search
        filters={[{ type: 'Input', field: 'coachname', placeholder: '教练名称', otherProps: { allowClear: true } }]}
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
                    avatar={<Avatar shape="square" size={100} src={_get(item, 'coaCoachExtinfoEntity.headImgUrl')} />}
                    description={
                      <div style={{ paddingRight: 20 }}>
                        <Row>姓名：{_get(item, 'coachname')}</Row>
                        <Row className="mt20 mb20">
                          <Col span={12}>性别：{genderHash[_get(item, 'sex')]}</Col>
                          <Col span={12}>准教车型：{_get(item, 'teachpermitted')}</Col>
                        </Row>
                        <Row style={{ display: 'flex' }}>
                          <span style={{ flex: 1 }}>所属驾校：{_get(item, 'schoolName')}</span>
                          <Button
                            type="primary"
                            onClick={() => {
                              _push(
                                `wenzhou_coach/coach/detail?id=${item.cid}&total=${total}&schoolId=${item.schoolId}`,
                              );
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
