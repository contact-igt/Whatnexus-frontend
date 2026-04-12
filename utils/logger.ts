const isDev = process.env.NODE_ENV === "development";

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.error(...args);
    }
  },
};

