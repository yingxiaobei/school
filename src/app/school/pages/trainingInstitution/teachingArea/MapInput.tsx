/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { Input } from 'antd';
import { useRef } from 'react';

// 地理位置
type TLocation = {
  lng: number;
  lat: number;
};

export default function MapInput(props: any) {
  const { callback, value, setValue, disabled = false } = props;

  useEffect(() => {
    var auto = new window.AMap.Autocomplete({ input: 'suggestId1' });
    // var placeSearch = new window.AMap.PlaceSearch({
    //   map: Amap,
    // }); //构造地点查询类
    auto.on('select', select); //注册监听，当选中某条记录时会触发
    function select(e: any) {
      const myValue = e.poi.district + e.poi.address + e.poi.name;
      console.log(e, myValue);
      console.log(e.poi.adcode, e.poi.name);
      setTimeout(() => setValue(myValue)); // 解决无法更新视图的问题
      callback(e.poi.location);
      // placeSearch.setCity(e.poi.adcode);
      // placeSearch.search(e.poi.name); //关键字查询查询
    }
  }, []);
  console.log(value, 'v');
  return (
    <>
      <Input
        // key={ignore}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        id="suggestId1"
        value={value}
        style={{ width: '100%' }}
        disabled={disabled}
      />
    </>
  );
}
