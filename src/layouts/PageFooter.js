import { useContext } from 'react';
import styles from './PortalLayout.module.css';
import FOOTER_LOGO from 'statics/images/home/logo.png';
import TEL from 'statics/images/home/logo.png';
import FAX from 'statics/images/home/logo.png';
import QR_CODE from 'statics/images/home/logo.png';

export default function PageFooter() {
  return (
    <>
      <div className={styles.footIntroduce}>
        <div className={styles.footMain}>
          <div className={styles.footerLogo}>{<img src={FOOTER_LOGO} alt="" style={{ width: 228 }} />}</div>
          <div className={styles.footerInfo}>
            <div>
              <div>产品中心</div>
              <div>
                <div>
                  <a target="_blank" rel="noopener noreferrer" className={styles.aLink} href="TODO:">
                    无忧理论培训平台
                  </a>
                </div>
                <div>
                  <a target="_blank" rel="noopener noreferrer" className={styles.aLink} href="TODO:">
                    驾校管理系统
                  </a>
                </div>
              </div>
            </div>
            <div>
              <div>模拟考试</div>
              <div>
                <div>
                  <a target="_blank" rel="noopener noreferrer" className={styles.aLink} href="TODO:">
                    科目一交规
                  </a>
                </div>
                <div>
                  <a target="_blank" rel="noopener noreferrer" className={styles.aLink} href="TODO:">
                    科目四安全文明驾驶
                  </a>
                </div>
              </div>
            </div>
            <div>
              <div>联系我们</div>
              <div className={styles.contactWay}>
                <div>
                  <span>{<img src={TEL} alt="" style={{ width: 14 }} />} </span>
                  <span>电话</span>
                  <span>0571-28080500</span>
                </div>
                <div>
                  <span>{<img src={FAX} alt="" style={{ width: 14 }} />}</span>
                  <span>传真</span>
                  <span>0571-86696433</span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.qrCode}>{<img src={QR_CODE} alt="" style={{ width: 105 }} />}</div>
        </div>
      </div>
      <div className={styles.footWords}>
        <div>公司地址：中国杭州滨江区滨康路669号 邮编：310053</div>
        <div>Copyright&nbsp;&copy;&nbsp;1998-2020&nbsp;浙ICP备09003683号-6浙江维尔科技有限公司&nbsp;&nbsp;版权所有</div>
        <div>
          <a className={styles.aLink} href={'TODO:'}>
            浙公网安备&nbsp;33010802008747号
          </a>
        </div>
      </div>
    </>
  );
}
