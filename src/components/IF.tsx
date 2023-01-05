type IProps = {
  condition: boolean;
  then: React.ReactNode;
  else?: React.ReactNode;
};

const IF = (props: IProps) => {
  const condition = props.condition || false;
  const positive = props.then || null;
  const negative = props.else || null;

  return (condition ? positive : negative) as JSX.Element;
};

export default IF;
