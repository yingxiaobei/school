import { BrowserRouter } from 'react-router-dom';
import GlobalProvider from 'GlobalProvider';
import OptionsProvider from 'OptionsProvider';
import { Helmet } from 'react-helmet';
import Routers from './Routers';
import { useEffect, useContext } from 'react';
import { PUBLIC_URL, PROJECT_CONFIG, GAODE_KEY } from 'constants/env';
import { _getTplConfigList, _searchSubItemConfigs, _getConfigTree } from 'app/yantai/_api';
import { _createToken } from 'app/yantai/_api';
import { Auth, _get } from 'utils';
import GlobalContext from 'globalContext';
import { useState } from 'react';
import { Spin } from 'antd';

export default function Yantai() {
  const [menuData, setMenuData] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getToken() {
      const res = await _createToken();
      if (_get(res, 'access_token.length') > 0) {
        const token = _get(res, 'token_type') + ' ' + _get(res, 'access_token');
        Auth.set('openAPIToken', token);
      }
      setLoading(true);
      const res1 = await _getConfigTree({ site: 'page_header' });
      setLoading(false);
      setMenuData(_get(res1, 'data', []));
    }

    getToken();
  }, []);
  if (loading) {
    return (
      <div className="flex-box" style={{ height: 600 }}>
        <Spin spinning={loading} tip="页面加载中"></Spin>
      </div>
    );
  }
  return (
    <>
      <Helmet>
        <title>{PROJECT_CONFIG.pageTitle}</title>
        <script src={`${PUBLIC_URL}jquery.md5.js`}></script>
        <script src={`${PUBLIC_URL}jquery3.3.1.min.js`}></script>
        <script
          src={`https://webapi.amap.com/maps?v=1.4.15&key=${GAODE_KEY}&plugin=AMap.PolyEditor&plugin=AMap.MouseTool&plugin=AMap.Geocoder&plugin=AMap.Autocomplete`}
        />
      </Helmet>
      <BrowserRouter>
        <GlobalProvider>
          <OptionsProvider>
            <Routers menuData={menuData} />
          </OptionsProvider>
        </GlobalProvider>
      </BrowserRouter>
    </>
  );
}
