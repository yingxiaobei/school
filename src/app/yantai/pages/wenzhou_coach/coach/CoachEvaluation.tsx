import { List, Avatar, Pagination } from 'antd';
import { _getCoachList, _getSearchText, _getStudentList } from 'api';
import { IF, Loading } from 'components';
import { formatTime, _get } from 'utils';
import { _getDicCode, _getEvaluateList } from 'app/yantai/_api';
import ICON from 'statics/images/portal/listIcon.png';
import { useContext, useEffect, useState } from 'react';
import GlobalContext from 'globalContext';
import { handleDicCode } from './utils';

const LIMIT = 10;

export default function CoachEvaluation(props: any) {
  const { schoolId, quality = '' } = props;
  const [pageSize, setPageSize] = useState(LIMIT);
  const [page, setPage] = useState(1);
  const { $openAPIToken } = useContext(GlobalContext);
  const [data, setData] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [qualityType, setQualityType] = useState<any>([]);

  useEffect(() => {
    async function getList() {
      setIsLoading(true);
      const res = await _getEvaluateList(
        {
          limit: pageSize, //每页条数
          page: page, //前页
          teachQuality: quality === 'all' ? '' : quality,
        },
        schoolId,
      );

      setData(_get(res, 'data'));
      setIsLoading(false);
    }
    if ($openAPIToken) {
      getList();
    }
  }, [$openAPIToken, schoolId, pageSize, page, quality]);

  useEffect(() => {
    async function getDic() {
      const qualityType = await _getDicCode({
        codeType: 'evaluation_quality_type',
        parentCodeKey: '-1',
      });

      setQualityType(_get(qualityType, 'data', []));
    }
    getDic();
  }, []);

  const qualityTypeHash = handleDicCode(qualityType);
  const total = _get(data, 'total', 0);
  const onChange = (page: any, pageSize: any) => {
    setPage(page);
    setPageSize(pageSize);
  };

  return (
    <div>
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <>
            <List
              style={{ padding: '0 20px' }}
              dataSource={_get(data, 'rows', [])}
              renderItem={(item: any) => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    avatar={<Avatar src={item.head_img_url_show} className="mr20" size="large" />}
                    title={item.studentName}
                    description={qualityTypeHash[item.teachQuality]}
                  ></List.Item.Meta>
                  <div style={{ color: '#B7B7B7' }} className="mt20">
                    {item.createTime}
                  </div>
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
