import { useEffect, useState, useContext } from 'react';
import LINE from 'statics/images/portal/line.png';
import TIME from 'statics/images/portal/time.png';
import CAR from 'statics/images/portal/car.png';
import COACH from 'statics/images/portal/coach.png';
import INDUSTRY from 'statics/images/portal/industry_icon.png';
import SIGNUP from 'statics/images/portal/signup.png';
import STUDENT from 'statics/images/portal/student.png';
import LINE2 from 'statics/images/portal/line2.png';
import SCHOOL from 'statics/images/portal/schoolImg.png';
import '../../../common.css';
import { formatTime, _get } from 'utils';
import moment from 'moment';
import {
  _getPortalArticleList,
  _getPortalSubjectList,
  _searchSubItemConfigs,
  _getTplConfigList,
  _pageRankCompany,
  _coaStartList,
  _queryStatistics,
} from 'app/yantai/_api';
import { useGoto, useVisible } from 'hooks';
import CommonList from '../home/CommonList';
import { Carousel, Radio, Empty, Rate, Tooltip } from 'antd';
import GlobalContext from 'globalContext';
import { ForwardFilled } from '@ant-design/icons';
import CommonHomepageDetail from 'app/yantai/components/CommonHomepageDetail';
import { IF, Loading } from 'components';
import AppDownload from './AppDownload';
import { PORTAL_URL } from 'constants/env';

export default function Demo1() {
  const { _push } = useGoto();
  const [data, setData] = useState([]);
  const [noticeData, setNoticeData] = useState([]);
  const [businessGuideData, setBusinessGuideData] = useState([]);
  const [industryNewsData, setIndustryNewsData] = useState([]);
  const [policeData, setPoliceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgData, setImgData] = useState([]);
  const [linkData, setInkData] = useState([]);
  const [industryStyleData, setIndustryStyleData] = useState([]);
  const [officialAccountData, setOfficialAccountData] = useState([]);
  const [schoolRedData, setSchoolRedData] = useState([]);
  const [schoolBlackData, setSchoolBlackData] = useState([]);
  const { $openAPIToken } = useContext(GlobalContext);
  const [currentVal, setCurrentVal] = useState('');
  const [articleIdObj, setArticleIdObj] = useState({
    noticeId: '',
    industryNewsId: '',
    policyId: '',
  });
  const [visible, setVisible] = useVisible();
  const [industryArr, setIndustryArr] = useState([]);
  const [studyArr, setStudyArr] = useState<any>([]);
  const [currentData, setCurrentData] = useState([]);
  const [currentDetailId, setCurrentDetailId] = useState('');
  const [name, setName] = useState({
    pageSingleName: '????????????',
    pageAllName: '????????????',
  });
  const [carouselId, setCarouselId] = useState(''); //?????????id
  const [schoolData, setSchoolData] = useState([]) as any; //????????????
  const [coachData, setCoachData] = useState([]) as any; //????????????
  const [statisticData, setStatisticData] = useState([]) as any; //????????????

  useEffect(() => {
    async function getArticleList() {
      const articleList = await _getPortalArticleList({
        isHomepageShow: '1', //??????????????????1??????
        limit: 7, //????????????
        page: 1, //??????
        isHomepageQuery: '1',
        publishTimeEnd: formatTime(moment(), 'DATE'), //?????????????????? yyyy-MM-dd
        publishTimeStart: formatTime(moment().subtract(30, 'day'), 'DATE'), //?????????????????? yyyy-MM-dd
        type: currentVal, //????????????
      });
      setCurrentData(_get(articleList, 'data.rows', []));
      setCurrentDetailId(_get(articleList, 'data.rows.0.id', ''));
    }
    currentVal && getArticleList();
  }, [currentVal]);

  useEffect(() => {
    async function getCarouseList() {
      const res = await _getPortalSubjectList({
        limit: 99, //????????????
        page: 1, //??????
        type: carouselId, //????????????
      });
      const img = _get(res, 'data.rows', []);
      const imgSort = img.sort((a: any, b: any) => {
        const x = _get(a, 'seq', 1000);
        const y = _get(b, 'seq', 1000);
        if (x - y === 0) {
          return moment(moment(_get(b, 'createTime'))).diff(_get(a, 'createTime'));
        }
        return x - y;
      });
      setImgData(imgSort);
    }
    carouselId && getCarouseList();
  }, [carouselId]);

  useEffect(() => {
    async function getList() {
      const statistics = await _queryStatistics({ queryDate: moment().subtract(1, 'years').format('YYYY-MM-DD') });
      setStatisticData(_get(statistics, 'data'));
      const pageContent = await _getTplConfigList({
        site: 'page_all,page_single,slide_show',
        page: 1,
        limit: 99,
      });
      const pageALL = _get(pageContent, 'data.rows', []).filter((x: any) => x.site === 'page_all'); //???????????? ??????????????????
      const pageSingle = _get(pageContent, 'data.rows', []).filter((x: any) => x.site === 'page_single'); //?????????????????????tab???,????????????????????????
      const pageCarousel = _get(pageContent, 'data.rows', []).filter((x: any) => x.site === 'slide_show'); //?????????
      const res = await _searchSubItemConfigs({
        id: _get(pageSingle, '0.itemId'),
        site: 'page_single',
      });
      const res2 = await _searchSubItemConfigs({
        id: _get(pageALL, '0.itemId'),
        site: 'page_all',
      });
      setName({
        pageAllName: _get(pageALL, '0.name'),
        pageSingleName: _get(pageSingle, '0.name'),
      });

      setIndustryArr(_get(res, 'data', []).slice(0, 4));
      setCarouselId(_get(pageCarousel, '0.itemId'));
      setCurrentVal(_get(res, 'data.0.itemId', ''));
      const studyList = _get(res2, 'data', []).map(async (x: any, index: any) => {
        let res: any = {};
        if (_get(x, 'itemId')) {
          res = await _getPortalSubjectList({
            limit: 99, //????????????
            page: 1, //??????
            type: x.itemId,
          });
        }

        const data = _get(res, 'data.rows.0', {}) || {};
        return { ...x, ...data };
      });
      const arr: any = [];
      for (const item of studyList) {
        const res = await item;
        arr.push(res);
      }

      arr.length > 0 && setStudyArr(arr.slice(0, 6)); //??????????????????

      const rankCompanyData = await _pageRankCompany();
      setSchoolData(_get(rankCompanyData, 'data', []));
      const rankCoach = await _coaStartList();
      setCoachData(_get(rankCoach, 'data', []));
      setLoading(false);
    }

    if ($openAPIToken) {
      getList();
    }
  }, [$openAPIToken]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {visible && <AppDownload onCancel={setVisible} />}
      <div style={{ position: 'relative' }}>
        <Carousel className="carousel1" autoplay /*  style={{ height: 330 }} */>
          {_get(imgData, 'length', 0) > 0 ? (
            imgData.map((x: any) => {
              return (
                <div key={_get(x, 'id')}>
                  <div
                    style={{ position: 'relative' }}
                    className="pointer"
                    onClick={() => {
                      _get(x, 'url') && window.open(_get(x, 'url'));
                    }}
                  >
                    {_get(x, 'img.fileUrl') ? (
                      <img src={_get(x, 'img.fileUrl')} alt="" style={{ width: '100%', height: 330 }} />
                    ) : (
                      <Empty
                        style={{ width: '100%', height: 330 }}
                        className="flex-box"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={<span>????????????</span>}
                      />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div>
              <div style={{ width: '100%', height: 330, background: 'white' }} className="flex-box">
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            </div>
          )}
        </Carousel>
        {/*
        coaCarNum	???????????????	
        coaNum ????????????	
        insNum ??????????????????	
        stuApplyNum	????????????????????????	
        stuNum ????????????	
        stuTrainNum	???????????????????????? 
        */}
        <div className="bannerMask">
          <div className="statistic  mr20">
            <div>
              <img src={INDUSTRY} className="statisticImg" />
              <span>??????????????????</span>
            </div>
            <div>{_get(statisticData, 'insNum', '????????????')}</div>
          </div>
          <div className="statistic mr20">
            <div>
              <img src={COACH} className="statisticImg" />
              <span>???????????????</span>
            </div>
            <div>{_get(statisticData, 'coaNum', '????????????')}</div>
          </div>
          <div className="statistic  mr20">
            <div>
              <img src={CAR} className="statisticImg" />
              <span>???????????????</span>
            </div>
            <div>{_get(statisticData, 'coaCarNum', '????????????')}</div>
          </div>
          <div className="mr10 flex" style={{ width: 90 }}>
            <div className="mr10">
              <img src={LINE2} />
            </div>
            <div className="mr10">
              <div>
                <img src={TIME} />
              </div>
              <span style={{ color: '#2E93F2', fontSize: 8 }}> {moment().format('YYYY')}??????</span>
            </div>
          </div>
          <div className="statistic  mr20">
            <div>
              <img src={SIGNUP} className="statisticImg" />
              <span>??????????????????</span>
            </div>
            <div>{_get(statisticData, 'stuApplyNum', '????????????')}</div>
          </div>
          <div className="statistic ">
            <div>
              <img src={STUDENT} className="statisticImg" />
              <span>??????????????????</span>
            </div>
            <div>{_get(statisticData, 'stuTrainNum', '????????????')}</div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 90, width: 1200, alignSelf: 'center' }} className="mb20">
        <div className="mb20 flex-box  background-white" style={{ height: 50, flexDirection: 'column' }}>
          <div className="fz30 bold mb10">{_get(name, 'pageSingleName', '????????????')}</div>
          <img src={LINE} />
        </div>
        <div className="mt20 mb20 flex-box">
          <Radio.Group
            value={currentVal}
            buttonStyle="solid"
            onChange={(e: any) => {
              const currentVal = e.target.value;
              setCurrentVal(currentVal);
              // _push(currentVal);
            }}
            size="large"
            style={{ width: '100%', display: 'flex' }}
          >
            {industryArr.map((x: any) => {
              return (
                <Radio.Button key={x.id} value={x.itemId} className="flex1 text-center">
                  {x.name}
                </Radio.Button>
              );
            })}
          </Radio.Group>
        </div>
        {
          <IF
            condition={loading}
            then={<Loading />}
            else={
              <div className="flex p10  border-all" style={{ width: '100%', height: 400 }}>
                <div style={{ width: '50%' }}>
                  <CommonHomepageDetail id={currentDetailId} itemId={currentVal} />
                </div>
                <div className="flex1 ml10 p10" style={{ background: '#fff' }}>
                  <CommonList
                    loading={loading}
                    address={`cms/information/${currentVal}`}
                    data={currentData}
                    itemId={currentVal}
                    isShowTime={true}
                  />
                </div>
              </div>
            }
          />
        }
        {currentVal === 'rank/coachRed' && (
          <div className="flex  p10 border-all " style={{ height: 400 }}>
            <div className="flex1">
              <span className="flex-box fz20">
                <span style={{ borderBottom: '2px solid #2E93F2', paddingBottom: 10 }}>????????????</span>
              </span>
              <CommonList
                loading={loading}
                address={'rank/schoolRed'}
                detailAddress={'rank/schoolRed/detail'}
                data={schoolRedData}
                isShowTime={true}
              />
            </div>
            <div className="flex1">
              <span className="flex-box  fz20">
                <span style={{ borderBottom: '2px solid #2E93F2', paddingBottom: 10 }}>????????????</span>
              </span>
              <div className="border-left">
                <CommonList
                  loading={loading}
                  address={'rank/schoolBlack'}
                  detailAddress={'rank/schoolBlack/detail'}
                  data={schoolBlackData}
                  isShowTime={true}
                />
              </div>
            </div>
          </div>
        )}
        <div style={{ background: '#F6F6F6' }} className="mt20 mb20 p10">
          <div className="mt20 mb20 flex-box p10" style={{ flexDirection: 'column' }}>
            <div className="fz30 bold mb10" style={{ color: '#2E93F2' }}>
              {_get(name, 'pageAllName', '????????????')}
            </div>
            <img src={LINE} />
          </div>
          <div className="flex" style={{ justifyContent: 'space-around', flexWrap: 'wrap' }}>
            {(studyArr || []).map((x: any) => {
              return (
                <div
                  key={x.itemId}
                  className="p10 background-white homepage-car pointer mb10 mt10"
                  onClick={() => {
                    if (x.showType === 'pop_up') {
                      return setVisible();
                    }
                    x.url && window.open(x.url);
                  }}
                >
                  {_get(x, 'img.fileUrl') ? (
                    <img src={_get(x, 'img.fileUrl')} alt="" style={{ width: '100%', height: 330 }} />
                  ) : (
                    <Empty
                      style={{ width: '100%', height: 266 }}
                      className="flex-box"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={<span>????????????</span>}
                    />
                  )}
                  <div
                    className="bold fz18 p10 textEllipsis"
                    style={{ color: '#333333', maxWidth: 330, textAlign: 'center' }}
                  >
                    {x.name}
                  </div>
                  <div className="border-top p10 textEllipsis" style={{ color: '#999999', maxWidth: 330 }}>
                    {x.title}
                  </div>
                </div>
              );
            })}
            {/* <div
              className="p10 background-white homepage-car pointer"
              onClick={() => {
                _push('learningNotice/signUpNotice');
              }}
            >
              <img src={SCHOOL} />
              <div className="bold fz18 p10" style={{ color: '#333333' }}>
                ????????????
              </div>
              <div className="border-top p10" style={{ color: '#999999' }}>
                ???????????????????????????????????????
              </div>
            </div>
            <div
              className="p10 background-white homepage-car pointer"
              onClick={() => {
                window.open(PORTAL_URL);
              }}
            >
              <img src={SCHOOL} />
              <div className="bold fz18 p10" style={{ color: '#333333' }}>
                ????????????
              </div>
              <div className="border-top p10" style={{ color: '#999999' }}>
                ?????????????????????????????????????????????
              </div>
            </div>
            <div className="p10 background-white homepage-car pointer" onClick={setVisible}>
              <img src={SCHOOL} />
              <div className="bold fz18 p10" style={{ color: '#333333' }}>
                ????????????
              </div>
              <div className="border-top p10" style={{ color: '#999999' }}>
                ????????????????????????????????????
              </div>
            </div>
            <div className="p10 background-white homepage-car pointer" onClick={setVisible}>
              <img src={SCHOOL} />
              <div className="bold fz18 p10" style={{ color: '#333333' }}>
                ????????????
              </div>
              <div className="border-top p10" style={{ color: '#999999' }}>
                ????????????????????????????????????????????????
              </div>
            </div>
            <div className="p10 background-white homepage-car pointer" onClick={setVisible}>
              <img src={SCHOOL} />
              <div className="bold fz18 p10" style={{ color: '#333333' }}>
                ????????????
              </div>
              <div className="border-top p10" style={{ color: '#999999' }}>
                ????????????????????????????????????????????????
              </div>
            </div>
            <div
              className="p10 background-white homepage-car"
              onClick={() => {
                window.open('https://gab.122.gov.cn/m/login');
              }}
            >
              <img src={SCHOOL} />
              <div className="bold fz18 p10" style={{ color: '#333333' }}>
                ????????????
              </div>
              <div className="border-top p10" style={{ color: '#999999' }}>
                ?????????????????????????????????
              </div>
            </div>
           */}
          </div>
        </div>

        <div className="mt20 mb20 flex-box p10" style={{ flexDirection: 'column' }}>
          <div className="fz30 bold mb10" style={{ color: '#2E93F2' }}>
            ????????????
          </div>
          <img src={LINE} />
        </div>
        <div className="flex mb20" style={{ justifyContent: 'space-around' }}>
          <div className="homepage-rank">
            <div className="flex-box homepage-rank-title">????????????</div>
            <div style={{ height: 360, flexDirection: 'column' }} className="flex">
              {_get(schoolData, 'length', 0) > 0 ? (
                schoolData.map((x: any, index: any) => {
                  return (
                    <div
                      className="flex p10"
                      style={{
                        borderBottom: `${index + 1 < _get(schoolData, 'length', 0) ? '1px solid #dcdbdb' : ''}`,
                      }}
                    >
                      <span
                        style={{ width: 50, color: `${index > 2 ? '#333333' : '#EE2424'}`, marginTop: 6 }}
                        className="flex-box"
                      >
                        {Number(index) + 1}-
                      </span>
                      <Tooltip className="flex1" title={x.schoolName}>
                        <span className="textEllipsis" style={{ maxWidth: 150, marginTop: 6 }}>
                          {x.schoolName}
                        </span>
                      </Tooltip>

                      <span className="flex1">
                        <Rate value={x.startNumber} disabled />
                      </span>
                    </div>
                  );
                })
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>
          </div>
          <div className="homepage-rank">
            <div className="flex-box homepage-rank-title">??????????????????</div>

            <div style={{ height: 360, flexDirection: 'column' }} className="flex">
              {_get(coachData, 'length', 0) > 0 ? (
                coachData.map((x: any, index: any) => {
                  return (
                    <div
                      key={x.cid}
                      className="flex p10"
                      style={{
                        borderBottom: `${index + 1 < _get(coachData, 'length', 0) ? '1px solid #dcdbdb' : ''}`,
                      }}
                    >
                      <span
                        style={{ width: 50, color: `${index > 2 ? '#333333' : '#EE2424'}`, marginTop: 6 }}
                        className="flex-box"
                      >
                        {Number(index) + 1}-
                      </span>
                      <Tooltip className="flex1" title={x.cname}>
                        <span className="textEllipsis" style={{ maxWidth: 150, marginTop: 6 }}>
                          {x.cname}
                        </span>
                      </Tooltip>

                      <span className="flex1">
                        <Rate value={x.startNumber} disabled />
                      </span>
                    </div>
                  );
                })
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>
          </div>
          <div className="homepage-rank">
            <div className="flex-box homepage-rank-title">??????????????????</div>
            <div style={{ height: 360, flexDirection: 'column' }} className="flex">
              {_get(schoolData, 'length', 0) > 0 ? (
                schoolData.map((x: any, index: any) => {
                  return (
                    <div
                      className="flex p10"
                      style={{
                        borderBottom: `${index + 1 < _get(schoolData, 'length', 0) ? '1px solid #dcdbdb' : ''}`,
                      }}
                    >
                      <span
                        style={{ width: 50, color: `${index > 2 ? '#333333' : '#EE2424'}`, marginTop: 6 }}
                        className="flex-box"
                      >
                        {Number(index) + 1}-
                      </span>
                      <Tooltip className="flex1" title={x.schoolName}>
                        <span className="textEllipsis" style={{ maxWidth: 150, marginTop: 6 }}>
                          {x.schoolName}
                        </span>
                      </Tooltip>

                      <span className="flex1">
                        <Rate value={x.startNumber} disabled />
                      </span>
                    </div>
                  );
                })
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
