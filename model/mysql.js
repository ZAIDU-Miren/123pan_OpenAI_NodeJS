
const mysql = require('mysql2/promise');
// 创建MySQL连接池
const pool = mysql.createPool({
  //   host: 'localhost', // 数据库主机名
  host: '154.12.55.19',
  user: 'zaidu', // 用户名
  password: 'x2622011721', // 密码
  database: 'zaidu', // 数据库名
  connectionLimit: 10 // 连接池最大连接数
});



module.exports = pool;