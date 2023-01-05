// 此文件用于扩展webpack配置

const {
  override,
  fixBabelImports,
  addLessLoader,
  setWebpackPublicPath,
  addBabelPlugins,
  setWebpackOptimizationSplitChunks,
  addWebpackPlugin,
  getBabelLoader,
} = require('customize-cra');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// 打包时间
process.env.REACT_APP_BUILD_AT = new Date();

const themeConfig = {
  SCHOOL: {
    '@font-size-base': '14px',
    '@primary-color': '#F3302B',
    '@layout-header-background': '#28303f',
    '@height-base': '36px',
    '@border-radius-base': '4px',
    '@table-row-hover-bg': '#ffe9e6',
    '@layout-header-height': '60px',
    '@text-color': '#333333',
    '@table-header-bg': '#f8f8f8',
    '@table-padding-horizontal': '4px',
    '@table-padding-vertical': '4px',
  },
  YANTAI_PORTAL: {
    '@font-size-base': '14px',
    '@primary-color': '#33A0FF',
    '@layout-header-background': '#28303f',
    '@height-base': '36px',
    '@border-radius-base': '4px',
    '@table-row-hover-bg': '#ffe9e6',
    '@layout-header-height': '60px',
    '@text-color': '#333333',
    '@table-header-bg': '#f8f8f8',
    '@table-padding-horizontal': '4px',
    '@table-padding-vertical': '4px',
  },
  WENZHOU_PORTAL: {
    '@font-size-base': '14px',
    '@primary-color': '#33A0FF',
    '@layout-header-background': '#28303f',
    '@height-base': '36px',
    '@border-radius-base': '4px',
    '@table-row-hover-bg': '#ffe9e6',
    '@layout-header-height': '60px',
    '@text-color': '#333333',
    '@table-header-bg': '#f8f8f8',
    '@table-padding-horizontal': '4px',
    '@table-padding-vertical': '4px',
  },
};

// commitHash
const commitHash = require('child_process').execSync('git rev-parse --short HEAD');
const TagInfo = require('child_process').execSync('git describe --abbrev=0');
process.env.REACT_APP_COMMIT_HASH = commitHash;
process.env.REACT_APP_TAG_INFO = TagInfo;

// 查看打包产物
const addAnalyzer = () => (config) => {
  if (process.env.NODE_ENV === 'production') {
    config.plugins.push(new BundleAnalyzerPlugin());
  }

  return config;
};

// 开启 babel-loader 多线程
const addThread = () => (config) => {
  // console.log(JSON.stringify(config.module.rules[1].oneOf, null, 2));
  const babelLoader = getBabelLoader(config);
  const { options } = babelLoader;
  options.cacheDirectory = true;
  babelLoader.use = [
    // 'thread-loader',
    {
      loader: 'thread-loader',
      options: { workers: require('os').cpus().length, workerParallelJobs: 50, poolTimeout: 2000 },
    },
    {
      loader: babelLoader.loader,
      options,
    },
  ];
  delete babelLoader.loader;
  delete babelLoader.options;
  return config;
};

module.exports = override(
  // process.env.NODE_ENV === 'production' && addWebpackPlugin(
  //    new UglifyJsPlugin({
  //      // 开启打包缓存
  //      cache: true,
  //      // 开启多线程打包
  //      parallel: true,
  //      uglifyOptions: {
  //        // 删除警告
  //        warnings: false,
  //        // 压缩
  //        compress: {
  //          // 移除console
  //          drop_console: true,
  //          // 移除debugger
  //          drop_debugger: true
  //        }
  //      }
  //    })
  //  ),
  addWebpackPlugin(new ProgressBarPlugin()),
  setWebpackOptimizationSplitChunks({
    chunks: 'all',
    minSize: 30000,
    minChunks: 1,
    maxAsyncRequests: 5,
    maxInitialRequests: 3,
    automaticNameDelimiter: '~',
    name: true,
    cacheGroups: {
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        priority: -10,
      },
      default: {
        minChunks: 2,
        priority: -20,
        reuseExistingChunk: true,
      },
      // common: {
      //   name: "common",
      //   chunks: "async",
      //   minChunks: 7,
      //   priority: 10,
      // },
      print: {
        name: 'studentInfo',
        chunks: 'all',
        test: /studentInfo/,
      },
    },
  }),
  // 按需加载`antd`样式	https://ant.design/docs/react/use-with-create-react-app-cn
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  }),
  // fixBabelImports('lodash', { libraryDirectory: '', camel2DashComponentName: false }),
  setWebpackPublicPath(process.env.REACT_APP_PUBLIC_URL),

  addBabelPlugins([
    '@simbathesailor/babel-plugin-use-what-changed',
    {
      active: process.env.NODE_ENV === 'development',
    },
  ]),

  // 自定义主题	https://ant.design/docs/react/use-with-create-react-app-cn
  addLessLoader({
    lessOptions: {
      javascriptEnabled: true,
      modifyVars: themeConfig[process.env.REACT_APP_PROJECT],
    },
  }),
  // addAnalyzer(),
  // addThread()
);
