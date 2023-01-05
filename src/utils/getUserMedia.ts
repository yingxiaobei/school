//调用摄像头
export function getUserMedia(constraints: any, success: any, error: any) {
  const customNavigator: any = navigator; // 解决ts校验问题
  if (customNavigator.mediaDevices.getUserMedia) {
    //最新版API
    customNavigator.mediaDevices.getUserMedia(constraints).then(success).catch(error);
    return true;
  }
  if (customNavigator.getUserMedia) {
    //旧版API
    customNavigator.getUserMedia(constraints, success, error);
    return true;
  }
  if (customNavigator.mozGetUserMedia) {
    //Firefox API
    customNavigator.mozGetUserMedia(constraints, success, error);
    return true;
  }
  if (customNavigator.webkitGetUserMedia) {
    //webkit内核浏览器 API
    customNavigator.webkitGetUserMedia(constraints, success, error);
    return true;
  }

  return false;
}
