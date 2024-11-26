// log4js.config.js

const fs = require('fs');
const path = require('path');
const log4js = require('log4js');
const dateFormat = require('date-format');

// 创建 log 目录
const logDirectory = path.join(__dirname, 'log');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

log4js.configure({
  appenders: {
    file: {
      type: 'dateFile',
      filename: path.join(logDirectory, 'ZAIDU'), // 使用相对路径
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd hh:mm:ss} [%p] [%c] - %m'
      }
    }
  },
  categories: {
    default: {
      appenders: ['file'],
      level: 'info'
    }
  }
});

module.exports = log4js;
