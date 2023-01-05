import { useHistory } from 'react-router-dom';
import { _get } from 'utils';
import { Avatar, Col, Row, Tabs, Radio } from 'antd';
import { useContext, useState } from 'react';
import { useEffect } from 'react';
import { PopoverImg } from 'components';
import AddressMap from './AddressMap';
import { _getImg, _getBasicInfo, _getDicCode, _getDesc } from 'app/yantai/_api';
import GlobalContext from 'globalContext';
import { IF, Loading } from 'components';

export default function Detail() {
  const history = useHistory();
  const { $openAPIToken } = useContext(GlobalContext);

  const [imgsData, setImgsData] = useState([]);
  const [dataList, setDataList] = useState({} as any);
  const [isLoading, setIsLoading] = useState(true);
  const IMG_TYPE = ['7', '8', '9', '10', '11']; // 7驾校头像/8校园风貌\9培训实景\10教具设施\11场地图片
  const searchParams = _get(history, 'location.search', '')
    .replace('?', '')
    .split('&')
    .reduce((acc: any, x: any) => {
      const temp = x.split('=');
      Object.assign(acc, { [temp[0]]: temp[1] });
      return acc;
    }, {});
  const { id, total } = searchParams;
  const { TabPane } = Tabs;
  const [basicInfoData, setBasicInfoData] = useState([]);
  const [companyImg, setCompanyImg] = useState([]);
  const [desc, setDesc] = useState('');

  useEffect(() => {
    async function getList() {
      setIsLoading(true);
      const res = await _getDicCode({
        codeType: 'company_img_type',
        parentCodeKey: '-1',
      });
      const res2 = await _getBasicInfo({ id });
      const res3 = await _getImg({ id, permissionType: 1 });
      const res4 = await _getDesc({ companyId: id });
      setCompanyImg(_get(res, 'data', []));
      setBasicInfoData(_get(res2, 'data', []));
      setImgsData(_get(res3, 'data', []));
      setDesc(_get(res4, 'data', ''));
      setIsLoading(false);
    }
    if ($openAPIToken) {
      getList();
    }
  }, [$openAPIToken, id]);
  const SCHOOL_IMG_LIST = companyImg
    .map((x: any) => {
      return { label: x.text, value: x.value };
    })
    .filter((x: any) => IMG_TYPE.includes(x.value));
  const NAME_LIST = SCHOOL_IMG_LIST.sort((x: any, y: any) => x.value - y.value).reverse() || []; // 图片

  useEffect(() => {
    const dataList = NAME_LIST.reduce((acc: any, x: any) => {
      const imgData = (imgsData || []).filter((item: any) => _get(item, 'type') === x.value);
      const imgDataMap = imgData.map((item: any) => {
        return { url: item.url, id: item.id };
      });
      return { ...acc, [x.value]: imgDataMap };
    }, {});

    setDataList(dataList);
  }, [NAME_LIST.length, imgsData]);

  return (
    <div>
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          _get(Object.keys(basicInfoData), 'length', 0) > 0 ? (
            <div style={{ background: '#FFFFFF', padding: 24 }}>
              <Row
                justify="end"
                className="mb20 pointer"
                style={{ color: '#B1B1B1' }}
                onClick={() => {
                  history.goBack();
                }}
              >
                {`<返回上一级`}
              </Row>
              <div style={{ display: 'flex', borderTop: '2px solid #2775E4', paddingTop: 20 }} className="mb20">
                <div className=" mr20 ml20 mb20">
                  <Avatar shape="square" size={160} src={_get(dataList, '7.0.url', '')} />
                </div>
                <div style={{ flex: 1 }}>
                  <Row>
                    <Col style={{ fontWeight: 'bold', fontSize: 16 }} span={12}>
                      {_get(basicInfoData, 'name')}
                    </Col>
                  </Row>
                  <Row style={{ color: '#666666', fontSize: 14 }} className="mt10">
                    <Col span={10}>经营范围：{_get(basicInfoData, 'busiScope')}</Col>
                    <Col span={12}>教练员数量：{_get(basicInfoData, 'coachNumber')}</Col>
                  </Row>
                  <Row style={{ color: '#666666', fontSize: 14 }} className="mt10">
                    <Col span={10}>联系人：{_get(basicInfoData, 'leader')}</Col>
                    <Col span={12}>教练车数量：{_get(basicInfoData, 'tracarNum')}</Col>
                  </Row>
                  <Row style={{ color: '#666666', fontSize: 14 }} className="mt10">
                    联系电话：{_get(basicInfoData, 'leaderPhone')}
                  </Row>
                  <Row style={{ color: '#666666', fontSize: 14 }} className="mt10">
                    <span>驾校地址：{_get(basicInfoData, 'address')}</span>
                  </Row>
                </div>
              </div>
              <Radio.Group
                defaultValue="school_introduce_id"
                buttonStyle="solid"
                onChange={(e: any) => {
                  const currentVal = e.target.value;
                  window.location.hash = `#${currentVal}`;
                }}
                size="large"
                style={{ width: '100%', display: 'flex' }}
              >
                <Radio.Button value="school_introduce_id" className="flex1 text-center">
                  驾校简介
                </Radio.Button>
                <Radio.Button value="teaching_environment_id" className="flex1 text-center">
                  教学环境
                </Radio.Button>

                <Radio.Button value="school_location_id" className="flex1 text-center">
                  <a href="#school_location_id">驾校位置</a>
                </Radio.Button>
              </Radio.Group>
              <div id="school_introduce_id">
                <div className="mt20 mb20" style={{ paddingBottom: 8, borderBottom: '2px solid #2E93F2' }}>
                  <span style={{ borderLeft: '1px solid #086FCF', paddingLeft: 10 }}>驾校简介</span>
                </div>
                <Row style={{ fontSize: 16, whiteSpace: 'pre-line' }} className="mt20 ml20 mr20">
                  {desc}
                </Row>
              </div>
              <div id="teaching_environment_id">
                <div className="mt20 mb20" style={{ paddingBottom: 8, borderBottom: '2px solid #2E93F2' }}>
                  <span style={{ borderLeft: '1px solid #086FCF', paddingLeft: 10 }}>教学环境</span>
                </div>
                <Tabs defaultActiveKey="school">
                  {NAME_LIST.filter((x: any) => {
                    return x.value !== '7';
                  }).map((item: any) => {
                    return (
                      <TabPane tab={item.label} key={item.value}>
                        {_get(dataList, `${item.value}.length`, 0) > 0 ? (
                          (dataList[item.value] || []).map((x: any, index: number) => {
                            return _get(x, 'url', '') ? (
                              <PopoverImg
                                src={_get(x, 'url', '')}
                                key={_get(x, 'id')}
                                imgStyle={{ marginRight: 20, marginBottom: 20, width: 280, height: 300 }}
                              />
                            ) : (
                              '未上传'
                            );
                          })
                        ) : (
                          <span>未上传</span>
                        )}
                      </TabPane>
                    );
                  })}
                </Tabs>
              </div>
              <div id="school_location_id">
                <div className="mt20 mb20" style={{ paddingBottom: 8, borderBottom: '2px solid #2E93F2' }}>
                  <span style={{ borderLeft: '1px solid #086FCF', paddingLeft: 10 }}>驾校位置</span>
                </div>
                <Row className="mb10">驾校位置：{_get(basicInfoData, 'address')}</Row>
                <div style={{ width: '100%', height: 400 }}>
                  <AddressMap address={_get(basicInfoData, 'address')} />
                </div>
              </div>
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
