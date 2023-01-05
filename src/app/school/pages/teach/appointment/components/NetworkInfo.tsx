import { _get } from 'utils';

export default function NetworkInfo(props: any) {
  const { networkInfo } = props;

  return (
    <div style={{ display: 'flex', margin: '20px 0' }}>
      <div className="mr20">
        <span>营业网点简称:</span>
        <span>{_get(networkInfo, 'branchname', '')}</span>
      </div>
      <div className="mr20">
        <span>教室:</span>
        <span>{_get(networkInfo, 'classroom', '')}</span>
      </div>
    </div>
  );
}
