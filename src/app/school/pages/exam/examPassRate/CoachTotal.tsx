import { _get } from 'utils';

const commonBorder = 'solid 1px #f0f0f0';
const commonStyle = { borderBottom: commonBorder };
const flexStyle = { flex: 1, padding: 5 };
const middleStyle = { borderLeft: commonBorder, borderRight: commonBorder, ...flexStyle };

interface IProps {
  data: object;
  totalPass?: number;
  totalSubject2Data: object;
  totalSubject3Data: object;
}

// FIXME: -yyq 该文件的css样式尽可能替换成className，并且统一为通用样式

export default function CoachTotal(props: IProps) {
  const { data, totalPass, totalSubject2Data, totalSubject3Data } = props;

  function commonFormat(val: string | null) {
    return val != null && val !== '' ? val + '%' : '';
  }

  return (
    <>
      <div style={{ marginBottom: 10, flex: 1 }}>
        日期区间：{_get(data, 'startDate', '') + ' - ' + _get(data, 'endDate', '')}
      </div>
      <div style={{ display: 'flex', marginBottom: 10 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginRight: 10 }}>
          <div style={{ flex: 1 }}>考出合计:</div>
          <div
            style={{
              border: commonBorder,
              flex: 3,
              padding: 5,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            考出人数：{totalPass}
          </div>
        </div>
        <div style={{ flex: 3, marginRight: 10 }}>
          <div style={{ marginBottom: 15 }}>科二合计:</div>
          <div style={{ border: commonBorder }}>
            <div style={{ ...commonStyle, display: 'flex' }}>
              <div style={flexStyle}>参考合计：{_get(totalSubject2Data, 'examCount', '')}</div>
              <div style={middleStyle}></div>
              <div style={flexStyle}></div>
            </div>
            <div style={{ ...commonStyle, display: 'flex' }}>
              <div style={flexStyle}>初考合格：{_get(totalSubject2Data, 'onePassCount', '')}</div>
              <div style={middleStyle}>补考合格：{_get(totalSubject2Data, 'mulPassCount', '')}</div>
              <div style={flexStyle}>不合格：{_get(totalSubject2Data, 'failCount', '')}</div>
            </div>
            <div style={{ ...commonStyle, display: 'flex' }}>
              <div style={flexStyle}>合格率：{commonFormat(_get(totalSubject2Data, 'passRate', ''))}</div>
              <div style={middleStyle}>
                初考合格率：
                {commonFormat(_get(totalSubject2Data, 'onePassRate', ''))}
              </div>
              <div style={flexStyle}></div>
            </div>
          </div>
        </div>
        <div style={{ flex: 3 }}>
          <div style={{ marginBottom: 15 }}>科三合计:</div>
          <div style={{ border: commonBorder }}>
            <div style={{ ...commonStyle, display: 'flex' }}>
              <div style={flexStyle}>参考合计：{_get(totalSubject3Data, 'examCount', '')}</div>
              <div style={middleStyle}></div>
              <div style={flexStyle}></div>
            </div>
            <div style={{ ...commonStyle, display: 'flex' }}>
              <div style={flexStyle}>初考合格：{_get(totalSubject3Data, 'onePassCount', '')}</div>
              <div style={middleStyle}>补考合格：{_get(totalSubject3Data, 'mulPassCount', '')}</div>
              <div style={flexStyle}>不合格：{_get(totalSubject3Data, 'failCount', '')}</div>
            </div>
            <div style={{ ...commonStyle, display: 'flex' }}>
              <div style={flexStyle}>合格率：{commonFormat(_get(totalSubject3Data, 'passRate', ''))}</div>
              <div style={middleStyle}>
                初考合格率：
                {commonFormat(_get(totalSubject3Data, 'onePassRate', ''))}
              </div>
              <div style={flexStyle}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
