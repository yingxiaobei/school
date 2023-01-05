import { _get } from 'utils';

interface IProps {
  dataSource: object[];
  specialStyle: React.CSSProperties;
  label: string;
}

// FIXME: -yyq 该文件的css样式尽可能替换成className，并且统一为通用样式

export default function StatisticsTable(props: IProps) {
  const { dataSource, specialStyle, label } = props;
  const commonBorder = 'solid 1px #f0f0f0';
  const commonStyle = {
    borderBottom: commonBorder,
    borderLeft: commonBorder,
    flex: 1,
    padding: '5px 0px',
  };
  const bottomDiv = {
    borderLeft: commonBorder,
    flex: 1,
    padding: '5px 0px',
  };
  const flex = {
    display: 'flex',
  };

  const hashSubjectTitleMap = { total: '实操考试', '02': '科二考试', '03': '科三考试' };
  const hashTotalTitleMap = { total: '考出总人数', '02': '考出最后科目（科二）', '03': '考出最后科目（科三）' };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: commonBorder,
        flex: 1,
        padding: '5px 0px',
        ...specialStyle,
      }}
    >
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ borderBottom: commonBorder, flex: 3, padding: '5px 0px' }}>
          {_get(hashTotalTitleMap, _get(dataSource, 'subject', ''), '')}
        </div>
        <div style={{ ...commonStyle, flex: 3 }}>{_get(dataSource, 'total', '')}</div>
      </div>
      <div style={{ display: 'flex', flex: 7, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>{_get(hashSubjectTitleMap, _get(dataSource, 'subject', ''), '')}</div>
        <div style={{ flex: 3, display: 'flex', flexDirection: 'column' }}>
          <div style={flex}>
            <div style={commonStyle}>{label}</div>
            <div style={commonStyle}>{_get(dataSource, 'pass1', '')}</div>
            <div style={commonStyle}>{_get(dataSource, 'rate1', '') ? _get(dataSource, 'rate1', '') + '%' : ''}</div>
          </div>
          <div style={flex}>
            <div style={commonStyle}>补考一次</div>
            <div style={commonStyle}>{_get(dataSource, 'pass2', '')}</div>
            <div style={commonStyle}>{_get(dataSource, 'rate2', '') ? _get(dataSource, 'rate2', '') + '%' : ''}</div>
          </div>
          <div style={flex}>
            <div style={commonStyle}>补考二次</div>
            <div style={commonStyle}>{_get(dataSource, 'pass3', '')}</div>
            <div style={commonStyle}>{_get(dataSource, 'rate3', '') ? _get(dataSource, 'rate3', '') + '%' : ''}</div>
          </div>
          <div style={flex}>
            <div style={commonStyle}>补考三次</div>
            <div style={commonStyle}>{_get(dataSource, 'pass4', '')}</div>
            <div style={commonStyle}>{_get(dataSource, 'rate4', '') ? _get(dataSource, 'rate4', '') + '%' : ''}</div>
          </div>
          <div style={flex}>
            <div style={commonStyle}>补考四次</div>
            <div style={commonStyle}>{_get(dataSource, 'pass5', '')}</div>
            <div style={commonStyle}>{_get(dataSource, 'rate5', '') ? _get(dataSource, 'rate5', '') + '%' : ''}</div>
          </div>
          <div style={flex}>
            <div style={commonStyle}>四次以上</div>
            <div style={commonStyle}>{_get(dataSource, 'pass6', '')}</div>
            <div style={commonStyle}>{_get(dataSource, 'rate6', '') ? _get(dataSource, 'rate6', '') + '%' : ''}</div>
          </div>
          <div style={flex}>
            <div style={bottomDiv}>补考合计</div>
            <div style={bottomDiv}>{_get(dataSource, 'makeupTotal', '')}</div>
            <div style={bottomDiv}>
              {_get(dataSource, 'makeupTotalRate', '') ? _get(dataSource, 'makeupTotalRate', '') + '%' : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
