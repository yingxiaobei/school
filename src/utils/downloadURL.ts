interface IParams {
  url: string;
  filename: string;
}

export function downloadURL({ url, filename }: IParams) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
}
