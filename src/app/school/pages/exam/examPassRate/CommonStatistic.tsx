import { useFetch } from 'hooks';
import { useState } from 'react';
import { _examPassRateAge, _examPassRateCarType } from './_api';
import { mergeCells } from './utils';
import { useTablePagination } from 'hooks';
import { CustomTable, IF, Loading } from 'components';
import { generateIdForDataSource, _get } from 'utils';

const commonStyle = { borderBottom: 'solid 1px #f0f0f0', padding: 5 };

interface IProps {
  period: string;
  type: string;
}

// FIXME: -yyq 该文件的css样式尽可能替换成className，并且统一为通用样式

export default function CommonStatistic(props: IProps) {
  const { period, type } = props;
  const [dataSource, setDataSource] = useState([]);
  const [totalSubject2Data, setTotalSubject2Data] = useState([]);
  const [totalSubject3Data, setTotalSubject3Data] = useState([]);
  const [pagination, setPagination, tablePagination] = useTablePagination({});
  const hashTable = { '0': '20岁以下', '20': '20-29岁', '30': '30-39岁', '40': '40-49岁', '50': '50-59岁' };

  const { data, isLoading } = useFetch({
    request: type === 'carType' ? _examPassRateCarType : _examPassRateAge,
    query: { period, page: pagination.current, limit: pagination.pageSize },
    depends: [pagination.current, pagination.pageSize],
    // TODO: TS 不清楚这一块业务
    callback: (data: any) => {
      setPagination({ ...pagination, total: _get(data, 'total', 0) });
      const total = _get(data, 'rows', []).filter((items: any) => {
        return _get(items, 'year', '') === 'total';
      });
      _get(total, '0.items.0.subjectItems', []).forEach((element: any) => {
        if (element.subject === '科目二') {
          setTotalSubject2Data(element);
        }
        if (element.subject === '科目三') {
          setTotalSubject3Data(element);
        }
      });
      const dataSource: any = [];
      _get(data, 'rows', []).forEach((element: any) => {
        _get(element, 'items', []).forEach((item: any) => {
          if (item.title !== 'total') {
            item.year = _get(element, 'year', '');
            item.month = _get(element, 'month', '');
            dataSource.push(item);
          }
        });
      });
      // eslint-disable-next-line array-callback-return
      dataSource.map((element: any) => {
        let subject2Arr: any = [];
        let subject3Arr: any = [];
        _get(element, 'subjectItems', '').forEach((item: any) => {
          if (item.subject === '科目二') {
            subject2Arr = item;
          }
          if (item.subject === '科目三') {
            subject3Arr = item;
          }
        });
        element.pass2 = _get(subject2Arr, 'pass', '');
        element.fail2 = _get(subject2Arr, 'fail', '');
        element.passRate2 = _get(subject2Arr, 'passRate', '');
        element.pass3 = _get(subject3Arr, 'pass', '');
        element.fail3 = _get(subject3Arr, 'fail', '');
        element.passRate3 = _get(subject3Arr, 'passRate', '');
      });
      setDataSource(dataSource);
    },
  });

  function commonFormat(val: any) {
    return val != null && val !== '' ? val + '%' : '';
  }

  const columns = [
    {
      title: '月份',
      dataIndex: 'month',
      render: (month: any, record: any, index: any) => {
        const obj: any = {
          children: _get(record, 'year', '') ? _get(record, 'year', '') + '.' + month : month,
          props: {},
        };
        obj.props.rowSpan = mergeCells(month, dataSource, 'month', index);
        return obj;
      },
    },
    {
      title: type === 'carType' ? '车型' : '年龄',
      dataIndex: 'title',
      render: (title: any) => {
        let val = title;
        if (type === 'age') {
          val = _get(hashTable, title, '');
        }
        return val;
      },
    },
    {
      title: '科目二',
      children: [
        { title: '合格', dataIndex: 'pass2' },
        { title: '不合格', dataIndex: 'fail2' },
        { title: '合格率', dataIndex: 'passRate2', render: commonFormat },
      ],
    },
    {
      title: '科目三',
      children: [
        { title: '合格', dataIndex: 'pass3' },
        { title: '不合格', dataIndex: 'fail3' },
        { title: '合格率', dataIndex: 'passRate3', render: commonFormat },
      ],
    },
  ];
  return (
    <>
      <div style={{ marginBottom: 10, flex: 1 }}>
        日期区间：{_get(data, 'startDate', '') + ' - ' + _get(data, 'endDate', '')}
      </div>
      <div style={{ display: 'flex', marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 5 }}>科二合计:</div>
          <div style={{ border: 'solid 1px #f0f0f0' }}>
            <div style={commonStyle}>合格：{_get(totalSubject2Data, 'pass', '')}</div>
            <div style={commonStyle}>不合格：{_get(totalSubject2Data, 'fail', '')}</div>
            <div style={{ padding: 5 }}>合格率：{commonFormat(_get(totalSubject2Data, 'passRate', ''))}</div>
          </div>
        </div>
        <div style={{ flex: 1, marginLeft: 20 }}>
          <div style={{ marginBottom: 5 }}>科三合计:</div>
          <div style={{ border: 'solid 1px #f0f0f0' }}>
            <div style={commonStyle}>合格：{_get(totalSubject3Data, 'pass', '')}</div>
            <div style={commonStyle}>不合格：{_get(totalSubject3Data, 'fail', '')}</div>
            <div style={{ padding: 5 }}>合格率：{commonFormat(_get(totalSubject3Data, 'passRate', ''))}</div>
          </div>
        </div>
      </div>
      <CustomTable
        loading={isLoading}
        columns={columns}
        bordered
        scroll={{ x: 1100, y: document.body.clientHeight - 600 }}
        dataSource={generateIdForDataSource(dataSource)}
        rowKey="id"
        pagination={tablePagination}
      />
    </>
  );
}
