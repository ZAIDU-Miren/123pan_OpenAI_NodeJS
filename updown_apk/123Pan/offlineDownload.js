/**
 * 用户创建离线下载 
 * 得到分享地址并保存的逻辑模块 
 * 
 */
//导入config模块  配置信息 读取环境变量
const config = require('config')
const API = config.get('app.host')+':'+ config.get('app.port');
console.log(API)
const axios = require('axios');
// 导入模块
const APIClient = require('./function');

// 公共变量
let New_fileName = 'fate'; // 文件名
let New_fileURL = ''; // 文件URL
let dirID = '2517252'; // 父级目录ID
let New_dirID = null; // 新建目录ID
let New_fileID; // 离线文件ID
let version = '1.0.0';
let apkSize = 0;
let class_name = '';
let shareLink = ''; // 分享地址

// 设置参数的函数
async function setParams(p1, p2, p3, p4, p5, p6) {
  New_fileName = p1; // 文件名--包名
  class_name = p2; // 文件名--包名
  New_fileURL = p3; // 下载地址
  New_dirName = p4; // 新建目录名
  version = p5; // 版本号
  apkSize = p6; // 文件大小
  // 返回参数
  await main()
    .then(() => {
      console.log('参数设置完成');
    })
    .catch(error => {
      console.error('执行主流程时出错:', error);
    });
  return Promise.resolve("完成");
}

// 创建APIClient实例
const clientID = 'your-client-id';
const clientSecret = 'your-client-secret';
const apiClient = new APIClient(clientID, clientSecret);

async function main() {
  try {
    // 获取访问令牌
    // const tokenResponse = await apiClient.getAccessToken();
    // console.log('Access Token:', tokenResponse);
    // 创建目录
    const createDirectory = await apiClient.createDirectory(New_dirName, dirID);
    if (createDirectory.code === 0) {
      New_dirID = createDirectory.data.dirID;
      console.log('创建目录成功，目录ID为:', New_dirID);
      // 创建分享链接
      const shareLinkResponse = await apiClient.createShareLink(New_dirName, 0, New_dirID, '');
      if (shareLinkResponse.code === 0) {
        shareLink = shareLinkResponse.data.shareKey;
        console.log('Share Link:', { shareLink });
      }
      // 插入新分享数据
      await addData(New_dirName, class_name, version, apkSize, shareLink, New_dirID)
    } else {
      console.log('创建目录失败:', createDirectory.message);
      // 创建目录失败，直接查询ID
      await getDirID(class_name)
    }
    // 创建下载离线文件
    await createOfflineDownload(New_fileURL, New_fileName, New_dirID);
  } catch (error) {
    console.error('执行主流程时出错:', error);
  }
}

//查询目录ID
async function getDirID(class_name) {
  const config = {
    method: 'get',
    url: API+'/api/apkpan_api/' + class_name,
  };
  const response = await axios(config);
  console.log(response.data);
  if (response.data.length > 0) {
    New_dirID = response.data[0].category_id;
    console.log(response.data[0].category_id);
    return Promise.resolve("完成");
  } else {
    console.log("✗");
    console.log("出现问题没有搜索到这个游戏的文件夹");
    return Promise.resolve("完成");

  }
}
// 创建离线下载
async function createOfflineDownload(New_fileURL, New_fileName, New_dirID, retryCount = 0, maxRetries = 27) {
  const createOfflineDownloadTask = await apiClient.createOfflineDownloadTask(New_fileURL, New_fileName, New_dirID, API+'/api/callBackUrl');
  console.log('离线文件返回值:', createOfflineDownloadTask);

  if (createOfflineDownloadTask.code === 0) {
    New_fileID = createOfflineDownloadTask.data.taskID;
    console.log('离线文件ID为:', New_fileID);
    await checkOfflineDownloadProgress(New_fileID);
    await checkOfflineDownloadProgress(New_fileID);
    
  } else if (createOfflineDownloadTask.code === 2 && createOfflineDownloadTask.message=="解析失败" && retryCount < maxRetries) {
    console.log('重试:', createOfflineDownloadTask.message);
    await new Promise(resolve => setTimeout(resolve, 3000)); // 等待1秒再重试
    await createOfflineDownload(New_fileURL, New_fileName, New_dirID, retryCount + 1, maxRetries);
  } else if(createOfflineDownloadTask.code === 2 && createOfflineDownloadTask.message=="同时下载的任务超出最大限制，不能下载") {
    console.log('60秒后重试:', createOfflineDownloadTask.message);
    await new Promise(resolve => setTimeout(resolve, 60000)); // 等待1秒再重试
    await createOfflineDownload(New_fileURL, New_fileName, New_dirID, retryCount + 1, maxRetries);
  }else {
    console.error('请求失败:', createOfflineDownloadTask.message);
    
  }

  if (retryCount === maxRetries) {
    console.error('重试次数过多，终止请求');
  }
}
// 获取进度
async function checkOfflineDownloadProgress(New_fileID) {
  try {
    const progress = await apiClient.getOfflineDownloadProgress(New_fileID);
    console.log('离线下载进度:', progress);

    if (progress.status === 0) {
      // 下载进行中，继续监听
      setTimeout(() => checkOfflineDownloadProgress(New_fileID), 1000); // 每隔1秒检查一次
    } else if (progress.status === 1) {
      console.log('下载失败');
    } else if (progress.status === 2) {
      console.log('下载成功');
    } else if (progress.status === 3) {
      console.log('重试中');
    }
  } catch (error) {
    console.error('获取离线下载进度失败:', error);
  }
}

// 导出模块的公共接口
module.exports = {
  setParams
};
