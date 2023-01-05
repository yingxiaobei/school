export function handleDicCode(dicRes: []) {
  const hash = dicRes
    .map((x: any) => {
      return { label: x.text, value: x.value };
    })
    .reduce((acc: any, x: IOption) => Object.assign(acc, { [x.value]: x.label }), {});
  return hash;
}
