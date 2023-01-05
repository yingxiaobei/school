import { _get } from 'utils';

export default function CoachInfo(props: any) {
  const { coachInfo } = props;

  return (
    <div style={{ display: 'flex', margin: '20px 0' }}>
      <div className="mr20">
        <span>教练:</span>
        <span>{_get(coachInfo, 'coachname')}</span>
      </div>
      <div className="mr20">
        <span>准教车型:</span>
        <span>{_get(coachInfo, 'teachpermitted')}</span>
      </div>
      <div className="mr20">
        <span>身份证号:</span>
        <span>{_get(coachInfo, 'idcard')}</span>
      </div>
    </div>
  );
}
