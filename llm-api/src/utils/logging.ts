export enum Severity {
  debug = "debug",
  error = "error",
  info = "info",
}

export const log = (severity: Severity, place: string, message: string) => {
  switch (severity) {
    case Severity.debug:
      if (!process.env.DEBUG) {
        return;
      }
      console.log(`${severity}: [${place}] ${message}`);
      break;
    case Severity.error:
      console.log(`${severity}: [${place}] ${message}`);
      break;
    case Severity.info:
      console.log(`${severity}: [${place}] ${message}`);
      break;
  }
};
