// 车辆轨迹
import { SetStateAction, useEffect, useState } from 'react';
import { Button, DatePicker, Input, List, message, Radio, Spin } from 'antd';
import { useFetch, useHash } from 'hooks';
import { _getCarList, _getVehicleTrajectory } from './_api';
import { CustomTable, VehicleTrajectoryMap_New, FullScreen } from 'components';
import moment from 'moment';
import { formatTime } from 'utils';
import { GPS, _get } from 'utils';
import { TimePicker } from 'antd';
import { VerticalFold } from 'components/VerticalFold';
import { HorizontalFold } from 'components/HorizontalFold';
import { useSize } from 'ahooks';

const { RangePicker } = TimePicker;
const LIMIT = 10;

function VehicleTrajectory() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>('');
  const [selectedRows, setSelectedRows] = useState<any>();
  const [carId, setCarId] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [tracks, setTracks] = useState<any>([]); // 所有轨迹数据（二维）
  const [date, setDate] = useState(moment());
  const [startTime, setStartTime] = useState(moment('00:00:00', 'HH:mm:ss').format('HH:mm:ss'));
  const [endTime, setEndTime] = useState(moment('23:59:59', 'HH:mm:ss').format('HH:mm:ss'));
  const [pageSize, setPageSize] = useState(LIMIT);
  const [trackInitData, setTrackInitData] = useState([]);
  const [licNum, setLicNum] = useState('');
  const [gpsData, setGpsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [leftOut, setLeftOut] = useState(true); //控制左侧展开
  const [bottomOut, setBottomOut] = useState(true); //控制底部表格展开

  const size = useSize(document.getElementById('root'));

  const { isLoading: initLoading, data: list } = useFetch({
    request: _getCarList,
    query: { licnum: carNumber, page: 1, limit: pageSize },
    depends: [carNumber, pageSize],
  });
  const subjectcodeHash = useHash('trans_part_type'); // 培训部分
  const subjectTypeHash = useHash('subject_type'); //
  const total = _get(list, 'total', 0);

  const onLoadMore = function () {
    if (pageSize < total) {
      setPageSize(pageSize + LIMIT);
    }
  };
  const LoadMore = () => {
    return (
      <div>
        {!initLoading && pageSize < total && leftOut && (
          <div
            style={{
              textAlign: 'center',
              marginTop: 12,
              marginBottom: 12,
            }}
          >
            <Button onClick={onLoadMore}>加载更多</Button>
          </div>
        )}
      </div>
    );
  };
  const columns = [
    {
      title: 'GPS时间',
      width: 150,
      dataIndex: 'gpstime',
      render: (gpstime: string, record: any) => {
        const isTimeValid = moment(gpstime, 'YYYY-MM-DD HH:mm:ss').isValid();
        const timeFormat =
          gpstime && isTimeValid ? moment(gpstime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss') : '';
        return timeFormat;
      },
    },
    {
      title: '教练员',
      width: 80,
      dataIndex: 'coaname',
    },
    {
      title: '学员',
      width: 80,
      dataIndex: 'stuname',
    },
    {
      title: '培训科目',
      width: 80,
      dataIndex: 'traincode',
      render: (traincode: string, record: any) => {
        const examcode = _get(record, 'examcode', '');
        return `${subjectcodeHash ? (examcode !== '0' ? subjectcodeHash[examcode] : '') : ''} ${
          subjectTypeHash ? (traincode !== '0' ? subjectTypeHash[traincode] : '') : ''
        }`;
      },
    },
    {
      title: '速度',
      width: 80,
      dataIndex: 'gps_speed',
      render: (gps_speed: string, record: any) => {
        return `${gps_speed}公里/小时`;
      },
    },
    {
      title: '经度',
      width: 80,
      dataIndex: 'lon',
    },
    {
      title: '纬度',
      width: 80,
      dataIndex: 'lot',
    },
  ];
  function getBDPostion(y: any) {
    // 将GPS位置转换成BD位置
    // WGS-84 to GCJ-02
    const WCJ = GPS.gcj_encrypt(Number(y.lat), Number(y.lon));
    const { lat: gcjLat, lon: gcjLon } = WCJ;

    // GCJ-02 to BD-09
    // const WGS = GPS.bd_encrypt(gcjLat, gcjLon);
    return { lat: gcjLat, lon: gcjLon };
  }

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
    selectedRowKeys,
  };
  // useEffect(() => {
  //   console.log(_get(selectedRowKeys, 0, ''));
  //   //TODO
  //   const select = document.querySelector('#vehicle .ant-radio-checked')?.getClientRects()[0].top || 0;
  //   const header = document.querySelector('#vehicle .ant-table-tbody .ant-radio-checked')?.getClientRects()[0].top || 0;
  //   const body = document.querySelector('#vehicle div.ant-table-body');
  //   let scroll_top = header - select;
  //   console.log(selectedRowKeys[0], select, header, scroll_top, 'scroll');
  //   body?.scrollTo(0, scroll_top);
  // }, [_get(selectedRowKeys, 0, '')]);

  return (
    <div className="vehicle" id="vehicle">
      <div style={{ display: 'flex' }}>
        <div
          style={{
            width: leftOut ? 200 : 0,
            position: 'absolute',
            zIndex: '999',
            top: 40,
            background: '#fff',
            padding: 10,
          }}
        >
          <div style={{ position: 'relative', width: leftOut ? 180 : 0 }} id="leftDiv">
            <HorizontalFold leftOut={leftOut} setLeftOut={setLeftOut} />
            {/* {leftOut && <div style={{ marginBottom: 5 }}>车牌号码:</div>} */}
            {leftOut && (
              <Input
                style={{ width: '100%' }}
                onChange={(e) => {
                  setCarNumber(e.target.value);
                }}
                placeholder="请输入车牌号码"
              />
            )}

            <List
              bordered
              split={false}
              size="small"
              style={{ marginTop: 10, height: 300, overflow: 'auto', background: '#fff' }}
              className="demo-loadmore-list"
              loading={initLoading}
              itemLayout="horizontal"
              // loadMore={loadMore}
              dataSource={_get(list, 'rows', [])}
              renderItem={(item: any) => (
                <List.Item>
                  <Radio
                    checked={carId === item.carid}
                    onChange={(e: any) => {
                      setCarId(e.target.value);
                      setTracks([]);
                      setTrackInitData([]);
                      setLicNum(item.licnum);
                    }}
                    value={item.carid}
                    key={item.carid}
                  >
                    {item.licnum}
                  </Radio>
                </List.Item>
              )}
            ></List>
            <LoadMore />
          </div>
        </div>
        <div style={{ width: document.body.clientWidth }}>
          <Spin spinning={loading}>
            <div style={{ position: 'absolute', left: '20%', top: 10, zIndex: 999 }}>
              <DatePicker
                placeholder={'日期'}
                onChange={(dates: any) => {
                  if (dates) {
                    setDate(dates.format('YYYY-MM-DD'));
                  }
                }}
                defaultValue={moment()}
                style={{ margin: '0 20px 20px 0' }}
                allowClear={false}
              />
              <RangePicker
                format={'HH:mm'}
                allowClear={false}
                defaultValue={[moment('00:00', 'HH:mm'), moment('23:59', 'HH:mm')]}
                onChange={(dates: any) => {
                  if (dates) {
                    setStartTime(dates[0].format('HH:mm'));
                    setEndTime(dates[1].format('HH:mm'));
                  }
                }}
              />
              <Button
                type="primary"
                className="ml20"
                onClick={async () => {
                  if (!carId) {
                    return message.error('请选择车牌号');
                  }

                  if (!startTime || !endTime) {
                    return message.error('请选择时间');
                  }
                  setTracks([]);
                  // const query: any = {
                  //   carid: '35010015170722934',
                  //   signstarttime: '2022-09-13 14:00:00',
                  //   signendtime: '2022-09-13 14:20:59',
                  // };
                  const query: any = {
                    carid: carId,
                    signstarttime: formatTime(date, 'DATE') + ' ' + startTime + ':00',
                    signendtime: formatTime(date, 'DATE') + ' ' + endTime + ':59',
                  };
                  setLoading(true);
                  const res = await _getVehicleTrajectory(query);
                  setLoading(false);
                  const trackInitData = _get(res, 'data', []);
                  setGpsData({});
                  if (_get(trackInitData, 'length') === 0) {
                    setTracks([]);
                    setTrackInitData([]);
                    return message.error('找不到该车轨迹');
                  }

                  const tracks: any = trackInitData.map((y: any) => {
                    // 将GPS位置转换成BD位置
                    const WGS = getBDPostion(y);
                    return { lng: WGS.lon, lat: WGS.lat, lon: WGS.lon };
                  });
                  const tracksData: any = trackInitData.map((y: any) => {
                    // 将GPS位置转换成BD位置
                    const WGS = getBDPostion(y);
                    return { ...y, lot: WGS.lat, lng: WGS.lon, lat: WGS.lat, lon: WGS.lon };
                  });
                  setTrackInitData(tracksData);
                  setTracks([tracks]);
                }}
              >
                查询
              </Button>
            </div>
            {
              <FullScreen
                instance={document.getElementById('vehicle')}
                style={{
                  position: 'absolute',
                  right: 15,
                  top: 10,
                  zIndex: 999,
                  cursor: 'pointer',
                }}
              />
            }
            <div style={{ width: '100%', height: '100vh' }}>
              <VehicleTrajectoryMap_New
                paths={tracks}
                zoom={16}
                mapType="Polyline"
                isMarker={true}
                trackInitData={trackInitData}
                carNumber={licNum}
                setSelectedRowKeys={setSelectedRowKeys}
                selectedRowKeys={selectedRowKeys}
                selectedRows={selectedRows}
              />

              {_get(trackInitData, 'length', 0) > 0 && (
                <div
                  style={{
                    position: 'fixed',
                    zIndex: 999,
                    bottom: 10,
                    right: 15,
                    width: (size?.width || 0) - 240,
                  }}
                >
                  <div style={{ position: 'relative', height: bottomOut ? 180 : 0, background: '#fff' }}>
                    <VerticalFold bottomOut={bottomOut} setBottomOut={setBottomOut} />
                    <CustomTable
                      onRow={(record: SetStateAction<{}>) => {
                        return {
                          onClick: () => {
                            console.log(record);
                            setGpsData(record);
                          }, // 点击行
                        };
                      }}
                      rowSelection={{
                        type: 'radio',
                        ...rowSelection,
                      }}
                      columns={columns}
                      loading={loading}
                      bordered
                      dataSource={trackInitData}
                      rowKey={(record: any) => {
                        return `${record.lon}-${record.lot}-${record.gpstime}`;
                      }}
                      pagination={false}
                      scroll={{ y: 130 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </Spin>
        </div>
      </div>
    </div>
  );
}

export default VehicleTrajectory;
