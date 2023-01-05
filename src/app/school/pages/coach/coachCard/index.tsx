//教练制卡管理
import { useState } from 'react';
import { AuthButton, CustomTable, Search } from 'components';
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
import { _getCoachCardList, _updateCoachCardEffective, _addCard, _application, _getApplicationRes } from './_api';
import AddCard from './AddCard';
import InputCardNum from 'app/school/pages/student/studentCardMaking/InputCardNum';
import { getCardID, _get, _handleIdCard } from 'utils';
import Details from 'app/school/pages/coach/coachInfo/Details';
import FingerprintCollection from './FingerprintCollection';

function CoachCard() {
  const [search, _handleSearch] = useSearch();
  const [currentRecord, setCurrentRecord] = useState(null);
  const [ignore, forceUpdate] = useForceUpdate();
  const [detailsVisible, _switchDetailsVisible] = useVisible();

  const [visible, _switchVisible] = useVisible();

  const [currentId, setCurrentId] = useState(null);
  const [isReissue, setIsReissue] = useState(false); //是否补卡
  const [inputCardVisible, setInputCardVisible] = useVisible();
  const [cardInfo, setCardInfo] = useState('');
  const [cardID, setCardID] = useState('');
  const cardStatusHash = useHash('card_status_type');
  const employStatusHash = useHash('coa_master_status');
  const cardTypeHash = useHash('ic_card_physics_status_type');
  const applyStatus = useHash('ic_apply_status');
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [loading, setLoading] = useState(false);
  const [fingerVisible, setFingerVisible] = useVisible();

  const { loading: updateLoading, run } = useRequest(_updateCoachCardEffective, {
    onSuccess: () => {
      forceUpdate();
    },
  });

  async function makeCard(type: boolean) {
    setIsReissue(type);
    setLoading(true);
    _switchDetailsVisible();
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
      title: '教练姓名',
      width: 80,
      dataIndex: 'coachname',
      render: (name: any, record: any) => {
        return (
          <span
            className="color-primary pointer"
            onClick={() => {
              _switchVisible();
              setCurrentId(_get(record, 'cid'));
            }}
          >
            {name}
          </span>
        );
      },
    },
    {
      title: '教练状态',
      dataIndex: 'employstatus',
      width: 80,
      render: (employstatus: any) => employStatusHash[employstatus],
    },
    {
      title: '证件号码',
      dataIndex: 'idcard',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    { title: '入职日期', dataIndex: 'hiredate', width: 120 },
    { title: '制卡日期', dataIndex: 'maketime', width: 120 },
    {
      title: '制卡状态',
      width: 80,
      dataIndex: 'ismake',
      render: (ismake: any) => cardStatusHash[ismake],
    },
    { title: 'IC卡条形码', dataIndex: 'barcode', width: 120 },
    { title: '当前卡类型', dataIndex: 'usertype', width: 80, render: (usertype: any) => cardTypeHash[usertype] },
    { title: '有效截止日期', dataIndex: 'validdate', width: 130 },
    { title: '申请状态', dataIndex: 'applystatus', width: 80, render: (applystatus: any) => applyStatus[applystatus] },
    { title: '审核备注', dataIndex: 'remarks', width: 80 },
    {
      title: '操作',
      width: 300,
      dataIndex: 'operate',
      render: (_: void, record: any) => (
        <div>
          <AuthButton
            authId="coach/coachCard:btn4"
            loading={_get(currentRecord, 'cid') === _get(record, 'cid') && applicationLoading}
            onClick={() => {
              setCurrentRecord(record);
              applicationRun({ cid: _get(record, 'cid', ''), cardTypeEnum: 'IC_CARD' });
            }}
            className="operation-button"
          >
            申请
          </AuthButton>
          <AuthButton
            authId="coach/coachCard:btn5"
            loading={_get(currentRecord, 'cid') === _get(record, 'cid') && getApplicationLoading}
            onClick={() => {
              setCurrentRecord(record);
              getApplicationRun({ cid: _get(record, 'cid', '') });
            }}
            className="operation-button"
          >
            获取申请结果
          </AuthButton>

          <AuthButton
            insertWhen={!_get(record, 'barcode', '')} // 未制卡的教练显示制卡按钮，已制卡的教练显示补卡及延期按钮
            authId="coach/coachCard:btn1"
            onClick={async () => {
              setCurrentRecord(record);
              await makeCard(false);
            }}
            className="operation-button"
          >
            制卡
          </AuthButton>

          <AuthButton
            insertWhen={_get(record, 'barcode', '')}
            authId="coach/coachCard:btn2"
            onClick={async () => {
              setCurrentRecord(record);
              await makeCard(true);
            }}
            className="operation-button"
          >
            补卡
          </AuthButton>
          <AuthButton
            insertWhen={_get(record, 'barcode', '')}
            loading={_get(currentRecord, 'cid') === _get(record, 'cid') && updateLoading}
            authId="coach/coachCard:btn3"
            onClick={async () => {
              setCurrentRecord(record);
              run({ cids: [_get(record, 'cid', '')] });
            }}
            className="operation-button"
          >
            延期
          </AuthButton>

          <AuthButton
            authId="coach/coachCard:btn6"
            onClick={async () => {
              setCurrentRecord(record);
              setFingerVisible();
            }}
            className="operation-button"
          >
            指纹采集
          </AuthButton>
        </div>
      ),
    },
  ];

  const { data, isLoading } = useFetch({
    request: _getCoachCardList,
    query: {
      page: pagination.current,
      limit: pagination.pageSize,
      barcode: _get(search, 'barcode'),
      cardstatus: _get(search, 'cardstatus'),
      usetype: _get(search, 'usetype'),
      employstatus: _get(search, 'employstatus'),
      idcard: _get(search, 'idcard'),
      maketimeEnd: _get(search, 'maketimeEnd'),
      maketimeStart: _get(search, 'maketimeStart'),
      name: _get(search, 'name'),
      hireStartTime: _get(search, 'hireStartTime'),
      hireEndTime: _get(search, 'hireEndTime'),
      makeStatus: _get(search, 'makeStatus', ''),
    },
    depends: [pagination.current, pagination.pageSize, ignore],
    callback: (data) => {
      setCurrentRecord(_get(data, 'rows.0'));
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
    },
  });

  return (
    <div>
      {fingerVisible && (
        <FingerprintCollection onCancel={setFingerVisible} currentRecord={currentRecord} onOk={setFingerVisible} />
      )}
      {detailsVisible && (
        <AddCard
          onCancel={_switchDetailsVisible}
          onOk={() => {
            _switchDetailsVisible();
            forceUpdate();
          }}
          currentRecord={currentRecord}
          setInputCardVisible={setInputCardVisible}
          cardInfo={cardInfo}
          cardID={cardID}
          isReissue={isReissue} //是否补卡
          loading={loading}
        />
      )}
      <Details visible={visible} onCancel={_switchVisible} currentId={currentId} />

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
          isStudent={false}
          _func={_addCard}
        />
      )}
      <Search
        loading={isLoading}
        filters={[
          { type: 'Input', field: 'name', placeholder: '教练姓名' },
          { type: 'Input', field: 'idcard', placeholder: '证件号码' },
          {
            type: 'RangePicker',
            field: ['hireStartTime', 'hireEndTime'],
            placeholder: ['入职日期(起)', '入职日期(止)'],
          },
          {
            type: 'RangePicker',
            field: ['maketimeStart', 'maketimeEnd'],
            placeholder: ['制卡日期(起)', '制卡日期(止)'],
          },
          {
            type: 'Select',
            field: 'employstatus',
            options: [{ value: '', label: '教练状态(全部)' }, ...useOptions('coa_master_status')],
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
      />

      <CustomTable
        columns={columns}
        loading={isLoading}
        bordered
        dataSource={_get(data, 'rows', [])}
        rowKey="cid"
        pagination={tablePagination}
      />
    </div>
  );
}

export default CoachCard;
