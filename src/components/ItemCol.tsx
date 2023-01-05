import { Col, Form } from 'antd';

type TItemCol = {
  children: React.ReactNode;
  span?: number;
  rules?: object[];
  [key: string]: any;
};

export default function ItemCol(props: TItemCol) {
  const { span = 12, rules = [], ...itemProps } = props;
  rules.forEach((x: any) => {
    if (x.required && !x.message) {
      x.message = `${props.label}不能为空`;
    }
  });

  return (
    <Col span={span}>
      <Form.Item rules={rules} {...itemProps}>
        {props.children}
      </Form.Item>
    </Col>
  );
}
