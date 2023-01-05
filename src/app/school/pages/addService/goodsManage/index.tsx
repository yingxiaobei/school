import { useContext } from 'react';
import { useHash } from 'hooks';
import { _getList } from './_api';
import { message, Tooltip } from 'antd';
import s from './index.module.scss';
import EWM from '../../../../../statics/ewm.jpg';
import { useFetch } from 'hooks';
import { AuthButton, IF, Loading } from 'components';
import { useHistory } from 'react-router-dom';
import SHOP_1 from 'statics/images/shop_1.png';
import SHOP_2 from 'statics/images/shop_2.png';
import SHOP_3 from 'statics/images/shop_3.png';
import SHOP_4 from 'statics/images/shop_4.png';
import { _get, generateMenuMap, myFixed } from 'utils';
import GlobalContext from 'globalContext';

export default function GoodsManage() {
  const { $menuTree } = useContext(GlobalContext);
  const allMenu: object = generateMenuMap($menuTree);
  const { data = [], isLoading } = useFetch({
    request: _getList,
  });

  const history = useHistory();

  const shopCategoryHash = useHash('shop_category_type');

  console.log(shopCategoryHash);
  function getImg(type = '') {
    let img = '';
    switch (String(type)) {
      case '1':
        img = SHOP_1;
        break;
      case '2':
        img = SHOP_2;
        break;
      case '3':
        img = SHOP_3;
        break;
      case '4':
        img = SHOP_4;
        break;
      default:
        break;
    }
    return img;
  }
  const goRecord = () => {
    if (Object.prototype.hasOwnProperty.call(allMenu, 'addService/collectionWallet')) {
      history.push('./collectionWallet');
    } else {
      message.info('暂无权限，请联系系统管理员处理。');
    }
  };

  return (
    <div>
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <div>
            {data.length > 0 && (
              <div className="flex-box relative" style={{ flexDirection: 'column' }}>
                <div className={s.goodManage}>
                  {data.map((x: any) => {
                    return (
                      <div className={s.cardBox} key={Math.random()}>
                        <img
                          className={s.imgDiv}
                          src={getImg(x?.type)}
                          alt="暂无图片"
                          onClick={() => {
                            x?.url && window.open(x?.url);
                          }}
                        />
                        <div className={s.price}>
                          <span className="bold fz18 textEllipsis">
                            <Tooltip title={x.skuName}>{x.skuName}</Tooltip>
                          </span>
                          {/* <span
                            className="hover-active color-primary"
                            onClick={() => {
                              x?.url && window.open(x?.url);
                            }}
                          >
                            详情
                          </span> */}
                        </div>
                        <div className={s.price}>
                          <div>
                            商品总价：<span>{x.price}元</span>
                          </div>
                          <div>
                            可分成：
                            <span className="color-primary">{myFixed(Number(_get(x, 'rebate', 0)), 2)}</span>元
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <AuthButton
                  authId="goodsManage:btn1"
                  type="primary"
                  onClick={() => {
                    goRecord();
                  }}
                  className={s.btn2}
                >
                  查看分成
                </AuthButton>
              </div>
            )}

            {data.length <= 0 && (
              <div className={s.noConfig1}>
                <div>提示</div>
                <div>暂未配置商品，请联系当地服务工程师或拨打客服电话配置！</div>
                <div>驾校增值服务，助学创收享共赢</div>
                <img src={EWM} alt="" />
                <div>0571－28080500</div>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}
