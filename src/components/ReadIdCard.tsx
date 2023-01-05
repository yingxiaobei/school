import { message } from 'antd';
import { AuthButton } from 'components';
import GlobalContext from 'globalContext';
import { useContext, useState } from 'react';
import { getIdCardInfo, _get } from 'utils';

interface IProps {
  insertWhen?: boolean;
  authId: string;
  setInfo?: any;
  setUpdatePluginVisible: any;
  _handleSearch: any;
  setIdCard?: any;
  _refreshTable?: any;
}

export default function ReadIdCard(props: IProps) {
  const {
    insertWhen = true,
    authId = '',
    setInfo,
    setUpdatePluginVisible,
    _handleSearch,
    setIdCard,
    _refreshTable,
  } = props;
  const [isLoading, setIsLoading] = useState(false);
  const { $isForceUpdatePlugin } = useContext(GlobalContext);

  return (
    <AuthButton
      insertWhen={insertWhen}
      authId={authId}
      type="primary"
      loading={isLoading}
      className="mr20"
      onClick={async () => {
        setIsLoading(true);
        if ($isForceUpdatePlugin) {
          setIsLoading(false);
          setInfo && setInfo('无法进行读二代证');
          return setUpdatePluginVisible();
        }

        const result = await getIdCardInfo();
        if (_get(result, 'result') === false) {
          setIsLoading(false);
          setInfo && setInfo('无法进行读二代证');
          setUpdatePluginVisible();
          return;
        }
        if (!_get(result, 'idNo', '')) {
          setIsLoading(false);
          message.info(_get(result, 'info', '未检测到身份证'));
          return;
        }
        let id = _get(result, 'idNo', '').trim();

        _handleSearch('idcard', id);
        setIdCard && setIdCard(id + Math.random());
        setIsLoading(false);
        _refreshTable && _refreshTable();
      }}
    >
      读二代证搜索
    </AuthButton>
  );
}
