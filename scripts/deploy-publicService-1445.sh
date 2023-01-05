# 如果依赖项有变化就将下面命令解注
  #rm -rf node_modules

echo "安装依赖"
cnpm install

echo "构建项目"
npm run build:wenzhou-test

echo "删除原来的资源"
ssh root@192.168.192.136 "rm -rf /opt/front/portal/publicPlatform-dev"

echo "将新包拷贝到指定位置"
scp -r build root@192.168.192.136:/opt/front/portal/publicPlatform-dev
