import { useRef, useEffect, useState } from 'react';
import RedMarker from 'statics/images/poi-marker-red.png';

export default function AddressMap(props: any) {
  const { address } = props;
  const mapRef = useRef(null);
  const [map, setMap] = useState() as any;

  useEffect(() => {
    console.log('amap', window.AMap);
    if (!window.AMap) return;
    var map1 = new window.AMap.Map(mapRef.current, {
      zoom: 14,
    });
    setMap(map1);
  }, [mapRef.current, window.AMap]);
  useEffect(() => {
    if (!map || !address) return;
    var geocoder = new window.AMap.Geocoder({});
    var marker = new window.AMap.Marker({
      icon: new window.AMap.Icon({
        image: RedMarker,
        imageSize: new window.AMap.Size(20, 30),
      }),
    });

    geocoder.getLocation(address, function (status: string, result: any) {
      if (status === 'complete' && result.geocodes.length) {
        var lnglat = result.geocodes[0].location;

        marker.setPosition(lnglat);
        map.setCenter(lnglat, true);
        map.add(marker);
        map.setFitView([marker]);
      }
    });
  }, [address, map]);

  return <div id="markerMap" ref={mapRef} style={{ height: 400, width: '100%' }}></div>;
}
