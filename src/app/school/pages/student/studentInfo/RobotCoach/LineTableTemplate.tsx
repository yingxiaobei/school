import { Col } from 'antd';
import styles from './index.module.css';
import { ShowData, SingleDetail } from './index';
import { Datum, Line } from '@ant-design/charts';
import SingleDropDown from './SingleDropDown';

interface Props {
  data: Partial<ShowData>;
  colSpan: number;
  title: '单项训练' | '模拟考试';
  singleList: SingleDetail[];
  robotOptions?: any[];
  selectProject?: (itemType: string) => void;
  singleType?: string;
}

function getShowData(type: '模拟考试', info: Partial<ShowData>): any[];
function getShowData(type: '单项训练', info: Partial<ShowData>, singleList: any[], singleType?: string): any[];
function getShowData(
  type: '单项训练' | '模拟考试',
  info: Partial<ShowData>,
  singleList: any[] = [],
  singleType: string = '',
) {
  // 对于title的判断
  if (type === '模拟考试') {
    if (info?.examAll && info?.examAll > 1 && Array.isArray(info?.throughRateVo)) {
      return info?.throughRateVo;
    }
    return [];
  } else {
    if (Array.isArray(info?.singleTermVo)) {
      console.log(info?.singleTermVo);

      const result = info?.singleTermVo.find((single) => single.itemType === singleType);
      if (result && result.singleAllNum > 1) {
        return singleList;
      }
    }
    return [];
  }
}

function LineTableTemplate({ data, colSpan = 12, title, singleList, selectProject, robotOptions, singleType }: Props) {
  const config = {
    data:
      (title === '单项训练' ? getShowData('单项训练', data, singleList, singleType) : getShowData('模拟考试', data)) ||
      [],
    autoFit: true,
    padding: 'auto',
    seriesField: title === '单项训练' ? 'itemType' : '',
    xField: title === '单项训练' ? 'trainTime' : 'examTime',
    yField: title === '单项训练' ? 'singlelRate' : 'examRate',
    point: {
      size: 3,
      shape: 'circle',
    },
    label: {
      style: {
        fill: '#aaa',
      },
      autoHide: true,
      labelLine: true,
    },
    xAxis: {
      title: {
        text: '近30日训练',
        position: 'end',
      },
    },
    yAxis: {
      title: {
        text: '通过率(%)',
        position: 'end',
        rotate: 270.2,
        spacing: 30,
      },
      position: 'left',
      min: 0,
      max: 100,
      tickInterval: 20,
    },
    tooltip: {
      position: 'top',
      showTitle: true,
      formatter: (datum: Datum) => {
        return { name: '通过率', value: title === '单项训练' ? datum.singlelRate + '%' : datum.examRate + '%' };
      },
      showCrosshairs: true,
      crosshairs: {
        type: 'xy',
        line: {
          style: {
            stroke: '#627EF6',
            lineWidth: 2,
          },
          point: {
            shape: 'diamond',
          },
        },
      },
    },
    legend: false,
    lineStyle: {
      // fill: 'red',
      // r: '100px',
      stroke: '#2ED195',
      lineWidth: '4',
    },
  };

  return (
    <Col span={colSpan} className={styles.summaryWrapper}>
      <div style={{ background: title === '单项训练' ? '#2ED195' : '#627EF6', color: '#FFF', marginBottom: '28px' }}>
        <h4 style={{ textAlign: 'center', color: 'inherit', marginTop: '20px', fontWeight: 600, fontSize: '16px' }}>
          {title}
        </h4>
        <div className={styles.summary}>
          {title === '单项训练' ? (
            <>
              <div className={styles.summaryItem}>
                <div>
                  <span className={styles['font-weight-600']}>{data?.trainAllNum || 0}</span>次
                </div>
                <div>{'项目练习'}</div>
              </div>
              <div className={styles.summaryItem}>
                <div>
                  <span className={styles['font-weight-600']}>{data?.throughNum || 0}</span>次
                </div>
                <div>{'合格次数'}</div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.summaryItem}>
                <div>
                  <span className={styles['font-weight-600']}>{data?.examAll || 0}</span>次
                </div>
                <div>{'模拟考试'}</div>
              </div>
              <div className={styles.summaryItem}>
                <div>
                  <span className={styles['font-weight-600']}>{data?.examThrough || 0}</span> 次
                </div>
                <div>{'合格次数'}</div>
              </div>
            </>
          )}
          {/* 合格率 */}
          <div className={styles.summaryItem}>
            <div>
              <span className={styles['font-weight-600']}>{data?.throughRate || 0}</span>%
            </div>
            <div>{'合格率'}</div>
          </div>
        </div>
      </div>
      {title === '单项训练' && data && data.singleTermVo?.length && robotOptions?.length && (
        <SingleDropDown data={data} selectProject={selectProject} robotOptions={robotOptions} />
      )}

      <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '27px' }} className={styles.lineWrapper}>
        {/* @ts-ignore */}
        <Line {...config} />
      </div>
    </Col>
  );
}

export default LineTableTemplate;
