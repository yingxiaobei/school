// 异常学员
import { useTablePro } from 'hooks';
import { CustomTable, Search } from 'components';
import { _getList } from './_api';
import { _handleIdCard, _handlePhone } from 'utils';

export default function AbnormalStudent() {
  const iftrainfinishHash = { '0': '未完成', '1': '已完成' };

  const columns = [
    {
      title: '现培训机构',
      dataIndex: 'schoolName',
      width: 160,
    },
    {
      title: '原培训机构',
      dataIndex: 'oldSchoolName',
      width: 160,
    },
    {
      title: '学员姓名',
      dataIndex: 'name',
      width: 80,
    },
    {
      title: '证件号码',
      dataIndex: 'idcard',
      width: 160,
      render: (value: any, record: any) => _handleIdCard({ value, record }),
    },
    {
      title: '性别',
      dataIndex: 'sexValue',
      width: 50,
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 100,
      render: (value: any, record: any) => _handlePhone(value),
    },
    {
      title: '地址',
      dataIndex: 'address',
      width: 180,
    },
    {
      title: '业务类型',
      dataIndex: 'busitypevalue',
      width: 80,
    },
    {
      title: '培训车型',
      dataIndex: 'traintype',
      width: 80,
    },
    {
      title: '报名时间',
      dataIndex: 'applydate',
      width: 160,
    },
    {
      title: '培训记录编号',
      dataIndex: 'tranno',
      width: 100,
    },
    {
      title: '是否本地',
      dataIndex: 'isLocalValue',
      width: 70,
    },
    {
      title: '原驾校是否培训已完成',
      dataIndex: 'iftrainfinish',
      render: (iftrainfinish: any) => iftrainfinishHash[String(iftrainfinish)],
      width: 160,
    },
    {
      title: '主键',
      dataIndex: 'id',
      width: 160,
    },
    {
      title: '接收时间',
      dataIndex: 'createTime',
      width: 160,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 100,
    },
  ];

  const { tableProps, search, _refreshTable, _handleSearch } = useTablePro({
    request: _getList,
  });

  return (
    <div>
      <Search
        loading={tableProps.loading}
        filters={[
          {
            type: 'RangePicker',
            field: ['applyTimeBegin', 'applyTimeEnd'],
            placeholder: ['入学日期(起)', '入学日期(止)'],
          },
          { type: 'Input', field: 'name', placeholder: '请输入学员姓名' },
          { type: 'Input', field: 'idcard', placeholder: '请输入证件号码' },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={_refreshTable}
      />
      <CustomTable columns={columns} {...tableProps} rowKey="id" />
    </div>
  );
}
