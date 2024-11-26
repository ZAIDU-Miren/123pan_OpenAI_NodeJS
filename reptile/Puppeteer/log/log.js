// loggerExample.js

const log4js = require('./log4js.config.js');

const logger = log4js.getLogger();

// 打印日志
logger.trace('This is a trace log');
logger.debug('This is a debug log');
logger.info('This is an info log');
logger.warn('This is a warning log');
logger.error('This is an error log');
logger.fatal('This is a fatal log');

// 打印带有日期和内容的日志
logger.info('Date:', new Date().toLocaleString());
logger.info('Custom Log Message');

// 异步记录日志
async function asyncLog() {
  logger.info('Async Log Message');
}

asyncLog();
