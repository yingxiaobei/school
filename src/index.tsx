import ReactDOM from 'react-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import 'normalize.css';
import 'moment/locale/zh-cn';
import './index.scss';
import * as serviceWorker from './serviceWorker';

// production mode remove console.log/console.warn/console.error
function noop() {}
if (process.env.NODE_ENV !== 'development') {
  console.log = noop;
  console.warn = noop;
  // console.error = noop;
}

// Import the entry point and render it's default export
import(`${process.env.REACT_APP_BUILD_ENTRY}`).then(({ default: BuildTarget }) =>
  ReactDOM.render(
    <ConfigProvider locale={zhCN}>
      <BuildTarget />
    </ConfigProvider>,
    document.getElementById('root'),
  ),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
