import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import 'normalize.css';
import 'index.scss';
import Routers from './Routers';
import GlobalProvider from 'GlobalProvider';
import OptionsProvider from 'OptionsProvider';
import { Helmet } from 'react-helmet';
import { PUBLIC_URL, GAODE_KEY } from 'constants/env';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { store, persistor } from 'store';

export default function WellcomSchool() {
  return (
    <>
      <Helmet>
        <title>{process.env.REACT_APP_TITLE ? process.env.REACT_APP_TITLE : '远方学车驾校管理平台'}</title>
        <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests" />
        {/* 高德地图 */}
        <script
          src={`https://webapi.amap.com/maps?v=1.4.15&key=${GAODE_KEY}&plugin=AMap.PolyEditor,AMap.MouseTool,AMap.Geocoder,AMap.Autocomplete,AMap.ToolBar`}
        />
        {/* <script src={`https://webapi.amap.com/maps?v=2.0&key=${GAODE_KEY}&plugin=AMap.moveAnimation,AMap.Geocoder`} /> */}
        <script src="https://a.amap.com/jsapi_demos/static/demo-center/js/demoutils.js"></script>
        {/* <script
          type="text/javascript"
          src="https://api.map.baidu.com/getscript?v=3.0&ak=GTrnXa5hwXGwgQnTBG28SHBubErMKm3f"
        /> */}
        {/* <script src={`${PUBLIC_URL}LodopFuncs.js`} /> */}
        <link href={`${PUBLIC_URL}neplayer.min.css`} rel="stylesheet" />
        <script src={`${PUBLIC_URL}neplayer.min.js`}></script>
        <script src={`${PUBLIC_URL}js/kg-iWebAssist.js`}></script>
        <script src={`${PUBLIC_URL}js/core/kg-xhr.js`}></script>
        <script src={`${PUBLIC_URL}js/kgSignture.js`}></script>
        <script src={`${PUBLIC_URL}js/jsmpeg.min.js`}></script>
      </Helmet>

      <BrowserRouter>
        <ReduxProvider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <GlobalProvider>
              <OptionsProvider>
                <Routers />
              </OptionsProvider>
            </GlobalProvider>
          </PersistGate>
        </ReduxProvider>
      </BrowserRouter>
    </>
  );
}
