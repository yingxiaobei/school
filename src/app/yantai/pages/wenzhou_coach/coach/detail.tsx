import { useHistory } from 'react-router-dom';
import { _get } from 'utils';
import { Avatar, Col, Row, Radio } from 'antd';
import { useContext, useState } from 'react';
import { useEffect } from 'react';
import { _getImg, _getBasicInfo, _getDicCode, _getDesc, _getCoachDetail, _getEvaluateList } from 'app/yantai/_api';
import GlobalContext from 'globalContext';
import { IF, Loading } from 'components';
import { handleDicCode } from './utils';
import CoachEvaluation from './CoachEvaluation';

export default function Detail() {
  const history = useHistory();
  const { $openAPIToken } = useContext(GlobalContext);

  const [isLoading, setIsLoading] = useState(true);
  const searchParams = _get(history, 'location.search', '')
    .replace('?', '')
    .split('&')
    .reduce((acc: any, x: any) => {
      const temp = x.split('=');
      Object.assign(acc, { [temp[0]]: temp[1] });
      return acc;
    }, {});
  const { id, total, schoolId } = searchParams;
  const [basicInfoData, setBasicInfoData] = useState([]);
  const [gender, setGender] = useState<any>([]);
  const [level, setLevel] = useState<any>([]);
  const [currentVal, setCurrentVal] = useState('');

  useEffect(() => {
    async function getList() {
      setIsLoading(true);
      const res2 = await _getCoachDetail({ id }, schoolId);

      setBasicInfoData(_get(res2, 'data', []));
      setIsLoading(false);
    }
    if ($openAPIToken) {
      getList();
    }
  }, [$openAPIToken, id, schoolId]);
  useEffect(() => {
    async function getDic() {
      const resLevel = await _getDicCode({
        codeType: 'occupation_level_type',
        parentCodeKey: '-1',
      });
      const resGender = await _getDicCode({
        codeType: 'gender_type',
        parentCodeKey: '-1',
      });
      setLevel(_get(resLevel, 'data', []));
      setGender(_get(resGender, 'data', []));
    }
    getDic();
  }, []);
  const occupationHash = handleDicCode(level);
  const genderHash = handleDicCode(gender);

  return (
    <div>
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          _get(Object.keys(basicInfoData), 'length', 0) > 0 ? (
            <div style={{ background: '#FFFFFF' }}>
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
                  <Avatar shape="square" size={140} src={_get(basicInfoData, 'coaCoachExtinfoEntity.headImgUrl', '')} />
                </div>
                <div style={{ flex: 1 }}>
                  <Row>
                    <Col style={{ fontWeight: 'bold', fontSize: 16, color: '#333333' }} className="mt10" span={12}>
                      {_get(basicInfoData, 'coachname')}
                    </Col>
                  </Row>
                  <Row className="mt10 mb10" style={{ color: '#666666', fontSize: 14 }}>
                    <Col span={8}>性别：{genderHash[_get(basicInfoData, 'sex', '')]}</Col>
                    <Col span={10}>
                      教练等级：
                      <span style={{ color: '#F3302B' }}>
                        {occupationHash[_get(basicInfoData, 'occupationlevel', '')]}
                      </span>
                    </Col>
                  </Row>
                  <Row style={{ color: '#666666', fontSize: 14 }}>
                    <Col span={8}>教练车牌：{_get(basicInfoData, 'drilicence')}</Col>
                    <Col span={10}>准驾车型：{_get(basicInfoData, 'teachpermitted')}</Col>
                  </Row>
                  <Row className="mt10 mb10" style={{ color: '#666666', fontSize: 14 }}>
                    <Col span={8}>
                      <span>任职驾校：{_get(basicInfoData, 'schoolName')}</span>
                    </Col>
                  </Row>
                </div>
              </div>
              <Row className="mt20 mb20" style={{ background: '#E2F1FF', padding: 6, paddingLeft: 50 }}>
                评价信息
              </Row>
              <div className="mt20 mb20" style={{ paddingBottom: 8, borderBottom: '2px solid #2E93F2' }}>
                <span style={{ borderLeft: '1px solid #086FCF', paddingLeft: 10 }}>评价信息</span>
              </div>
              <Radio.Group
                defaultValue="all"
                buttonStyle="solid"
                onChange={(e: any) => {
                  const currentVal = e.target.value;
                  setCurrentVal(currentVal);
                  // _push(currentVal);
                }}
                size="large"
                style={{ width: '100%', display: 'flex' }}
              >
                <Radio.Button value="all" className="flex1 text-center">
                  全部评价
                </Radio.Button>
                <Radio.Button value="1" className="flex1 text-center">
                  好评
                </Radio.Button>
                <Radio.Button value="2" className="flex1 text-center">
                  中评
                </Radio.Button>
                <Radio.Button value="3" className="flex1 text-center">
                  差评
                </Radio.Button>
              </Radio.Group>
              <CoachEvaluation schoolId={schoolId} quality={currentVal} />
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
