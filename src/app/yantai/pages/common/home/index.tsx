import { useEffect, useState, useContext } from 'react';
import IMG1 from 'statics/images/portal/img1.png';
import SCHOOL1 from 'statics/images/portal/school1.png';
import SCHOOL2 from 'statics/images/portal/school2.png';
import SCHOOL3 from 'statics/images/portal/school3.png';
import SCHOOL4 from 'statics/images/portal/schoolBlack.png';
import SCHOOL5 from 'statics/images/portal/schoolRed.png';
import SCHOOL6 from 'statics/images/portal/coachBlack.png';
import SCHOOL7 from 'statics/images/portal/coachRed.png';
import SCHOOL8 from 'statics/images/portal/industry.png';
import LINK1 from 'statics/images/portal/link1.png';
import LINK2 from 'statics/images/portal/link2.png';
import LINK3 from 'statics/images/portal/link3.png';
import LINK4 from 'statics/images/portal/link4.png';
import QRCODE from 'statics/images/portal/QRcode.png';
import '../../../common.css';
import { formatTime, _get } from 'utils';
import moment from 'moment';
import { Login } from '../../../components/Login';
import { Study } from '../../../components/Study';
import { Row, List } from 'antd';
import { _getPortalArticleList, _getPortalSubjectList } from 'app/yantai/_api';
import { useGoto } from 'hooks';
import CommonList from './CommonList';
import { Carousel } from 'antd';
import GlobalContext from 'globalContext';
import { ForwardFilled } from '@ant-design/icons';
// import jsonp from 'jsonp';

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
  const { $openAPIToken } = useContext(GlobalContext);
  // const [weather, setWeather] = useState({
  //   degree: '',
  //   weather: '',
  // });

  useEffect(() => {
    async function getList() {
      //weather_type=forecast_1h|forecast_24h|alarm|limit|tips|rise|observe|index|air
      // jsonp(
      //   `https://wis.qq.com/weather/common?source=pc&weather_type=observe&province=山东&city=烟台&county=`,
      //   {},
      //   (err: any, data: any) => {
      //     console.log(data);
      //     const weatherData = _get(data, 'data.observe', {});
      //     setWeather({
      //       degree: _get(weatherData, 'degree', ''),
      //       weather: _get(weatherData, 'weather', ''),
      //     });
      //     if (err) {
      //       console.log(err);
      //     } else {
      //       // setObserve(data.data)
      //     }
      //   },
      // );

      // 1	通知公告
      // 2	办事指南
      // 3	行业动态
      // 4	政策法规
      // 5  行业风采
      Promise.all(
        ['1', '2', '3', '4', '5'].map(async (x: string) => {
          return await _getPortalArticleList({
            isHomepageShow: '1', //是否首页显示1：是
            limit: 5, //每页条数
            page: 1, //前页
            isHomepageQuery: '1',
            publishTimeEnd: formatTime(moment(), 'DATE'), //发布时间结束 yyyy-MM-dd
            publishTimeStart: formatTime(moment().subtract(30, 'day'), 'DATE'), //发布时间开始 yyyy-MM-dd
            type: x, //文章类型
          });
        }),
      ).then((res) => {
        setLoading(false);
        setNoticeData(_get(res, '0.data.rows', []));
        setBusinessGuideData(_get(res, '1.data.rows', []));
        setIndustryNewsData(_get(res, '2.data.rows', []));
        setPoliceData(_get(res, '3.data.rows', []));
        setIndustryStyleData(_get(res, '4.data.rows', []).splice(0, 4));
      });
      Promise.all(
        ['1', '2', '3'].map(async (x: string) => {
          return await _getPortalSubjectList({
            limit: 99, //每页条数
            page: 1, //前页
            type: x, //栏目类型   1	轮播图2	友情链接3	公众号
          });
        }),
      ).then((res) => {
        const img = _get(res, '0.data.rows', []);
        const link = _get(res, '1.data.rows', []);
        const official = _get(res, '2.data.rows', []);
        const imgSort = img.sort((a: any, b: any) => {
          const x = _get(a, 'seq', 1000);
          const y = _get(b, 'seq', 1000);
          if (x - y === 0) {
            return moment(moment(_get(b, 'createTime'))).diff(_get(a, 'createTime'));
          }
          return x - y;
        });
        const linkSort = link.sort((a: any, b: any) => {
          return _get(a, 'seq', 1000) - _get(b, 'seq', 1000);
        });
        const officialSort = official.sort((a: any, b: any) => {
          return _get(a, 'seq', 1000) - _get(b, 'seq', 1000);
        });
        setImgData(imgSort);
        setInkData(linkSort);
        setOfficialAccountData(officialSort);
      });
    }

    if ($openAPIToken) {
      getList();
    }
  }, [$openAPIToken]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: 340, height: 330, background: '#fff' }}>
          <div className="homepage-title">通知公告</div>
          <CommonList
            loading={loading}
            address={'cms/notification'}
            detailAddress={'cms/notification/detail'}
            data={noticeData}
          />
        </div>
        <Carousel autoplay style={{ width: 460, height: 330 }}>
          {_get(imgData, 'length', 0) > 0 ? (
            imgData.map((x: any) => {
              return (
                <div key={_get(x, 'id')}>
                  <div
                    style={{ position: 'relative' }}
                    onClick={() => {
                      _get(x, 'url') && window.open(_get(x, 'url'));
                    }}
                  >
                    {_get(x, 'img.fileUrl') ? (
                      <img src={_get(x, 'img.fileUrl')} alt="" style={{ width: 460, height: 330 }} />
                    ) : (
                      <div style={{ width: 460, height: 330 }}></div>
                    )}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        left: '28%',
                        color: 'white',
                        width: 200,
                        textAlign: 'center',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {_get(x, 'title')}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div>
              <div style={{ width: 460, height: 330, background: 'white' }} className="flex-box">
                暂无信息
              </div>
            </div>
          )}
        </Carousel>

        <div style={{ width: 340, height: 330 }} className="mb20">
          <Login />
          <Study />
        </div>
      </div>
      <div
        style={{
          background: '#f6f6f6',
        }}
      >
        <div style={{ background: '#fff', paddingLeft: 20, paddingBottom: 10 }}>
          {
            <iframe
              className="ml20 mt20"
              src="https://i.tianqi.com/index.php?c=code&py=yantai&id=1&site=16"
              frameBorder="0"
              style={{ width: '100%', height: 30 }}
            ></iframe>
          }
          {/* 当地天气情况:<span className="fz30 ml20 mt20">{_get(weather, 'degree')}°</span>{' '}
          <span>{_get(weather, 'weather')}</span> */}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: 340, height: 330, background: '#fff' }}>
            <div className="homepage-title">办事指南</div>
            <CommonList
              loading={loading}
              address={'cms/businessGuide'}
              detailAddress={'cms/businessGuide/detail'}
              data={businessGuideData}
            />
          </div>
          <div style={{ width: 460, height: 330, background: '#fff' }}>
            <div className="homepage-title">政策法规</div>
            <CommonList
              loading={loading}
              address={'cms/regulation'}
              detailAddress={'cms/regulation/detail'}
              data={policeData}
            />
          </div>
          <div style={{ width: 340, height: 330, background: '#fff' }}>
            <div className="homepage-title">行业动态</div>
            <CommonList
              loading={loading}
              address={'cms/industryDynamics'}
              detailAddress={'cms/industryDynamics/detail'}
              data={industryNewsData}
            />
          </div>
        </div>
        <div className="homepage-caption">
          <span style={{ color: '#2299EE' }}>榜单排行 / </span>
          <span className="homepage-span ">List Ranking</span>
        </div>
        <div className="homepage-container" style={{ position: 'relative' }}>
          <img
            src={SCHOOL2}
            alt=""
            className="homepage-school"
            onClick={() => {
              _push('rank/school');
            }}
          />
          <img
            src={SCHOOL1}
            alt=""
            className="homepage-school"
            onClick={() => {
              _push('rank/schoolDynamic');
            }}
          />
          <img
            src={SCHOOL3}
            alt=""
            className="homepage-school"
            onClick={() => {
              _push('rank/evaluate');
            }}
          />
          <div style={{ position: 'fixed', right: '4%', bottom: 150 }}>
            {officialAccountData.map((x) => {
              return (
                <div className="mb10" key={_get(x, 'id')}>
                  {_get(x, 'img.fileUrl', '') && (
                    <img src={_get(x, 'img.fileUrl', '')} alt="" style={{ width: 100, height: 100 }} />
                  )}
                  <Row
                    style={{
                      fontSize: 8,
                      justifyContent: 'center',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      width: 100,
                    }}
                  >
                    {_get(x, 'title')}
                  </Row>
                </div>
              );
            })}
          </div>
        </div>
        <div className="homepage-container">
          <img
            src={SCHOOL5}
            alt=""
            className="homepage-list"
            onClick={() => {
              _push('rank/schoolRed');
            }}
          />
          <img
            src={SCHOOL4}
            alt=""
            className="homepage-list"
            onClick={() => {
              _push('rank/schoolBlack');
            }}
          />
          <img
            src={SCHOOL7}
            alt=""
            className="homepage-list"
            onClick={() => {
              _push('rank/coachRed');
            }}
          />
          <img
            src={SCHOOL6}
            alt=""
            className="homepage-list"
            onClick={() => {
              _push('rank/coachBlack');
            }}
          />
        </div>
      </div>
      <div className="homepage-caption" style={{ display: 'flex' }}>
        <div>
          <span style={{ color: '#2299EE' }}>行业风采 / </span>
          <span className="homepage-span ">Industry Style</span>
        </div>
        <div style={{ flex: 1 }}></div>
        <span
          className="pointer"
          onClick={() => {
            _push('cms/industryStyle');
          }}
          style={{ color: '#098DFF', fontSize: '12px', alignSelf: 'flex-end', marginBottom: 5 }}
        >
          更多
          <ForwardFilled style={{ alignSelf: 'center' }} />
        </span>
      </div>
      <div className="homepage-container">
        {industryStyleData.map((item: any) => {
          return (
            <div
              key={_get(item, 'id')}
              className="pointer mb10"
              onClick={() => {
                _push(`cms/industryStyle/detail?id=${item.id}`);
              }}
            >
              {_get(item, 'img.fileUrl') ? (
                <img src={_get(item, 'img.fileUrl')} style={{ width: 290, height: 190 }} />
              ) : (
                <img src={SCHOOL8} />
              )}
              <div
                style={{
                  background: '#1b95ff',
                  color: 'white',
                  padding: 5,
                  textAlign: 'center',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              >
                {_get(item, 'title')}
              </div>
            </div>
          );
        })}
      </div>
      <div className="homepage-caption">
        <span style={{ color: '#2299EE' }}>相关链接 / </span>
        <span className="homepage-span ">Related Links</span>
      </div>
      <div className="homepage-container" style={{ marginBottom: 40 }}>
        {linkData.map((x: any) => {
          return (
            <div key={_get(x, 'id')}>
              {_get(x, 'img.fileUrl', '') ? (
                <img
                  src={_get(x, 'img.fileUrl', '')}
                  alt=""
                  className="homepage-link pointer mb10"
                  onClick={() => {
                    _get(x, 'url', '') && window.open(_get(x, 'url', ''));
                  }}
                />
              ) : (
                <div
                  className="homepage-link pointer mb10"
                  style={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    color: '#4E7FFF',
                    textDecoration: 'underline',
                  }}
                  onClick={() => {
                    _get(x, 'url', '') && window.open(_get(x, 'url', ''));
                  }}
                >
                  {x.title}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="homepage-footer">烟台机动车驾驶培训平台Copyright©2021 版权所有 鲁ICP备18012893号</div>
    </div>
  );
}
