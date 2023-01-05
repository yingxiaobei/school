// 学员制卡管理
import { useState } from 'react';
import { message, Tooltip } from 'antd';
import { AuthButton, ButtonContainer, CustomTable, Search, UpdatePlugin } from 'components';
import {
  useFetch,
  useTablePagination,
  useHash,
  useSearch,
  useForceUpdate,
  useVisible,
  useOptions,
  useRequest,
} from 'hooks';
import { _getStudentCardList, _addCard, _updateCardEffective, _application, _getApplicationRes } from './_api';
import Add from './Add';
import Details from 'app/school/pages/student/studentInfo/StudentInfoDetail';
import { getICCardID, getCardID, getIdCardInfo, _get, _handleIdCard } from 'utils';
import InputCardNum from './InputCardNum';
import ReadIdCard from 'components/ReadIdCard';

export default function StudentCardMaking() {
  const [visible, _switchVisible] = useVisible();
  const [search, _handleSearch] = useSearch();
  const [currentRecord, setCurrentRecord] = useState(null);
  const [ignore, forceUpdate] = useForceUpdate();
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [cardInfo, setCardInfo] = useState('');
  const [cardID, setCardID] = useState('');
  const [isReissue, setIsReissue] = useState(false); //是否补卡
  const cardStatusHash = useHash('card_status_type');
  const cardTypeHash = useHash('ic_card_physics_status_type');
  const [inputCardVisible, setInputCardVisible] = useVisible();
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [loading, setLoading] = useState(false);
  const [idCard, setIdCard] = useState('');
  const [icCard, setIcCard] = useState('');
  const [icLoading, setIcLoading] = useState(false);
  const [idLoading, setIdLoading] = useState(false);
  const [updatePluginVisible, setUpdatePluginVisible] = useVisible();

  const applyStatus = useHash('ic_apply_status');

  async function makeCard(type: boolean) {
    setIsReissue(type);
    setLoading(true);
    _switchVisible();
    await getCardID((data: any) => {
      setLoading(false);
      if (_get(data, 'length', 0) > 1 && _get(data, '0') !== false && _get(data, '1') !== false) {
        setCardInfo(_get(data, '0'));
        setCardID(_get(data, '1'));
      } else {
        setCardInfo('');
        setCardID('');
        setInputCardVisible();
      }
    });
  }

  const { loading: updateLoading, run: upodateRun } = useRequest(_updateCardEffective, {
    onSuccess: () => {
      forceUpdate();
    },
  });

  const { loading: applicationLoading, run: applicationRun } = useRequest(_application, {
    onSuccess: () => {
      forceUpdate();
    },
  });

  const { loading: getApplicationLoading, run: getApplicationRun } = useRequest(_getApplicationRes, {
    onSuccess: () => {
      forceUpdate();
    },
  });

  const columns = [
    {
      title: '学员姓名',
      width: 80,
      dataIndex: 'name',
      render: (name: any, record: any) => {
        return (
          <Tooltip title={name}>
            <span
              className="color-primary pointer"
              onClick={() => {
                _switchDetailsVisible();
                setCurrentRecord(record);
              }}
            >
              {name}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: '证件号码',
      dataIndex: 'idcard',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    { title: '培训车型', width: 80, dataIndex: 'traintype' }, // 单选C1/C2
    { title: '报名日期', width: 120, dataIndex: 'applydate' },
    { title: '制卡日期', width: 120, dataIndex: 'maketime' },
    {
      title: '制卡状态',
      width: 80,
      dataIndex: 'makestatus',
      render: (makestatus: any) => cardStatusHash[makestatus],
    }, // 卡状态
    { title: 'IC卡条形码', width: 120, dataIndex: 'barcode' },
    { title: '当前卡类型', width: 80, dataIndex: 'usetype', render: (usetype: any) => cardTypeHash[usetype] },
    { title: '有效截止日期', width: 140, dataIndex: 'validdate' },
    { title: '申请状态', width: 80, dataIndex: 'applystatus', render: (applystatus: any) => applyStatus[applystatus] },
    { title: '审核备注', width: 90, dataIndex: 'remarks' },
    {
      title: '操作',
      dataIndex: 'operate',
      width: 300,
      render: (_: void, record: any) => (
        <div>
          <AuthButton
            authId="student/studentCardMaking:btn6"
            loading={_get(currentRecord, 'sid') === _get(record, 'sid') && applicationLoading}
            onClick={() => {
              setCurrentRecord(record);
              applicationRun({ sid: _get(record, 'sid', ''), cardTypeEnum: 'IC_CARD' });
            }}
            className="operation-button"
          >
            申请
          </AuthButton>
          <AuthButton
            authId="student/studentCardMaking:btn7"
            loading={_get(currentRecord, 'sid') === _get(record, 'sid') && getApplicationLoading}
            onClick={() => {
              setCurrentRecord(record);
              getApplicationRun({ sid: _get(record, 'sid', '') });
            }}
            className="operation-button"
          >
            获取申请结果
          </AuthButton>
          {!_get(record, 'barcode', '') && ( //未制卡的显示制卡按钮，已制卡的显示补卡及延期按钮
            <AuthButton
              authId="student/studentCardMaking:btn3"
              onClick={async () => {
                setCurrentRecord(record);
                await makeCard(false);
              }}
              className="operation-button"
            >
              制卡
            </AuthButton>
          )}
          {_get(record, 'barcode', '') && (
            <>
              <AuthButton
                authId="student/studentCardMaking:btn4"
                onClick={async () => {
                  setCurrentRecord(record);
                  await makeCard(true);
                }}
                className="operation-button"
              >
                补卡
              </AuthButton>
              <AuthButton
                loading={_get(currentRecord, 'sid') === _get(record, 'sid') && updateLoading}
                authId="student/studentCardMaking:btn5"
                onClick={async () => {
                  setCurrentRecord(record);
                  upodateRun({ sid: _get(record, 'sid', '') });
                }}
                className="operation-button"
              >
                延期
              </AuthButton>
            </>
          )}
        </div>
      ),
    },
  ];

  // FIXME:wy
  const { data, isLoading } = useFetch<any>({
    request: _getStudentCardList,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      studentnum: _get(search, 'studentnum'),
      spell: _get(search, 'spell'),
      sid: _get(search, 'sid'),
      usetype: _get(search, 'usetype'),
      makeStatus: _get(search, 'makeStatus'),
      barcode: _get(search, 'barcode'),
      maketimestart: _get(search, 'maketimestart'),
      maketimeend: _get(search, 'maketimeend'),
      idcard: _get(search, 'idcard'),
      name: _get(search, 'name'),
      applyStartTime: _get(search, 'applyStartTime'),
      applyEndTime: _get(search, 'applyEndTime'),
    },
    depends: [pagination.current, pagination.pageSize, ignore, idCard, icCard],
    callback: (data) => {
      setCurrentRecord(_get(data, 'rows.0'));
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  return (
    <div>
      <Search
        loading={isLoading}
        filters={[
          { type: 'Input', field: 'name', placeholder: '学员姓名' },
          { type: 'Input', field: 'idcard', placeholder: '证件号码' },
          {
            type: 'RangePicker',
            field: ['applyStartTime', 'applyEndTime'],
            placeholder: ['报名日期(起)', '报名日期(止)'],
          },
          {
            type: 'RangePicker',
            field: ['maketimestart', 'maketimeend'],
            placeholder: ['制卡日期(起)', '制卡日期(止)'],
          },
          {
            type: 'Select',
            field: 'makeStatus',
            options: [{ value: '', label: '制卡状态(全部)' }, ...useOptions('card_status_type')],
          },
          { type: 'Input', field: 'barcode', placeholder: 'IC卡条形码' },
          {
            type: 'Select',
            field: 'usetype',
            options: [{ value: '', label: 'IC卡类型(全部)' }, ...useOptions('ic_card_physics_status_type')],
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
        showSearchButton={false}
      />
      {visible && (
        <Add
          onCancel={_switchVisible}
          onOk={() => {
            _switchVisible();
            forceUpdate();
          }}
          currentRecord={currentRecord}
          cardInfo={cardInfo}
          cardID={cardID}
          isReissue={isReissue} //是否补卡
          loading={loading}
          setInputCardVisible={setInputCardVisible}
        />
      )}
      {detailsVisible && (
        <Details onCancel={_switchDetailsVisible} currentRecord={currentRecord} sid={_get(currentRecord, 'sid', '')} />
      )}
      {updatePluginVisible && <UpdatePlugin onCancel={setUpdatePluginVisible} info={'无法进行读二代证'} />}
      {inputCardVisible && (
        <InputCardNum
          onOk={() => {
            setInputCardVisible();
            forceUpdate();
          }}
          onCancel={setInputCardVisible}
          currentRecord={currentRecord}
          cardInfo={cardInfo}
          isReissue={isReissue} //是否补卡
          isStudent={true}
          _func={_addCard}
        />
      )}
      <ButtonContainer
        showSearchButton={true}
        refreshTable={() => {
          forceUpdate();
          setPagination({ ...pagination, current: 1 });
        }}
        loading={isLoading}
        // className="mb20"
      >
        <AuthButton
          loading={icLoading}
          authId="student/studentCardMaking:btn1"
          type="primary"
          className="mr20 mb20"
          onClick={async () => {
            setIcLoading(true);
            const res = await getICCardID();
            if (res) {
              _handleSearch('barcode', res);
              setIcCard(res + Math.random());
            } /* else {
              message.error('未检测到IC卡信息');
            } */
            setIcLoading(false);
          }}
        >
          读IC卡
        </AuthButton>

        <ReadIdCard
          authId="student/studentCardMaking:btn2"
          setUpdatePluginVisible={setUpdatePluginVisible}
          _handleSearch={_handleSearch}
          setIdCard={setIdCard}
        />
      </ButtonContainer>

      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey="sid"
        pagination={tablePagination}
      />
    </div>
  );
}
