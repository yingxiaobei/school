// 教学评价
import * as React from 'react';
import { Button, message, Radio, Row, Select } from 'antd';
import { useState } from 'react';
import { Auth, _get } from 'utils';
import { _getCoachList } from 'api';
import { _getDetails, _saveStuEvaluation, _getEvaluateList } from './_api';
import { PopoverImg } from 'components';
import { useFetch, useHash } from 'hooks';
import { IF, Loading } from 'components';
import { useHistory } from 'react-router-dom';
import { PUBLIC_URL } from 'constants/env';

export default function TeachingEvaluation() {
  const [optionData, setOptionData] = useState([]);
  const [teachQuality, setTeachQuality] = useState('');
  const [serviceQuality, setServiceQuliaty] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedCoach, setSelectedCoach] = useState('');
  const [coachDetail, setCoachDetail] = useState();
  const genderHash = useHash('gender_type'); // 性别
  const evaluationQualityHash = useHash('evaluation_quality_type');
  const history = useHistory();

  const onChange = (e: any) => {
    setTeachQuality(e.target.value);
  };

  const onChange2 = (e: any) => {
    setServiceQuliaty(e.target.value);
  };

  const { data, isLoading } = useFetch({
    request: _getEvaluateList,
    query: { page: 1, limit: 10, sid: Auth.get('sid') },
    callback: (data: any) => {
      const cid = _get(data, 'rows.0.cid', '');
      const serviceQuality = _get(data, 'rows.0.serviceQuality');
      const teachQuality = _get(data, 'rows.0.teachQuality');
      cid && setSelectedCoach(cid);
      teachQuality && setTeachQuality(teachQuality);
      serviceQuality && setServiceQuliaty(serviceQuality);
    },
  });

  React.useEffect(() => {
    _getDetails({ id: selectedCoach }, { customSchoolId: Auth.get('schoolId') }).then((data) => {
      setCoachDetail(_get(data, 'data', {}));
    });
  }, [selectedCoach]);

  const isEvaluated: boolean = _get(data, 'rows.length', 0) > 0 && Auth.get('sid') ? true : false; //是否已评价

  return (
    <div
      style={{
        background: '#FFFFFF',
        height: 400,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 20,
      }}
    >
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Row>
              <span style={{ marginTop: 5 }}>选择教练：</span>
              <Select
                disabled={isEvaluated}
                style={{ margin: '0 20px 20px 0', width: 200, display: 'inline-block', marginRight: 20 }}
                value={_get(data, 'rows.0.coachName')}
                placeholder="教练员"
                onSearch={(value) => {
                  const query = { coachname: value };
                  _getCoachList(query, { customSchoolId: Auth.get('schoolId') }).then((res: any) => {
                    setOptionData(
                      _get(res, 'data', []).map((x: any) => {
                        return { label: x.coachname, value: x.cid };
                      }),
                    );
                  });
                }}
                showSearch
                filterOption={false}
                allowClear={true}
                options={[{ label: '请选择教练员', value: '' }, ...optionData]}
                onSelect={async (val: any) => {
                  setSelectedCoach(val);
                }}
              />
            </Row>

            <div style={{ border: '1px solid #33A0FF', padding: 15 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  borderBottom: '1px solid #33A0FF',
                  paddingBottom: 20,
                }}
              >
                <div style={{ background: '#edf0f5', width: 60, height: 60 }}>
                  <PopoverImg
                    src={_get(coachDetail, 'coaCoachExtinfoEntity.headImgUrl', '')}
                    imgStyle={{ width: 60, height: 60 }}
                  />
                </div>

                <div>
                  <Row>姓名：{_get(coachDetail, 'coachname', '')}</Row>
                  <Row>性别：{genderHash[_get(coachDetail, 'sex', 0)]}</Row>
                </div>
              </div>

              <Row className="mt20">
                <span>教学质量：</span>
                <Radio.Group onChange={onChange} value={teachQuality} disabled={isEvaluated}>
                  <Radio value={'1'}>满意</Radio>
                  <Radio value={'2'}>基本满意</Radio>
                  <Radio value={'3'}>不满意</Radio>
                </Radio.Group>
              </Row>
              <Row className="mt20">
                <span>服务质量：</span>
                <Radio.Group onChange={onChange2} value={serviceQuality} disabled={isEvaluated}>
                  <Radio value={'1'}>满意</Radio>
                  <Radio value={'2'}>基本满意</Radio>
                  <Radio value={'3'}>不满意</Radio>
                </Radio.Group>
              </Row>
            </div>
            {!isEvaluated && (
              <Button
                type="primary"
                className="mt20"
                style={{ background: '#33A0FF', borderColor: '#33A0FF' }}
                onClick={async () => {
                  if (!selectedCoach) {
                    return message.error('请选择教练');
                  }
                  if (!teachQuality) {
                    return message.error('请评价教学质量');
                  }
                  if (!serviceQuality) {
                    return message.error('请评价服务质量');
                  }
                  const query = {
                    cid: selectedCoach,
                    serviceQuality,
                    teachQuality,
                    sid: String(Auth.get('sid')),
                  };
                  const res = await _saveStuEvaluation(query, { customSchoolId: Auth.get('schoolId') });
                  if (_get(res, 'code') === 200) {
                    setTimeout(function () {
                      history.replace(`${PUBLIC_URL}`);
                    }, 2000);
                  }
                }}
              >
                提交
              </Button>
            )}
          </div>
        }
      />
    </div>
  );
}
