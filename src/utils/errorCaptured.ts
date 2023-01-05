export async function errorCaptured(asyncFunc: any) {
  try {
    const res = await asyncFunc();
    return [res, null];
  } catch (err) {
    return [null, err];
  }
}
