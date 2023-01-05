// https://gist.github.com/jbutko/d7b992086634a94e84b6a3e526336da3

export const downloadFile = (binaryData: any, filename = 'download', type = 'application/pdf', fileSuffix = 'pdf') => {
  const blob = new Blob([binaryData], { type });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `${filename}.${fileSuffix}`;
  link.click();
};
