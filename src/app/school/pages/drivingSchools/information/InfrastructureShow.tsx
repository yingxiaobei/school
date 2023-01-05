import { memo } from 'react';
import { Infrastructure } from './_api';
import { ReactComponent as WIFI } from 'statics/images/information/wifi.svg';
import { ReactComponent as InternetBar } from 'statics/images/information/internetBar.svg';
import { ReactComponent as Bathroom } from 'statics/images/information/bathroom.svg';
import { ReactComponent as RestArea } from 'statics/images/information/restArea.svg';
import { ReactComponent as Canteen } from 'statics/images/information/canteen.svg';
import { ReactComponent as CofferShop } from 'statics/images/information/cofferShop.svg';
import { ReactComponent as Locker } from 'statics/images/information/locker.svg';
import { ReactComponent as Shop } from 'statics/images/information/shop.svg';

import CustomIcon from 'components/CustomIcon';
import styles from './index.module.css';
import { _get } from 'utils';
import { useCallback } from 'react';
import { Row } from 'antd';
interface Props {
  isInfrastructureOptions: Partial<Infrastructure>;
}

function InfrastructureShow({ isInfrastructureOptions }: Props) {
  const isOpen = useCallback(
    (item: keyof Infrastructure) => {
      return _get(isInfrastructureOptions, item, 0) !== 1
        ? `${styles['infrastructureBase']} ${styles['infrastructureShow-not']}`
        : styles['infrastructureBase'];
    },
    [isInfrastructureOptions],
  );

  return (
    <Row justify="space-between" className={styles['wrapper']}>
      {/* 食堂 */}
      <div className={styles['infrastructure']}>
        <CustomIcon className={isOpen('canteen')} svgcomponent={Canteen} />
        食堂
      </div>
      {/* wifi */}
      <div className={styles['infrastructure']}>
        <CustomIcon className={isOpen('freeNet')} svgcomponent={WIFI} />
        免费WIFI
      </div>
      {/* 商店 shop */}
      <div className={styles['infrastructure']}>
        <CustomIcon className={isOpen('shop')} svgcomponent={Shop} />
        商店
      </div>
      {/* 储物箱 locker */}
      <div className={styles['infrastructure']}>
        <CustomIcon className={isOpen('locker')} svgcomponent={Locker} />
        储物箱
      </div>
      {/* 网吧 */}
      <div className={styles['infrastructure']}>
        <CustomIcon className={isOpen('internetBar')} svgcomponent={InternetBar} />
        网吧
      </div>
      {/* 咖啡厅 */}
      <div className={styles['infrastructure']}>
        <CustomIcon className={isOpen('cofferShop')} svgcomponent={CofferShop} />
        咖啡厅
      </div>
      {/* 浴室 */}
      <div className={styles['infrastructure']}>
        <CustomIcon className={isOpen('bathroom')} svgcomponent={Bathroom} />
        浴室
      </div>
      {/* 休息室 */}
      <div className={styles['infrastructure']}>
        <CustomIcon className={isOpen('restArea')} svgcomponent={RestArea} />
        休息室
      </div>
    </Row>
  );
}

export default memo(InfrastructureShow);
