interface SleepFunc {
  (ms?: number): Promise<undefined>;
}

export const sleep: SleepFunc = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms));
