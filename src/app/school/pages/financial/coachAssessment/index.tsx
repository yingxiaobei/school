import { Table, Drawer, message, Pagination } from 'antd';
import { useState, useCallback, useMemo, useRef } from 'react';
import { _pageList, _export } from './_api'; // 请求服务相关的
import { downloadFile, _get, _handleIdCard } from 'utils';
import { _getCoachList } from 'api';
import { useTablePro } from 'hooks';
import { AuthButton, ButtonContainer, CustomTable, Search } from 'components';
// import { useReactToPrint } from 'react-to-print';
import AppointmentRecord from './AppointmentRecord';
import Text from 'antd/lib/typography/Text';
import styles from './index.module.css';
import moment from 'moment';
import { formatTime } from 'utils';
import { useEffect } from 'react';

type CoachPageList = {
  cid: number; // 教练ID
  coachname: string; // 教练姓名
  idcard: string; // 身份证
  traintype: string; // 培训车型
  amount: number; // 车型
  num: number; // 次数
  parringPrice: string; // 金额

  // total:number;
  // key:string;
  [key: string]: any;
};

export default function CoachAssessment() {
  const [pageSize, setPageSize] = useState(10);
  const componentRef = useRef<any>({});

  const commonHandler = (data: CoachPageList[]) => {
    const place: any = {}; // 记录返回数据对应的位置
    const count: Record<string, number> = {}; //教练名字一样的合并
    const carCount: Record<string, number> = {}; //车型一样的合并
    const moneyByIdCard: Record<string, number> = {};
    data.forEach((item, index) => {
      let cou = _get(count, item.idcard);
      let carCou = _get(carCount, item.traintype + item.idcard);
      if (!cou) {
        count[item.idcard] = 1;
        moneyByIdCard[item.idcard] = item.amount;
        place[_get(item, 'idcard', 'noIdCard')] = {};
        place[_get(item, 'idcard', 'noIdCard')][item.traintype] = [index];
      } else {
        count[item.idcard]++;
        moneyByIdCard[item.idcard] += item.amount;
        Object.keys(place[_get(item, 'idcard', 'noIdCard')]).includes(item.traintype)
          ? place[item.idcard][item.traintype].push(index)
          : (place[item.idcard][item.traintype] = [index]);
      }
      if (!carCou) {
        carCount[item.traintype + item.idcard] = 1;
      } else {
        carCount[item.traintype + item.idcard]++;
      }
    });

    return {
      place,
      count,
      carCount,
      moneyByIdCard,
    };
  };

  const dataSourceFormatter = (data: CoachPageList[]) => {
    // 数据统计
    const { place, count, carCount, moneyByIdCard } = commonHandler(data);

    return Object.values(place)
      .map((item: any) => Object.values(item))
      .flat(2)
      .map((index: any) => {
        const item = data[index];
        let res = {
          coachNameRowSpan: count[item.idcard],
          idcardRowSpan: count[item.idcard],
          carRowSpan: carCount[item.traintype + item.idcard],
          totalRowSpan: carCount[item.traintype + item.idcard],
          total: moneyByIdCard[item.idcard],
          key: item.cid + item.traintype + item.parringPrice, // 拼接唯一key
          ...item,
        };
        count[item.idcard] = 0;
        carCount[item.traintype + item.idcard] = 0;
        moneyByIdCard[item.idcard] = 0;
        return res;
      });
  };

  const {
    search,
    _handleSearch,
    tableProps,
    currentId,
    setCurrentId,
    setCurrentRecord,
    isAddOrEditVisible,
    _refreshTable,
    _switchIsAddOrEditVisible,
  } = useTablePro({
    request: _pageList,
    initialSearch: {
      beginDate: formatTime(moment().subtract(30, 'day'), 'DATE'),
      endDate: formatTime(moment(), 'DATE'),
    },
    dataSourceFormatter: dataSourceFormatter,
    cb(data) {
      // hack 展示服务端返回的当前数据
      setPageSize(data.rows.length);
    },
  });
  const columns = useMemo(() => {
    return [
      {
        title: '教练员姓名',
        dataIndex: 'coachname',
        render: (text: string, record: CoachPageList) => {
          // console.log(record, 'record');
          // 现在最后的困惑就是 如何去判断那些是要去啊集合在一起的
          return {
            children: (
              <div
                style={{ color: '#1890FF', cursor: 'pointer' }}
                onClick={() => {
                  setCurrentRecord(record);
                  setCurrentId(record.cid);
                  _switchIsAddOrEditVisible();
                }}
              >
                {record.coachname}
              </div>
            ),
            props: {
              rowSpan: record.idcardRowSpan,
              // colSpan: 3
            },
          };
        },
      },
      {
        title: '证件号码',
        dataIndex: 'idcard',
        width: 160,
        render: (text: string, record: any) => {
          return {
            children: <div>{_handleIdCard({ value: record?.idcard, record })}</div>,
            props: {
              rowSpan: record.coachNameRowSpan,
            },
          };
        },
      },
      {
        title: '车型',
        dataIndex: 'traintype',
        render: (text: string, record: any) => {
          // 现在最后的困惑就是 如何去判断那些是要去啊集合在一起的
          return {
            children: <div>{record.traintype}</div>,
            props: {
              rowSpan: record.carRowSpan,
              // colSpan: 3
            },
          };
        },
      },
      {
        title: '预约单价',
        dataIndex: 'parringPrice',
      },
      {
        title: '次数',
        dataIndex: 'num',
      },
      {
        title: '金额（元）',
        dataIndex: 'amount',
      },
      {
        title: '总计金额（元）',
        dataIndex: 'totalAmount',
        render: (text: string, record: any) => {
          return {
            children: <div>{record.total}</div>,
            props: {
              rowSpan: record.idcardRowSpan,
            },
          };
        },
      },
    ];
  }, [_switchIsAddOrEditVisible, setCurrentRecord, setCurrentId]);

  const calculate = useCallback((data: CoachPageList[]) => {
    return data.reduce((acc, cur) => {
      return (acc += cur.total);
    }, 0);
  }, []);

  const refreshTable = useCallback(() => {
    if (isNaN(moment(_get(search, 'beginDate')).date()) || isNaN(moment(_get(search, 'endDate')).date())) {
      message.error('日期不能为空');
    } else if (moment(_get(search, 'endDate')).diff(moment(_get(search, 'beginDate')), 'months', true) > 1) {
      message.error('间隔不能超过30天');
    } else {
      _refreshTable();
    }
  }, [_refreshTable, search]);

  const outPut = () => {
    // 每页10条是后端要求
    const current = _get(tableProps, ['pagination', 'current'], 1);
    _export({ limit: 10, page: current, ...search } as any).then((data) => {
      downloadFile(data, '教练考核', 'application/vnd.ms-excel', 'xlsx');
    });
  };

  useEffect(() => {
    // 受组件控制
    const antPagination = document.querySelector('#coachAssessment .ant-table-wrapper .ant-pagination');
    if (antPagination) {
      antPagination.classList.add(`${styles['hidden']}`);
    }
  }, [tableProps]);

  return (
    <>
      {isAddOrEditVisible && (
        <Drawer title={'教练考核详情'} visible={isAddOrEditVisible} onClose={_switchIsAddOrEditVisible} width={1200}>
          <AppointmentRecord cid={currentId} beginDate={_get(search, 'beginDate')} endDate={_get(search, 'endDate')} />
        </Drawer>
      )}

      <Search
        filters={[
          {
            type: 'RangePicker',
            // type: 'RangePickerDisable',
            field: ['beginDate', 'endDate'],
            placeholder: ['签到日期起', '签到日期止'],
            // rangeDay: 30,
            // rangeAllowClear: false,
            otherProps: {
              allowClear: false,
              defaultValue: [moment().subtract(30, 'day'), moment()],
            },
          },
          {
            type: 'SimpleSelectOfCoach',
            field: 'cid',
          },
        ]}
        search={search}
        _handleSearch={_handleSearch}
        refreshTable={refreshTable}
        simpleCoachRequest={_getCoachList}
        showSearchButton={false}
      />

      <ButtonContainer showSearchButton={true} refreshTable={_refreshTable} loading={tableProps.loading}>
        {/* <Button onClick={handlePrint} type='primary' className='mb20 mr20'>
          打印
        </Button> */}

        <AuthButton authId="financial/coachAssessment:btn1" type="primary" className="mb20" onClick={outPut}>
          导出
        </AuthButton>
      </ButtonContainer>
      <div id="coachAssessment" ref={componentRef}>
        <CustomTable
          showSerial={false}
          {...tableProps}
          columns={columns}
          rowKey={(record: any) => `${record.idcard} ${record.traintype} ${record.parringPrice}`}
          className={styles.wrapper}
          pagination={{
            ...(tableProps as any).pagination,
            pageSize: pageSize <= 10 ? 10 : pageSize,
            showSizeChanger: false,
          }}
          summary={(data: readonly CoachPageList[]) => {
            if (Array.isArray(data) && data.length) {
              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={1} className={styles.summaryTitle}>
                    合计
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} colSpan={6}>
                    <Text className={styles.summaryTitle}>{calculate(data)}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              );
            } else {
              return null;
            }
          }}
        />

        <Pagination
          style={{ marginTop: '0.8rem', display: 'flex' }}
          total={tableProps.pagination.total}
          showSizeChanger={false}
          current={tableProps.pagination.current}
          onChange={(page) => {
            tableProps.pagination.onChange(page);
          }}
          hideOnSinglePage
          showTotal={(total) => `共 ${total} 条记录`}
          itemRender={(current, type, originalElement) => {
            if (type === 'prev') {
              // eslint-disable-next-line jsx-a11y/anchor-is-valid
              return <a>上一页</a>;
            }
            if (type === 'next') {
              // eslint-disable-next-line jsx-a11y/anchor-is-valid
              return <a>下一页</a>;
            }
            return originalElement;
          }}
        />
      </div>
    </>
  );
}
