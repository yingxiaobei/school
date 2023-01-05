import { message, Modal } from 'antd';
import { memo, useState } from 'react';
import RedMarker from 'statics/images/poi-marker-red.png';

import { useMap, APILoader } from '@uiw/react-amap';
import { useRef } from 'react';
import { useEffect } from 'react';
import styles from './index.module.css';
import { Loading } from 'components';
import MapLayerChange from 'components/MapLayerChange';
import { GAODE_KEY } from 'constants/env';

interface Props {
  schoolAddress: string;
  switchVisible: () => void;
  confirmAddressCallback: (address: string) => void;
}

function AddressLocator({ switchVisible, confirmAddressCallback, schoolAddress = '' }: Props) {
  const [address, setAddress] = useState(schoolAddress); // 检索的结果
  const inputRef = useRef<HTMLInputElement>(null);
  const divElm = useRef<HTMLDivElement>(null);

  const { setContainer, map } = useMap({
    resizeEnable: true, // 启用滚轮放大缩小，默认禁用
  });
  useEffect(() => {
    if (map && schoolAddress) {
      map.plugin(['AMap.Geocoder'], function () {
        let geocoder = new window.AMap.Geocoder({});
        const marker = new window.AMap.Marker({
          icon: new window.AMap.Icon({
            image: RedMarker,
            imageSize: new window.AMap.Size(20, 30),
          }),
        });

        geocoder.getLocation(address, function (status: string, result: any) {
          if (status === 'complete' && result.geocodes.length) {
            var lnglat = result.geocodes[0].location;

            marker.setPosition(lnglat);
            // map.setCenter(lnglat, true);
            map.add(marker);
            map.setFitView([marker], false, [60, 60, 60, 60]);
          }
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolAddress, map, window.AMap]);

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
        setAddress(address);
      });
      function select(e: any) {
        placeSearch.setCity(e.poi.adcode);
        // placeSearch.search(e.poi.name); //关键字查询查询
        placeSearch.search(e.poi.name, (status: string, result: any) => {
          console.log(status, result);
          if (status !== 'complete') return;
          const pois = result.poiList.pois[0];
          const name = pois.name;
          const cityname = pois.cityname; //市
          const adname = pois.adname; //区/县

          setAddress(cityname + adname + name);
        }); //关键字查询查询
      }
    });
  }, [map]);

  useEffect(() => {
    if (divElm.current && !map) {
      setContainer(divElm.current);
    }
  });

  useEffect(() => {
    map?.plugin(['AMap.ToolBar'], function () {
      // 在图面添加工具条控件，工具条控件集成了缩放、平移、定位等功能按钮在内的组合控件
      map.addControl(new window.AMap.ToolBar({ locate: false }));
    });
  }, [map]);

  return (
    <Modal
      title={'地图选择'}
      width={800}
      visible
      onCancel={() => {
        switchVisible();
      }}
      onOk={() => {
        if (!address) {
          confirmAddressCallback(inputRef.current?.value || '');
        } else {
          confirmAddressCallback(address);
        }
      }}
    >
      <div style={{ width: '100%', height: '450px', position: 'relative' }}>
        {
          <input
            className={styles['addressInput']}
            placeholder="请输入目标地址"
            ref={inputRef}
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
            }}
          />
        }
        <APILoader akay={GAODE_KEY} version="1.4.15" fallback={() => <Loading />} plugin="AMap.ToolBar">
          <div ref={divElm} style={{ height: 450, position: 'relative' }}>
            {map && <MapLayerChange map={map} style={{ right: 10, left: 'unset' }} />}
          </div>
        </APILoader>
      </div>
    </Modal>
  );
}

export default memo(AddressLocator);
