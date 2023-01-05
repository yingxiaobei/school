import { Divider } from 'antd';
import IMG_1 from 'statics/images/addService/1.png';
import IMG_2 from 'statics/images/addService/2.png';
import IMG_3 from 'statics/images/addService/3.png';
import MONEY from 'statics/images/addService/money.png';
import styles from './index.module.css';

export default function AddServiceIntro() {
  return (
    <div className="mt10">
      <div className={styles.top}>
        <img alt="" src={MONEY} width={80} height={80} />
        <div className="mt10">
          <div className={styles.title}>增值服务</div>
          <div className={styles.text}>帮助拓展驾校营收方式 助学创收享双赢</div>
        </div>
      </div>
      <Divider />
      <div>
        <div className="flex-box">
          <img src={IMG_1} style={{ width: '80%' }} />
          {/* <div>
            <div>助学创收</div>
            <div>助力学员提高考试通过率</div>
            <div>本校学员在线下单享分成</div>
          </div> */}
        </div>
        <div className="flex-box">
          {/* <div>
            <div>对账无忧</div>
            <div>驾校开户后即可参与商品分成</div>
            <div>自动生成商品分成对账单信息</div>
          </div> */}

          <img src={IMG_3} alt="" style={{ width: '80%' }} />
        </div>
        <div className="flex-box">
          <img src={IMG_2} alt="" style={{ width: '80%' }} />
          {/* <div>
            <div>实时提现</div>
            <div>线上完成提现手续流程</div>
            <div>提现分成金额实时到账</div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
