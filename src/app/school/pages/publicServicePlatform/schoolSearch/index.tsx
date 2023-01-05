import { useState } from 'react';
import { _get } from 'utils';
import { AuthButton, CustomTable, SuperviseTree } from 'components';
import { _getSuperviseList } from './_api';
import { useFetch, useForceUpdate, useHash, useSearch, useTablePagination, useVisible } from 'hooks';
import Details from './Detail';
import AddOrEdit from './AddOrEdit';

export default function Foo() {
  const [seletedId, setSelectedId] = useState(undefined as any);
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const [detailsVisible, _switchDetailsVisible] = useVisible();
  const [visible, _switchVisible] = useVisible();
  const [currentRecord, setCurrentRecord] = useState<any>([]);
  const [ignore, forceUpdate] = useForceUpdate();

  const { data, isLoading } = useFetch({
    request: _getSuperviseList,
    query: { areaCode: seletedId },
    depends: [seletedId, ignore],
    requiredFields: ['areaCode'],
  });

  const timingFirmHash = useHash('timing_firm'); // 供职状态
  const companyLevelHash = useHash('company_level'); // 培训机构分类等级
  const columns = [
    {
      title: '所属计时厂商',
      dataIndex: 'timingFirm',
      render: (timingFirm: any) => timingFirmHash[timingFirm],
    },
    {
      title: '培训机构全称',
      dataIndex: 'name',
    },
    {
      title: '培训机构简称',
      dataIndex: 'shortName',
    },
    {
      title: '行政区划',
      dataIndex: 'area',
    },
    {
      title: '培训机构地址',
      dataIndex: 'address',
    },
    {
      title: '经营范围',
      dataIndex: 'busiScope',
    },
    {
      title: '分类等级',
      dataIndex: 'schoolLevel',
      render: (schoolLevel: any) => companyLevelHash[schoolLevel],
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (_: any, record: any) => (
        <>
          <AuthButton
            authId="publicServicePlatform/schoolSearch:btn1"
            onClick={() => {
              setCurrentRecord(record);
              _switchDetailsVisible();
            }}
            className="operation-button"
            type="primary"
            ghost
            size="small"
          >
            详情
          </AuthButton>
          <AuthButton
            authId="publicServicePlatform/schoolSearch:btn2"
            onClick={() => {
              setCurrentRecord(record);
              _switchVisible();
            }}
            className="operation-button"
            type="primary"
            ghost
            size="small"
          >
            编辑
          </AuthButton>
        </>
      ),
    },
  ];
  return (
    <div style={{ display: 'flex' }}>
      {detailsVisible && <Details onCancel={_switchDetailsVisible} currentRecord={currentRecord} isEdit={false} />}
      {visible && (
        <AddOrEdit
          onCancel={_switchVisible}
          currentRecord={currentRecord}
          onOk={() => {
            _switchVisible();
            forceUpdate();
          }}
        />
      )}
      <SuperviseTree
        callback={(id: string) => {
          setSelectedId(id);
        }}
        height={480}
        width={'15%'}
        leafType="area"
        showSearch={false}
      />
      {
        <div style={{ width: '85%' }}>
          <CustomTable
            columns={columns}
            loading={isLoading}
            bordered
            dataSource={_get(data, 'rows', [])}
            rowKey={(record: any) => _get(record, 'id')}
            pagination={tablePagination}
          />
        </div>
      }
    </div>
  );
}
