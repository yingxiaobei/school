import React, { ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface IProps {
  children: ReactNode;
  component: any;
}

interface IState {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<IProps, IState> {
  public state: any;
  public props: any;

  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): IState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.info('Uncaught error:', error, errorInfo);

    // FIXME: 出错的时候自动刷新页面
    if (String(error).includes('Loading chunk') && process.env.NODE_ENV !== 'development') {
      console.info('errorboundary');
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Result
          status="500"
          title="出错了"
          subTitle="对不起, 系统出现问题了,请重新刷新一下."
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              刷新试试
            </Button>
          }
        />
      );
    }

    return this.props.component;
  }
}
