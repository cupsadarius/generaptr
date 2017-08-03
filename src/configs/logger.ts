import * as logger from 'bunyan';
import * as path from 'path';

const bunyan: logger = logger.createLogger({
  name: 'generatr',
  serializers: logger.stdSerializers,
  streams: [
    {
      type: 'file',
      path: path.join(__dirname, '../../debug-log.json'),
    },
  ],
});

// Make sure that uncaught exceptions are logged before exiting
process.on('uncaughtException', (err: Error) => {
  console.log(err);
  /* istanbul ignore next */
  bunyan.fatal(err, 'Uncaught exception');
});

process.on('exit', (code: number) => {
  console.log(code);
  /* istanbul ignore next */
  bunyan.error({exitCode: code}, `Exiting with status code: ${code}`);
});

process.on('warning', (warning: Error) => {
  console.log(warning);
  /* istanbul ignore next */
  bunyan.warn(warning, 'Warning triggered');
});

process.on('unhandledRejection', (error: Error) => {
  console.log(error);
  /* istanbul ignore next */
  bunyan.fatal(error, `Unhandled rejection: ${error.message}`);
});

export default bunyan;
