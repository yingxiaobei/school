import { _get } from 'utils';
type HashList = { [code: string]: { total: number; msg: string } };
interface IProps {
  total: number;
  successTotal: number;
  errorTotal: number;
  errHashList: HashList;
  successList?: HashList;
}

export default function Result(props: IProps) {
  const { total, successTotal, errorTotal, errHashList, successList = '' } = props;
  function resultItem(errHashList: HashList) {
    return Object.keys(errHashList).map(function (key) {
      return (
        <div>
          {_get(errHashList[key], 'msg')}: {_get(errHashList[key], 'total', 0)}条
        </div>
      );
    });
  }
  return (
    <>
      <div className="bold">
        本次共处理{total}条, 处理成功{successTotal}条，处理失败{errorTotal}条
      </div>
      {successList ? resultItem(successList) : ''}

      {resultItem(errHashList)}
    </>
  );
}
