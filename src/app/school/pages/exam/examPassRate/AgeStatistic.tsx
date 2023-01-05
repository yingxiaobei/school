import CommonStatistic from './CommonStatistic';

interface IProps {
  period: string;
}

export default function AgeStatistic(props: IProps) {
  const { period } = props;
  return <CommonStatistic type="age" period={period} />;
}
