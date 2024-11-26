const fs = require('fs-extra');

/**
 * 删除指定目录下的所有文件
 * @param {string} directoryPath 目录路径
 * @returns {Promise<void>} 删除操作的 Promise
 */
async function deleteAllFiles(directoryPath) {
  try {
    await fs.emptyDir(directoryPath);
    console.log('目录下的所有文件已成功删除。');
  } catch (err) {
    console.error('删除文件时发生错误:', err);
    throw err;
  }
}

module.exports = deleteAllFiles;

//使用方法
// const deleteAllFiles = require('./apk/deleteAllFiles');

// // 使用模块
// const directoryPath = 'C:\\Users\\zaidu\\Downloads'; // 目录路径
// deleteAllFiles(directoryPath)
//   .then(() => {
//     console.log('删除操作完成。');
//   })
//   .catch(err => {
//     console.error('删除操作失败:', err);
//   });
