// 车辆轨迹
import { useEffect, useState } from 'react';
import { Button, Input, List, Checkbox, message, Tooltip } from 'antd';
import { useFetch, useVisible, useInterval, useHash, useForceUpdate } from 'hooks';
import { _getCarList, _getCarDetails, _getPoscode, _getPhotograph } from './_api';
import Detail from './Detail';
import CarMap from './CarMap';
import { GPS, _get } from 'utils';
import { CustomTable, AuthButton, FullScreen } from 'components';
import { VerticalFold } from 'components/VerticalFold';
import { HorizontalFold } from 'components/HorizontalFold';
import { useSize } from 'ahooks';

const LIMIT = 10;

function CarMonitor() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>('');
  const [licNumArr, setLicNumArr] = useState([]) as any;
  const [carNumber, setCarNumber] = useState('');
  const [pageSize, setPageSize] = useState(LIMIT);
  const [visible, _switchVisible] = useVisible();
  const [currentRecord, setCurrentRecord] = useState();
  const [mapData, setMapData] = useState([]) as any;
  const [address, setAddress] = useState({}) as any;
  const [dataSource, setDataSource] = useState([]) as any;
  const [mapKey, setMapKey] = useState('empty') as any;
  const [load, setLoad] = useVisible();
  const carOnlineStateHash = useHash('car_online_state'); // 在线带教状态
  const [checkValue, setCheckValue] = useState([]);
  const [leftOut, setLeftOut] = useState(true); //控制左侧展开
  const [bottomOut, setBottomOut] = useState(true); //控制底部表格展开
  const size = useSize(document.getElementById('root'));
  const [checkedCarId, setCheckedCarId] = useState(''); //最后选中的车辆ID
  const [checkedList, setCheckedList] = useState<any>([]); //控制选中的车辆不超过最大值

  // 左侧列表
  const { isLoading: initLoading, data: list = [] } = useFetch({
    request: _getCarList,
    query: { licnum: carNumber, page: 1, limit: pageSize },
    depends: [carNumber, pageSize],
  });

  // 根据坐标得到地址描述
  function transAddress(lng: number, lat: number, carId: string) {
    var myGeo = new window.AMap.Geocoder({
      city: '010', //城市设为北京，默认：“全国”
      radius: 1000, //范围，默认：500
    });

    myGeo.getAddress([lng, lat], function (status: any, result: any) {
      if (status === 'complete' && result.regeocode) {
        var formattedAddress = result.regeocode.formattedAddress;
        address[carId] = formattedAddress;
        setAddress({ ...address });
      }
    });
  }
  async function _handleDataSource(licArr?: any[]) {
    let licArrNum = licArr ? licArr : licNumArr;
    if (licArrNum.length > 0) {
      const res = await _getCarDetails({ carids: licArrNum.join('|') });

      const transData = _get(res, 'data', []).map((item: any) => {
        // 将GPS位置转换成BD位置
        // WGS-84 to GCJ-02
        const WCJ = GPS.gcj_encrypt(Number(item.lat), Number(item.lon));
        const { lat: gcjLat, lon: gcjLon } = WCJ;

        // GCJ-02 to BD-09
        // const WGS = GPS.bd_encrypt(gcjLat, gcjLon);
        //高德地图坐标系，只需要 WGS-84 to GCJ-02
        return { ...item, lat: gcjLat, lon: gcjLon };
      });

      transData.forEach((x: any) => {
        transAddress(_get(x, 'lon'), _get(x, 'lat'), _get(x, 'carid'));
      });
      setMapData(transData);
      const data = transData;
      setDataSource((pre: any) =>
        pre.map((x: any) => {
          const temp = data.find((item: any) => item.carid === x.carid);
          return temp || x;
        }),
      );

      setMapKey(licArrNum.toString());
    } else {
      setMapKey('empty');
      setMapData([]);
    }
  }
  // 右侧数据
  useInterval(async () => {
    await _handleDataSource();
  }, 40000);

  const total = _get(list, 'total', 0);

  // 在线车辆总数
  let onlineNum: any = 0;
  _get(list, 'rows', []).forEach((item: any) => {
    if (item.activeState === 1) {
      onlineNum += 1;
    }
  });

  // 加载更多
  const onLoadMore = function () {
    if (pageSize < total) {
      setPageSize(pageSize + LIMIT);
    }
  };

  const carHash = _get(list, 'rows', []).reduce((acc: any, x: any) => ({ ...acc, [x.assistId]: x.licNum }), {});

  const columns = [
    {
      title: '车牌号',
      dataIndex: 'carid',
      width: 60,
      render: (carid: string, record: any) => <div onClick={() => setCurrentRecord(record)}>{carHash[carid]}</div>,
    },
    {
      title: '状态',
      dataIndex: 'activeState',
      width: 30,
      render: (activeState: any) => carOnlineStateHash[activeState],
    },
    {
      title: '教练员',
      width: 60,
      dataIndex: 'coaname',
    },
    {
      title: '学员',
      width: 60,
      dataIndex: 'stuname',
    },
    {
      title: '培训科目',
      width: 80,
      dataIndex: 'examname',
    },
    {
      title: '速度',
      width: 30,
      dataIndex: 'gps_speed',
    },
    {
      title: '定位时间',
      width: 80,
      dataIndex: 'gpstime',
    },
    {
      title: '地址',
      width: 140,
      dataIndex: 'add',
      render: (_: void, record: any) => (
        <Tooltip title={address[record.carid]} placement="topLeft">
          {address[record.carid]}
        </Tooltip>
      ),
    },
    {
      title: '操作',
      width: 50,
      dataIndex: 'operate',
      render: (_: void, record: any) => {
        return (
          <>
            <Button
              className="operation-button"
              onClick={() => {
                _switchVisible();
                setCurrentRecord(record);
              }}
              type="primary"
              ghost
              size="small"
            >
              详情
            </Button>
          </>
        );
      },
    },
  ];

  const LoadMore = () => {
    return (
      <div>
        {!initLoading && pageSize < total && leftOut && (
          <div className="text-center mt10 mb10">
            <Button onClick={onLoadMore} size="small">
              加载更多
            </Button>
          </div>
        )}
      </div>
    );
  };
  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      console.log(selectedRowKeys);
      setSelectedRowKeys(selectedRowKeys);
    },
    selectedRowKeys,
  };

  return (
    <>
      <Detail
        onCancel={_switchVisible}
        currentRecord={currentRecord}
        visible={visible}
        carHash={carHash}
        address={_get(address, _get(currentRecord, 'carid'), '')}
      />

      <div style={{ display: 'flex' }} id="carMonitor">
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
          <div
            style={{
              // height: 400,
              position: 'relative',
              width: leftOut ? 180 : 0,
            }}
            id="leftDiv"
          >
            <HorizontalFold leftOut={leftOut} setLeftOut={setLeftOut} />
            {leftOut && <div className="mb4">总车辆总数：{total}</div>}
            {leftOut && <div className="mb4">在线车辆总数：{onlineNum}</div>}
            {leftOut && (
              <div style={{ width: 180 }}>
                <Input
                  placeholder="车牌号码"
                  className="full-width "
                  onChange={(e) => {
                    setCarNumber(e.target.value);
                  }}
                />
              </div>
            )}
            <Checkbox.Group
              className="full-width "
              value={checkedList}
              onChange={(checkedValue: any) => {
                if (checkedList.length >= 10) {
                  return;
                }
                setLicNumArr(checkedValue);
                _handleDataSource(checkedValue);
              }}
            >
              <List
                bordered
                split={false}
                style={{ marginTop: 10, height: 300, overflow: 'auto', background: '#fff' }}
                className="demo-loadmore-list"
                loading={initLoading}
                itemLayout="horizontal"
                size="small"
                // loadMore={loadMore}
                dataSource={_get(list, 'rows', [])}
                renderItem={(item: any) => {
                  return (
                    <List.Item>
                      <Checkbox
                        value={item.assistId}
                        key={item.assistId}
                        checked={checkedList.includes(_get(item, 'assistId')) || false}
                        onChange={(e) => {
                          const { value = '', checked } = e.target;

                          if (checked && !licNumArr.includes(value)) {
                            if (licNumArr.length >= 10) {
                              const list = checkedList.filter((x: any) => {
                                return x != value;
                              });
                              setCheckedList(list);
                              return message.error('最多可同时查看10辆车');
                            }
                            setCheckedList([...checkedList, value]);
                            setCheckedCarId(value);
                            dataSource.push({ carid: value });
                            setDataSource([...dataSource]);
                          } else {
                            const list = checkedList.filter((x: any) => {
                              return x != value;
                            });
                            setCheckedList(list);
                            setLicNumArr(list);
                            setCheckedCarId('');
                            setDataSource(dataSource.filter((x: any) => x.carid !== value));
                          }
                        }}
                      >
                        {item.licNum}
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            background: item.activeState === 1 ? '#0f0' : '#aaa',
                            borderRadius: 5,
                            display: 'inline-block',
                            marginLeft: 10,
                          }}
                        />
                      </Checkbox>
                    </List.Item>
                  );
                }}
              />
            </Checkbox.Group>
            <LoadMore />
          </div>
        </div>
        <div style={{ width: document.body.clientWidth }}>
          <div style={{ position: 'absolute', left: '20%', zIndex: 999 }}>
            <AuthButton
              authId="trainingInstitution/carMonitor:btn1"
              type="primary"
              loading={load}
              onClick={async () => {
                if (licNumArr.length === 0) {
                  message.info('请先选择车辆');
                  return;
                } else if (licNumArr.length > 1) {
                  message.info('只能选择一个车辆拍照');
                  return;
                } else if (
                  !_get(list, 'rows', []).filter((item: any) => item.assistId == licNumArr[0])?.[0].activeState
                ) {
                  message.info('请选择在线车辆拍照');
                  return;
                }
                setLoad();
                const res: any = await _getPoscode({ carid: licNumArr[0] });
                if (res && res.code === 200) {
                  _getPhotograph({ poscode: res.data }).then((resp: any) => {
                    if (resp && resp.code === 200) {
                      message.success(resp.message);
                      setLoad();
                    } else {
                      setLoad();
                    }
                  });
                } else {
                  setLoad();
                }
              }}
              className="mb20"
            >
              拍照
            </AuthButton>
          </div>
          {
            <FullScreen
              instance={document.getElementById('carMonitor')}
              style={{ position: 'absolute', right: 15, top: 10, zIndex: 999, cursor: 'pointer' }}
            />
          }
          <div style={{ width: '100%', height: '100vh' }}>
            <CarMap
              mapData={mapData}
              carHash={carHash}
              address={address}
              selectedRowKeys={selectedRowKeys}
              checkedCarId={checkedCarId}
            />
            <div
              style={{
                position: 'fixed',
                zIndex: 999,
                bottom: 10,
                right: 15,
                width: (size?.width || 0) - 240,
              }}
            >
              <div style={{ position: 'relative', height: bottomOut ? 200 : 0, background: '#fff' }}>
                <VerticalFold bottomOut={bottomOut} setBottomOut={setBottomOut} />
                <CustomTable
                  pagination={false}
                  columns={columns}
                  bordered
                  dataSource={dataSource}
                  rowKey={(record: any) => {
                    return `${record.carid}`;
                  }}
                  scroll={{ y: 150 }}
                  rowSelection={{
                    type: 'radio',
                    ...rowSelection,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CarMonitor;
