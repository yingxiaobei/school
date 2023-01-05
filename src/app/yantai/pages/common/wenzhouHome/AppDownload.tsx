import { Modal, Button } from 'antd';
import QRCODE from 'statics/images/portal/wellQRcode.png';
import APP_BG from 'statics/images/portal/appBg.png';
import CHOICE from 'statics/images/portal/choice.png';
import EXAM from 'statics/images/portal/exam.png';
import STUDY from 'statics/images/portal/study.png';
import WRONG from 'statics/images/portal/wrong.png';
import styles from 'layouts/WenZhouLayout.module.css';

export default function AppDownload(props: any) {
  const { onCancel } = props;
  return (
    <Modal width={350} className="appDownLoad" visible title={null} onCancel={onCancel} footer={null}>
      <div className={styles.appDownloadBg}>
        <span>打开手机扫一扫</span>
        <span>立刻解锁一下功能</span>
        <img src={QRCODE} className="mt20" style={{ width: 150 }} />
      </div>
      <div
        className="flex-box mb20 p10"
        style={{ flexDirection: 'column', boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.16)', opacity: 1, borderRadius: 9 }}
      >
        <div>
          <img src={STUDY} className="mb20" style={{ height: 20 }} />
        </div>
        <div className="flex" style={{ width: '100%', justifyContent: 'space-evenly', fontSize: 12 }}>
          <div className="mr10 flex-box" style={{ flexDirection: 'column' }}>
            <img src={EXAM} style={{ width: 30 }} />
            <span>考点练习</span>
          </div>
          <div className="mr10 flex-box" style={{ flexDirection: 'column' }}>
            <img src={CHOICE} style={{ width: 20 }} />
            <span>精简500题</span>
          </div>
          <div className="mr10 flex-box" style={{ flexDirection: 'column' }}>
            <img src={WRONG} style={{ width: 20 }} />
            <span>易错200题</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
