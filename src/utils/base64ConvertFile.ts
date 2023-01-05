//base64转file
export function base64ConvertFile(urlData: any, filename: string = 'filename') {
  const arr = urlData.split(',');
  const type = arr[0].match(/:(.*?);/)[1];
  const fileExt = type.split('/')[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename + '.' + fileExt, {
    type,
  });
}
