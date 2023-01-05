import CommonStatistic from './CommonStatistic';

interface IProps {
  period: string;
}

export default function CarTypeStatistic(props: IProps) {
  const { period } = props;
  return <CommonStatistic type="carType" period={period} />;
}
