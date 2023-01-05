// 分账管理
import { useTablePro, useConfirm, useVisible, useHash } from 'hooks';
import { Search, AuthButton, CustomTable, ButtonContainer } from 'components';
import { _getCoaSplitRatio, _deleteCoach } from './_api';
import { _get } from 'utils';
import UpdateRecord from './UpdateRecord';
import ImportCoach from './ImportCoach';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { _getCoachList } from 'api';
import { Tooltip } from 'antd';

export default function SplitAccount() {
  const { search, _handleSearch, tableProps, _refreshTable, currentId, setCurrentId } = useTablePro({
    request: _getCoaSplitRatio,
  });
  const [_showConfirm] = useConfirm();
  const [visible, _switchVisible] = useVisible();
  const [importVisible, _switchImportVisible] = useVisible();
  const employStatusHash = useHash('coa_master_status');

  const columns = [
    {
      title: '教练员姓名',
      width: 100,
      dataIndex: 'coachname',
    },
    {
      title: '教练身份证号',
      width: 160,
      dataIndex: 'idcard',
    },
    {
      title: '生效时间',
      width: 120,
      dataIndex: 'effectiveTime',
    },
    {
      title: '教练员状态',
      width: 80,
      dataIndex: 'employstatus',
      render: (employstatus: any) => employStatusHash[employstatus],
    },
    {
      title: '驾校分账比例',
      width: 120,
      dataIndex: 'schSplitRatio',
    },
    {
      title: (
        <>
          {'教练分账比例'}
          <Tooltip placement="bottom" title={'教练员的分账比例变动的，仅对变动之后的结算的学费生效'}>
            <QuestionCircleOutlined />
          </Tooltip>
        </>
      ),
      width: 120,
      dataIndex: 'coaSplitRatio',
    },
    {
      title: '操作',
      dataIndex: '',
      width: 160,
      render: (_: void, record: object) => {
        return (
          <>
            <AuthButton
              className="operation-button"
              authId="financial/splitAccount:btn1"
              onClick={() => {
                _showConfirm({
                  handleOk: async () => {
                    const res = await _deleteCoach({ id: _get(record, 'cid', '') });
                    if (_get(res, 'code') === 200) {
                      _refreshTable();
                    }
                  },
                });
              }}
            >
              删除
            </AuthButton>
            <AuthButton
              className="operation-button"
              authId="financial/splitAccount:btn2"
              onClick={() => {
                _switchVisible();
                setCurrentId(_get(record, 'cid', ''));
              }}
            >
              修改记录
            </AuthButton>
          </>
        );
      },
    },
  ];

  return (
    <>
      {visible && <UpdateRecord onCancel={_switchVisible} cid={currentId as string} />}

      {importVisible && <ImportCoach onCancel={_switchImportVisible} onOk={_refreshTable} />}

      <Search
        loading={tableProps.loading}
        filters={[
          {
            type: 'SimpleSelectOfCoach',
            field: 'cid',
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
        simpleCoachRequest={_getCoachList}
        showSearchButton={false}
      />
      <ButtonContainer showSearchButton={true} refreshTable={_refreshTable} loading={tableProps.loading}>
        <AuthButton
          authId="financial/splitAccount:btn3"
          type="primary"
          className="mb20"
          onClick={() => _switchImportVisible()}
        >
          导入
          <Tooltip placement="bottom" title={'请通过导入功能添加、修改教练员分账信息'}>
            <QuestionCircleOutlined />
          </Tooltip>
        </AuthButton>
      </ButtonContainer>

      <CustomTable columns={columns} {...tableProps} rowKey="cid" scroll={{ x: 1200 }} />
    </>
  );
}
