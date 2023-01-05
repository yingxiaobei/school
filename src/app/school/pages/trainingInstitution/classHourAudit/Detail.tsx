import { Checkbox, Row, Tooltip } from 'antd';
import { useConfirm, useFetch, useHash } from 'hooks';
import { _get } from 'utils';
import { cloneDeep } from 'lodash';
import { _getReviewDetail } from './_api';
import { _getCoMubanPic, _reviewLog } from '../../student/teachingJournal/_api';
import { AuthButton, IF, Loading, PhotoListShow } from 'components';
import moment from 'moment';
import { Collapse } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.module.css';
import VehicleTrajectory from '../../student/teachingJournal/VehicleTrajectory';
import Minutes from '../../student/teachingJournal/Minutes';
import { CreditHourDetails } from './components';
import { titleList } from 'components/PhotoListShow';

const { Panel } = Collapse;

interface classHourAuditProps {
  coachid: string | null;
  classid: string | null;
  stuid: string | null;
  currentRecord: any;
  onOk: () => void;
  _switchVisible: () => void;
  ignore: number;
  forceUpdate: () => void;
}

type CreditHourAuditLog = {
  title: typeof titleList[number];
  url?: string;
  takeTime?: string;
  exceptionCodes?: string;
};

export default function Detail({
  classid = null,
  stuid = null,
  currentRecord = {},
  onOk,
  _switchVisible,
  ignore,
  forceUpdate,
  coachid = null,
}: classHourAuditProps) {
  const [list, setList] = useState<Record<number, CreditHourAuditLog>>([
    { title: '学员证件照' },
    { title: '学员模板照' },
    { title: '学员签到照' },
    { title: '学员签退照' },
    { title: '教练证件照' },
    { title: '教练模板照' },
  ]); // 第一行照片
  const [otherList, setOtherList] = useState<CreditHourAuditLog[]>([]); // 第二行照片
  const [otherShowList, setOtherShowList] = useState<CreditHourAuditLog[]>([]);

  // const commonStyle = { borderLeft: '1px solid #979494', paddingLeft: 6 };
  // const commonImg = { width: 150, height: 150, margin: 10 };
  const year = _get(currentRecord, 'signstarttime', '')
    ? moment(_get(currentRecord, 'signstarttime', '')).format('YYYY')
    : null;

  const { data, isLoading } = useFetch({
    request: _getReviewDetail,
    query: { classid, stuid, year },
    depends: [classid, stuid, ignore],
    requiredFields: ['classid', 'stuid', 'year'],
  });

  useEffect(() => {
    // let data =  data || {}
    let tempList: Record<number, CreditHourAuditLog> = {};
    // 学员证件照
    tempList[0] = {
      title: titleList[0],
      url: _get(data, ['headImg', 'url']),
    };
    // 学员模板照
    tempList[1] = {
      title: titleList[1],
      url: _get(data, ['faceCenter', 'url']),
    };
    // 学员签到照
    tempList[2] = {
      title: titleList[2],
      url: _get(data, ['stuSigninPhoto', 'url']),
      takeTime: _get(data, ['stuSigninPhoto', 'takeTime']),
      exceptionCodes: _get(data, ['stuSigninPhoto', 'exceptionCodes']),
    };
    // 学员签退照
    tempList[3] = {
      title: titleList[3],
      url: _get(data, ['stuSignoutPhoto', 'url']),
      takeTime: _get(data, ['stuSignoutPhoto', 'takeTime']),
      exceptionCodes: _get(data, ['stuSignoutPhoto', 'exceptionCodes']),
    };

    // 随机照片
    const randomPhoto: CreditHourAuditLog[] = _get(data, 'randomPhoto', []); // 随机照片

    setList((list) => ({
      ...cloneDeep(list),
      ...cloneDeep(tempList),
    }));

    setOtherShowList(cloneDeep(randomPhoto));
    setOtherList(cloneDeep(randomPhoto));
  }, [data]);

  const { data: coachData, isLoading: coachLoading } = useFetch({
    request: _getCoMubanPic,
    query: { cid: coachid },
    depends: [ignore, coachid],
    requiredFields: ['cid'],
  });

  useEffect(() => {
    let tempList: Record<number, CreditHourAuditLog> = {};
    tempList[4] = { title: titleList[4], url: _get(coachData, 'head_img_url') };
    tempList[5] = { title: titleList[5], url: _get(coachData, 'faceid_center') };

    setList((list) => ({
      ...cloneDeep(list),
      ...cloneDeep(tempList),
    }));
  }, [coachData]);

  const exceptionType = useHash('exception_code_type'); //异常原因
  const [_showConfirm] = useConfirm();

  // const stuSigninPhoto = _get(data, 'stuSigninPhoto', {}); // 签到照
  // const stuSignoutPhoto = _get(data, 'stuSignoutPhoto', {}); // 签退照
  // const randomPhoto = _get(data, 'randomPhoto', []); // 随机照片
  // const headImg = _get(data, 'headImg', {}); // 学员证件照
  // const faceCenter = _get(data, 'faceCenter', {}); // 学员模板照

  const resolveException = (exceptionCodes: string = '') => {
    const exceptionArr = exceptionCodes.replace(/;/g, ',').split(','); //返回值可能是分号也可能是逗号分隔
    const length = exceptionArr.length;
    const exception1 = _get(exceptionArr, '0');
    if (length === 1) {
      return exceptionType[exception1];
    }
    const str = exceptionArr
      .map((x) => {
        return exceptionType[x];
      })
      .join('，');

    return (
      <Tooltip color={'#333'} placement="top" title={str}>
        {exceptionType[exception1]}...
      </Tooltip>
    );
  };

  const timeLine = moment(_get(currentRecord, 'signendtime', '')).diff(
    moment(_get(currentRecord, 'signstarttime', '')),
    'minute',
  );

  // 签退－签到＜1的0学时+系统自动审批+整体无效才不能选中
  const isDisabled =
    timeLine < 1 && _get(currentRecord, 'crstate', '') === '3' && _get(currentRecord, 'reviewStatus', '') === '7';

  return (
    <div>
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <div className="p24" style={{ height: '100%', position: 'relative' }}>
            <Collapse
              className={styles.classHourAuditCollapseWrapper}
              // 默认展开学时详情、培训照片
              defaultActiveKey={['1', '2']}
              onChange={() => {}}
              ghost
              expandIconPosition={'end'}
              // style={{ maxWidth: 1600 }}
            >
              <Panel header="学时详情" key="1">
                <CreditHourDetails data={data} />
              </Panel>
              <Panel header="培训照片" key="2">
                <PhotoListShow
                  selectRender={() => (
                    <Checkbox
                      className={'ml20'}
                      onChange={(checkboxEvent) => {
                        if (checkboxEvent.target.checked) {
                          const exceptionList = otherList.filter((photo) => photo.exceptionCodes);
                          setOtherShowList(exceptionList);
                        } else {
                          setOtherShowList(otherList);
                        }
                      }}
                    >
                      只看异常
                    </Checkbox>
                  )}
                  isSelected
                  list={list}
                  otherList={otherShowList}
                  render={(item: CreditHourAuditLog) => {
                    return (
                      <>
                        <span>{_get(item, 'takeTime', '')}</span>
                        {_get(item, 'exceptionCodes', '') && (
                          <span className="color-primary">
                            异常项：{resolveException(_get(item, 'exceptionCodes', ''))}
                          </span>
                        )}
                      </>
                    );
                  }}
                />
              </Panel>
              {/*分钟学时和车辆轨迹只有在实操的状态下展示*/}
              <Panel header="分钟学时" key="3">
                {_get(currentRecord, 'traincode') === '1' ? (
                  <Minutes currentRecord={currentRecord} />
                ) : (
                  <>本次训练非实操课程，无分钟学时</>
                )}
              </Panel>
              <Panel header="车辆轨迹" key="4">
                {_get(currentRecord, 'traincode') === '1' ? (
                  <VehicleTrajectory size={'small'} currentRecord={currentRecord} />
                ) : (
                  <>本次训练非实操课程，无车辆轨迹</>
                )}
              </Panel>
            </Collapse>

            <Row
              style={{ position: 'fixed', bottom: 40, right: 60, display: 'inline-block', zIndex: 10 }}
              justify="end"
              align="bottom"
            >
              <>
                <AuthButton
                  authId="trainingInstitution/classHourAudit:btn4"
                  disabled={isDisabled}
                  type="primary"
                  className="ml20"
                  onClick={() => {
                    _showConfirm({
                      title: '是否设置本条电子教学日志有效',
                      handleOk: async () => {
                        const res = await _reviewLog({
                          classids: _get(currentRecord, 'classid', ''),
                          signstarttime: _get(currentRecord, 'signstarttime', ''),
                          crstate: '1',
                        });

                        if (_get(res, 'code') === 200) {
                          forceUpdate();
                          onOk();
                        }
                      },
                    });
                  }}
                >
                  学时有效
                </AuthButton>
                <AuthButton
                  authId="trainingInstitution/classHourAudit:btn3"
                  type="primary"
                  className="ml20"
                  onClick={async () => {
                    _switchVisible();
                  }}
                >
                  学时无效
                </AuthButton>
              </>
            </Row>
          </div>
        }
      />
    </div>
  );
}
