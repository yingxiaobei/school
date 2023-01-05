export function previewPdf(binaryData: any, isBinaryData: boolean = true) {
  const pdfUrl = isBinaryData
    ? window.URL.createObjectURL(new Blob(binaryData, { type: 'application/pdf' }))
    : binaryData;

  const iWidth = 1277;
  const iHeight = 754;
  const iTop = (window.screen.height - 30 - iHeight) / 2;
  const iLeft = (window.screen.width - 10 - iWidth) / 2;
  window.open(
    pdfUrl,
    'name',
    'height=' +
      iHeight +
      ',innerHeight=' +
      iHeight +
      ',width=' +
      iWidth +
      ',innerWidth=' +
      iWidth +
      ',top=' +
      iTop +
      ',left=' +
      iLeft +
      ',toolbar=no,menubar=no,scrollbars=auto,resizeable=no,location=no,status=no',
  );
}
