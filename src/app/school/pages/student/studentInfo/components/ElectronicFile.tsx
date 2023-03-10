import { lazy, useState, useContext } from 'react';
import { Button, Card, message, Select } from 'antd';
import { useAuth, useFetch, useHash, useOptions, useVisible } from 'hooks';
import {
  _getSchContractTemp,
  // _getDetails,
  _trainExam,
  _getFileUrl,
  _getContractFile,
  _getDriveTrainApplyReport,
  _getTrainClassReport,
  _getStuStageReportStageTaoda,
  _getStuClassRecordReportStageTaoda,
  _getStuClassRecordReportStageTaodaSubject,
  _getStuStageReportForLastVersion,
  _getEmploymentApplyReport,
  _downLoadStuSigncontract,
  _downLoadGraduateReport,
  _downLoadStageReport,
  _downLoadTrainClassReport,
  _downLoadDriveTrainApplyReport,
  _downLoadStuStageReportForLastVersion,
  _getStatisticTheoryClassRecord,
  _downLoadEmploymentApplyReport,
  _getReportPdfidForZhenjiang,
} from '../_api';
import { _get, downloadFile, Auth } from 'utils';
import { createTrainRecordData, createTeachJournal, previewTheoryLog } from '../_printUtils';
import { AuthButton /* , UpdatePlugin, AuthWrapper  */ } from 'components';
import GlobalContext from 'globalContext';
import { isTheoryStudents } from 'services/request';

export default function ElectronicFile(props: { sid: string; currentRecord: unknown }) {
  const { sid, currentRecord } = props;
  const AuthWrapper = lazy(() => import('components/AuthWrapper'));
  const UpdatePlugin = lazy(() => import('components/UpdatePlugin'));
  const [subject, setSubject] = useState('0');
  const [noSoftwareVisible, setNoSoftwareVisible] = useVisible();
  const [contractLoading, setContractLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);
  const [loading4, setLoading4] = useState(false);
  const [loading5, setLoading5] = useState(false);
  const [loading6, setLoading6] = useState(false);
  const [loading7, setLoading7] = useState(false);

  const [preLoading1, setPreLoading1] = useState(false);
  const [preLoading2, setPreLoading2] = useState(false);
  const [preLoading3, setPreLoading3] = useState(false);
  const [preLoading4, setPreLoading4] = useState(false);
  const [preLoading5, setPreLoading5] = useState(false);
  const [preLoading6, setPreLoading6] = useState(false);
  const [preLoading7, setPreLoading7] = useState(false);
  const [preLoading8, setPreLoading8] = useState(false);

  const subjectcodeHash = useHash('trans_part_type'); // ????????????
  const traincodeHash = useHash('subject_type'); // ????????????
  const { $areaNum } = useContext(GlobalContext);

  /*  useFetch({
    query: {
      id: sid,
    },
    request: _getDetails,
  }); */

  const { data: tempData = {} } = useFetch({
    query: {
      sid: sid,
    },
    request: _getSchContractTemp,
  });

  //
  const { data: cardList = [] } = useFetch({
    query: {
      id: sid,
    },
    request: _getReportPdfidForZhenjiang,
  });

  /*  useFetch({
    query: {
      sid: sid,
    },
    request: _getContractFile,
    callback: (data) => {
      console.log(data);
    },
  }); */
  const isShowTeachJournalPrint = useAuth('student/studentInfo:btn19');

  async function print(subject: any) {
    const res = await _getStuClassRecordReportStageTaodaSubject({ sid, subject });
    const data = _get(res, 'data', {});
    if (Object.keys(data).length === 0) {
      return message.error(_get(res, 'message'));
    }
    const printRes = createTeachJournal(data, subject);
    if (printRes === 'NO_SOFTWARE') {
      setNoSoftwareVisible();
    }
  }

  const CARD_STYLE: { style: React.CSSProperties; bodyStyle: React.CSSProperties } = {
    style: { width: 290, textAlign: 'center', margin: '0 20px 20px 0', minHeight: 200 },
    bodyStyle: {
      height: 'calc(100% - 57px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {noSoftwareVisible && (
        <UpdatePlugin onCancel={setNoSoftwareVisible} info="????????????????????????" plugin="print_package.zip" />
      )}
      {String(_get(currentRecord, 'contractflag', '')) !== '0' && (
        <Card title="????????????" {...CARD_STYLE}>
          <Button
            loading={preLoading1}
            className="mr20"
            onClick={() => {
              setPreLoading1(true);
              if (Object.keys(tempData).length === 0) {
                message.error('?????????????????????????????????????????????');
                return;
              }
              _getContractFile({
                sid,
              })
                .then((res) => {
                  setPreLoading1(false);
                  window.open(_get(res, 'data'));
                })
                .catch(() => {
                  setPreLoading1(false);
                });
            }}
          >
            ??????
          </Button>
          <Button
            type="primary"
            loading={contractLoading}
            onClick={async () => {
              if (Object.keys(tempData).length === 0) {
                message.error('?????????????????????????????????????????????');
                return;
              }
              setContractLoading(true);
              const result = await _getContractFile({
                sid,
              });
              if (_get(result, 'code') !== 200) {
                setContractLoading(false);
                return message.error(_get(result, 'message'));
              }
              const res = await _downLoadStuSigncontract({
                sid,
              });
              setContractLoading(false);
              downloadFile(res, '????????????');
            }}
          >
            ??????
          </Button>
        </Card>
      )}
      <Card title="???????????????" {...CARD_STYLE}>
        <div>
          <AuthButton
            insertWhen={
              _get(currentRecord, 'traintype', '') === 'A2' ||
              _get(currentRecord, 'traintype', '') === 'B2' ||
              _get(currentRecord, 'transCarType', '') === 'A2' ||
              _get(currentRecord, 'transCarType', '') === 'B2'
            } //// ??????A2???B2????????????
            authId="student/studentInfo:btn18"
            className="mr20"
            onClick={async () => {
              const res = await _getStuStageReportStageTaoda({ sid });
              const data = _get(res, 'data', {});
              if (Object.keys(data).length === 0) {
                return message.error(_get(res, 'message'));
              }
              const printRes = await createTrainRecordData(data);
              if (printRes === 'NO_SOFTWARE') {
                setNoSoftwareVisible();
              }
            }}
          >
            ??????
          </AuthButton>
          <Button
            className="mr20"
            loading={preLoading2}
            onClick={async () => {
              setPreLoading2(true);
              const res = await _trainExam({ id: sid });
              if (!_get(res, 'data')) {
                setPreLoading2(false);
                message.error(_get(res, 'message'));
                return;
              }
              setPreLoading2(false);
              window.open(_get(res, 'data'));
            }}
          >
            ??????
          </Button>
          <Button
            loading={loading2}
            onClick={async () => {
              setLoading2(true);
              const result = await _trainExam({ id: sid });
              if (_get(result, 'code') !== 200) {
                setLoading2(false);
                message.error(_get(result, 'message'));
                return;
              }
              const res = await _downLoadStageReport({ id: sid });
              setLoading2(false);
              downloadFile(res, '???????????????');
            }}
            type="primary"
          >
            ??????
          </Button>
        </div>
      </Card>
      <Card title="????????????" {...CARD_STYLE}>
        <Button
          className="mr20"
          loading={preLoading3}
          onClick={async () => {
            setPreLoading3(true);
            const res = await _getFileUrl({ id: sid });
            if (!_get(res, 'data')) {
              setPreLoading3(false);
              message.error('????????????????????????????????????');
              return;
            }
            setPreLoading3(false);
            window.open(_get(res, 'data'));
          }}
        >
          ??????
        </Button>
        <Button
          type="primary"
          loading={loading3}
          onClick={async () => {
            setLoading3(true);
            const result = await _getFileUrl({ id: sid });
            if (_get(result, 'code') !== 200) {
              setLoading3(false);
              message.error('????????????????????????????????????');
              return;
            }
            const res = await _downLoadGraduateReport({ id: sid });
            setLoading3(false);

            downloadFile(res, '????????????');
          }}
        >
          ??????
        </Button>
      </Card>

      <Card title="???????????????" {...CARD_STYLE}>
        <Button
          className="mr20"
          loading={preLoading4}
          onClick={async () => {
            setPreLoading4(true);
            const res = await _getDriveTrainApplyReport({ id: sid });
            if (!_get(res, 'data')) {
              setPreLoading4(false);
              message.error(_get(res, 'message'));
              return;
            }
            setPreLoading4(false);
            window.open(_get(res, 'data'));
          }}
        >
          ??????
        </Button>
        <Button
          type="primary"
          loading={loading4}
          onClick={async () => {
            setLoading4(true);
            const result = await _getDriveTrainApplyReport({ id: sid });
            if (_get(result, 'code') !== 200) {
              setLoading4(false);
              message.error(_get(result, 'message'));
              return;
            }
            const res = await _downLoadDriveTrainApplyReport({ id: sid });
            downloadFile(res, '???????????????');
            setLoading4(false);
          }}
        >
          ??????
        </Button>
      </Card>

      <Card title="??????????????????" {...CARD_STYLE}>
        <div>
          <Select
            style={{ width: 170 }}
            value={subject}
            options={[{ value: '0', label: '????????????(??????)' }, ...useOptions('trans_part_type')]}
            onChange={(val: any) => {
              setSubject(val);
            }}
            className="text-center mb20"
          />
          <Button
            className="mr20"
            loading={preLoading5}
            onClick={async () => {
              setPreLoading5(true);
              const res = await _getTrainClassReport({ id: sid, subject });
              if (!_get(res, 'data')) {
                setPreLoading5(false);
                message.error(_get(res, 'message'));
                return;
              }
              setPreLoading5(false);
              window.open(_get(res, 'data'));
            }}
          >
            ??????
          </Button>
          <Button
            type="primary"
            loading={loading5}
            onClick={async () => {
              setLoading5(true);
              const result = await _getTrainClassReport({ id: sid, subject });
              if (_get(result, 'code') !== 200) {
                setLoading5(false);
                message.error(_get(result, 'message'));
                return;
              }
              const res = await _downLoadTrainClassReport({ id: sid, subject });
              downloadFile(res, '??????????????????');
              setLoading5(false);
            }}
          >
            ??????
          </Button>
        </div>
      </Card>
      {isShowTeachJournalPrint &&
      (_get(currentRecord, 'traintype', '') === 'A2' ||
        _get(currentRecord, 'traintype', '') === 'B2' ||
        _get(currentRecord, 'transCarType', '') === 'A2' ||
        _get(currentRecord, 'transCarType', '') === 'B2') && ( // ??????A2???B2????????????
          <Card title="????????????????????????" {...CARD_STYLE}>
            <div>
              <Button
                className="mr20"
                type="primary"
                onClick={() => {
                  print(1);
                }}
              >
                ?????????
              </Button>
              <Button
                className="mr20"
                type="primary"
                onClick={() => {
                  print(2);
                }}
              >
                ?????????
              </Button>
              <Button
                className="mr20 mt10"
                type="primary"
                onClick={() => {
                  print(3);
                }}
              >
                ?????????
              </Button>
              <Button
                className="mr20 mt10"
                type="primary"
                onClick={() => {
                  print(4);
                }}
              >
                ?????????
              </Button>
            </div>
          </Card>
        )}

      <AuthWrapper authId="student/studentInfo:btn22">
        <Card title="????????????????????????" {...CARD_STYLE}>
          <Button
            className="mr20"
            loading={preLoading6}
            onClick={async () => {
              setPreLoading6(true);
              const res = await _getStuStageReportForLastVersion({ sid });
              if (_get(res, 'code') !== 200) {
                setPreLoading6(false);
                message.error(_get(res, 'message'));
                return;
              }
              setPreLoading6(false);
              window.open(_get(res, 'data'));
            }}
          >
            ??????
          </Button>
          <Button
            loading={loading6}
            type="primary"
            onClick={async () => {
              setLoading6(true);
              const result = await _getStuStageReportForLastVersion({ sid });
              if (_get(result, 'code') !== 200) {
                setLoading6(false);
                message.error(_get(result, 'message'));
                return;
              }
              const res = await _downLoadStuStageReportForLastVersion({ id: sid });
              downloadFile(res, '???????????????');
              setLoading6(false);
            }}
          >
            ??????
          </Button>
        </Card>
      </AuthWrapper>

      <AuthWrapper
        authId="student/studentInfo:btn23"
        insertWhen={
          _get(currentRecord, 'traintype', '') === 'A2' ||
          _get(currentRecord, 'traintype', '') === 'B2' ||
          _get(currentRecord, 'transCarType', '') === 'A2' ||
          _get(currentRecord, 'transCarType', '') === 'B2'
        } //// ??????A2???B2????????????
      >
        <Card title="???????????????????????????" {...CARD_STYLE}>
          <Button
            className="mr20"
            loading={preLoading7}
            onClick={async () => {
              setPreLoading7(true);
              const res = await _getEmploymentApplyReport({ sid });
              if (_get(res, 'code') !== 200) {
                setPreLoading7(false);
                message.error(_get(res, 'message'));
                return;
              }
              setPreLoading7(false);
              window.open(_get(res, 'data'));
            }}
          >
            ??????
          </Button>
          <Button
            type="primary"
            loading={loading7}
            onClick={async () => {
              setLoading7(true);
              const result = await _getEmploymentApplyReport({ sid });
              if (_get(result, 'code') !== 200) {
                setLoading7(false);
                message.error(_get(result, 'message'));
                return;
              }
              const res = await _downLoadEmploymentApplyReport({ id: sid });
              downloadFile(res, '???????????????????????????');
              setLoading7(false);
            }}
          >
            ??????
          </Button>
        </Card>
      </AuthWrapper>
      <AuthWrapper authId="student/studentInfo:btn29">
        <Card title="??????????????????" {...CARD_STYLE}>
          <Button
            className="mr20"
            loading={preLoading8}
            onClick={async () => {
              setPreLoading8(true);
              /*
              ?????????????????????-?????? ??????????????????????????????customSchoolId=practicalSchoolId
              ????????????????????????????????????customSchoolId??????????????????customSchoolId?????????undefined,???????????????????????????
              */
              const res = await _getStatisticTheoryClassRecord({
                sid,
                customSchoolId: isTheoryStudents() ? Auth.get('practicalSchoolId') || '' : '',
              });

              setPreLoading8(false);
              if (Object.keys(_get(res, 'data', {})).length === 0) {
                return message.info('????????????');
              }
              const printRes = await previewTheoryLog(_get(res, 'data', {}), false, subjectcodeHash, traincodeHash);
              if (printRes === 'NO_SOFTWARE') {
                setNoSoftwareVisible();
              }
            }}
          >
            ??????
          </Button>
        </Card>
      </AuthWrapper>

      {/* ??????????????? */}
      {_get(currentRecord, 'certproclass') &&
        $areaNum === '05' &&
        _get(cardList, 'stuStudentReportPdfs', []).map((item: any) => {
          return (
            <Card title={item.desc} {...CARD_STYLE}>
              <Button
                className="mr20"
                onClick={() => {
                  window.open(item.url);
                }}
              >
                ??????
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  window.open(item.url);
                }}
              >
                ??????
              </Button>
            </Card>
          );
        })}
    </div>
  );
}
