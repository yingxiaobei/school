import Icon from '@ant-design/icons';
import { ComponentType, SVGProps } from 'react';
interface Props {
  svgcomponent: ComponentType<SVGProps<SVGSVGElement>>;
  style?: React.CSSProperties;
  className?: string;
}

const CustomIcon = (props: Props) => <Icon component={props.svgcomponent} {...props} />;

export default CustomIcon;
