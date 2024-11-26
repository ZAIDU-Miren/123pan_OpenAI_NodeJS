const mysql = require('mysql2/promise');
const log4js = require('../reptile/Puppeteer/log/log4js.config');
const logger = log4js.getLogger("MySQL");

// 创建MySQL连接池
const pool = mysql.createPool({
  host: '154.12.55.19',
  user: 'zaidu',
  password: 'x2622011721',
  database: 'zaidu',
  connectionLimit: 10
});

// 检查表是否存在，如果不存在则创建表
async function createTableIfNotExists() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS apkpan_sql (
        id INT AUTO_INCREMENT PRIMARY KEY,
        game_name VARCHAR(255) NOT NULL,
        package_name VARCHAR(255) NOT NULL,
        version VARCHAR(50),
        version_code INT,
        size VARCHAR(20),
        update_channel VARCHAR(50),
        update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        download_url VARCHAR(255),
        category_id INT,
        file_id INT
      )
    `);
    connection.release();
    logger.info('Table apkpan_sql created or already exists.');
  } catch (error) {
    logger.error('Error creating table apkpan_sql:', error);
  }
}

// 初始化时检查并创建表
createTableIfNotExists();

/**
 * 插入新数据
 * @param {Object} data 要插入的数据对象，包含以下字段：
 *   - game_name {string} 游戏名称
 *   - package_name {string} 包名
 *   - version {string} 版本
 *   - version_code {number} 版本号
 *   - size {string} 大小
 *   - update_channel {string} 更新渠道
 *   - download_url {string} 下载地址
 *   - category_id {number} 目录id
 *   - file_id {number} 文件id
 * @returns {Promise<number>} 返回新插入行的ID
 * @throws {Error} 如果插入过程中发生错误
 * @example
 * const newData = {
 *   game_name: '游戏名称',
 *   package_name: 'com.example.game',
 *   version: '1.0.0',
 *   version_code: 100,
 *   size: '100MB',
 *   update_channel: '官方渠道',
 *   download_url: 'https://example.com/download',
 *   category_id: 1,
 *   file_id: 1
 * };
 * const insertedId = await insertData(newData);
 */
async function insertOrUpdateData(data) {
  try {
    const connection = await pool.getConnection();
    
    // 检查包名是否存在
    const [existingRows] = await connection.query('SELECT * FROM apkpan_sql WHERE package_name = ?', [data.package_name]);
    
    if (existingRows.length > 0) {
      // 包名存在，进行更新操作
      const [updateResult] = await connection.query('UPDATE apkpan_sql SET ? WHERE package_name = ?', [data, data.package_name]);
      connection.release();
      return { action: 'update', affectedRows: updateResult.affectedRows }; // 返回更新操作的结果
    } else {
      // 包名不存在，进行插入操作
      const [insertResult] = await connection.query('INSERT INTO apkpan_sql SET ?', data);
      connection.release();
      return { action: 'insert', insertId: insertResult.insertId }; // 返回插入操作的结果
    }
  } catch (error) {
    logger.error('Error inserting or updating data in apkpan_sql:', error);
    throw error;
  }
}

/**
 * 根据包名查询数据
 * @param {string} packageName 包名
 * @returns {Promise<Array<Object>>} 匹配包名的数据行数组
 * @throws {Error} 如果查询过程中发生错误
 * @example
 * const results = await queryDataByPackageName('com.example.game');
 */
async function queryDataByPackageName(packageName) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM apkpan_sql WHERE package_name = ?', packageName);
    connection.release();
    return rows;
  } catch (error) {
    logger.error('Error querying data from apkpan_sql:', error);
    throw error;
  }
}

/**
 * 根据文件夹名查询数据
 * @param {string} dirName 包名
 * @returns {Promise<Array<Object>>} 匹配包名的数据行数组
 * @throws {Error} 如果查询过程中发生错误
 * @example
 * const results = await queryDataByPackageName('com.example.game');
 */
async function queryDataByGameName(gameName) {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM apkpan_sql WHERE game_name = ?', [gameName]);
    connection.release();
    return rows;
  } catch (error) {
    logger.error('查询 apkpan_sql 数据时出错:', error);
    throw error;
  }
}

/**
 * 更新数据根据包名
 * @param {string} packageName 包名
 * @param {Object} newData 包含要更新的字段和对应的新值的对象
 * @returns {Promise<boolean>} 如果更新成功则为true，否则为false
 * @throws {Error} 如果更新过程中发生错误
 * @example
 * const newData = {
 *   version: '2.0.0',
 *   version_code: 200,
 *   update_channel: '新渠道'
 * };
 * const updateSuccessful = await updateDataByPackageName('com.example.game', newData);
 */

async function updateDataByPackageName(packageName, newData) {
  try {
    const connection = await pool.getConnection();
    
    // 动态构建 SQL 查询语句和参数
    const setClause = Object.keys(newData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(newData);
    values.push(packageName); // 将 packageName 添加到参数数组的最后
    
    const query = `UPDATE apkpan_sql SET ${setClause} WHERE package_name = ?`;
    
    const [result] = await connection.query(query, values);
    connection.release();
    
    return result.affectedRows > 0; // 返回是否更新成功
  } catch (error) {
    logger.error('Error updating data in apkpan_sql:', error);
    throw error;
  }
}


/**
 * 删除数据根据包名
 * @param {string} packageName 包名
 * @returns {Promise<boolean>} 如果删除成功则为true，否则为false
 * @throws {Error} 如果删除过程中发生错误
 * @example
 * const deleteSuccessful = await deleteDataByPackageName('com.example.game');
 */
async function deleteDataByPackageName(packageName) {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM apkpan_sql WHERE package_name = ?', packageName);
    connection.release();
    return result.affectedRows > 0; // 返回是否删除成功
  } catch (error) {
    logger.error('Error deleting data from apkpan_sql:', error);
    throw error;
  }
}

module.exports = {
  pool,
  createTableIfNotExists,
  insertOrUpdateData,
  queryDataByPackageName,
  updateDataByPackageName,
  deleteDataByPackageName,
  queryDataByGameName
};
