/*  
* 下载文件到本地 
* 上传到123盘获取云盘链接  模块
* 
* 
**/
const axios = require('axios');
const fs = require('fs');
const path = require('path'); // 引入 path 模块
const crypto = require('crypto');//计算md5
//导入config模块  配置信息 读取环境变量
const config = require('config')
const API = config.get('app.host') + ':' + config.get('app.port');
console.log(API)
// 导入模块
const APIClient = require('./function');
const createDownloadTask = require('./main/toolMethods/undloadapk_url'); // 上传资源到库内
// 公共变量
let New_fileName = 'fate'; // 文件名
let New_fileURL = ''; // 文件URL
let dirID = '2517252'; // 父级目录ID
let New_dirID = null; // 新建目录ID
let version = '1.0.0';
let apkSize = 0;
let class_name = '';
let shareLink = ''; // 分享地址
let MD5 = ''

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
      console.log('上传完成');
      //记得删除本地文件
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
      // 插入新分享数据-保存数据
      // await addData(New_dirName, class_name, version, apkSize, shareLink, New_dirID)
    } else {
      console.log('创建目录失败:', createDirectory.message);
      console.log('尝试查询目录当前请求地址:', API);
      // 创建目录失败，直接查询ID-并赋值
      await getDirID(New_dirName)
    }
    // 下载文件到本地 {"code":0,"msg":"","data":"JNlSjlSXQDgqPsfWfTzuR"}
    // const targetId = await makeRequest_apk(New_fileURL, New_fileName)//仅供参考，请使用自己的下载方法
    // // 查询文件下载情况
    // console.log('正在查询目标ID:', targetId);

    /*
    *
    * 我是使用的gopeed下载
    * 项目地址：https://gopeed.com/zh-CN
    * 速度非常快，你们可以使用自己的方法下载到本地
    * 通过检查下载完成，进入下一步分片操作
    * 
    * 
    * 
    */

    // 调用示例
    await processFile(New_fileName, New_dirID);//文件名，目录ID
    // try {
    //   const result = await pollTasks(targetId);
    //   if (result) {
    //     console.log('可以处理下一个包名。');
    //     // 计算md5并上传资源到库内
    //     await processFile(New_fileName, New_dirID);
    //   } else {
    //     console.log('下载队列已满或出错。');
    //   }
    // } catch (error) {
    //   console.error('处理过程中出现错误:', error);
    // }

  } catch (error) {
    console.error('执行主流程时出错:', error);
  }
}

//  //上传主流程方法
async function processFile(fileName, dirID) {
  try {
    await downloadFile(fileName);
    console.log('上传文件:', dirID, fileName, MD5, apkSize);

    const response = await apiClient.createFolder(dirID, fileName, MD5, apkSize);
    console.log('创建文件:', response);
    if (response.code === 1) {
      // 创建文件失败，有同名文件
      console.log(response.message, New_fileName);
      return
    }
    if (response.data.reuse) {//C:\Users\Administrator\Downloads
      //文件发生秒传
      console.log('文件发生秒传。');
     //记得删除本地文件
    } else {
      console.log('文件需要分片上传');
      // 获取分片大小
      let sliceSize = response.data.sliceSize;
      console.log('分片大小:', { sliceSize });
      let preuploadID = response.data.preuploadID
      console.log('预上传ID:', { preuploadID });
      // 获取文件路径
      filePath = path.join(__dirname, '..', 'apk', fileName);
      console.log('文件目录:', { filePath });
      sizeInBytes = '' + fs.statSync(filePath).size;
      console.log('文件大小:', { sizeInBytes });
      // 创建分片数据
      // const chunks = createFileChunks(filePath, sliceSize);
      await uploadSlices(filePath, sliceSize, sizeInBytes, preuploadID)
      async function uploadSlices(filePath, sliceSize, sizeInBytes, preuploadID) {
        let uploadDataParts = [];  // 用于存储每次分片上传的数据
        let numSlices = Math.ceil(sizeInBytes / sliceSize);
        console.log('总分片数量:', { numSlices });
        // 创建文件流
        let fileStream = fs.createReadStream(filePath, { highWaterMark: sliceSize });
        let sliceNo = 1;
        console.log('预上传ID:', { preuploadID });
        // 遍历文件流
        for await (const chunk of fileStream) {
          console.log('当前分片:', { sliceNo }, "剩余分片:", numSlices - sliceNo);
          try {
            // 获取上传URL
            let GetpresignedURL = await apiClient.getUploadUrl(preuploadID, sliceNo);
            presignedURL = GetpresignedURL.data.presignedURL
            console.log('Presigned URL:', presignedURL);
            // 计算当前块的MD5值
            let md5 = crypto.createHash('md5').update(chunk).digest('hex');

            // 设置请求头，特别是Content-Length
            let headers = {
              'Content-Length': chunk.length,
              'Content-Type': 'application/octet-stream'
            };

            // 上传分片
            let response = await axios.put(presignedURL, chunk, { headers: headers });
            // console.log('上传分片返回结果:', { response });
            if (response.status === 200) {
              // 保存每次分片上传的相关数据到列表
              uploadDataParts.push({
                partNumber: `${sliceNo}`,
                size: chunk.length,
                etag: md5,
              });
            }
          } catch (error) {
            console.error(`Error uploading chunk ${sliceNo}: ${error}`);
            return false;
          }

          sliceNo++;
          let getUploadedChunks = await apiClient.getUploadedChunks(preuploadID)
          console.log('获取已上传的分片:', { getUploadedChunks });
          console.log('当前已上传分片数量:', uploadDataParts.length);
        }

        if (uploadDataParts.length == numSlices) {
          let completeUpload = await apiClient.completeUpload(preuploadID)
          console.log('上传完成接口:', { completeUpload });
          return false;
        } else {
          console.log('上传失败');
          console.log(uploadDataParts.length, numSlices);
        }

        return uploadDataParts;
      }
      console.log('分片上传完成');
    }
  } catch (error) {
    console.error('文件处理过程中出错:', error);
    //记得删除本地文件
  }
}

//查询目录ID--文件夹名
async function getDirID(New_dirName) {
  console.log('查询目录ID--文件夹名:', { New_dirName });
  New_dirID ='2517252'
  // const config = {
  //   method: 'get',
  //   url: API + '/apkpan_api_gameClass/' + New_dirName
  // };
  // console.log('API+' + config);
  // const response = await axios(config);
  // console.log(response.data);
  // if (response.data.length > 0) {
  //   New_dirID = response.data[0].category_id;//复制文件目录
  //   console.log(response.data[0].category_id);
  //   return Promise.resolve("完成");
  // } else {
  //   console.log("✗");
  //   console.log("出现问题没有搜索到这个游戏的文件夹");
  //   return Promise.resolve("完成");

  // }
}
// 下载文件
async function makeRequest_apk(url, game_name) {
  try {
    const response = await createDownloadTask(url, game_name);
    console.log('创建下载任务成功:', { '进程': response.data });
    return response.data
  } catch (error) {
    console.error('下载APK过程中出现错误:', error);
    throw error;
  }
}
// // 获取下载列表--判断最多下载个数
async function pollTasks(targetId) {
  try {
    let exists = true;
    while (exists) {
      const response = await axios.get('仅供参考的下载方式--填写自己的域名/api/v1/tasks?status=ready&status=running&status=pause&status=wait&status=error');

      // if (response.data.data.length > 3) {
      //   console.log("下载队列有:", response.data.data.length, '个数据，不继续处理下一个包名');
      //   await new Promise(resolve => setTimeout(resolve, 3000));
      //   return false;
      // } else {
      //   console.log("下载队列有:", response.data.data.length, '个数据');
      //   console.log('正在查询目标ID:', targetId);
      //   console.log(response.data.data);

      //   exists = response.data.data.some(item => item.id === targetId);
      //   if (!exists) {
      //     console.log('目标ID不存在，可以处理下一个包名。');
      //     return true;
      //   } else {
      //     console.log('目标ID仍然存在，继续等待...');
      //     await waitForIdToDisappear(targetId);
      //   }
      // }
      return true;
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

async function waitForIdToDisappear(targetId, interval = 5000) {
  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(async () => {
      try {
        const response = await axios.get('http://family.zaidu.in:699/api/v1/tasks?status=ready&status=running&status=pause&status=wait&status=error');
        const data = response.data.data;
        const exists = data.some(item => item.id === targetId);

        if (!exists) {
          clearInterval(checkInterval);
          resolve(true);
        } else {
          console.log('目标ID仍然存在，继续等待...');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        clearInterval(checkInterval);
        reject(error);
      }
    }, interval);
  });
}

async function downloadFile(fileName) {
  // 下载文件到本地
  // 定义文件路径
  const filePath = path.join(__dirname, '..', 'apk', fileName);

  console.log(filePath);
  const md5 = await getMD5(filePath);
  MD5 = md5;
  console.log(md5);
}

// 获取MD5
async function getMD5(filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        console.error('Error reading file:', err);
        return reject(err);
      }

      // 文件大小
      apkSize = stats.size;
      console.log(`File size: ${apkSize} bytes`);

      // 计算 MD5 值
      const hash = crypto.createHash('md5');
      const fileStream = fs.createReadStream(filePath);

      fileStream.on('data', (data) => {
        hash.update(data);
      });

      fileStream.on('end', () => {
        const md5sum = hash.digest('hex');
        resolve(md5sum);
      });

      fileStream.on('error', (err) => {
        reject(err);
      });
    });
  });
}



// 导出模块的公共接口
module.exports = {
  setParams
};
