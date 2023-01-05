import { Modal } from 'antd';
import { useRef, useEffect, useState } from 'react';
import RedMarker from 'statics/images/poi-marker-red.png';
import { GPS } from 'utils';

export default function Address(props: any) {
  const {
    lng = '',
    lat = '',
    change,
    setChange,
    setLng,
    setLat,
    setVisible,
    longitude,
    setLongitude,
    latitude,
    setLatitude,
    schoolAddress,
    setSchoolAddress,
  } = props;
  const [inputAddress, setInputAddress] = useState(''); // 检索的结果
  const mapRef = useRef(null);
  const [map, setMap] = useState() as any;
  const inputRef = useRef<HTMLInputElement>(null);
  const divElm = useRef<HTMLDivElement>(null);
  const [inputChange, setInputChange] = useState(false);

  useEffect(() => {
    if (!window.AMap) return;
    var map1 = new window.AMap.Map(mapRef.current, {
      zoom: 14,
    });
    // var marker = new window.AMap.Marker({
    //   icon: new window.AMap.Icon({
    //     image: RedMarker,
    //     imageSize: new window.AMap.Size(20, 30),
    //   }),
    // });
    // //为地图注册click事件获取鼠标点击出的经纬度坐标
    // map1.on('click', function (e: any) {
    //   const _lng = e.lnglat.getLng();
    //   const _lat = e.lnglat.getLat();

    //   const WGS = GPS.gcj_decrypt(_lat, _lng);
    //   const { lat, lon: lng } = WGS;
    //   setLnglat(`${lng},${lat}`);
    //   marker.setPosition(e.lnglat);
    //   map1.add(marker);
    // });
    setMap(map1);
  }, [mapRef.current, window.AMap]);
  useEffect(() => {
    setInputAddress(schoolAddress);
  }, [schoolAddress]);
  useEffect(() => {
    if (!map || !inputAddress) return;
    var geocoder = new window.AMap.Geocoder({});

    geocoder.getLocation(inputAddress, function (status: string, result: any) {
      console.log(result);
      if (status === 'complete' && result.geocodes.length) {
        var lnglat = result.geocodes[0].location;
        setLng(lnglat.lng);
        setLat(lnglat.lat);
        const WGS = GPS.gcj_decrypt(lnglat.lat, lnglat.lng);
        const { lat, lon: lng } = WGS;
        setLongitude(lng.toFixed(6));
        setLatitude(lat.toFixed(6));
        // marker.setPosition(lnglat);
        // map.setCenter(lnglat, true);
        // map.add(marker);
        // setChange(false);
        // map.setFitView([marker]);
      }
    });
  }, [inputAddress, map]);
  useEffect(() => {
    if (!map || !lng || !lat || inputChange) return;
    var marker = new window.AMap.Marker({
      icon: new window.AMap.Icon({
        image: RedMarker,
        imageSize: new window.AMap.Size(20, 30),
      }),
    });

    marker.setPosition([lng, lat]);
    map.setCenter([lng, lat], true);
    map.add(marker);
  }, [map, lng, lat, inputChange]);

  useEffect(() => {
    if (!map) return;
    var autoOptions = {
      input: inputRef.current,
    };
    //@ts-ignore
    map.plugin(['AMap.PlaceSearch', 'AMap.Autocomplete'], function () {
      var auto = new window.AMap.Autocomplete(autoOptions);
      var placeSearch = new window.AMap.PlaceSearch({
        map: map,
      }); //构造地点查询类
      auto.on('select', select); //注册监听，当选中某条记录时会触发
      placeSearch.on('markerClick', (e: any) => {
        console.log(e);
        const address = e.data.cityname + e.data.adname + e.data.name;
        setInputAddress(address);
        setLng(e.data.location.lng);
        setLat(e.data.location.lat);

        const WGS = GPS.gcj_decrypt(e.data.location.lat, e.data.location.lng);
        const { lat, lon: lng } = WGS;
        setLongitude(lng.toFixed(6));
        setLatitude(lat.toFixed(6));
      });
      function select(e: any) {
        map.clearMap();
        placeSearch.setCity(e.poi.adcode);
        placeSearch.search(e.poi.name); //关键字查询查询

        setLng(e.poi.location.lng);
        setLat(e.poi.location.lat);
        const WGS = GPS.gcj_decrypt(e.poi.location.lat, e.poi.location.lng);
        const { lat, lon: lng } = WGS;
        setLongitude(lng.toFixed(6));
        setLatitude(lat.toFixed(6));
        setChange(true);
        // placeSearch.search(e.poi.name); //关键字查询查询
        // placeSearch.search(e.poi.name, (status: string, result: any) => {
        //   console.log(status, result);
        //   if (status !== 'complete') return;
        //   const pois = result.poiList.pois[0];
        //   const name = pois.name;
        //   const cityname = pois.cityname; //市
        //   const adname = pois.adname; //区/县

        //   setInputAddress(cityname + adname + name);
        // }); //关键字查询查询
      }
    });
  }, [map]);

  return (
    <Modal
      title="经纬度"
      onCancel={setVisible}
      onOk={setVisible}
      visible
      width={900}
      maskClosable={false}
      footer={null}
    >
      <input
        // className={styles['addressInput']}
        placeholder="请输入地址"
        ref={inputRef}
        value={inputAddress}
        onChange={(e) => {
          setInputAddress(e.target.value);
          setInputChange(true);
        }}
        style={{ width: 700 }}
      />
      <div className="mt10 mb20 bold">
        经纬度：{longitude ? `${Number(longitude).toFixed(6)},${Number(latitude).toFixed(6)}` : ''}
      </div>
      <div id="markerMap" ref={mapRef} style={{ height: 400, width: '100%' }}></div>
    </Modal>
  );
}
