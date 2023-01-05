import { ColumnsType } from 'antd/lib/table/Table';
import { AxiosResponse } from 'axios';
import { CustomTable } from 'components';
import { useTablePro } from 'hooks';
import TooltipRender from './TooltipRender';

interface ChangedRecordProps {
  id: string | null;
  paramsKey: string;
  api: (...params: any[]) => Promise<AxiosResponse<any>> | undefined;
  /**
   * @description 区分学员档案中变更记录和车\教练的
   * 1. 用到的接口不一样
   * 2. 根据后端返回渲染的表格字段也不一样
   * */
  isStu?: boolean;
}

export default function ChangeRecord({ id, paramsKey, api, isStu = false }: ChangedRecordProps) {
  const { tableProps } = useTablePro({
    request: api,
    extraParams: {
      [paramsKey]: id,
    },
  });

  const renderToolTip = (text: string) => {
    const str = !text ? '无' : text;
    return <TooltipRender content={str} />;
  };

  const isStuColumns = () => {
    return isStu
      ? [
          { title: '变更内容', dataIndex: 'keycolumName', width: 100 },
          {
            title: '变更前内容',
            dataIndex: 'befKeyValueName',
            width: 100,
            render: renderToolTip,
          },
          {
            title: '变更后内容',
            dataIndex: 'aftKeyValueName',
            width: 100,
            render: renderToolTip,
          },
        ]
      : [
          {
            title: '变更内容',
            dataIndex: 'keycolumnName',
            width: 100,
          },
          {
            title: '变更前内容',
            dataIndex: 'befKeyValue',
            width: 100,
            render: renderToolTip,
          },
          {
            title: '变更后内容',
            dataIndex: 'aftKeyValue',
            width: 100,
            render: renderToolTip,
          },
        ];
  };

  const columns: ColumnsType<ChangeRecordRes> = [
    ...isStuColumns(),
    { title: '操作人', dataIndex: 'updateUserName', width: 180 },
    { title: '操作时间', dataIndex: 'createTime', width: 180 },
  ];

  return (
    <div>
      <CustomTable {...tableProps} columns={columns} rowKey="id" />
    </div>
  );
}
